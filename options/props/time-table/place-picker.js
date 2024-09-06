import { NOP } from "../defaults";

export const props = {
    initStart: "",
    edited: false,
    historyAddress: {},
    onSubmitQuery: NOP,
  };
export const data = {
    stationOptions: [],
    startOptions: [],
    endOptions: [],
    startName: "",
    endName: "",
    startTime: "00:00",
    isWeekend: false,
    canTrans: true,
  };