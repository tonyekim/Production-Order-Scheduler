
import { DashboardCharts } from "@/app/components/core/DashboardCharts";
import { initialResources, initialOrders } from "@/lib/initialData";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard - Production Scheduler",
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Suspense fallback={<p>Loading charts...</p>}>
        <DashboardCharts productionOrders={initialOrders} resources={initialResources} />
      </Suspense>
    </div>
  );
}