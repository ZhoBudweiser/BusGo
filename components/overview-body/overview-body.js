import { bodyData, bodyProps } from "/options/props/overview";
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
