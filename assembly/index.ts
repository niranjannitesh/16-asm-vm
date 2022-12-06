// The entry file of your WebAssembly module.

import CPU from "./cpu";
import { createMemory } from "./memory";
import * as instructions from './cpu/instructions'

export function init(): void {
  const m = createMemory(256);
  const writeableBytes = Uint8Array.wrap(m.buffer);
  writeableBytes[0] = instructions.MOV_LIT_R1;
  writeableBytes[1] = 0x12
  writeableBytes[2] = 0x34

  writeableBytes[3] = instructions.MOV_LIT_R2;
  writeableBytes[4] = 0xAB
  writeableBytes[5] = 0xCD

  writeableBytes[6] = instructions.ADD_REG_REG
  writeableBytes[7] = 2
  writeableBytes[8] = 3
  const cpu = new CPU(m);

  cpu.debug()
  cpu.step()
  cpu.debug()
  cpu.step()
  cpu.debug()
  cpu.step()
  cpu.debug()

}
