import React, { Suspense } from "react";
import { ProductionOrderTableWrapper } from "@/app/components/core/ProductionOrderTableWrapper";

export const metadata = {
  title: "Production Orders - Production Scheduler",
};

export default async function OrdersPage() {
  try {
    const [resourcesRes, ordersRes] = await Promise.all([
      fetch("http://localhost:3000/api/resources", { cache: "no-store" }),
      fetch("http://localhost:3000/api/orders", { cache: "no-store" }),
    ]);

    if (!resourcesRes.ok) {
      throw new Error(
        `Resources API error: ${resourcesRes.status} ${resourcesRes.statusText}`
      );
    }
    if (!ordersRes.ok) {
      throw new Error(
        `Orders API error: ${ordersRes.status} ${ordersRes.statusText}`
      );
    }

    const resources = await resourcesRes.json();
    const productionOrders = await ordersRes.json();

    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Production Orders</h1>
        <Suspense fallback={<p>Loading orders table...</p>}>
          <ProductionOrderTableWrapper
            productionOrders={productionOrders}
            resources={resources}
            existingOrders={productionOrders} 
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Production Orders</h1>
        <p>Error loading data: {error.message}</p>
      </div>
    );
  }
}
