export type Tuple<A, B> = { first: A; second: B }

export const tuple = <A, B>(first: A, second: B): Tuple<A, B> => ({ first, second })
