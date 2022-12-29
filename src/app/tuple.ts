export type Tuple<A, B> = { first: A; second: B }

export const tuple = <A, B>(first: A, second: B): Tuple<A, B> => ({ first, second })
export const unsafeFromArray = (values: ReadonlyArray<string>): Tuple<string, string> => {
  if (values.length != 2) throw new Error("Invalid legth")
  return tuple(String(values[0]), String(values[1]))
}
