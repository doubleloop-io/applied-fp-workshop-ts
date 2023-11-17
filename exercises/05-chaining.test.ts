import { constVoid, pipe } from "fp-ts/function"
import { Option } from "fp-ts/Option"
import * as O from "fp-ts/Option"
import { Either } from "fp-ts/Either"
import * as E from "fp-ts/Either"
import { Task } from "fp-ts/Task"
import * as T from "fp-ts/Task"
import { TaskEither } from "fp-ts/TaskEither"
import * as TE from "fp-ts/TaskEither"

// TODO  1: for each test, remove the skip marker and make it green
describe("chaining", () => {
  type ItemId = number
  type Item = Readonly<{ id: ItemId; qty: number }>

  const checkIn =
    (value: number) =>
    (current: Item): Item => ({
      ...current,
      qty: current.qty + value,
    })

  const anItem: Item = { id: 123, qty: 10 }

  test.skip("chaining w/ Option Monad", () => {
    const load = (id: ItemId): Option<Item> => O.of(anItem)
    const save = (item: Item): Option<void> => O.of(constVoid())

    // TODO 1: remove O.of(constVoid()) and write a program that:
    //  load an item, check in 10 and finally save the item
    const program: Option<void> = O.of(constVoid())
  })

  test.skip("chaining w/ Either Monad", () => {
    type Error = string
    const load = (id: ItemId): Either<Error, Item> => E.of(anItem)
    const save = (item: Item): Either<Error, void> => E.of(constVoid())

    // TODO 2: remove E.of(constVoid()) and write a program that:
    //  load an item, check in 10 and finally save the item
    const program: Either<Error, void> = E.of(constVoid())
  })

  test.skip("chaining w/ Task Monad", () => {
    const load = (id: ItemId): Task<Item> => T.of(anItem)
    const save = (item: Item): Task<void> => T.of(constVoid())

    // TODO 3: remove T.of(constVoid()) and write a program that:
    //  load an item, check in 10 and finally save the item
    const program: Task<void> = T.of(constVoid())
  })

  test.skip("chaining w/ TaskEither Monad", () => {
    type Error = string
    const load = (id: ItemId): TaskEither<Error, Item> => TE.of(anItem)
    const save = (item: Item): TaskEither<Error, void> => TE.of(constVoid())

    // TODO 4: remove TE.of(constVoid()) and write a program that:
    //  load an item, check in 10 and finally save the item
    const program: TaskEither<Error, void> = TE.of(constVoid())
  })
})
