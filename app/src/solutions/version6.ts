import { tuple, Tuple, parseTuple } from "../../utils/tuple"
import { ask, logError, logInfo } from "../../utils/infra-console"
import { match } from "ts-pattern"
import { constVoid, flow, pipe } from "fp-ts/function"
import * as E from "fp-ts/Either"
import { Either } from "fp-ts/Either"
import * as T from "fp-ts/Task"
import { Task } from "fp-ts/Task"
import * as TE from "fp-ts/TaskEither"
import { TaskEither } from "fp-ts/TaskEither"
import { loadTuple } from "../../utils/infra-file"
import * as O from "fp-ts/Option"
import { Option } from "fp-ts/Option"

export type Rover = Readonly<{ position: Position; direction: Direction }>
export type Position = Readonly<{ x: number; y: number }>
export type Direction = "Nord" | "Est" | "West" | "South"
export type Planet = Readonly<{
  size: Size
  obstacles: ReadonlyArray<Obstacle>
}>
export type Size = Readonly<{ width: number; height: number }>
export type Obstacle = Readonly<{ position: Position }>
export type Command = "TurnRight" | "TurnLeft" | "MoveForward" | "MoveBackward"
export type Commands = ReadonlyArray<Command>
export type ObstacleDetected = Rover
type Delta = Readonly<{ x: number; y: number }>

const planet =
  (size: Size) =>
  (obstacles: ReadonlyArray<Obstacle>): Planet => ({ size, obstacles })

const rover =
  (position: Position) =>
  (direction: Direction): Rover => ({ position, direction })

const position =
  (x: number) =>
  (y: number): Position => ({ x, y })

const size =
  (width: number) =>
  (height: number): Size => ({ width, height })

const obstacle =
  (x: number) =>
  (y: number): Obstacle => ({ position: { x, y } })

const delta =
  (x: number) =>
  (y: number): Delta => ({ x, y })

type ParseError =
  | InvalidSize
  | InvalidObstacle
  | InvalidPosition
  | InvalidDirection
  | InvalidCommand

type InvalidSize = Readonly<{ _tag: "InvalidSize"; error: Error }>
type InvalidObstacle = Readonly<{ _tag: "InvalidObstacle"; error: Error }>
type InvalidPosition = Readonly<{ _tag: "InvalidPosition"; error: Error }>
type InvalidDirection = Readonly<{ _tag: "InvalidDirection"; error: Error }>
type InvalidCommand = Readonly<{ _tag: "InvalidCommand"; error: Error }>

const invalidSize = (e: Error): ParseError => ({
  _tag: "InvalidSize",
  error: e,
})
const invalidObstacle = (e: Error): ParseError => ({
  _tag: "InvalidObstacle",
  error: e,
})
const invalidPosition = (e: Error): ParseError => ({
  _tag: "InvalidPosition",
  error: e,
})
const invalidDirection = (e: Error): ParseError => ({
  _tag: "InvalidDirection",
  error: e,
})
const invalidCommand = (e: Error): ParseError => ({
  _tag: "InvalidCommand",
  error: e,
})

// ELM ARCHITECTURE

type AppState = AppLoading | AppReady | AppFailed

type AppLoading = Readonly<{ _tag: "AppLoading" }>
type AppReady = Readonly<{ _tag: "AppReady"; planet: Planet; rover: Rover }>
type AppFailed = Readonly<{ _tag: "AppFailed" }>

export const appLoading = (): AppState => ({ _tag: "AppLoading" })
export const appReady = (planet: Planet, rover: Rover): AppState => ({
  _tag: "AppReady",
  planet,
  rover,
})
export const appFailed = (): AppState => ({ _tag: "AppFailed" })

type Effect =
  | LoadMissionEffect
  | AskCommandsEffect
  | ReportObstacleDetectedEffect
  | ReportSequenceCompletedEffect
  | ReportErrorEffect

type LoadMissionEffect = Readonly<{
  _tag: "LoadMissionEffect"
  pathPlanet: string
  pathRover: string
}>
type AskCommandsEffect = Readonly<{ _tag: "AskCommandsEffect" }>
type ReportObstacleDetectedEffect = Readonly<{
  _tag: "ReportObstacleDetectedEffect"
  rover: ObstacleDetected
}>
type ReportSequenceCompletedEffect = Readonly<{
  _tag: "ReportSequenceCompletedEffect"
  rover: Rover
}>
type ReportErrorEffect = Readonly<{ _tag: "ReportErrorEffect"; error: Error }>

