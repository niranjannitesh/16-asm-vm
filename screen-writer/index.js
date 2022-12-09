import process from "node:process"
import ansiEscapes from "ansi-escapes"

export function screenWriter(add, data) {
  const charValue = data & 0x00ff
  const command = (data & 0xff00) >> 8

  if (command === 0xff) {
    process.stdout.write(ansiEscapes.clearScreen())
  }

  if (command === 0x01) {
    process.stdout.write("\x1b[1m")
  }

  if (command === 0x02) {
    process.stdout.write("\x1b[0m")
  }

  const x = (add % 16) + 1
  const y = Math.floor(add / 16) + 1

  const char = String.fromCharCode(charValue)
  process.stdout.write(ansiEscapes.cursorTo(x, y) + char)
}
