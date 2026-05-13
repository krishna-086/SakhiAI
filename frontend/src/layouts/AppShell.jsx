import {
  LayoutDashboard,
  Mic,
  Bell,
  BarChart3,
  House,
  HeartPulse,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import MobileBottomNav from "../components/MobileBottomNav";

const navItems = [
  {
    label: "Home",
    icon: House,
    path: "/",
  },

  {
    label: "Voice",
    icon: Mic,
    path: "/voice",
  },

  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },

  {
    label: "Alerts",
    icon: Bell,
    path: "/alerts",
  },

  {
    label: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
];

function AppShell({ children }) {
  const navigate = useNavigate();

  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f5f2]">

      {/* DESKTOP */}
      <div className="hidden lg:flex">

        {/* SIDEBAR */}
        <aside className="w-[290px] min-h-screen bg-white/70 backdrop-blur-xl border-r border-white/40 p-6 flex flex-col">

          {/* BRAND */}
          <div className="flex items-center gap-4 mb-10">

            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#ea816c] to-[#df6b57] flex items-center justify-center shadow-lg">

              <HeartPulse
                size={28}
                className="text-white"
              />

            </div>

            <div>

              <h1 className="text-2xl font-bold">
                SakhiAI
              </h1>

              <p className="text-sm text-neutral-500">
                Rural Healthcare AI
              </p>

            </div>

          </div>

          {/* NAV */}
          <div className="flex flex-col gap-3">

            {navItems.map((item) => {
              const Icon = item.icon;

              const active =
                location.pathname ===
                item.path;

              return (
                <button
                  key={item.path}
                  onClick={() =>
                    navigate(item.path)
                  }
                  className={`
                    flex items-center gap-4
                    px-5 py-4 rounded-2xl
                    transition-all duration-300
                    text-left
                    ${
                      active
                        ? "bg-gradient-to-r from-[#ea816c] to-[#df6b57] text-white shadow-lg"
                        : "hover:bg-[#f5f2ef] text-neutral-700"
                    }
                  `}
                >

                  <Icon size={22} />

                  <span className="font-medium">
                    {item.label}
                  </span>

                </button>
              );
            })}

          </div>

          {/* FOOTER */}
          <div className="mt-auto">

            <div className="rounded-[2rem] bg-gradient-to-br from-[#fff1ed] to-[#fff7f4] p-5">

              <h3 className="font-semibold">
                AI Healthcare Assistant
              </h3>

              <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                Supporting ASHA workers
                with voice-based screening.
              </p>

            </div>

          </div>

        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto min-h-screen">

          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>

        </main>

      </div>

      {/* MOBILE */}
      <div className="lg:hidden min-h-screen w-full">

        <div className="w-full max-w-md mx-auto min-h-screen pb-28">
          {children}
        </div>

      </div>

      <MobileBottomNav />

    </div>
  );
}

export default AppShell;