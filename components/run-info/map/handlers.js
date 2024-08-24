import { STATION_ID_LABEL, UNION_LENGTH } from "/options/props/defaults";
import { flip } from "/util/setters";

export const methods = {
  onMarkerTap,
  onSwitchMode,
  onJumpSearch,
  onRegionChange
};

export const lifeHanders = {
  onInit,
};

function onMarkerTap(e) {
  const markerId = e.markerId;
  if (typeof(markerId) !== 'string' || markerId.indexOf(STATION_ID_LABEL) === -1) return;
  this.mapCtx.clearRoute();
  const { selectedStation, onSelectStation } = this.props;
  const markerIdNum = markerId.replace(STATION_ID_LABEL, "");
  if (markerIdNum !== selectedStation.id) {
    onSelectStation(markerIdNum);
  }
}

function onSwitchMode() {
  flip(this, "displayMode");
}

function onJumpSearch() {
  my.navigateTo({
    url: "/pages/time-table/time-table?start=" + this.props.selectedStation.name,
  });
}

function onRegionChange(e) {
  const scale = UNION_LENGTH(e.scale);
  if (this.data.scale == scale) return;
  this.setData({ scale });
}

function onInit() {
  this.mapCtx = my.createMapContext("map");
}
