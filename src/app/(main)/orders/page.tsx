
import { ProductionOrderTable } from "@/app/components/core/ProductionOrderTable";
import { initialOrders, initialResources } from "@/lib/initialData";
import { Suspense } from "react";

export const metadata = {
  title: "Production Orders - Production Scheduler",
};

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Production Orders</h1>
      <Suspense fallback={<p>Loading orders table...</p>}>
        <ProductionOrderTable productionOrders={initialOrders} resources={initialResources} />
      </Suspense>
    </div>
  );
}


