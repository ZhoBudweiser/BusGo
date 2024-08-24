export class LRUArray {
  constructor(buffer, data) {
    this.bufferSize = buffer.length;
    this.buffer = buffer;
    this.data = data.toSorted((a, b) =>
      a.localeCompare(b, "zh-Hans-CN", { sensitivity: "accent" }),
    );
    this.updateMemery(buffer);
  }
  update(item) {
    if (item === "") return this.getAll();
    const { buffer } = this;
    const newBuffer = buffer.filter((ele) => ele != item);
    newBuffer.unshift(item);
    if (newBuffer.length > this.bufferSize) {
      newBuffer.pop();
    }
    this.buffer = newBuffer;
    this.updateMemery(newBuffer);
    return this.getAll();
  }
  updateMemery(buffer) {
    const bufferSet = new Set(buffer);
    this.memery = this.data.filter((ele) => !bufferSet.has(ele));
  }
  getBuffer() {
    return this.buffer;
  }
  getAll() {
    const { buffer, memery } = this;
    return [...buffer, ...memery];
  }
}
