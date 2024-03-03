const fmtLines = (lines) => {
  return lines.map(item => {
    const station_map = {};
    item.station_list.forEach((station, i) => (station_map[station.station_alias_no] = i));
    return {
      "bid": item.lid,
      "start_address": item.station_list[0].station_alias,
      "end_address": item.station_list.at(-3).station_alias,
      "runBusInfo": null,
      "line_alias": item.line_alias,
      "station_map": station_map,
      "duration": "",
      "remark": "",
      "stations": item.station_list
    }
  });
}

export function findShttleLines(client) {
  const startName = client.props.nearest_stop_name;
  const endName = client.data.selectedEnd;
  const lines = client.props.shuttleLines.filter(
    item => {
      const startIndex = item.station_list.findIndex(stop => stop.station_alias === startName);
      const endIndex = item.station_list.findIndex(stop => stop.station_alias === endName);
      return startIndex !== -1 && endIndex !== -1 && startIndex < endIndex;
    }
  );
  console.log(lines);
  client.props.onSetBusLines(fmtLines(lines));
}

export function findShttleLinesByStartOnly(client) {
  const startId = client.data.selectedStop;
  const lines = client.data.shuttleLines.filter(
    item =>
    item.station_list.findIndex(stop => stop.station_alias_no === startId) !== -1
  );
  return fmtLines(lines);
}