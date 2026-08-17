import { useEffect, useState } from "react"
import { getPoliceUnits } from "../../services/api"
import type { PoliceUnit } from "../../services/api"
import {
  onPoliceUnitUpdated,
  onDeploymentUpdated,
} from "../../services/socket"

function getStatusStyle(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-500/15 text-green-400"

    case "DEPLOYED":
      return "bg-blue-500/15 text-blue-400"

    case "BUSY":
      return "bg-yellow-500/15 text-yellow-400"

    case "OFFLINE":
      return "bg-red-500/15 text-red-400"

    default:
      return "bg-slate-700 text-slate-400"
  }
}

function PoliceUnitList() {
  const [units, setUnits] = useState<PoliceUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadPoliceUnits = async () => {
      try {
        const data = await getPoliceUnits()
        setUnits(data)
      } catch (err) {
        console.error(err)
        setError("Unable to load police units")
      } finally {
        setLoading(false)
      }
    }

    loadPoliceUnits()

    const removePoliceListener = onPoliceUnitUpdated(
      (updatedUnit) => {
        setUnits((currentUnits) =>
          currentUnits.map((unit) =>
            unit.id === updatedUnit.id
              ? updatedUnit
              : unit
          )
        )
      }
    )

    const removeDeploymentListener = onDeploymentUpdated(
      (updatedUnit) => {
        setUnits((currentUnits) =>
          currentUnits.map((unit) =>
            unit.id === updatedUnit.id
              ? updatedUnit
              : unit
          )
        )
      }
    )

    return () => {
      removePoliceListener()
      removeDeploymentListener()
    }
  }, [])

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Police Units
        </h2>

        <p className="text-sm text-slate-400">
          Current unit availability
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-400">
          Loading police units...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="rounded-lg border border-slate-800 bg-slate-950 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">
                  {unit.unit_name}
                </p>

                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusStyle(
                    unit.status
                  )}`}
                >
                  {unit.status}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {unit.assigned_location_id
                  ? `Assigned: ${unit.assigned_location_id}`
                  : "No current assignment"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default PoliceUnitList