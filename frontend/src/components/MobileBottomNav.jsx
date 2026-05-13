import {
  House,
  Mic,
  LayoutDashboard,
  Bell,
  BarChart3,
} from "lucide-react";

import { useLocation } from "react-router-dom";

import { useNavigate } from "react-router-dom";

const navItems = [
  {
    icon: House,
    path: "/",
  },

  {
    icon: Mic,
    path: "/voice",
  },

  {
    icon: LayoutDashboard,
    path: "/dashboard",
  },

  {
    icon: Bell,
    path: "/alerts",
  },

  {
    icon: BarChart3,
    path: "/analytics",
  },
];

function MobileBottomNav() {
  const navigate = useNavigate();

  const location = useLocation();

  return (
    <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50">

      <div className="backdrop-blur-xl bg-white/90 border border-white/40 shadow-2xl rounded-full px-3 py-3 flex items-center gap-3">

        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() =>
                navigate(item.path)
              }
              className={`
                w-12 h-12 rounded-full
                flex items-center justify-center
                transition-all duration-300
                ${
                  active
                    ? "bg-[#ea816c] text-white shadow-lg"
                    : "text-neutral-500"
                }
              `}
            >

              <Icon size={22} />

            </button>
          );
        })}

      </div>

    </div>
  );
}

export default MobileBottomNav;