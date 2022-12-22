// TODO - 6: remove disable comment
/* eslint-disable @typescript-eslint/no-unused-vars */

import { pipe } from "fp-ts/function"

// TODO - 1: remove skip marker
describe.skip("custom option monad", () => {
    const increment: (x: number) => number = (x) => x + 1

    const reverseString: (x: number) => Option<string> = (x) =>
        some(x.toString().split("").reverse().join(""))

    test("creation phase", () => {
        // TODO - 2: implement 'of' function
        const result = of(10)

        expect(isSome(result)).toBeTruthy()
    })

    test("combination phase - normal", () => {
        // TODO - 3: implement 'map' function
        const result = pipe(some(10), map(increment))

        expect(result).toStrictEqual(some(11))
    })

    test("combination phase - effectful", () => {
        // TODO - 4: implement 'chain' function
        const result = pipe(some(10), chain(reverseString))

        expect(result).toStrictEqual(some("01"))
    })

    test("removal phase - value", () => {
        // TODO - 5: implement 'fold' function
        const result = pipe(
            some(10),
            fold(
                () => "none",
                (x) => x.toString(),
            ),
        )

        expect(result).toStrictEqual("10")
    })

    test("removal phase - alternative value", () => {
        const result = pipe(
            none<string>(),
            fold(
                () => "none",
                (x) => x.toString(),
            ),
        )

        expect(result).toStrictEqual("none")
    })

    // data types
    type Option<A> = None | Some<A>
    type None = {
        readonly _tag: "None"
    }
    type Some<A> = {
        readonly _tag: "Some"
        readonly value: A
    }

    // constructors
    type noneFn = <A>() => Option<A>
    const none: noneFn = () => ({ _tag: "None" })

    type someFn = <A>(a: A) => Option<A>
    const some: someFn = (a) => ({ _tag: "Some", value: a })

    type ofFn = <A>(a: A) => Option<A>
    const of: ofFn = (a) => {
        throw new Error("TODO")
    }

    // utilities
    type IsSome = <A>(oa: Option<A>) => boolean
    const isSome: IsSome = (oa) => oa._tag === "Some"

    // combiners
    type mapFn = <A, B>(f: (a: A) => B) => (fa: Option<A>) => Option<B>
    const map: mapFn = (f) => (fa) => {
        throw new Error("TODO")
    }

    type chainFn = <A, B>(
        f: (a: A) => Option<B>,
    ) => (fa: Option<A>) => Option<B>
    const chain: chainFn = (f) => (fa) => {
        throw new Error("TODO")
    }

    // folders / runners
    type foldFn = <A, B>(
        onNone: () => B,
        onSome: (a: A) => B,
    ) => (fa: Option<A>) => B
    const fold: foldFn = (onNone, onSome) => (fa) => {
        throw new Error("TODO")
    }
})
