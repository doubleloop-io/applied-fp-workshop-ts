import { pipe } from "fp-ts/function"

describe("custom option monad", () => {
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

    const of: <A>(a: A) => Option<A> = (a) => (a ? some(a) : none())

    const isSome: <A>(oa: Option<A>) => boolean = (oa) => oa._tag === "Some"

    const map: <A, B>(f: (a: A) => B) => (fa: Option<A>) => Option<B> =
        (f) => (fa) => {
            switch (fa._tag) {
                case "Some":
                    return some(f(fa.value))
                case "None":
                    return none()
            }
        }

    const chain: <A, B>(
        f: (a: A) => Option<B>,
    ) => (fa: Option<A>) => Option<B> = (f) => (fa) => {
        switch (fa._tag) {
            case "Some":
                return f(fa.value)
            case "None":
                return none()
        }
    }

    const fold: <A, B>(
        onNone: () => B,
        onSome: (a: A) => B,
    ) => (ma: Option<A>) => B = (on, os) => (fa) => {
        switch (fa._tag) {
            case "Some":
                return os(fa.value)
            case "None":
                return on()
        }
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
