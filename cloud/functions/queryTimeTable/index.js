const cloud = require("@alipay/faas-server-sdk");

exports.main = async (event, context) => {
  const {
    startStationName,
    endStationName,
  } = event;
  const collectionName = "bus-run-infos";
  const db = cloud.database();
  const collection = db.collection(collectionName);

  const data = await collection
    .where({
      startStationName,
      endStationName,
    })
    .limit(100)
    .get();

  return {
    data
  };
};