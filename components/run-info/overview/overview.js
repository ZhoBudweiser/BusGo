import { methods, lifeHanders } from "./handlers";
import observers from "./observers";
import { data, props } from "/options/props/overview";

Component({
  options: {
    observers: true,
  },
  data,
  props,
  observers,
  ...lifeHanders,
  methods,
});
