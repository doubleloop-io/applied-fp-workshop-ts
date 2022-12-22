// TODO - 6: remove disable comment
/* eslint-disable @typescript-eslint/no-unused-vars */

import { pipe } from "fp-ts/function"

// TODO - 1: remove skip marker
describe.skip("custom lazy monad", () => {
    let logs: string[] = []

    beforeEach(() => {
        logs = []
    })

    const log: (l: string) => void = (l) => (logs = [...logs, l])

    const increment: (x: number) => number = (x) => {
        log("increment")
        return x + 1
    }

    const reverseString: (x: number) => Lazy<string> = (x) => {
        log("reverseString")
        return of(x.toString().split("").reverse().join(""))
    }

    test("creation phase", () => {
        // TODO - 2: implement 'of' function
        const result = of(10)

        expect(result()).toStrictEqual(10)
    })

    test("combination phase - normal", () => {
        // TODO - 3: implement 'map' function
        const result = pipe(of(10), map(increment))

        expect(logs).toStrictEqual([])
        expect(result()).toStrictEqual(11)
        expect(logs).toStrictEqual(["increment"])
    })

    test("combination phase - effectful", () => {
        // TODO - 4: implement 'chain' function
        const result = pipe(of(10), chain(reverseString))

        expect(logs).toStrictEqual([])
        expect(result()).toStrictEqual("01")
        expect(logs).toStrictEqual(["reverseString"])
    })

    test("removal phase - value", () => {
        // TODO - 5: implement 'fold' function
        const result = pipe(of(10), run())

        expect(result).toStrictEqual(10)
    })

    // data types
    type Lazy<A> = () => A

    // constructors
    type ofFn = <A>(a: A) => Lazy<A>
    const of: ofFn = (a) => () => {
        throw new Error("TODO")
    }

    // combiners
    type mapFn = <A, B>(f: (a: A) => B) => (fa: Lazy<A>) => Lazy<B>
    const map: mapFn = (f) => (fa) => () => {
        throw new Error("TODO")
    }

    type chainFn = <A, B>(f: (a: A) => Lazy<B>) => (fa: Lazy<A>) => Lazy<B>
    const chain: chainFn = (f) => (fa) => () => {
        throw new Error("TODO")
    }

    // folders / runners
    type runFn = <A>() => (fa: Lazy<A>) => A
    const run: runFn = () => (fa) => {
        throw new Error("TODO")
    }
})
