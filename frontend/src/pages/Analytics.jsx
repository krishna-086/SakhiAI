import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
} from "recharts";

import AppShell from "../layouts/AppShell";

import { Card } from "@/components/ui/card";

import {
  getDashboardStats,
  getRecentScreenings,
} from "../services/dashboard.service";

const COLORS = [
  "#df6b57",
  "#dd8a28",
  "#2d9b7f",
];

function Analytics() {
  const [stats, setStats] =
    useState(null);

  const [screenings, setScreenings] =
    useState([]);

  useEffect(() => {
    const loadAnalytics =
      async () => {
        try {
          const statsData =
            await getDashboardStats();

          const screeningsData =
            await getRecentScreenings();

          setStats(statsData);

          setScreenings(screeningsData);

        } catch (error) {
          console.error(error);
        }
      };

    loadAnalytics();
  }, []);

  if (!stats) {
    return (
      <AppShell>
        <div className="p-10">
          Loading analytics...
        </div>
      </AppShell>
    );
  }

  const pieData = [
    {
      name: "High",
      value:
        stats.highRiskCases || 0,
    },

    {
      name: "Medium",
      value:
        stats.mediumRiskCases || 0,
    },

    {
      name: "Low",
      value:
        stats.lowRiskCases || 0,
    },
  ];

  const trendData =
    screenings.map(
      (screening, index) => ({
        name: `Case ${index + 1}`,
        value:
          screening.risk_level ===
          "HIGH"
            ? 3
            : screening.risk_level ===
              "MEDIUM"
            ? 2
            : 1,
      })
    );

  return (
    <AppShell>

      <div className="space-y-8">

        {/* HEADER */}
        <div>

          <h1 className="text-4xl font-bold">
            Analytics
          </h1>

          <p className="text-neutral-500 mt-2">
            AI healthcare intelligence overview.
          </p>

        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* PIE */}
          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <h2 className="text-2xl font-semibold">
              Risk Distribution
            </h2>

            <div className="h-[320px] mt-6">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                  >

                    {pieData.map(
                      (_, index) => (
                        <Cell
                          key={index}
                          fill={
                            COLORS[index]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </Card>

          {/* TREND */}
          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <h2 className="text-2xl font-semibold">
              Screening Trends
            </h2>

            <div className="h-[320px] mt-6">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={trendData}
                >

                  <XAxis
                    dataKey="name"
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#df6b57"
                    fill="#ffe3dc"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </Card>

        </div>

        {/* INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <h2 className="text-4xl font-bold text-[#df6b57]">
              {
                stats.highRiskCases
              }
            </h2>

            <p className="text-neutral-500 mt-2">
              Critical Cases
            </p>

          </Card>

          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <h2 className="text-4xl font-bold text-[#dd8a28]">
              {
                stats.mediumRiskCases
              }
            </h2>

            <p className="text-neutral-500 mt-2">
              Medium Risk
            </p>

          </Card>

          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <h2 className="text-4xl font-bold text-[#2d9b7f]">
              {
                stats.totalScreenings
              }
            </h2>

            <p className="text-neutral-500 mt-2">
              Total Assessments
            </p>

          </Card>

        </div>

      </div>

    </AppShell>
  );
}

export default Analytics;