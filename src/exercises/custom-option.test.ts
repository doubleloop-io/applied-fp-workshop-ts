/* eslint-disable @typescript-eslint/no-unused-vars */

import { pipe } from "fp-ts/function"

describe.skip("custom option monad", () => {
    type Option<A> = None | Some<A>
    type None = {
        readonly _tag: "None"
    }
    type Some<A> = {
        readonly _tag: "Some"
        readonly value: A
    }

    const none: <A>() => Option<A> = () => ({ _tag: "None" })

    const some: <A>(a: A) => Option<A> = (a) => ({ _tag: "Some", value: a })

    const of: <A>(a: A) => Option<A> = (a) => {
        throw new Error("TODO")
    }

    const isSome: <A>(oa: Option<A>) => boolean = (oa) => {
        throw new Error("TODO")
    }

    const map: <A, B>(f: (a: A) => B) => (fa: Option<A>) => Option<B> =
        (f) => (fa) => {
            throw new Error("TODO")
        }

    const chain: <A, B>(
        f: (a: A) => Option<B>,
    ) => (fa: Option<A>) => Option<B> = (f) => (fa) => {
        throw new Error("TODO")
    }

    const fold: <A, B>(
        onNone: () => B,
        onSome: (a: A) => B,
    ) => (ma: Option<A>) => B = (on, os) => (fa) => {
        throw new Error("TODO")
    }

    const increment: (x: number) => number = (x) => x + 1

    const reverseString: (x: number) => Option<string> = (x) =>
        some(x.toString().split("").reverse().join(""))

    test("creation phase", () => {
        const result = of(10)

        expect(isSome(result)).toBeTruthy()
    })

    test("combination phase - normal", () => {
        const result = pipe(some(10), map(increment))

        expect(result).toStrictEqual(some(11))
    })

    test("combination phase - effectful", () => {
        const result = pipe(some(10), chain(reverseString))

        expect(result).toStrictEqual(some("01"))
    })

    test("removal phase - value", () => {
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
})
