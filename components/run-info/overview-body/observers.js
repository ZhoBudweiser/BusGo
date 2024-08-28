import { popNoCar } from "/util/notification";
import { setActiveCards } from "/util/setters";

const observers = {
  carLines
};

export default observers;

function carLines(lines) {
  if (lines.length == 0) popNoCar();
  if (lines.length === this.data.activeCards.length) return;
  const activeCards = setActiveCards(lines);
  this.setData({ activeCards });
}
