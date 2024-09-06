import { realTimeQueryProps } from "/options/props/run-info/run-info";
import observers from "./observers";
import handlers from "./handlers";

Page({
  data: realTimeQueryProps,
  options: {
    observers: true,
  },
  observers,
  ...handlers,
});
