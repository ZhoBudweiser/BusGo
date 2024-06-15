const cloud = require("@alipay/faas-server-sdk");

exports.main = async (event, context) => {
  // 初始化
  cloud.init();
  const db = cloud.database();
  const collectionName = "bus-time-line";
  console.log("查询 collection:", collectionName);

  // 查询 collection
  const collection = await db.getCollection(collectionName);
  console.log("查询 collection id:", collection.coll_id);

  // 查询 collection 中的 doc 列表，默认返回 100 条
  const docList = await db.collection(collectionName).get();
  console.log("当前 collection 中的 doc 列表:", docList);

  return { message: "示例运行成功，请在运行日志中查询详情" };
};
