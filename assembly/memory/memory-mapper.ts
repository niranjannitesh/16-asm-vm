class MemoryRegion {
  device: DataView
  start: u16
  end: u16
  remap: boolean

  constructor(device: DataView, start: u16, end: u16, remap: boolean = true) {
    this.device = device
    this.start = start
    this.end = end
    this.remap = remap
  }
}

var address: u16

export default class MemoryMapper {
  private regions: MemoryRegion[] = []

  constructor() {}

  map(device: DataView, start: u16, end: u16, remap: boolean = false): void {
    const region = new MemoryRegion(device, start, end, remap)
    this.regions.unshift(region)
    // return () => {
    //   this.regions = this.regions.filter((r) => r !== region)
    // }
  }

  getUint8(_address: u16): u8 {
    address = _address
    const finder = (r: MemoryRegion, index: i32, self: MemoryRegion[]): bool =>
      r.start <= address && r.end >= address

    const regionIndex = this.regions.findIndex(finder)
    if (regionIndex !== -1) {
      const region = this.regions[regionIndex]
      return region.device.getUint8(
        region.remap ? address - region.start : address
      )
    }
    return 0
  }

  setUint8(_address: u16, value: u8): void {
    address = _address
    const finder = (r: MemoryRegion, index: i32, self: MemoryRegion[]): bool =>
      r.start <= address && r.end >= address

    const regionIndex = this.regions.findIndex(finder)
    if (regionIndex !== -1) {
      const region = this.regions[regionIndex]
      region.device.setUint8(
        region.remap ? address - region.start : address,
        value
      )
    }
  }

  getUint16(_address: u16): u16 {
    address = _address
    const finder = (r: MemoryRegion, index: i32, self: MemoryRegion[]): bool =>
      r.start <= address && r.end >= address

    const regionIndex = this.regions.findIndex(finder)
    if (regionIndex !== -1) {
      const region = this.regions[regionIndex]
      return region.device.getUint16(
        region.remap ? address - region.start : address
      )
    }
    return 0
  }

  setUint16(_address: u16, value: u16): void {
    address = _address
    const finder = (r: MemoryRegion, index: i32, self: MemoryRegion[]): bool =>
      r.start <= address && r.end >= address

    const regionIndex = this.regions.findIndex(finder)
    if (regionIndex !== -1) {
      const region = this.regions[regionIndex]
      region.device.setUint16(
        region.remap ? address - region.start : address,
        value
      )
    }
  }

  get buffer(): ArrayBuffer {
    const buffer = new ArrayBuffer(0xffff)
    const view = new DataView(buffer)
    for (let i: u16 = 0; i < 0xffff; i++) {
      view.setUint8(i, this.getUint8(i))
    }
    return buffer
  }
}
