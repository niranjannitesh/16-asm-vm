import { init, step } from "../build/debug.js";
import readline from 'node:readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

init()

rl.on('line', () => {
  step(true)
})

