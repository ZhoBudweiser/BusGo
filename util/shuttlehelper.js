const fmtLines = (lines) => {
  return lines.map((item) => {
    const station_map = {};
    item.station_list.forEach(
      (station, i) => (station_map[station.station_alias_no] = i),
    );
    const n = item.station_list.length;
    const endIndex = n - 3 >= 0 ? n - 3 : 0;
    return {
      bid: item.lid,
      start_address: item.station_list[0].station_alias,
      end_address: item.station_list[endIndex].station_alias,
      runBusInfo: null,
      line_alias: item.line_alias,
      station_map: station_map,
      duration: item.line_alias,
      remark: "",
      stations: item.station_list,
    };
  });
};

export function findShttleLines(client) {
  const startName = client.props.nearest_stop_name;
  const endName = client.data.selectedEnd;
  const lines = client.props.shuttleLines.filter((item) => {
    let startIndex = -1;
    let endIndex = -1;
    let match = false;
    item.station_list.forEach((stop, i) => {
      if (stop.station_alias === startName) {
        startIndex = i;
      } else if (stop.station_alias === endName) {
        endIndex = i;
        if (startIndex !== -1 && startIndex < endIndex) {
          match = true;
        }
      }
    });
    return match;
  });
  console.log(lines);
  client.props.onSetBusLines(fmtLines(lines));
}

export function findShttleLinesByStartOnly(client) {
  const startId = client.data.selectedStationId;
  const lines = client.data.shuttleLines.filter(
    (item) =>
      item.station_list.findIndex(
        (stop) => stop.station_alias_no === startId,
      ) !== -1,
  );
  return fmtLines(lines);
}

export function shttleChange(oldbuses, newBuses) {
  if (oldbuses.length !== newBuses.length) return true;
  if (!newBuses.length || !oldbuses.length) return false;
  const n = oldbuses.length;
  for (let i = 0; i < n; ++i) {
    if (oldbuses[i].id !== newBuses[i].id) {
      return true;
    }
  }
  return false;
}
