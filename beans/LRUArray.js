/**
 * LRU 数组
 */
export class LRUArray {
  constructor(buffer, data) {
    this.bufferSize = buffer.length;
    this.buffer = buffer;
    this.data = data.toSorted((a, b) =>
      a.localeCompare(b, "zh-Hans-CN", { sensitivity: "accent" }),
    );
    this.updateMemery(buffer);
  }
  /**
   * 根据选择的数据更新全部数据
   * @param {string} item 选择的数据
   * @returns 更新后的数据
   */
  update(item) {
    if (item === "") return this.getAll();
    const { buffer } = this;
    // 如果缓存中已经存在该数据，则将其移动到缓存头部
    const newBuffer = buffer.filter((ele) => ele != item);
    newBuffer.unshift(item);
    if (newBuffer.length > this.bufferSize) {
      newBuffer.pop();
    }
    // 更新数据
    this.buffer = newBuffer;
    this.updateMemery(newBuffer);
    return this.getAll();
  }
  /**
   * 更新全量数据
   * @param {Array<string>} 缓存数据
   */
  updateMemery(buffer) {
    const bufferSet = new Set(buffer);
    this.memery = this.data.filter((ele) => !bufferSet.has(ele));
  }
  /**
   * 返回缓存数据
   * @returns {Array<string>} 缓存数据
   */
  getBuffer() {
    return this.buffer;
  }
  /**
   * 返回所有数据
   * @returns {Array<string>} 所有数据
   */
  getAll() {
    const { buffer, memery } = this;
    return [...buffer, ...memery];
  }
}
