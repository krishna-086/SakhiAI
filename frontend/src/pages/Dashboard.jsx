import { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

import AppShell from "../layouts/AppShell";

import { Card } from "@/components/ui/card";

import {
  getDashboardStats,
  getRecentScreenings,
} from "../services/dashboard.service";

function Dashboard() {
  const [stats, setStats] =
    useState(null);

  const [screenings, setScreenings] =
    useState([]);

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          const statsData =
            await getDashboardStats();

          const screeningsData =
            await getRecentScreenings();

          setStats(statsData);

          setScreenings(
            screeningsData.slice(0, 6)
          );

        } catch (error) {
          console.error(error);
        }
      };

    loadDashboard();
  }, []);

  if (!stats) {
    return (
      <AppShell>
        <div className="p-10">
          Loading dashboard...
        </div>
      </AppShell>
    );
  }

  const chartData = [
    {
      name: "High",
      value:
        stats.highRiskCases,
    },

    {
      name: "Medium",
      value:
        stats.mediumRiskCases,
    },

    {
      name: "Alerts",
      value:
        stats.totalAlerts,
    },
  ];

  return (
    <AppShell>

      <div className="space-y-8">

        {/* HEADER */}
        <div className="pt-4">

          <h1 className="text-4xl font-bold">
            Healthcare Dashboard
          </h1>

          <p className="text-neutral-500 mt-2">
            Real-time AI screening analytics.
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div className="bg-[#eef8f5] p-3 rounded-2xl">
                <Activity
                  size={22}
                  className="text-[#2d9b7f]"
                />
              </div>

            </div>

            <h2 className="text-4xl font-bold mt-6">
              {
                stats.totalScreenings
              }
            </h2>

            <p className="text-neutral-500 mt-2">
              Total Screenings
            </p>

          </Card>

          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <div className="bg-[#fff1ed] w-fit p-3 rounded-2xl">
              <AlertTriangle
                size={22}
                className="text-[#df6b57]"
              />
            </div>

            <h2 className="text-4xl font-bold mt-6">
              {
                stats.highRiskCases
              }
            </h2>

            <p className="text-neutral-500 mt-2">
              High Risk Cases
            </p>

          </Card>

          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <div className="bg-[#eef4ff] w-fit p-3 rounded-2xl">
              <ShieldCheck
                size={22}
                className="text-[#4d78ff]"
              />
            </div>

            <h2 className="text-4xl font-bold mt-6">
              {
                stats.mediumRiskCases
              }
            </h2>

            <p className="text-neutral-500 mt-2">
              Medium Risk
            </p>

          </Card>

          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <div className="bg-[#fff8e8] w-fit p-3 rounded-2xl">
              <Users
                size={22}
                className="text-[#dd8a28]"
              />
            </div>

            <h2 className="text-4xl font-bold mt-6">
              {
                stats.totalAlerts
              }
            </h2>

            <p className="text-neutral-500 mt-2">
              Total Alerts
            </p>

          </Card>

        </div>

        {/* CHART + TABLE */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* CHART */}
          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <h2 className="text-2xl font-semibold">
              Risk Analytics
            </h2>

            <div className="h-[320px] mt-6">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart data={chartData}>

                  <XAxis dataKey="name" />

                  <Tooltip />

                  <Bar dataKey="value" />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </Card>

          {/* TABLE */}
          <Card className="rounded-[2rem] border-0 shadow-sm p-6 overflow-hidden">

            <h2 className="text-2xl font-semibold mb-6">
              Recent Screenings
            </h2>

            <div className="space-y-4">

              {screenings.map(
                (screening) => (
                  <div
                    key={screening.id}
                    className="border border-neutral-200 rounded-2xl p-4"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="font-semibold leading-relaxed">
                          {
                            screening.possible_concern
                          }
                        </p>

                        <p className="text-sm text-neutral-500 mt-2 line-clamp-2">
                          {
                            screening.transcript
                          }
                        </p>

                      </div>

                      <div
                        className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            screening.risk_level ===
                            "HIGH"
                              ? "bg-[#fff1ed] text-[#df6b57]"
                              : "bg-[#fff8e8] text-[#dd8a28]"
                          }
                        `}
                      >
                        {
                          screening.risk_level
                        }
                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </Card>

        </div>

      </div>

    </AppShell>
  );
}

export default Dashboard;