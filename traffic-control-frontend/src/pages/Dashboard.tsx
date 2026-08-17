import DashboardHeader from "../components/layout/DashboardHeader"
import Sidebar from "../components/layout/Sidebar"
import RiskSummary from "../components/dashboard/RiskSummary"
import RiskRanking from "../components/dashboard/RiskRanking"
import DashboardGrid from "../components/dashboard/DashboardGrid"
import PoliceUnitList from "../components/police/PoliceUnitList"

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardHeader />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 space-y-6 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Control Room Dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Real-time traffic risk monitoring and police deployment management
            </p>
          </div>

          <RiskSummary />

          <DashboardGrid />

          <RiskRanking />
          <PoliceUnitList />
        </main>
      </div>
    </div>
  )
}

export default Dashboard