export const loadMission = (pathPlanet: string, pathRover: string): Effect => ({
  _tag: "LoadMissionEffect",
  pathPlanet,
  pathRover,
})
export const askCommands = (): Effect => ({
  _tag: "AskCommandsEffect",
})
export const reportObstacleDetected = (rover: ObstacleDetected): Effect => ({
  _tag: "ReportObstacleDetectedEffect",
  rover,
})
export const reportSequenceCompleted = (rover: Rover): Effect => ({
  _tag: "ReportSequenceCompletedEffect",
  rover,
})
export const reportError = (error: Error): Effect => ({
  _tag: "ReportErrorEffect",
  error,
})

type Event =
  | LoadMissionSuccessfulEvent
  | LoadMissionFailedEvent
  | CommandsReceivedEvent

type LoadMissionSuccessfulEvent = Readonly<{
  _tag: "LoadMissionSuccessfulEvent"
  planet: Planet
  rover: Rover
}>
type LoadMissionFailedEvent = Readonly<{
  _tag: "LoadMissionFailedEvent"
  error: Error
}>
type CommandsReceivedEvent = Readonly<{
  _tag: "CommandsReceivedEvent"
  commands: Commands
}>

export const loadMissionSuccessful = (planet: Planet, rover: Rover): Event => ({
  _tag: "LoadMissionSuccessfulEvent",
  planet,
  rover,
})
export const loadMissionFailed = (error: Error): Event => ({
  _tag: "LoadMissionFailedEvent",
  error,
})
export const commandsReceived = (commands: Commands): Event => ({
  _tag: "CommandsReceivedEvent",
  commands,
})

const start = <M, EV, EF>(
  init: () => Tuple<M, EF>,
  update: (model: M, event: EV) => Tuple<M, EF>,
  infrastructure: (effect: EF) => Task<Option<EV>>,
): Task<void> => {
  const loop = (model: M, effect: EF): Task<void> =>
    pipe(
      infrastructure(effect),
      T.flatMap((wishToContinue) =>
        match(wishToContinue)
          .with({ _tag: "Some" }, (ev) => {
            const { first: nextModel, second: nextEffect } = update(
              model,
              ev.value,
            )
            return loop(nextModel, nextEffect)
          })
          .otherwise(() => T.of(constVoid())),
      ),
    )

  const { first: iniModel, second: initEffect } = init()
  return loop(iniModel, initEffect)
}

const keepGoing = (ev: Event): Option<Event> => O.some(ev)
const stop = (_: void): Option<Event> => O.none

export const init =
  (pathPlanet: string, pathRover: string) => (): Tuple<AppState, Effect> =>
    tuple(appLoading(), loadMission(pathPlanet, pathRover))

export const update = (
  model: AppState,
  event: Event,
): Tuple<AppState, Effect> =>
  match<[AppState, Event], Tuple<AppState, Effect>>([model, event])
    .with(
      [{ _tag: "AppLoading" }, { _tag: "LoadMissionSuccessfulEvent" }],
      ([_, ev]) => tuple(appReady(ev.planet, ev.rover), askCommands()),
    )
    .with(
      [{ _tag: "AppLoading" }, { _tag: "LoadMissionFailedEvent" }],
      ([_, ev]) => tuple(appFailed(), reportError(ev.error)),
    )
    .with(
      [{ _tag: "AppReady" }, { _tag: "CommandsReceivedEvent" }],
      ([m, ev]) =>
        pipe(
          executeAll(m.planet)(m.rover)(ev.commands),
          E.fold(
            (ob) => tuple(appReady(m.planet, ob), reportObstacleDetected(ob)),
            (r) => tuple(appReady(m.planet, r), reportSequenceCompleted(r)),
          ),
        ),
    )
    .otherwise(() =>
      tuple(
        appFailed(),
        reportError(
          new Error(`Cannot handle ${event} event in ${model} state.`),
        ),
      ),
    )

