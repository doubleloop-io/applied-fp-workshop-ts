import Fastify from "fastify"
import { Task } from "fp-ts/Task"
import {
  createFileMissionSource,
  createStdinCommandsChannel,
  createStdoutMissionReport,
} from "./adapterts"
import { runApp } from "./handler"

const runAppWired = (pathPlanet: string, pathRover: string): Task<void> =>
  runApp(
    createFileMissionSource(pathPlanet, pathRover),
    createStdinCommandsChannel(),
    createStdoutMissionReport(),
  )

const fastify = Fastify({
  logger: true,
})

fastify.get("/", async (request, reply) => {
  const app = runAppWired("data/planet.txt", "data/rover.txt")
  await app()
  reply.type("application/json").code(200)
  return { hello: "world" }
})

fastify.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
