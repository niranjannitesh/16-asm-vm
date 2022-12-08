// The entry file of your WebAssembly module.

import CPU from "./cpu";
import { createMemory } from "./memory";
import instructions from './cpu/instructions'

let i = 0;

const m = createMemory(256 * 256);
const cpu = new CPU(m);


export function init(): void {
  const IP = cpu.registerNames.indexOf("ip")
  const R1 = cpu.registerNames.indexOf("r1")
  const R2 = cpu.registerNames.indexOf("r2")
  const ACC = cpu.registerNames.indexOf("acc")



  const writeableBytes = Uint8Array.wrap(m.buffer);
  writeableBytes[i++] = instructions.MOV_MEM_REG;
  writeableBytes[i++] = 0x01
  writeableBytes[i++] = 0x00
  writeableBytes[i++] = R1

  writeableBytes[i++] = instructions.MOV_MEM_REG;
  writeableBytes[i++] = 0x00
  writeableBytes[i++] = 0x01
  writeableBytes[i++] = R2

  writeableBytes[i++] = instructions.ADD_REG_REG
  writeableBytes[i++] = R1
  writeableBytes[i++] = R2

  writeableBytes[i++] = instructions.MOV_REG_MEM
  writeableBytes[i++] = ACC
  writeableBytes[i++] = 0x01
  writeableBytes[i++] = 0x00

  writeableBytes[i++] = instructions.JMP_NOT_EQ
  writeableBytes[i++] = 0x00
  writeableBytes[i++] = 0x03
  writeableBytes[i++] = 0x00


  cpu.debug()
  cpu.viewMemoryAt(cpu.getRegister('ip'));
  cpu.viewMemoryAt(0x0100)
}

export function step(debug: bool = false): void {
  cpu.step()
  if (debug) {
    cpu.debug()
    cpu.viewMemoryAt(cpu.getRegister('ip'));
    cpu.viewMemoryAt(0x0100)
  }
}