export const infrastructure = (effect: Effect): Task<Option<Event>> => {
  return match(effect)
    .with({ _tag: "LoadMissionEffect" }, (eff) => {
      const loadMission =
        (p: Planet) =>
        (r: Rover): Event =>
          loadMissionSuccessful(p, r)

      return pipe(
        pipe(
          TE.of(loadMission),
          TE.ap(loadPlanet(eff.pathPlanet)),
          TE.ap(loadRover(eff.pathRover)),
        ),
        TE.getOrElse(flow(loadMissionFailed, T.of)),
        T.map(keepGoing),
      )
    })
    .with({ _tag: "AskCommandsEffect" }, () =>
      pipe(
        loadCommands(),
        TE.map(commandsReceived),
        TE.getOrElse(flow(loadMissionFailed, T.of)),
        T.map(keepGoing),
      ),
    )
    .with({ _tag: "ReportObstacleDetectedEffect" }, (eff) =>
      pipe(writeObstacleDetected(eff.rover), T.map(stop)),
    )
    .with({ _tag: "ReportSequenceCompletedEffect" }, (eff) =>
      pipe(writeSequenceCompleted(eff.rover), T.map(stop)),
    )
    .with({ _tag: "ReportErrorEffect" }, (eff) =>
      pipe(writeError(eff.error), T.map(stop)),
    )
    .exhaustive()
}

// ENTRY POINT

const runApp = (pathPlanet: string, pathRover: string): Task<void> =>
  start(init(pathPlanet, pathRover), update, infrastructure)

// INFRASTRUCTURE

const toError = (error: ParseError): Error => new Error(renderParseError(error))

const loadPlanet = (path: string): TaskEither<Error, Planet> =>
  pipe(
    loadTuple(path),
    TE.flatMap(flow(parsePlanet, E.mapLeft(toError), TE.fromEither)),
  )

const loadRover = (path: string): TaskEither<Error, Rover> =>
  pipe(
    loadTuple(path),
    TE.flatMap(flow(parseRover, E.mapLeft(toError), TE.fromEither)),
  )

const loadCommands = (): TaskEither<Error, Commands> =>
  pipe(
    ask("Waiting commands..."),
    TE.fromTask,
    TE.flatMap(flow(parseCommands, E.mapLeft(toError), TE.fromEither)),
  )

const writeSequenceCompleted = (rover: Rover): Task<void> =>
  pipe(rover, renderComplete, logInfo)

const writeObstacleDetected = (rover: Rover): Task<void> =>
  pipe(rover, renderObstacle, logInfo)

const writeError = (error: Error): Task<void> =>
  pipe(error, renderError, logError)

// PARSING

const parseCommands = (
  input: string,
): Either<ParseError, ReadonlyArray<Command>> =>
  pipe(input.split(""), E.traverseArray(parseCommand))

const parseCommand = (input: string): Either<ParseError, Command> =>
  match(input.toLocaleUpperCase())
    .with("R", () => E.right("TurnRight" as const))
    .with("L", () => E.right("TurnLeft" as const))
    .with("F", () => E.right("MoveForward" as const))
    .with("B", () => E.right("MoveBackward" as const))
    .otherwise(() => E.left(invalidCommand(new Error(`Input: ${input}`))))

const parseRover = ({
  first,
  second,
}: Tuple<string, string>): Either<ParseError, Rover> =>
  pipe(E.of(rover), E.ap(parsePosition(first)), E.ap(parseDirection(second)))

const parsePosition = (input: string): Either<ParseError, Position> =>
  pipe(
    input,
    parseTuple(","),
    E.mapLeft(invalidPosition),
    E.map(({ first, second }) => position(first)(second)),
  )

const parseDirection = (input: string): Either<ParseError, Direction> =>
  match(input.toLocaleUpperCase())
    .with("N", () => E.right("Nord" as const))
    .with("E", () => E.right("Est" as const))
    .with("W", () => E.right("West" as const))
    .with("S", () => E.right("South" as const))
    .otherwise(() => E.left(invalidDirection(new Error(`Input: ${input}`))))

const parsePlanet = ({
  first,
  second,
}: Tuple<string, string>): Either<ParseError, Planet> =>
  pipe(E.of(planet), E.ap(parseSize(first)), E.ap(parseObstacles(second)))

const parseSize = (input: string): Either<ParseError, Size> =>
  pipe(
    input,
    parseTuple("x"),
    E.mapLeft(invalidSize),
    E.map((tuple) => size(tuple.first)(tuple.second)),
  )

const parseObstacles = (
  input: string,
): Either<ParseError, ReadonlyArray<Obstacle>> =>
  pipe(input.split(" "), E.traverseArray(parseObstacle))

const parseObstacle = (input: string): Either<ParseError, Obstacle> =>
  pipe(
    input,
    parseTuple(","),
    E.mapLeft(invalidObstacle),
    E.map((tuple) => obstacle(tuple.first)(tuple.second)),
  )

// RENDERING

export const renderError = (error: Error): string => error.message

