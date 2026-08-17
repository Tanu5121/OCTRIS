import { locations } from "../map/locationsData"

function RiskRanking() {
  const sortedLocations = [...locations].sort(
    (a, b) => b.risk_score - a.risk_score
  )

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Risk Ranking
        </h2>

        <p className="text-sm text-slate-400">
          Highest-risk locations
        </p>
      </div>

      <div className="space-y-3">
        {sortedLocations.map((location) => (
          <div
            key={location.id}
            className="flex items-center justify-between rounded-lg bg-slate-800 p-3"
          >
            <div>
              <p className="font-medium text-white">
                {location.name}
              </p>

              <p className="text-xs text-slate-400">
                Risk Level: {location.risk_level}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                location.risk_level === "RED"
                  ? "bg-red-500/20 text-red-400"
                  : location.risk_level === "YELLOW"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
              }`}
            >
              {location.risk_score}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RiskRanking