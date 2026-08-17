import {
  LayoutDashboard,
  Map,
  Bell,
  MapPin,
  Shield,
  Navigation,
  Lightbulb,
  History,
} from "lucide-react"

function Sidebar() {
  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "Risk Map",
      icon: Map,
      path: "/locations",
    },
    {
      label: "Alerts",
      icon: Bell,
      path: "/alerts",
    },
    {
      label: "Locations",
      icon: MapPin,
      path: "/locations",
    },
    {
      label: "Police Units",
      icon: Shield,
      path: "/deployment",
    },
    {
      label: "Deployments",
      icon: Navigation,
      path: "/deployment",
    },
    {
      label: "Recommendations",
      icon: Lightbulb,
      path: "/deployment",
    },
    {
      label: "History",
      icon: History,
      path: "/history",
    },
  ]

  return (
    <aside className="hidden min-h-[calc(100vh-73px)] w-64 border-r border-slate-800 bg-slate-950 lg:block">
      <nav className="space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <a
              key={item.label}
              href={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                item.label === "Dashboard"
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="mx-4 mt-6 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
        <p className="text-sm font-medium text-white">
          Orange City
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Nagpur Traffic Control
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
          <span>●</span>
          <span>Live System</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar