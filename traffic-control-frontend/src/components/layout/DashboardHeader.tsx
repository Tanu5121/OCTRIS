function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b border-slate-700 bg-slate-950 px-6 py-4 text-white">
      {/* OCTRIS Branding */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-wide text-orange-500">
         OCTRIS
        </h1>

        <p className="text-xs text-orange-400">
          Orange City Traffic Intelligence System
        </p>
      </div>

      {/* System Status */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-green-400">●</span>
          <span className="text-slate-300">System Online</span>
        </div>

        <div className="text-slate-300">
          Operator
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader