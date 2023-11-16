export type Tuple<A, B> = { first: A; second: B }

export const tuple = <A, B>(first: A, second: B): Tuple<A, B> => ({
  first,
  second,
})

export const unsafeParse = (
  separator: string,
  input: string,
): Tuple<number, number> => {
  const isNumeric = (value: string | undefined) => {
    if (value == undefined) return false
    return value.match(/^[0-9]+$/i)
  }

  const parts = input.split(separator)
  if (parts.length != 2) throw new Error(`Input: ${input}`)
  if (!isNumeric(parts[0]) || !isNumeric(parts[1]))
    throw new Error(`Input: ${input}`)

  const first = Number(parts[0])
  const second = Number(parts[1])

  if (Number.isNaN(first) || Number.isNaN(second))
    throw new Error(`Input: ${input}`)

  return tuple(first, second)
}
export const unsafeFromArray = (
  values: ReadonlyArray<string>,
): Tuple<string, string> => {
  if (values.length != 2) throw new Error("Invalid length")
  return tuple(String(values[0]), String(values[1]))
}
