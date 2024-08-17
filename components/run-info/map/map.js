import { data, props } from "/options/props/run-info/map";
import observers from "./observers";
import { lifeHanders, methods } from "./handlers";

Component({
  data,
  options: {
    observers: true,
  },
  props,
  observers,
  ...lifeHanders,
  methods,
});
