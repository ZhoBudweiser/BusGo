const cloud = require('@alipay/faas-server-sdk');


exports.main = async (event, context) => {
  const startAddress = event.startAddress, endAddress = event.endAddress;
  const startTime = event.startTime, startDay = event.startDay;
  
  // 初始化
  cloud.init();
  const db = cloud.database();
  let collectionName = 'bus-time';
  console.log('查询 collection:', collectionName);
  
  // 查询 collection
  let collection = await db.getCollection(collectionName);
  console.log('查询 collection id:', collection.coll_id);
  
  // 查询 collection 中的 doc 列表，默认返回 100 条
  let docList = await db.collection(collectionName).where({
    cycle: startDay==="1,2,3,4,5" ? db.command.or(db.command.eq("1,2,3,4,5"), db.command.eq("1,2,3,4,5,6,7")) : db.command.or(db.command.eq("6,7"), db.command.eq("1,2,3,4,5,6,7")),
    endTime: db.command.gt(startTime)
  }).get();
  const candidates = docList.map(item => item["id"]);
  console.log('当前 collection 中的 候选列表:', candidates);

  collectionName = 'bus-time-line';
  console.log('查询 collection:', collectionName);
  
  // 查询 collection
  collection = await db.getCollection(collectionName);
  console.log('查询 collection id:', collection.coll_id);
  
  // 查询 collection 中的 doc 列表，默认返回 100 条
  docList = await db.collection(collectionName).where({
    id: db.command.in(candidates)
  }).get();

  const res = docList.filter(item => {
    const stations = JSON.parse(item["stations"].replace(/'/g, '"'));
    const sz = stations.length;
    let startFit = false, endFit = false;
    for (let i = 0; i < sz; ++i) {
      const station = stations[i];
      if (station["name"].indexOf(startAddress) !== -1 && (!station["time"] || (station["time"] >= startTime))) {
        startFit = true;
      }
      if (station["name"].indexOf(endAddress) !== -1 && startFit) {
        endFit = true;
      }
    }
    return startFit && endFit;
  });
  
  return { data: res };
};