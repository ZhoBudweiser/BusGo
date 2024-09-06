import { DEFAULT_CAMPUS, STATION_ID_LABEL, UNION_LENGTH } from "/options/props/defaults";
import { flip } from "/util/client";
import { setNearestCampusIndex } from "/util/setters";

export const methods = {
  onMarkerTap,
  onSwitchMode,
  onRegionChange,
  onSelectLocation
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

function onRegionChange(e) {
  const { scale, longitude, latitude } = e;
  const length = UNION_LENGTH(scale);
  const campusIndex = setNearestCampusIndex(DEFAULT_CAMPUS, { longitude, latitude });
  if (campusIndex !== this.data.campusIndex) this.setData({ campusIndex });
  if (this.data.length == length) return;
  this.setData({ length });
}

function onSelectLocation(campusIndex) {
  this.mapCtx.moveToLocation(this.data.campus[campusIndex]);
  this.setData({ campusIndex });
}

function onInit() {
  this.mapCtx = my.createMapContext("map");
}
