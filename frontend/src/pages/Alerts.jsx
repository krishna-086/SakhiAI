import { useEffect, useState } from "react";

import {
  ShieldAlert,
} from "lucide-react";

import AppShell from "../layouts/AppShell";

import { Card } from "@/components/ui/card";

import {
  getAlerts,
} from "../services/dashboard.service";

function Alerts() {
  const [alerts, setAlerts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadAlerts =
      async () => {
        try {
          const data =
            await getAlerts();

          setAlerts(data);

        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    loadAlerts();
  }, []);

  const highAlerts =
    alerts.filter(
      (alert) =>
        alert.risk_level === "HIGH"
    );

  const mediumAlerts =
    alerts.filter(
      (alert) =>
        alert.risk_level === "MEDIUM"
    );

  const lowAlerts =
    alerts.filter(
      (alert) =>
        alert.risk_level === "LOW"
    );

  if (loading) {
    return (
      <AppShell>
        <div className="p-10">
          Loading alerts...
        </div>
      </AppShell>
    );
  }

  const AlertSection = ({
    title,
    alerts,
    dotColor,
    bgClass,
  }) => (
    <div>

      <div className="flex items-center gap-3 mb-5">

        <div
          className={`w-4 h-4 rounded-full ${dotColor}`}
        />

        <h2 className="text-2xl font-bold">
          {title}
        </h2>

      </div>

      <div className="grid gap-5">

        {alerts.length === 0 && (
          <Card className="rounded-[2rem] border-0 shadow-sm p-6">

            <p className="text-neutral-500">
              No alerts found.
            </p>

          </Card>
        )}

        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className={`rounded-[2rem] border-0 shadow-sm p-6 ${bgClass}`}
          >

            <div className="flex gap-4">

              <div className="bg-white p-4 rounded-3xl h-fit shadow-sm">

                <ShieldAlert
                  size={28}
                  className="text-[#df6b57]"
                />

              </div>

              <div>

                <h3 className="text-xl font-semibold">
                  {alert.possible_concern}
                </h3>

                <p className="mt-4 text-neutral-600 leading-relaxed">
                  {alert.response_for_user}
                </p>

                <p className="mt-5 text-sm text-neutral-500">
                  {new Date(
                    alert.created_at
                  ).toLocaleString()}
                </p>

              </div>

            </div>

          </Card>
        ))}

      </div>

    </div>
  );

  return (
    <AppShell>

      <div className="space-y-10">

        {/* HEADER */}
        <div>

          <h1 className="text-4xl font-bold">
            Risk Alerts
          </h1>

          <p className="text-neutral-500 mt-2">
            AI-prioritized healthcare alerts.
          </p>

        </div>

        <AlertSection
          title="High Risk"
          alerts={highAlerts}
          dotColor="bg-[#df6b57]"
          bgClass="bg-gradient-to-br from-[#fff1ed] to-[#fff8f6]"
        />

        <AlertSection
          title="Medium Risk"
          alerts={mediumAlerts}
          dotColor="bg-[#dd8a28]"
          bgClass="bg-gradient-to-br from-[#fff9ef] to-[#fffdf9]"
        />

        <AlertSection
          title="Low Risk"
          alerts={lowAlerts}
          dotColor="bg-[#2d9b7f]"
          bgClass="bg-gradient-to-br from-[#eef8f5] to-[#f8fffc]"
        />

      </div>

    </AppShell>
  );
}

export default Alerts;