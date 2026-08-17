import RiskMap from "../map/RiskMap"
import AlertPanel from "../alerts/AlertPanel"

function DashboardGrid() {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      {/* Live Risk Map */}
      <div className="min-h-[500px] rounded-xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
        <h2 className="text-lg font-semibold text-white">
          Live Risk Map
        </h2>

        <div className="mt-4 min-h-[420px] overflow-hidden rounded-lg">
          <RiskMap />
        </div>
      </div>

      {/* Active Alerts */}
      <AlertPanel />
    </section>
  )
}

export default DashboardGrid