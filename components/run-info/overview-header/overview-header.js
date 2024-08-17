import { headerData, headerProps } from "/options/props/overview";
import { methods } from "./handlers";
import observers from "./observers";

Component({
  options: {
    observers: true,
  },
  data: headerData,
  props: headerProps,
  observers,
  methods,
});
