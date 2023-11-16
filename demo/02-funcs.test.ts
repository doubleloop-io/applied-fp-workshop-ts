import { flow, pipe } from "fp-ts/function"

describe("model behaviors - functions", () => {
  // A function is something that accepts an input value (Domain)
  // and produces an output value (Codomain).

  // Functions are described/documented by it's type definition.
  //   f:  InType => OutType

  // functions
  const asString = (value: number): string => value.toString()
  const parseString = (value: string): number => Number(value)
  const reciprocal = (value: number): number => 1.0 / value

  test("manual passing of values to functions", () => {
    const input = "42"

    const input2 = parseString(input)
    const input3 = reciprocal(input2)
    const result = asString(input3)

    expect(result).toEqual("0.023809523809523808")
  })

  test("automatic passing of values to functions (pipe)", () => {
    const input = "42"

    const result = pipe(input, parseString, reciprocal, asString)

    expect(result).toEqual("0.023809523809523808")

    /*
    let program input =
      input
        |> parseString
        |> reciprocal
        |> asString

    def program(input) =
      parseString(input)
        .reciprocal()
        .asString()
    */
  })

  test("compose functions by generating new function (flow)", () => {
    const input = "42"

    const composed = flow(parseString, reciprocal, asString)
    const result = composed(input)

    expect(result).toEqual("0.023809523809523808")

    /*
    let program () =
      parseString
        >> reciprocal
        >> asString

    def program() =
      parseString
        .andThen(reciprocal)
        .andThen(asString)
    */
  })

  test("pipe function with more than one parameter", () => {
    const substring = (size: number, value: string): string =>
      value.substring(0, size)

    const input = "42"

    const result = pipe(
      input,
      parseString,
      reciprocal,
      asString,
      // requires a lambda (aka anonymous function)
      // to adapt input signatures
      (v) => substring(4, v),
    )

    expect(result).toEqual("0.02")
  })

  test("pipe curried function with more than one parameter", () => {
    // curry means one parameter per function
    // (param1: ...) => (param2: ...) => (paramN: ...): ... => implementation
    const substring =
      (size: number) =>
      (value: string): string =>
        value.substring(0, size)

    const input = "42"

    const result = pipe(
      input,
      parseString,
      reciprocal,
      asString,
      // curry enables function partial application
      // that returns the adapted function
      substring(4),
    )

    expect(result).toEqual("0.02")

    /*
    let program input =
      input
        |> parseString
        |> reciprocal
        |> asString
        |> substring 4

    def program(input) =
      parseString(input)
        .reciprocal()
        .asString()
        .substring(4)
    */
  })
})