const renderParseError = (error: ParseError): string =>
  match(error)
    .with(
      { _tag: "InvalidCommand" },
      (e) => `Invalid command. ${e.error.message}`,
    )
    .with(
      { _tag: "InvalidDirection" },
      (e) => `Invalid direction. ${e.error.message}`,
    )
    .with(
      { _tag: "InvalidObstacle" },
      (e) => `Invalid obstacle. ${e.error.message}`,
    )
    .with(
      { _tag: "InvalidPosition" },
      (e) => `Invalid position. ${e.error.message}`,
    )
    .with({ _tag: "InvalidSize" }, (e) => `Invalid size. ${e.error.message}`)
    .exhaustive()

export const renderComplete = (rover: Rover): string =>
  `${rover.position.x}:${rover.position.y}:${rover.direction}`

export const renderObstacle = (rover: Rover): string =>
  `O:${rover.position.x}:${rover.position.y}:${rover.direction}`

// DOMAIN

const executeAll =
  (planet: Planet) =>
  (rover: Rover) =>
  (commands: Commands): Either<ObstacleDetected, Rover> =>
    commands.reduce(
      (prev, cmd) =>
        pipe(
          prev,
          E.flatMap((next) => execute(planet)(next)(cmd)),
        ),
      E.of<ObstacleDetected, Rover>(rover),
    )

const execute =
  (planet: Planet) =>
  (rover: Rover) =>
  (command: Command): Either<ObstacleDetected, Rover> =>
    match(command)
      .with("TurnRight", () => E.of(turnRight(rover)))
      .with("TurnLeft", () => E.of(turnLeft(rover)))
      .with("MoveForward", () => moveForward(planet, rover))
      .with("MoveBackward", () => moveBackward(planet, rover))
      .exhaustive()

const turnRight = (rover: Rover): Rover => {
  const direction = match(rover.direction)
    .with("Nord", () => "Est" as const)
    .with("Est", () => "South" as const)
    .with("South", () => "West" as const)
    .with("West", () => "Nord" as const)
    .exhaustive()

  return pipe(rover, updateRover({ direction }))
}

const turnLeft = (rover: Rover): Rover => {
  const direction = match(rover.direction)
    .with("Nord", () => "West" as const)
    .with("West", () => "South" as const)
    .with("South", () => "Est" as const)
    .with("Est", () => "Nord" as const)
    .exhaustive()

  return pipe(rover, updateRover({ direction }))
}

const moveForward = (
  planet: Planet,
  rover: Rover,
): Either<ObstacleDetected, Rover> =>
  pipe(
    rover.direction,
    toDelta,
    nextPosition(planet, rover),
    E.map((position) => updateRover({ position })(rover)),
  )

const moveBackward = (
  planet: Planet,
  rover: Rover,
): Either<ObstacleDetected, Rover> =>
  pipe(
    rover.direction,
    opposite,
    toDelta,
    nextPosition(planet, rover),
    E.map((position) => updateRover({ position })(rover)),
  )

const opposite = (direction: Direction): Direction =>
  match(direction)
    .with("Nord", () => "South" as const)
    .with("South", () => "Nord" as const)
    .with("Est", () => "West" as const)
    .with("West", () => "Est" as const)
    .exhaustive()

const toDelta = (direction: Direction): Delta =>
  match(direction)
    .with("Nord", () => delta(0)(1))
    .with("South", () => delta(0)(-1))
    .with("Est", () => delta(1)(0))
    .with("West", () => delta(-1)(0))
    .exhaustive()

const nextPosition =
  (planet: Planet, rover: Rover) =>
  (delta: Delta): Either<ObstacleDetected, Position> => {
    const newX = wrap(rover.position.x, planet.size.width, delta.x)
    const newY = wrap(rover.position.y, planet.size.height, delta.y)
    const candidate = position(newX)(newY)

    const hitObstacle = planet.obstacles.findIndex(
      (x) => x.position.x == newX && x.position.y == newY,
    )

    return hitObstacle != -1
      ? E.left(rover)
      : E.right(updatePosition(candidate)(rover.position))
  }

const wrap = (value: number, limit: number, delta: number): number =>
  (((value + delta) % limit) + limit) % limit

const updatePosition =
  (values: Partial<Position>) =>
  (actual: Position): Position => ({
    ...actual,
    ...values,
  })

const updateRover =
  (values: Partial<Rover>) =>
  (actual: Rover): Rover => ({
    ...actual,
    ...values,
  })
