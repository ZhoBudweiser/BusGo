import { data, props } from "/options/props/time-table/place-picker";
import observers from "./observers";
import { lifeHanders, methods } from "./handlers";

Component({
  options: {
    observers: true,
  },
  data,
  observers,
  props,
  ...lifeHanders,
  methods,
});
