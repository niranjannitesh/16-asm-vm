import { createMemory } from "../memory"
import * as instructions from './instructions'

export default class CPU {
  memory!: DataView
  registerNames!: string[]
  registers!: DataView
  registerMap!: Map<string, i32>

  constructor(memory: DataView) {
    this.memory = memory

    this.registerNames = [
      "ip",
      "acc",
      "r1",
      "r2",
      "r3",
      "r4",
      "r5",
      "r6",
      "r7",
      "r8",
    ]

    /**
     * Since this is a 16 bit vm and 1 byte is 8 bit multiplying it by 2 gives us 16 bit
     */
    this.registers = createMemory(this.registerNames.length * 2)

    this.registerMap = this.registerNames.reduce<Map<string, i32>>(
      (map, name: string, i: i32) => {
        map.set(name, i * 2)
        return map
      },
      new Map<string, i32>()
    )
  }

  debug(): void {
    for (let i = 0; i < this.registerNames.length; i++) {
      const name = this.registerNames[i];
      console.log(`${name}: ${this.getRegister(name).toString(16).padStart(4, '0')}`)
    }
    console.log();
  }

  getRegister(name: string): u16 {
    if (!this.registerNames.includes(name)) {
      throw new Error(`getRegister: no such register '${name}'`)
    }
    return this.registers.getUint16(this.registerMap.get(name))
  }

  setRegister(name: string, value: u16): void {
    if (!this.registerNames.includes(name)) {
      throw new Error(`setRegister: no such register '${name}'`)
    }
    this.registers.setInt16(this.registerMap.get(name), value)
  }

  fetch(): u8 {
    const nextInstructionAddress = this.getRegister("ip")
    const instruction = this.memory.getUint8(nextInstructionAddress)
    this.setRegister("ip", nextInstructionAddress + 1)
    return instruction
  }

  fetch16(): u16 {
    const nextInstructionAddress = this.getRegister("ip")
    const instruction = this.memory.getUint16(nextInstructionAddress)
    this.setRegister("ip", nextInstructionAddress + 2)
    return instruction
  }

  exec(instruction: u8): void {
    switch (instruction) {
      case instructions.MOV_LIT_R1: {
        const literal = this.fetch16()
        this.setRegister("r1", literal)
        return
      }
      case instructions.MOV_LIT_R2: {
        const literal = this.fetch16()
        this.setRegister("r2", literal)
        return
      }
      case instructions.ADD_REG_REG: {
        const rX = this.fetch()
        const rY = this.fetch()
        const rXValue = this.registers.getUint16(rX * 2);
        const rYValue = this.registers.getUint16(rY * 2);
        this.setRegister("acc", rXValue + rYValue);
        return
      }
    }
  }

  step(): void {
    const instruction = this.fetch()
    return this.exec(instruction);
  }
}
