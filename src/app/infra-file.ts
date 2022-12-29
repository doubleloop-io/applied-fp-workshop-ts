import { flow, pipe } from "fp-ts/function"
import * as E from "fp-ts/Either"
import { Either, toError } from "fp-ts/Either"
import * as TE from "fp-ts/TaskEither"
import { TaskEither } from "fp-ts/TaskEither"
import * as fs from "fs"
import { Tuple, unsafeFromArray } from "./tuple"

export const loadTuple = (path: fs.PathLike): TaskEither<Error, Tuple<string, string>> =>
  pipe(
    loadLines(path),
    TE.chain(flow(linesToTuple, TE.fromEither)),
    TE.mapLeft((_) => new Error(`Invalid file content: ${path}`)),
  )

const loadLines = (path: fs.PathLike): TaskEither<Error, ReadonlyArray<string>> =>
  pipe(
    loadContent(path),
    TE.map((x) => x.split(/\r?\n/)),
  )

const loadContent = (path: fs.PathLike): TaskEither<Error, string> =>
  TE.tryCatch(() => fs.promises.readFile(path, { encoding: "utf8" }), toError)

const linesToTuple = (values: ReadonlyArray<string>): Either<Error, Tuple<string, string>> =>
  E.tryCatch(() => unsafeFromArray(values), E.toError)
