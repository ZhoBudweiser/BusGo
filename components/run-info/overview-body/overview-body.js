import { bodyData, bodyProps } from "/options/props/run-info/overview";
import { methods } from "./handlers";
import observers from "./observers";

Component({
  options: {
    observers: true,
  },
  data: bodyData,
  props: bodyProps,
  observers,
  methods,
});
