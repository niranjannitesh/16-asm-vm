export default class ScreenDevice extends DataView {
  screenWriter: (address: i32, value: u16) => void

  constructor(size: i32, screenWriter: (address: i32, value: u16) => void) {
    super(new ArrayBuffer(size))
    this.screenWriter = screenWriter
  }

  setUint16(byteOffset: i32, value: u16, littleEndian: bool = true): void {
    // console.log("something")
    this.screenWriter(byteOffset, value)
    // super.setUint16(byteOffset, value, littleEndian)
  }
}
