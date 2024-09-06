export const methods = {
  onToggleCard,
};

function onToggleCard(e) {
  const i = e.currentTarget.dataset.i;
  const activeCards = this.data.activeCards.concat();
  activeCards[i] = !activeCards[i];
  this.setData({ activeCards });
}
