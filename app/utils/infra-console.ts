import { pipe } from "fp-ts/function"
import { Task } from "fp-ts/Task"
import * as T from "fp-ts/Task"
import * as C from "fp-ts/Console"
import { createInterface } from "readline"

const RESET = "\x1b[0m"
const GREEN = "\x1b[32m"
const RED = "\x1b[31m"

export const ask = (question: string): Task<string> =>
  pipe(puts(question), T.flatMap(reads))

export const logInfo = (message: string): Task<void> =>
  puts(green(`[OK] ${message}`))

export const logError = (message: string): Task<void> =>
  puts(red(`[ERROR] ${message}`))

export const reads = (): Task<string> => () =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question("> ", (answer) => {
      rl.close()
      resolve(answer)
    })
  })

export const puts = (message: string): Task<void> => T.fromIO(C.log(message))

export const green = (message: string): string => `${GREEN}${message}${RESET}`
export const red = (message: string): string => `${RED}${message}${RESET}`
