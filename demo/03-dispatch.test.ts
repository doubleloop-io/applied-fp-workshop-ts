import { match } from "ts-pattern"

describe("multiple dispatch", () => {
  // Multiple dispatch is a feature in which a function can be dispatched
  // based on the type of one of its arguments.
  // The pattern match enable the structural recursion a fancy name
  // to express a way to dispatch logic by type and data.
  // It goes hand in hand with ADT specially Sum Type.

  type TrafficLight = Red | Yellow | Green
  type Red = { readonly _tag: "Red" }
  type Yellow = { readonly _tag: "Yellow" }
  type Green = { readonly _tag: "Green" }

  const red = (): TrafficLight => ({ _tag: "Red" })
  const yellow = (): TrafficLight => ({ _tag: "Yellow" })
  const green = (): TrafficLight => ({ _tag: "Green" })

  const next = (current: TrafficLight): TrafficLight =>
    match(current)
      .with({ _tag: "Red" }, () => green())
      .with({ _tag: "Yellow" }, () => red())
      .with({ _tag: "Green" }, () => yellow())
      .exhaustive()

  it("provides the next state", () => {
    expect(next(red())).toEqual(green())
    expect(next(yellow())).toEqual(red())
    expect(next(green())).toEqual(yellow())
  })

  // PROGRAM AS VALUES

  // We can model behavior intent with data types.
  // Then, data can be stored, combined and finally interpreted.
  // Whit different interpreters we can execute different behaviors.

  // In order to do that, we must split a program in two parts:
  // - description: build a program description w/ values
  // - evaluation: execute logic based on the description

  type Expr = Num | Plus | Times
  type Num = { readonly _tag: "Num"; readonly x: number }
  type Plus = { readonly _tag: "Plus"; readonly x: Expr; readonly y: Expr }
  type Times = { readonly _tag: "Times"; readonly x: Expr; readonly y: Expr }

  const num = (x: number): Expr => ({ _tag: "Num", x })
  const plus = (x: Expr, y: Expr): Expr => ({ _tag: "Plus", x, y })
  const times = (x: Expr, y: Expr): Expr => ({ _tag: "Times", x, y })

  const program = times(plus(num(1), num(2)), num(3))

  const evalNumber = (e: Expr): number =>
    match(e)
      .with({ _tag: "Num" }, ({ x }) => x)
      .with({ _tag: "Plus" }, ({ x, y }) => evalNumber(x) + evalNumber(y))
      .with({ _tag: "Times" }, ({ x, y }) => evalNumber(x) * evalNumber(y))
      .exhaustive()

  it("eval number", () => {
    const result = evalNumber(program)
    expect(result).toEqual(9)
  })

  const evalString = (e: Expr): string =>
    match(e)
      .with({ _tag: "Num" }, ({ x }) => x.toString())
      .with(
        { _tag: "Plus" },
        ({ x, y }) => `(${evalString(x)} + ${evalString(y)})`,
      )
      .with(
        { _tag: "Times" },
        ({ x, y }) => `(${evalString(x)} * ${evalString(y)})`,
      )
      .exhaustive()

  it("eval string", () => {
    const result = evalString(program)
    expect(result).toEqual("((1 + 2) * 3)")
  })
})
