import { locations } from "../map/locationsData"

function RiskSummary() {
  const redCount = locations.filter(
    (location) => location.risk_level === "RED"
  ).length

  const yellowCount = locations.filter(
    (location) => location.risk_level === "YELLOW"
  ).length

  const greenCount = locations.filter(
    (location) => location.risk_level === "GREEN"
  ).length

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-slate-400">RED</p>
        <p className="mt-2 text-3xl font-bold text-red-400">
          {redCount}
        </p>
        <p className="text-xs text-slate-500">High Risk</p>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
        <p className="text-sm text-slate-400">YELLOW</p>
        <p className="mt-2 text-3xl font-bold text-yellow-400">
          {yellowCount}
        </p>
        <p className="text-xs text-slate-500">Medium Risk</p>
      </div>

      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
        <p className="text-sm text-slate-400">GREEN</p>
        <p className="mt-2 text-3xl font-bold text-green-400">
          {greenCount}
        </p>
        <p className="text-xs text-slate-500">Low Risk</p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">UNMANNED</p>
        <p className="mt-2 text-3xl font-bold text-white">
          0
        </p>
        <p className="text-xs text-slate-500">
          High-Risk Locations
        </p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">UNITS</p>
        <p className="mt-2 text-3xl font-bold text-white">
          0
        </p>
        <p className="text-xs text-slate-500">
          Available Police
        </p>
      </div>
    </section>
  )
}

export default RiskSummary