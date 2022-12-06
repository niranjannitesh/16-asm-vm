export function createMemory(size: i32): DataView {
  const ab = new ArrayBuffer(size);
  const dv = new DataView(ab);
  return dv;
}