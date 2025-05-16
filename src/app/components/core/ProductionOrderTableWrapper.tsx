"use client";
import React from 'react'
import { ProductionOrderTable } from "@/app/components/core/ProductionOrderTable";
import { ProductionOrder, Resource } from "@/lib/types";

export function ProductionOrderTableWrapper({
  productionOrders,
  resources,
  existingOrders,
}: {
  productionOrders: ProductionOrder[];
  resources: Resource[];
  existingOrders: ProductionOrder[];
}) {
  return (
    <ProductionOrderTable
      productionOrders={productionOrders}
      resources={resources}
      existingOrders={existingOrders}
    />
  );
}