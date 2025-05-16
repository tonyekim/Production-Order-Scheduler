
"use client";
import { ProductionOrder, Resource } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function DashboardCharts({
  productionOrders,
  resources,
}: {
  productionOrders: ProductionOrder[];
  resources: Resource[];
}) {
  const orderStatusData = productionOrders.reduce((acc, order) => {
    const status = order.status;
    const existingEntry = acc.find((entry) => entry.name === status);
    if (existingEntry) {
      existingEntry.count += 1;
    } else {
      acc.push({ name: status, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number }[]);

  const resourceUtilizationData = resources.map((resource) => {
    const scheduledOrdersCount = productionOrders.filter(
      (order) => order.resourceId === resource.id && order.status === "Scheduled"
    ).length;
    return {
      name: resource.name,
      scheduledOrders: scheduledOrdersCount,
      status: resource.status,
    };
  });

  const totalOrders = productionOrders.length;
  const scheduledOrders = productionOrders.filter(
    (o) => o.status === "Scheduled"
  ).length;
  const pendingOrders = productionOrders.filter(
    (o) => o.status === "Pending"
  ).length;
  const availableResources = resources.filter(
    (r) => r.status === "Available"
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card data-testid="total-orders-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">All production orders</p>
        </CardContent>
      </Card>
      <Card data-testid="scheduled-orders-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Scheduled Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scheduledOrders}</div>
          <p className="text-xs text-muted-foreground">Currently scheduled</p>
        </CardContent>
      </Card>
      <Card data-testid="pending-orders-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders}</div>
          <p className="text-xs text-muted-foreground">Awaiting scheduling</p>
        </CardContent>
      </Card>
      <Card data-testid="available-resources-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Available Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {availableResources} / {resources.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Resources ready for tasks
          </p>
        </CardContent>
      </Card>

      <Card
        className="md:col-span-2 lg:col-span-2"
        data-testid="order-status-chart-card"
      >
        <CardHeader>
          <CardTitle>Order Status Overview</CardTitle>
          <CardDescription>
            Distribution of production orders by their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={orderStatusData}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Orders" fill="#8884d8">
                  {orderStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">
              No order data to display.
            </p>
          )}
        </CardContent>
      </Card>

      <Card
        className="md:col-span-2 lg:col-span-2"
        data-testid="resource-utilization-chart-card"
      >
        <CardHeader>
          <CardTitle>Resource Assignment (Scheduled Orders)</CardTitle>
          <CardDescription>
            Number of Scheduled orders assigned to each resource.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resourceUtilizationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={resourceUtilizationData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="scheduledOrders"
                  name="Scheduled Orders"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">
              No resource data to display.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}