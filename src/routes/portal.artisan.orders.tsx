import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  GenericSection,
  DataTable,
  InfoTiles,
} from "@/components/portal-sections";
import {
  getArtisanOrders,
  updateOrderStatus,
  ORDERS_UPDATED_EVENT,
  type Order,
  type OrderStatus,
} from "@/lib/orders";

export const Route = createFileRoute("/portal/artisan/orders")({
  component: ArtisanOrders,
});

const ARTISAN_ID = "artisan-self";

function getStatusLabel(status: Order["status"]) {
  switch (status) {
    case "Placed":
      return "New";

    case "Confirmed":
      return "Confirmed";

    case "Processing":
      return "In production";

    case "Shipped":
      return "Dispatched";

    case "Delivered":
      return "Delivered";

    case "Cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function getStatusClass(status: Order["status"]) {
  switch (status) {
    case "Placed":
      return "rounded-full bg-gold/20 px-2 py-0.5 text-xs text-earth";

    case "Confirmed":
      return "rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary";

    case "Processing":
      return "rounded-full bg-clay/10 px-2 py-0.5 text-xs text-clay";

    case "Shipped":
      return "rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary";

    case "Delivered":
      return "rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary";

    case "Cancelled":
      return "rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive";

    default:
      return "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground";
  }
}

function getBuyerLocation(order: Order) {
  const city = order.shippingAddress?.city;
  const state = order.shippingAddress?.state;

  if (city && state) {
    return `${city}, ${state}`;
  }

  return city || state || "India";
}

function ArtisanOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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

  const handleStatusChange = (
    orderId: string,
    status: OrderStatus,
  ) => {
    setUpdatingOrderId(orderId);

    const updated = updateOrderStatus(orderId, status);

    if (updated) {
      setOrders(getArtisanOrders(ARTISAN_ID));
    }

    setUpdatingOrderId(null);
  };

  const stats = useMemo(() => {
    const newOrders = orders.filter(
      (order) => order.status === "Placed",
    ).length;

    const inProduction = orders.filter(
      (order) =>
        order.status === "Confirmed" ||
        order.status === "Processing",
    ).length;

    const dispatched = orders.filter(
      (order) => order.status === "Shipped",
    ).length;

    const thirtyDaysAgo =
      Date.now() - 30 * 24 * 60 * 60 * 1000;

    const deliveredLast30Days = orders.filter(
      (order) =>
        order.status === "Delivered" &&
        new Date(order.updatedAt).getTime() >= thirtyDaysAgo,
    ).length;

    return {
      newOrders,
      inProduction,
      dispatched,
      deliveredLast30Days,
    };
  }, [orders]);

  const rows = useMemo(() => {
    return orders.map((order) => {
      const artisanItems = order.items.filter(
        (item) => item.artisanId === ARTISAN_ID,
      );

      const craftName =
        artisanItems.length === 1
          ? artisanItems[0].title
          : `${artisanItems[0]?.title ?? "Craft"} + ${
              artisanItems.length - 1
            } more`;

      const artisanValue = artisanItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );

      const buyerName =
        order.shippingAddress?.name ||
        order.customerName ||
        "Customer";

      const buyerLocation = getBuyerLocation(order);

      const statusOptions: OrderStatus[] = [
        "Placed",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      return [
        order.id,

        `${buyerName} · ${buyerLocation}`,

        craftName,

        <div
          key={`${order.id}-status`}
          className="flex items-center gap-2"
        >
          <span className={getStatusClass(order.status)}>
            {getStatusLabel(order.status)}
          </span>

          <select
            value={order.status}
            disabled={updatingOrderId === order.id}
            onChange={(event) =>
              handleStatusChange(
                order.id,
                event.target.value as OrderStatus,
              )
            }
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Update status for ${order.id}`}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>,

        `₹${artisanValue.toLocaleString("en-IN")}`,
      ];
    });
  }, [orders, updatingOrderId]);

  return (
    <GenericSection
      title="Orders"
      subtitle="Every order from village workshop to global doorstep."
    >
      <InfoTiles
        tiles={[
          {
            label: "New orders",
            value: String(stats.newOrders),
          },
          {
            label: "In production",
            value: String(stats.inProduction),
          },
          {
            label: "Dispatched",
            value: String(stats.dispatched),
          },
          {
            label: "Delivered (30d)",
            value: String(stats.deliveredLast30Days),
          },
        ]}
      />

      {orders.length > 0 ? (
        <DataTable
          headers={[
            "Order",
            "Buyer",
            "Craft",
            "Status",
            "Value",
          ]}
          rows={rows}
        />
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="font-display text-2xl">
            No orders yet.
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Customer purchases for your published crafts will appear here.
          </p>
        </div>
      )}
    </GenericSection>
  );
}