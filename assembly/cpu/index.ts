import { createMemory } from "../memory"
import instructions from "./instructions"

export default class CPU {
  memory: DataView
  registerNames: string[]
  registers!: DataView
  registerMap!: Map<string, i32>
  stackFrameSize: u32

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
      "sp",
      "fp",
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

    const spAddr: u16 = (memory.byteLength - 1 * 2) as u16

    this.setRegister("sp", spAddr)
    this.setRegister("fp", spAddr)

    this.stackFrameSize = 0
  }

  debug(): void {
    for (let i = 0; i < this.registerNames.length; i++) {
      const name = this.registerNames[i]
      console.log(
        `${name}: ${this.getRegister(name).toString(16).padStart(4, "0")}`
      )
    }
    console.log()
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

  /**
   * fetch basically fetches the data at current instruction pointer and increments the pointer
   * since the instructions are 8 bit we need a 8 bit fetch
   */
  fetch(): u8 {
    const nextInstructionAddress = this.getRegister("ip")
    const instruction = this.memory.getUint8(nextInstructionAddress)
    this.setRegister("ip", nextInstructionAddress + 1)
    return instruction
  }

  /**
   * fetch basically fetches the data at current instruction pointer and increments the pointer
   * since the its a 16 bit vm we need a 16 bit fetch
   */
  fetch16(): u16 {
    const nextInstructionAddress = this.getRegister("ip")
    const instruction = this.memory.getUint16(nextInstructionAddress)
    this.setRegister("ip", nextInstructionAddress + 2)
    return instruction
  }

  push(value: u16): void {
    const spAddr = this.getRegister("sp")
    this.memory.setUint16(spAddr, value)
    this.setRegister("sp", spAddr - 2)
    this.stackFrameSize += 2
  }

  pop(): u16 {
    const spAddr = this.getRegister("sp")
    const value = this.memory.getUint16(spAddr)
    this.setRegister("sp", spAddr + 2)
    this.stackFrameSize -= 2
    return value
  }

  pushState(): void {
    for (let i = 1; i <= 8; i++) {
      this.push(this.getRegister(`r${i}`))
    }
    this.push(this.getRegister("ip"))
    this.push((this.stackFrameSize + 2) as u16)

    this.setRegister("fp", this.getRegister("sp"))
    this.stackFrameSize = 0
  }

  popState(): void {
    const framePointerAddress = this.getRegister("fp")
    this.setRegister("sp", framePointerAddress)
    this.stackFrameSize = this.pop()
    const stackFrameSize = this.stackFrameSize

    this.setRegister("ip", this.pop())
    for (let i = 8; i >= 1; i--) {
      this.setRegister(`r${i}`, this.pop())
    }

    const nArgs = this.pop()
    for (let i: u16 = 0; i < nArgs; i++) {
      this.pop()
    }

    this.setRegister("fp", (framePointerAddress + stackFrameSize) as u16)
  }

  exec(instruction: u8): void {
    switch (instruction) {
      // move 0x1000 r1
      case instructions.MOV_LIT_REG: {
        const literal = this.fetch16()
        const reg = this.fetch()
        this.registers.setUint16(reg, literal)
        return
      }

      // mov r1 r2
      case instructions.MOV_REG_REG: {
        const fromReg = this.fetch()
        const toReg = this.fetch()
        const value = this.registers.getUint16(fromReg)
        this.registers.setUint16(toReg, value)
        return
      }

      // mov r1 0x0001
      case instructions.MOV_REG_MEM: {
        const fromReg = this.fetch()
        const addr = this.fetch16()
        const value = this.registers.getUint16(fromReg)
        this.memory.setUint16(addr, value)
        return
      }

      // mov 0x0001 r1
      case instructions.MOV_MEM_REG: {
        const addr = this.fetch16()
        const toReg = this.fetch()
        const value = this.memory.getUint16(addr)
        this.registers.setUint16(toReg, value)
        return
      }

      // add r1 r2
      case instructions.ADD_REG_REG: {
        const rX = this.fetch()
        const rY = this.fetch()
        const rXValue = this.registers.getUint16(rX * 2)
        const rYValue = this.registers.getUint16(rY * 2)
        this.setRegister("acc", rXValue + rYValue)
        return
      }

      // jne 0x1000
      case instructions.JMP_NOT_EQ: {
        const value = this.fetch16()
        const addr = this.fetch16()
        if (value != this.getRegister("acc")) {
          this.setRegister("ip", addr)
        }
        return
      }

      // psh 0x1000
      case instructions.PSH_LIT: {
        const value = this.fetch16()
        this.push(value)
        return
      }

      // psh r1
      case instructions.PSH_REG: {
        const reg = this.fetch()
        const value = this.registers.getUint16(reg)
        this.push(value)
        return
      }

      // pop r1
      case instructions.POP_REG: {
        const reg = this.fetch()
        this.registers.setUint16(reg, this.pop())
        return
      }

      // cal 0x2454
      case instructions.CAL_LIT: {
        const addr = this.fetch16()
        this.pushState()
        this.setRegister("ip", addr)
        return
      }

      // cal r3
      case instructions.CAL_REG: {
        const reg = this.fetch()
        const addr = this.registers.getUint16(reg)
        this.pushState()
        this.setRegister("ip", addr)
        return
      }

      // ret
      case instructions.RET: {
        this.popState()
        return
      }
    }
  }

  step(): void {
    const instruction = this.fetch()
    return this.exec(instruction)
  }

  viewMemoryAt(addr: i32, n: u32 = 8): void {
    const bytes = Uint8Array.wrap(this.memory.buffer, addr)
    const values: string[] = []
    for (let i: u32 = 0; i < n; i++) {
      values[i] = `0x${bytes[i].toString(16).padStart(2, "0")}`
    }
    console.log(`0x${addr.toString(16).padStart(2, "0")}: ${values.join(" ")}`)
  }
}
