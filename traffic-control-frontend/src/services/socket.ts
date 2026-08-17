import { io } from "socket.io-client"
import type { PoliceUnit } from "./api"

const SOCKET_URL = "http://localhost:5002"

export const socket = io(SOCKET_URL, {
  autoConnect: true,
})

export function onPoliceUnitUpdated(
  callback: (unit: PoliceUnit) => void
) {
  socket.on("POLICE_UNIT_UPDATED", callback)

  return () => {
    socket.off("POLICE_UNIT_UPDATED", callback)
  }
}

export function onDeploymentUpdated(
  callback: (unit: PoliceUnit) => void
) {
  socket.on("DEPLOYMENT_UPDATED", callback)

  return () => {
    socket.off("DEPLOYMENT_UPDATED", callback)
  }
}
