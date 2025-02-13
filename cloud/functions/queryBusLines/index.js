const cloud = require("@alipay/faas-server-sdk");

// 主函数，处理班车时刻表查询请求
exports.main = async (event, context) => {
  const { startAddress, endAddress, startTime, startDay, canTrans } = event;

  // 初始化云服务
  cloud.init();
  const db = cloud.database();
  const collectionName = "bus-time-line-time";
  const collection = db.collection(collectionName);
  const condition = {
    cycle: getCycleCondition(startDay, db),
    endTime: db.command.gt(startTime),
  };
  let data = [];

  if (canTrans) {
    // 允许换乘，查询包含起点或终点的班车
    const allList = await collection
      .where({
        ...condition,
        name: db.RegExp({
          regexp: `.*${startAddress}.*|.*${endAddress}.*`,
        }),
      })
      .limit(200)
      .get();
    const { uniList, startList, endList } = filterDocList(
      allList,
      startAddress,
      endAddress,
      startTime,
    );
    const transList = handleTransfers(
      startList,
      endList,
      startAddress,
      endAddress,
    );
    data = [...uniList, ...transList];
  } else {
    // 不允许换乘，查询严格包含起点和终点的班车
    const allList = await collection
      .where({
        ...condition,
        name: db.RegExp({
          regexp: `.*${startAddress}.+${endAddress}.*`,
        }),
      })
      .limit(200)
      .get();
    data = filterList(allList, startAddress, endAddress, startTime);
  }

  return { data };
};

// 获取班车运行周期条件
function getCycleCondition(startDay, db) {
  const weekdays = "1,2,3,4,5";
  const weekends = "6,7";
  const allDays = "1,2,3,4,5,6,7";

  return startDay === weekdays
    ? db.command.or(db.command.eq(weekdays), db.command.eq(allDays))
    : db.command.or(
        db.command.eq(weekends),
        db.command.eq(allDays),
        db.command.eq(7),
      );
}

/**
 * 过滤班车时刻表列表
 * @param {object[]} docList 数据库查询结果
 * @param {string} startAddress 起点
 * @param {string} endAddress 终点
 * @param {number} startTime 出发时间
 * @returns {object[]} 过滤后的班车列表
 */
function filterList(docList, startAddress, endAddress, startTime) {
  return docList.filter((item) => {
    let startFit = false;
    let endFit = false;

    // 遍历站点，判断是否符合起始和终点条件
    item.stations.forEach((station) => {
      if (
        !startFit &&
        station.name.includes(startAddress) &&
        (!station.time || station.time >= startTime)
      ) {
        startFit = true;
      }
      if (startFit && station.name.includes(endAddress)) {
        endFit = true;
      }
    });

    return startFit && endFit;
  });
}

/**
 * 过滤班车时刻表列表，得到包含起止点、起点、终点的列表
 * @param {object[]} docList 数据库查询结果
 * @param {string} startAddress 起点
 * @param {string} endAddress 终点
 * @param {number} startTime 出发时间
 * @returns {object[]} 过滤后的三种班车列表
 */
function filterDocList(docList, startAddress, endAddress, startTime) {
  const startList = [];
  const endList = [];

  const uniList = docList.filter((item) => {
    const stations = item.stations;
    const sz = stations.length;
    let startFit = false;
    let endFit = false;
    let endOnlyFit = false;

    // 遍历站点，判断是否符合起始和终点条件
    for (let i = 0; i < sz; ++i) {
      const station = stations[i];
      if (
        station.name.includes(startAddress) &&
        (!station.time || station.time >= startTime)
      ) {
        startFit = true;
      }
      if (station.name.includes(endAddress) && startFit) {
        endFit = true;
      }
      if (
        station.name.includes(endAddress) &&
        (!station.time || station.time >= startTime)
      ) {
        endOnlyFit = true;
      }
    }

    // 根据条件将班车加入起始或终点列表
    if (startFit && !endFit && !item.endStation.includes(startAddress)) {
      startList.push(item);
    } else if (
      !startFit &&
      endOnlyFit &&
      !item.startStation.includes(endAddress)
    ) {
      endList.push(item);
    }

    return startFit && endFit;
  });

  return { uniList, startList, endList };
}

/**
 * 查询换乘方案
 * @param {object[]} startList 包含起点的班次
 * @param {object[]} endList 包含终点的班车
 * @param {string} startAddress 起点
 * @param {string} endAddress 终点
 * @returns {object[]} 换乘方案
 */
function handleTransfers(startList, endList, startAddress, endAddress) {
  const MAX_TRANSFER_TIME = 100; // 最大换乘时间一小时
  const res = [];

  startList.forEach((startItem) => {
    const matchedRes = endList.filter((endItem) => {
      // 时间不匹配
      if (startItem.startTime > endItem.endTime) return false;

      const startStations = startItem.stations;
      const endStations = endItem.stations;
      let lastStartStationTime = startItem.startTime;
      let skipStart = true;

      // 中间换乘站点是否匹配
      return startStations.some((startStation) => {
        lastStartStationTime = startStation.time || lastStartStationTime;

        // 跳过起点之前的站点
        if (startStation.name.includes(startAddress)) skipStart = false;
        if (skipStart) return false;

        let lastEndStationTime = endItem.startTime;
        let skipEnd = false;

        return endStations.some((endStation) => {
          // 跳过终点之后的站点
          if (endStation.name.includes(endAddress)) skipEnd = true;
          if (skipEnd) return false;

          lastEndStationTime = endStation.time || lastEndStationTime;

          // 匹配检测，是否相同站点，时间间隔在范围内
          return (
            lastStartStationTime <= lastEndStationTime &&
            lastEndStationTime - lastStartStationTime < MAX_TRANSFER_TIME &&
            startStation.name.slice(0, 3) === endStation.name.slice(0, 3)
          );
        });
      });
    });

    if (matchedRes.length > 0) {
      const sorted = matchedRes.sort((a, b) => a.startTime - b.startTime);
      // 加入起点列表
      sorted.unshift(startItem);
      // 加入结果
      res.push(sorted);
    }
  });

  return res;
}
