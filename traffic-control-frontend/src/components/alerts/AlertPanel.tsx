import { useState } from "react"
import { alerts } from "./alertData"
import {
  getDeploymentRecommendation,
  acceptDeployment,
} from "../../services/api"

interface Recommendation {
  id: string
  location_id: string
  recommended_unit_id: string
  reason: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
}

function AlertPanel() {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [recommendations, setRecommendations] = useState<
    Record<string, Recommendation>
  >({})

  const [errors, setErrors] = useState<
    Record<string, string>
  >({})

  const [acceptingId, setAcceptingId] = useState<string | null>(
    null
  )

  const handleGetRecommendation = async (
    locationId: string,
    alertId: string
  ) => {
    try {
      setLoadingId(alertId)

      setErrors((previous) => ({
        ...previous,
        [alertId]: "",
      }))

      const recommendation =
        await getDeploymentRecommendation(locationId)

      setRecommendations((previous) => ({
        ...previous,
        [alertId]: recommendation,
      }))
    } catch (error) {
      console.error(error)

      setErrors((previous) => ({
        ...previous,
        [alertId]:
          error instanceof Error
            ? error.message
            : "Unable to get deployment recommendation",
      }))
    } finally {
      setLoadingId(null)
    }
  }

  const handleAcceptDeployment = async (
    alertId: string,
    recommendationId: string
  ) => {
    try {
      setAcceptingId(alertId)

      setErrors((previous) => ({
        ...previous,
        [alertId]: "",
      }))

      const result = await acceptDeployment(
        recommendationId
      )

      console.log("Deployment accepted:", result)

      setRecommendations((previous) => ({
        ...previous,
        [alertId]: {
          ...previous[alertId],
          status: "ACCEPTED",
        },
      }))
    } catch (error) {
      console.error(error)

      setErrors((previous) => ({
        ...previous,
        [alertId]:
          error instanceof Error
            ? error.message
            : "Unable to accept deployment",
      }))
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Active Alerts
        </h2>

        <p className="text-sm text-slate-400">
          Locations requiring attention
        </p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const recommendation = recommendations[alert.id]
          const error = errors[alert.id]

          const isLoading =
            loadingId === alert.id

          const isAccepting =
            acceptingId === alert.id

          return (
            <div
              key={alert.id}
              className="rounded-lg border border-red-500/20 bg-red-500/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />

                    <p className="text-sm font-semibold text-red-400">
                      {alert.severity} RISK
                    </p>
                  </div>

                  <p className="mt-2 font-medium text-white">
                    {alert.location_name}
                  </p>
                </div>

                <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-400">
                  {alert.risk_score}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-400">
                <p>Red for: {alert.duration}</p>
                <p>Police: {alert.police_coverage}</p>
                <p>{alert.reason}</p>
              </div>

              {alert.recommendation_available && (
                <div className="mt-3">
                  {!recommendation && (
                    <button
                      onClick={() =>
                        handleGetRecommendation(
                          alert.location_id,
                          alert.id
                        )
                      }
                      disabled={isLoading}
                      className="w-full rounded-md bg-orange-500/10 px-3 py-2 text-left text-xs font-medium text-orange-400 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading
                        ? "Getting recommendation..."
                        : "Get Deployment Recommendation"}
                    </button>
                  )}

                  {error && (
                    <p className="mt-2 text-xs text-red-400">
                      {error}
                    </p>
                  )}

                  {recommendation && (
                    <div className="rounded-md border border-orange-500/20 bg-orange-500/10 p-3">
                      <p className="text-xs font-semibold text-orange-400">
                        Deployment Recommendation
                      </p>

                      <div className="mt-2 space-y-1 text-xs text-slate-300">
                        <p>
                          Recommended Unit:{" "}
                          <span className="font-semibold text-white">
                            {recommendation.recommended_unit_id}
                          </span>
                        </p>

                        <p>
                          Status:{" "}
                          <span
                            className={
                              recommendation.status ===
                              "ACCEPTED"
                                ? "text-green-400"
                                : "text-orange-400"
                            }
                          >
                            {recommendation.status}
                          </span>
                        </p>

                        <p>{recommendation.reason}</p>
                      </div>

                      {recommendation.status ===
                        "PENDING" && (
                        <button
                          onClick={() =>
                            handleAcceptDeployment(
                              alert.id,
                              recommendation.id
                            )
                          }
                          disabled={isAccepting}
                          className="mt-3 w-full rounded-md bg-green-500/10 px-3 py-2 text-left text-xs font-semibold text-green-400 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isAccepting
                            ? "Accepting deployment..."
                            : "Accept Deployment"}
                        </button>
                      )}

                      {recommendation.status ===
                        "ACCEPTED" && (
                        <div className="mt-3 rounded-md bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400">
                          Deployment accepted successfully
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default AlertPanel