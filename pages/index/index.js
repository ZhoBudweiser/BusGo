import { realTimeQueryProps } from "/options/props/realTimeQuery";
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
