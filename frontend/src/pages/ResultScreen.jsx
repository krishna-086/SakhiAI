import { useLocation } from "react-router-dom";

import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AppShell from "../layouts/AppShell";

import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

function ResultScreen() {
  const navigate = useNavigate();

  const location = useLocation();

  const data = location.state;

  if (!data) {
    return (
      <AppShell>
        <div className="p-10">
          No result data found.
        </div>
      </AppShell>
    );
  }

  const {
    transcript,
    aiResponse,
    riskData,
  } = data;

  const riskLevel =
    aiResponse?.risk_level ||
    riskData?.riskLevel ||
    "UNKNOWN";

  const warningSigns =
    aiResponse?.warning_signs || [];

  return (
    <AppShell>

      <div className="max-w-4xl mx-auto py-10 px-4">

        {/* TOP */}
        <div className="flex items-center justify-between mb-8">

          <button
            onClick={() => navigate("/")}
            className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-right">
            <h2 className="font-semibold">
              Screening Result
            </h2>

            <p className="text-sm text-neutral-500">
              AI healthcare assessment
            </p>
          </div>

        </div>

        {/* RISK CARD */}
        <Card
          className={`
            rounded-[2rem]
            border-0
            shadow-xl
            p-8
            text-white
            ${
              riskLevel === "HIGH"
                ? "bg-gradient-to-br from-[#e56b57] to-[#d94d39]"
                : riskLevel === "MEDIUM"
                ? "bg-gradient-to-br from-[#e7a14e] to-[#dd8a28]"
                : "bg-gradient-to-br from-[#35a37d] to-[#248866]"
            }
          `}
        >

          <div className="flex items-center gap-4">

            <div className="bg-white/20 p-4 rounded-3xl">

              {riskLevel === "HIGH" ? (
                <AlertTriangle size={34} />

              ) : (
                <ShieldCheck size={34} />
              )}

            </div>

            <div>
              <p className="text-white/80 text-sm">
                Risk Assessment
              </p>

              <h1 className="text-5xl font-bold mt-1">
                {riskLevel}
              </h1>
            </div>

          </div>

          <p className="mt-8 text-lg leading-relaxed text-white/90">
            {
              aiResponse?.possible_concern
            }
          </p>

        </Card>

        {/* GRID */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">

          {/* TRANSCRIPT */}
          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <div className="flex items-center gap-3">

              <div className="bg-[#fff1ed] p-3 rounded-2xl">
                <Activity
                  size={20}
                  className="text-[#df6b57]"
                />
              </div>

              <h2 className="text-xl font-semibold">
                Transcript
              </h2>

            </div>

            <p className="mt-6 text-neutral-600 leading-relaxed">
              {transcript}
            </p>

          </Card>

          {/* ACTION */}
          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <div className="flex items-center gap-3">

              <div className="bg-[#eef8f5] p-3 rounded-2xl">
                <ShieldCheck
                  size={20}
                  className="text-[#2d9b7f]"
                />
              </div>

              <h2 className="text-xl font-semibold">
                Recommended Action
              </h2>

            </div>

            <p className="mt-6 text-neutral-600 leading-relaxed">
              {
                aiResponse?.recommended_action
              }
            </p>

          </Card>

        </div>

        {/* WARNING SIGNS */}
        <Card className="rounded-[2rem] border-0 shadow-sm p-6 mt-8">

          <h2 className="text-2xl font-semibold">
            Warning Signs
          </h2>

          <div className="flex flex-wrap gap-3 mt-6">

            {warningSigns.map(
              (item, index) => (
                <div
                  key={index}
                  className="bg-[#fff1ed] text-[#dc694f] px-4 py-2 rounded-full text-sm font-medium"
                >
                  {item}
                </div>
              )
            )}

          </div>

        </Card>

        {/* USER RESPONSE */}
        <Card className="rounded-[2rem] border-0 shadow-sm p-6 mt-8">

          <h2 className="text-2xl font-semibold">
            Response For Patient
          </h2>

          <p className="mt-6 text-neutral-600 leading-relaxed text-lg">
            {
              aiResponse?.response_for_user
            }
          </p>

        </Card>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 mt-10">

          <Button
            onClick={() =>
              navigate("/voice")
            }
            className="rounded-2xl h-12 px-6"
          >
            New Screening
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              navigate("/")
            }
            className="rounded-2xl h-12 px-6"
          >
            Back Home
          </Button>

        </div>

      </div>

    </AppShell>
  );
}

export default ResultScreen;