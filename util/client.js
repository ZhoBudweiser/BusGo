import { showQuerying } from "./notification";
import { queryBackend } from "/options/apis/carApis";
import { DEFAULT_LOCATION_QUERY_FREQUENCY } from "/options/props/defaults";

export function setLocationTimer(client) {
  return setInterval(autoLocate, DEFAULT_LOCATION_QUERY_FREQUENCY, client);
}

export function resetCarTimer(client, dataType, sid, frequency) {
  const timer = client.data.carTimer;
  if (timer != null) clearInterval(timer);
  queryLinesByStationId(client, dataType, sid)();
  const carTimer = setInterval(
    queryLinesByStationId(client, dataType, sid),
    frequency,
  );
  client.setData({ carTimer });
}

export async function selectStation(client, sid) {
  if (sid == "") return;
  const stations = await queryBackend(
    "allStations",
    client.data.activeIndex,
    [],
  );
  const stationName = stations.find(
    (item) => item.station_alias_no === sid,
  ).station_alias;
  console.log("已选择的站点：", stationName);
  client.setData({
    selectedStation: {
      id: sid,
      name: stationName,
    },
  });
  showQuerying();
  const { activeIndex, sysQueryFrequency } = client.data;
  resetCarTimer(client, activeIndex, sid, sysQueryFrequency);
}

function autoLocate(client) {
  my.getLocation({
    type: 0,
    success: (userPosition) => client.setData({ userPosition }),
    fail: () => clearInterval(client.data.locationTimer),
  });
  console.log("已获取定位");
}

function queryLinesByStationId(client, dataType, sid) {
  return async () => {
    const { queriedLineIds } = client.data;
    const notfiltered = (bid) =>
      queriedLineIds == null || queriedLineIds.indexOf(bid) !== -1;
    const busLines = (
      await queryBackend("linesByStationId", dataType, [sid])
    ).filter((line) => notfiltered(line.bid));
    client.setData({ busLines });
    console.log("查询到班次：", busLines);
  };
}
