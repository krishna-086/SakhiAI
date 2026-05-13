import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  Mic,
  AlertTriangle,
  Activity,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AppShell from "../layouts/AppShell";

import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  getDashboardStats,
  getRecentScreenings,
} from "../services/dashboard.service";

function MobileHome() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(
    null
  );

  const [screenings, setScreenings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchDashboardData =
      async () => {
        try {
          const statsData =
            await getDashboardStats();

          const screeningsData =
            await getRecentScreenings();

          setStats(statsData);

          setScreenings(
            screeningsData.slice(0, 3)
          );

        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AppShell>

        <div className="min-h-screen flex items-center justify-center text-xl">
          Loading dashboard...
        </div>

      </AppShell>
    );
  }

  return (
    <AppShell>

      <div className="p-5 flex flex-col gap-6">

        {/* HEADER */}
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="pt-6"
        >

          <h1 className="text-4xl font-bold text-[#e77b67]">
            SakhiAI
          </h1>

          <p className="text-neutral-500 mt-2 text-base leading-relaxed">
            AI-assisted healthcare support
            for ASHA workers and rural
            communities.
          </p>

        </motion.div>

        {/* ALERT */}
        <Card className="rounded-3xl border-0 bg-[#fff0ec] shadow-sm p-4 flex items-start gap-3">

          <div className="bg-[#ffe1d8] p-2 rounded-2xl">
            <AlertTriangle
              size={20}
              className="text-[#d95f43]"
            />
          </div>

          <div>
            <h3 className="font-semibold text-sm">
              High Risk Alert
            </h3>

            <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
              {
                stats?.highRiskCases
              }{" "}
              high-risk cases require
              monitoring.
            </p>
          </div>

        </Card>

        {/* MAIN CTA */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <Card className="rounded-[2rem] border-0 bg-gradient-to-br from-[#ea816c] to-[#e56b57] text-white p-6 shadow-xl overflow-hidden relative">

            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />

            <div className="relative z-10">

              <div className="bg-white/20 w-fit p-4 rounded-3xl">
                <Mic size={34} />
              </div>

              <h2 className="text-2xl font-bold mt-6">
                Record Patient Symptoms
              </h2>

              <p className="mt-3 text-white/90 leading-relaxed text-sm">
                Voice-based AI screening
                for quick healthcare
                assistance.
              </p>

              <Button
                onClick={() =>
                  navigate("/voice")
                }
                className="mt-6 bg-white text-[#df6b57] hover:bg-white/90 rounded-2xl h-12 px-6 text-base font-semibold"
              >
                Start Screening
              </Button>

            </div>

          </Card>

        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4">

          <Card className="rounded-3xl p-5 border-0 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="bg-[#eef8f5] p-3 rounded-2xl">
                <Activity
                  size={20}
                  className="text-[#2d9b7f]"
                />
              </div>

              <ChevronRight
                size={18}
                className="text-neutral-400"
              />

            </div>

            <h3 className="text-3xl font-bold mt-5">
              {
                stats?.totalScreenings
              }
            </h3>

            <p className="text-sm text-neutral-500 mt-1">
              Total Screenings
            </p>

          </Card>

          <Card className="rounded-3xl p-5 border-0 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="bg-[#fff2e7] p-3 rounded-2xl">
                <AlertTriangle
                  size={20}
                  className="text-[#dd7a31]"
                />
              </div>

              <ChevronRight
                size={18}
                className="text-neutral-400"
              />

            </div>

            <h3 className="text-3xl font-bold mt-5">
              {
                stats?.highRiskCases
              }
            </h3>

            <p className="text-sm text-neutral-500 mt-1">
              High Risk Cases
            </p>

          </Card>

        </div>

        {/* RECENT ACTIVITY */}
        <div>

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-xl font-semibold">
              Recent Activity
            </h2>

            <button className="text-sm text-[#e16c58] font-medium">
              View All
            </button>

          </div>

          <div className="flex flex-col gap-4">

            {screenings.map(
              (screening) => (
                <Card
                  key={screening.id}
                  className="rounded-3xl border-0 shadow-sm p-4"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="font-semibold">
                        {
                          screening.possible_concern
                        }
                      </p>

                      <p className="text-sm text-neutral-500 mt-1">
                        {
                          screening.transcript
                        }
                      </p>

                    </div>

                    <div
                      className={`
                        text-xs
                        font-semibold
                        px-3
                        py-1
                        rounded-full
                        ${
                          screening.risk_level ===
                          "HIGH"
                            ? "bg-[#fff1ed] text-[#dc694f]"
                            : "bg-[#fff8e8] text-[#cc932f]"
                        }
                      `}
                    >
                      {
                        screening.risk_level
                      }
                    </div>

                  </div>

                </Card>
              )
            )}

          </div>

        </div>

      </div>

    </AppShell>
  );
}

export default MobileHome;