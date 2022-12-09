// The entry file of your WebAssembly module.



import CPU from "./cpu"
import { createMemory } from "./memory"
import MemoryMapper from "./memory/memory-mapper"
import instructions from "./cpu/instructions"
import ScreenDevice from "./devices/screen"
@external("./screen-writer.js", "screenWriter")
declare function screenWriter(address: i32, value: u16): void;

let i = 0
let cpu!: CPU
let writeableBytes!: Uint8Array
let R1 = 0x01

function writeCharToScreen(char: string, command: u8, position: u8): void {
  writeableBytes[i++] = instructions.MOV_LIT_REG
  writeableBytes[i++] = command
  writeableBytes[i++] = char.charCodeAt(0)
  writeableBytes[i++] = R1

  writeableBytes[i++] = instructions.MOV_REG_MEM
  writeableBytes[i++] = R1
  writeableBytes[i++] = 0x30
  writeableBytes[i++] = position
}

export function init(): void {
  const mm = new MemoryMapper()
  const m = createMemory(256 * 256)
  const screen = new ScreenDevice(256, screenWriter)
  mm.map(m, 0, 0xffff)
  mm.map(screen, 0x3000, 0x30ff, true)
  cpu = new CPU(mm)

  R1 = cpu.registerNames.indexOf("r1")

  writeableBytes = Uint8Array.wrap(m.buffer)

  for (let i: u8 = 0; i < 0xff; i++) {
    const command: u8 = i % 2 === 0 ? 0x01 : 0x02
    writeCharToScreen("*", command, i)
  }


  writeableBytes[i++] = instructions.HLT

  cpu.run()
}
