const cloud = require('@alipay/faas-server-sdk');

exports.main = async (event, context) => {
  const startAddress = event.startAddress,
    endAddress = event.endAddress;
  const startTime = event.startTime,
    startDay = event.startDay;
  const canTrans = event.canTrans;

  // 初始化
  cloud.init();
  const db = cloud.database();
  const collectionName = 'bus-time-line-time';
  // console.log('查询 collection:', collectionName);
  // 查询 collection
  const collection = await db.getCollection(collectionName);
  // console.log('查询 collection id:', collection.coll_id);

  // 查询 collection 中的 doc 列表，默认返回 100 条
  const docList = await db.collection(collectionName).where({
    cycle: startDay === "1,2,3,4,5" ?
      db.command.or(db.command.eq("1,2,3,4,5"), db.command.eq("1,2,3,4,5,6,7")) : 
      db.command.or(db.command.eq("6,7"),db.command.eq("1,2,3,4,5,6,7"), db.command.eq(7)),
    endTime: db.command.gt(startTime)
  }).limit(200).get();
  // console.log('当前 collection 中的 候选列表:', docList);

  const startList = [],
    endList = [];
  const res = docList.filter(item => {
    const stations = JSON.parse(item["stations"].replace(/'/g, '"'));
    item["stations"] = stations;
    const sz = stations.length;
    let startFit = false,
      endFit = false,
      endOnlyFit = false;
    for (let i = 0; i < sz; ++i) {
      const station = stations[i];
      if (station["name"].indexOf(startAddress) !== -1 && (!station["time"] || (station["time"] >= startTime))) {
        startFit = true;
      }
      if (station["name"].indexOf(endAddress) !== -1 && startFit) {
        endFit = true;
      }
      if (station["name"].indexOf(endAddress) !== -1 && (!station["time"] || (station["time"] >= startTime))) {
        endOnlyFit = true;
      }
    }
    if (startFit && !endFit && item.endStation.indexOf(startAddress) === -1) {
      startList.push(item);
    } else if (!startFit && endOnlyFit && item.startStation.indexOf(endAddress) === -1) {
      endList.push(item);
    }
    return startFit && endFit;
  });

  if (canTrans) {
    const m = startList.length,
      n = endList.length;
    for (let i = 0; i < m; ++i) {
      const matchedRes = [];
      for (let j = 0; j < n; ++j) {
        if (startList[i].startTime > endList[j].endTime) {
          continue;
        }
        const sm = startList[i].stations.length,
          sn = endList[j].stations.length;
        let match = false;
        let lastStartStationTime = startList[i].startTime;
        let find = false;
        for (let x = 0; x < sm && !match; ++x) {
          const startStation = startList[i].stations[x];
          if (startStation.name.indexOf(startAddress) !== -1) {
            find = true;
          }
          if (!find) {
            continue;
          }
          let lastEndStationTime = endList[j].startTime;
          lastStartStationTime = startStation.time ? startStation.time : lastStartStationTime;
          for (let y = 0; y < sn && !match; ++y) {
            const endStation = endList[j].stations[y];
            if (endStation.name.indexOf(endAddress) !== -1) {
              break;
            }
            lastEndStationTime = endStation.time ? endStation.time : lastEndStationTime;
            if ((lastStartStationTime < lastEndStationTime) && (lastEndStationTime - lastStartStationTime < 200) &&
              startStation.name.slice(0, 3) == endStation.name.slice(0, 3)) {
                match = true;
            }
          }
        }
        if (match) {
          matchedRes.push(endList[j]);
        }
      }
      if (matchedRes.length > 0) {
        const sorted = matchedRes.sort((item, jtem) => item.startTime < jtem.startTime ? -1 : 1);
        sorted.unshift(startList[i]);
        res.push(sorted);
      }
    }
  }

  return {
    data: res
  };
};