import Fastify from "fastify"
import {
  createFileMissionSource,
  createRequestCommandsChannel,
  createResponseMissionReport,
  MissionRequest,
  MissionResponse,
} from "./adapterts"
import { runApp } from "./handler"

const fastify = Fastify({
  logger: true,
})

const pathPlanet = "data/planet.txt"
const pathRover = "data/rover.txt"

fastify.get(
  "/rover/:commands",
  async (request: MissionRequest, reply: MissionResponse) => {
    const missionSource = createFileMissionSource(pathPlanet, pathRover)
    const commandsSource = createRequestCommandsChannel(request.params)
    const report = { code: 200, result: "" }
    const missionReport = createResponseMissionReport(report)

    const app = runApp(missionSource, commandsSource, missionReport)
    await app()

    return reply
      .type("application/json")
      .code(report.code)
      .send({ result: report.result })
  },
)

fastify.get("/", (request, reply) => {
  reply.send("hello world")
})

export default {
  run(): void {
    fastify.listen({ port: 8080 }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening at ${address}`)
      console.log(`Try sequence completed ${address}/rover/RBBLBRF`)
      console.log(`Try hit an obstacle ${address}/rover/RFF`)
      console.log(`Try invalid commands ${address}/rover/RBXL`)
    })
  },
}
