import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  GenericSection,
  InfoTiles,
  DataTable,
} from "@/components/portal-sections";
import {
  artisanEarnings,
  getArtisanOrders,
  ORDERS_UPDATED_EVENT,
  type Order,
} from "@/lib/orders";

export const Route = createFileRoute("/portal/artisan/payments")({
  component: ArtisanPayments,
});

const ARTISAN_ID = "artisan-self";

function ArtisanPayments() {
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

  const settledLast30Days = useMemo(() => {
    const thirtyDaysAgo =
      Date.now() - 30 * 24 * 60 * 60 * 1000;

    return orders
      .filter(
        (order) =>
          order.status === "Delivered" &&
          new Date(order.updatedAt).getTime() >= thirtyDaysAgo,
      )
      .reduce((total, order) => {
        return (
          total +
          order.items
            .filter((item) => item.artisanId === ARTISAN_ID)
            .reduce(
              (sum, item) => sum + item.totalPrice,
              0,
            )
        );
      }, 0);
  }, [orders]);

  const paymentRows = useMemo(() => {
    return orders.flatMap((order) => {
      const artisanItems = order.items.filter(
        (item) => item.artisanId === ARTISAN_ID,
      );

      const artisanAmount = artisanItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );

      if (artisanAmount <= 0) {
        return [];
      }

      const date = new Date(order.createdAt).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        },
      );

      const paymentStatus =
        order.status === "Delivered"
          ? "Settled"
          : order.status === "Cancelled"
            ? "Cancelled"
            : "Pending";

      return [
        [
          date,
          order.id,
          `₹${artisanAmount.toLocaleString("en-IN")}`,
          "Order payment",
          <span
            key={`${order.id}-payment`}
            className={
              paymentStatus === "Settled"
                ? "text-primary"
                : paymentStatus === "Cancelled"
                  ? "text-destructive"
                  : "text-clay"
            }
          >
            {paymentStatus}
          </span>,
        ],
      ];
    });
  }, [orders]);

  return (
    <GenericSection
      title="Payments"
      subtitle="Every rupee earned from your published crafts."
    >
      <InfoTiles
        tiles={[
          {
            label: "Available balance",
            value: `₹${earnings.settled.toLocaleString("en-IN")}`,
            hint: "Settled earnings",
          },
          {
            label: "Settled (30d)",
            value: `₹${settledLast30Days.toLocaleString("en-IN")}`,
          },
          {
            label: "Pending",
            value: `₹${earnings.pending.toLocaleString("en-IN")}`,
          },
          {
            label: "Items sold",
            value: String(earnings.itemsSold),
            hint: `${earnings.orders} order${
              earnings.orders === 1 ? "" : "s"
            }`,
          },
        ]}
      />

      {paymentRows.length > 0 ? (
        <DataTable
          headers={[
            "Date",
            "Order",
            "Amount",
            "Method",
            "Status",
          ]}
          rows={paymentRows}
        />
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="font-display text-2xl">
            No payment activity yet.
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Earnings from customer purchases will appear here.
          </p>
        </div>
      )}
    </GenericSection>
  );
}