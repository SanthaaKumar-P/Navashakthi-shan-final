import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  GenericSection,
  InfoTiles,
} from "@/components/portal-sections";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  artisanEarnings,
  getArtisanOrders,
  ORDERS_UPDATED_EVENT,
  type Order,
} from "@/lib/orders";

export const Route = createFileRoute("/portal/artisan/analytics")({
  component: ArtisanAnalytics,
});

const ARTISAN_ID = "artisan-self";

const COLORS = [
  "var(--forest)",
  "var(--clay)",
  "var(--gold-raw)",
  "oklch(0.55 0.1 30)",
  "var(--primary)",
];

function ArtisanAnalytics() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = () => {
    setOrders(getArtisanOrders(ARTISAN_ID));
  };

  useEffect(() => {
    loadOrders();

    const handleOrdersUpdated = () => {
      loadOrders();
    };

    window.addEventListener(ORDERS_UPDATED_EVENT, handleOrdersUpdated);
    window.addEventListener("storage", handleOrdersUpdated);

    return () => {
      window.removeEventListener(
        ORDERS_UPDATED_EVENT,
        handleOrdersUpdated,
      );

      window.removeEventListener("storage", handleOrdersUpdated);
    };
  }, []);

  const earnings = useMemo(() => {
    return artisanEarnings(ARTISAN_ID);
  }, [orders]);

  const analytics = useMemo(() => {
    const activeOrders = orders.filter(
      (order) => order.status !== "Cancelled",
    );

    const totalSales = activeOrders.reduce((sum, order) => {
      return (
        sum +
        order.items
          .filter((item) => item.artisanId === ARTISAN_ID)
          .reduce(
            (itemSum, item) => itemSum + item.totalPrice,
            0,
          )
      );
    }, 0);

    const itemsSold = activeOrders.reduce((sum, order) => {
      return (
        sum +
        order.items
          .filter((item) => item.artisanId === ARTISAN_ID)
          .reduce(
            (itemSum, item) => itemSum + item.quantity,
            0,
          )
      );
    }, 0);

    const averageOrderValue =
      activeOrders.length > 0
        ? Math.round(totalSales / activeOrders.length)
        : 0;

    const deliveredOrders = activeOrders.filter(
      (order) => order.status === "Delivered",
    ).length;

    const processingOrders = activeOrders.filter(
      (order) =>
        order.status === "Placed" ||
        order.status === "Confirmed" ||
        order.status === "Processing",
    ).length;

    const dispatchedOrders = activeOrders.filter(
      (order) => order.status === "Shipped",
    ).length;

    return {
      totalOrders: activeOrders.length,
      totalSales,
      itemsSold,
      averageOrderValue,
      deliveredOrders,
      processingOrders,
      dispatchedOrders,
    };
  }, [orders]);

  const salesByCraft = useMemo(() => {
    const craftMap = new Map<
      string,
      {
        name: string;
        value: number;
        quantity: number;
      }
    >();

    orders
      .filter((order) => order.status !== "Cancelled")
      .forEach((order) => {
        order.items
          .filter((item) => item.artisanId === ARTISAN_ID)
          .forEach((item) => {
            const existing = craftMap.get(item.productId);

            if (existing) {
              existing.value += item.totalPrice;
              existing.quantity += item.quantity;
            } else {
              craftMap.set(item.productId, {
                name: item.title,
                value: item.totalPrice,
                quantity: item.quantity,
              });
            }
          });
      });

    return Array.from(craftMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [orders]);

  const buyersByLocation = useMemo(() => {
    const locationMap = new Map<string, number>();

    orders
      .filter((order) => order.status !== "Cancelled")
      .forEach((order) => {
        const city = order.shippingAddress?.city;
        const state = order.shippingAddress?.state;

        const location =
          city && state
            ? `${city}, ${state}`
            : city || state || "Unknown";

        const current = locationMap.get(location) ?? 0;

        locationMap.set(location, current + 1);
      });

    const entries = Array.from(locationMap.entries())
      .map(([name, value]) => ({
        n: name,
        v: value,
      }))
      .sort((a, b) => b.v - a.v);

    const topLocations = entries.slice(0, 5);

    const remaining = entries
      .slice(5)
      .reduce((sum, item) => sum + item.v, 0);

    if (remaining > 0) {
      topLocations.push({
        n: "Other",
        v: remaining,
      });
    }

    return topLocations;
  }, [orders]);

  const hasSalesData = salesByCraft.length > 0;
  const hasBuyerData = buyersByLocation.length > 0;

  return (
    <GenericSection
      title="Analytics"
      subtitle="Understand what sells, when and to whom."
    >
      {/* REAL METRICS */}
      <InfoTiles
        tiles={[
          {
            label: "Total sales",
            value: `₹${analytics.totalSales.toLocaleString("en-IN")}`,
            hint: `${analytics.totalOrders} order${
              analytics.totalOrders === 1 ? "" : "s"
            }`,
          },
          {
            label: "Items sold",
            value: String(analytics.itemsSold),
            hint: `${analytics.deliveredOrders} delivered`,
          },
          {
            label: "Pending earnings",
            value: `₹${earnings.pending.toLocaleString("en-IN")}`,
            hint: "Awaiting delivery",
          },
          {
            label: "Average order",
            value: `₹${analytics.averageOrderValue.toLocaleString(
              "en-IN",
            )}`,
            hint:
              analytics.totalOrders > 0
                ? "Based on real orders"
                : "No orders yet",
          },
        ]}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* SALES BY CRAFT */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-display text-lg">
            Sales by craft
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Revenue generated from your published crafts.
          </p>

          {hasSalesData ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <BarChart
                  data={salesByCraft}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.3}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={55}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                      "Sales",
                    ]}
                  />

                  <Bar
                    dataKey="value"
                    fill="var(--clay)"
                    radius={8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
              <div className="text-center">
                <div className="font-display text-lg">
                  No sales yet
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Craft sales will appear here after customers
                  place orders.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BUYERS BY LOCATION */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-display text-lg">
            Buyers by location
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Customer locations from your real orders.
          </p>

          {hasBuyerData ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={buyersByLocation}
                    dataKey="v"
                    nameKey="n"
                    innerRadius={50}
                    outerRadius={90}
                  >
                    {buyersByLocation.map((_, index) => (
                      <Cell
                        key={`location-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Legend />

                  <Tooltip
                    formatter={(value) => [
                      value,
                      "Orders",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
              <div className="text-center">
                <div className="font-display text-lg">
                  No buyer data yet
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Customer locations will appear after orders
                  are placed.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORDER PIPELINE */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
        <h3 className="font-display text-lg">
          Order pipeline
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Current status of your customer orders.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Processing
            </div>

            <div className="mt-2 font-display text-2xl">
              {analytics.processingOrders}
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              New + confirmed + production
            </div>
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Dispatched
            </div>

            <div className="mt-2 font-display text-2xl">
              {analytics.dispatchedOrders}
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Currently in transit
            </div>
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Delivered
            </div>

            <div className="mt-2 font-display text-2xl">
              {analytics.deliveredOrders}
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Successfully completed
            </div>
          </div>
        </div>
      </div>
    </GenericSection>
  );
}