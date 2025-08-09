const axios = require('axios');
const fs     = require('fs-extra');
const readline = require('readline');

const DEFAULT_BUS_END_PAIRS = [{
    startStationName: "紫金港校区",
    endStationName: "玉泉校区"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "西溪校区"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "华家池校区"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "之江校区"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "湖滨"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "紫金文苑"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "雅仕苑"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "丰谭路高教二期"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "南都德加东"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "城市心境"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "高教一期"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "恩济花园"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "高教二期"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "丰谭中学"
  },
  {
    startStationName: "玉泉校区",
    endStationName: "紫金港校区"
  },
  {
    startStationName: "玉泉校区",
    endStationName: "西溪校区"
  },
  {
    startStationName: "玉泉校区",
    endStationName: "华家池校区"
  },
  {
    startStationName: "玉泉校区",
    endStationName: "之江校区"
  },
  {
    startStationName: "西溪校区",
    endStationName: "紫金港校区"
  },
  {
    startStationName: "西溪校区",
    endStationName: "玉泉校区"
  },
  {
    startStationName: "西溪校区",
    endStationName: "华家池校区"
  },
  {
    startStationName: "西溪校区",
    endStationName: "之江校区"
  },
  {
    startStationName: "之江校区",
    endStationName: "紫金港校区"
  },
  {
    startStationName: "之江校区",
    endStationName: "玉泉校区"
  },
  {
    startStationName: "之江校区",
    endStationName: "西溪校区"
  },
  {
    startStationName: "华家池校区",
    endStationName: "紫金港校区"
  },
  {
    startStationName: "华家池校区",
    endStationName: "玉泉校区"
  },
  {
    startStationName: "华家池校区",
    endStationName: "西溪校区"
  },
];

const DATA_FILE = './bus_lines._json_';   // JSON Lines 文件
const API_BASE  = 'https://bccx.zju.edu.cn/schoolbus_wx/manage/';

(async () => {
  // 1. 读取已有记录到内存 Map：key = "start@end"
  const recordMap = new Map();
  if (await fs.pathExists(DATA_FILE)) {
    const rl = readline.createInterface({
      input: fs.createReadStream(DATA_FILE, 'utf8'),
      crlfDelay: Infinity
    });
    for await (const line of rl) {
      if (!line.trim()) continue;
      const doc = JSON.parse(line);
      const key = `${doc.startStationName}@${doc.endStationName}`;
      recordMap.set(key, doc);
    }
  }

  // 2. 逐条更新
  for (const pair of DEFAULT_BUS_END_PAIRS) {
    const { startStationName, endStationName } = pair;
    const key = `${startStationName}@${endStationName}`;
    let doc = recordMap.get(key);

    if (!doc) {
      doc = {
        _id: String(recordMap.size),
        timestamp: Date.now(),
        startStationName,
        endStationName,
        ids: []
      };
      recordMap.set(key, doc);
    }

    try {
      const freshIds = await getBusLineIdsByEnds(startStationName, endStationName);
      const set = new Set(doc.ids);
      freshIds.forEach(id => set.add(id));
      doc.ids = Array.from(set).sort();
      doc.timestamp = Date.now();
    } catch (e) {
      console.error(`查询失败：${startStationName} -> ${endStationName}`, e.message);
    }
  }

  // 3. 写回 JSON Lines
  const lines = Array.from(recordMap.values())
                     .sort((a, b) => +a._id - +b._id)
                     .map(d => JSON.stringify(d));
  await fs.writeFile(DATA_FILE, lines.join('\n') + '\n');
  console.log('更新完成');
})();

// 根据起终站获取线路 id 列表
async function getBusLineIdsByEnds(startStationName, endStationName) {
  const { data: res } = await axios.post(
    API_BASE + 'searchLine',
    new URLSearchParams({
      begin_station: startStationName,
      end_station: endStationName,
      date: '00',
      time: '00'
    }),
    { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
  );
  return (res.data || []).map(item => item.bid);
}