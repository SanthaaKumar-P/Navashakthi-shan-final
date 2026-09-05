import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Stat } from "@/components/portal-shell";
import {
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  X,
  CreditCard,
} from "lucide-react";
import {
  getCustomerOrders,
  ORDERS_UPDATED_EVENT,
  type Order,
} from "@/lib/orders";

export const Route = createFileRoute("/portal/customer/orders")({
  component: Orders,
});

function getStatusIcon(status: Order["status"]) {
  switch (status) {
    case "Delivered":
      return CheckCircle2;

    case "Shipped":
      return Truck;

    case "Cancelled":
      return Package;

    case "Placed":
    case "Confirmed":
    case "Processing":
    default:
      return Clock;
  }
}

function getStatusLabel(status: Order["status"]) {
  switch (status) {
    case "Placed":
      return "Placed";

    case "Confirmed":
      return "Confirmed";

    case "Processing":
      return "Processing";

    case "Shipped":
      return "In transit";

    case "Delivered":
      return "Delivered";

    case "Cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function getCustomerId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = localStorage.getItem("navshakthi_user");

    if (!raw) {
      return undefined;
    }

    const user = JSON.parse(raw) as {
      id?: string;
    };

    return user.id;
  } catch {
    return undefined;
  }
}

const trackingSteps: {
  status: Order["status"];
  label: string;
}[] = [
  {
    status: "Placed",
    label: "Order placed",
  },
  {
    status: "Confirmed",
    label: "Order confirmed",
  },
  {
    status: "Processing",
    label: "In production",
  },
  {
    status: "Shipped",
    label: "Dispatched",
  },
  {
    status: "Delivered",
    label: "Delivered",
  },
];

function getStatusIndex(status: Order["status"]) {
  if (status === "Cancelled") {
    return -1;
  }

  return trackingSteps.findIndex(
    (step) => step.status === status,
  );
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    null,
  );

  const loadOrders = () => {
    const customerId = getCustomerId();
    const nextOrders = getCustomerOrders(customerId);

    setOrders(nextOrders);

    setSelectedOrder((current) => {
      if (!current) {
        return null;
      }

      return (
        nextOrders.find((order) => order.id === current.id) ?? null
      );
    });
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

  const stats = useMemo(() => {
    const delivered = orders.filter(
      (order) => order.status === "Delivered",
    ).length;

    const inTransit = orders.filter(
      (order) => order.status === "Shipped",
    ).length;

    const processing = orders.filter(
      (order) =>
        order.status === "Placed" ||
        order.status === "Confirmed" ||
        order.status === "Processing",
    ).length;

    const lifetimeSpend = orders
      .filter((order) => order.status !== "Cancelled")
      .reduce((sum, order) => sum + order.total, 0);

    return {
      delivered,
      inTransit,
      processing,
      lifetimeSpend,
    };
  }, [orders]);

  return (
    <>
      <PageHeader
        title="My orders"
        subtitle="Track every craft — from village workshop to your doorstep."
      />

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat
          label="Delivered"
          value={String(stats.delivered)}
        />

        <Stat
          label="In transit"
          value={String(stats.inTransit)}
        />

        <Stat
          label="Processing"
          value={String(stats.processing)}
        />

        <Stat
          label="Lifetime spend"
          value={`₹${stats.lifetimeSpend.toLocaleString("en-IN")}`}
        />
      </div>

      {/* EMPTY STATE */}
      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border p-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />

          <div className="mt-4 font-display text-2xl">
            No orders yet.
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Your purchased crafts will appear here after you place an
            order.
          </p>

          <Link
            to="/marketplace"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Explore crafts
          </Link>
        </div>
      ) : (
        <>
          {/* ORDERS TABLE */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-border/60 bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="p-4">Order</th>
                    <th className="p-4">Craft</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const Icon = getStatusIcon(order.status);

                    const itemNames = order.items
                      .map((item) => item.title)
                      .join(", ");

                    return (
                      <tr
                        key={order.id}
                        className="border-t border-border/60 transition hover:bg-muted/20"
                      >
                        {/* ORDER */}
                        <td className="p-4 align-top">
                          <div className="font-mono text-xs font-semibold">
                            {order.id}
                          </div>

                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            )}{" "}
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            ) === 1
                              ? "item"
                              : "items"}
                          </div>
                        </td>

                        {/* CRAFT */}
                        <td className="max-w-[280px] p-4 align-top">
                          <div className="font-medium">
                            {order.items[0]?.title ?? "Craft order"}
                          </div>

                          {order.items.length > 1 && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              + {order.items.length - 1} more craft
                              {order.items.length - 1 === 1
                                ? ""
                                : "s"}
                            </div>
                          )}

                          <div className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                            {itemNames}
                          </div>
                        </td>

                        {/* DATE */}
                        <td className="whitespace-nowrap p-4 align-top text-muted-foreground">
                          {new Date(
                            order.createdAt,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* STATUS */}
                        <td className="p-4 align-top">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              order.status === "Cancelled"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            <Icon className="h-3 w-3" />

                            {getStatusLabel(order.status)}
                          </span>
                        </td>

                        {/* AMOUNT */}
                        <td className="whitespace-nowrap p-4 text-right align-top font-semibold">
                          ₹{order.total.toLocaleString("en-IN")}
                        </td>

                        {/* ACTION */}
                        <td className="p-4 text-right align-top">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition hover:border-primary hover:text-primary"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ORDER DETAILS */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div
                className="absolute inset-0"
                onClick={() => setSelectedOrder(null)}
              />

              <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-border/60 p-6">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      Order
                    </div>

                    <h2 className="mt-1 font-display text-2xl">
                      {selectedOrder.id}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(
                        selectedOrder.createdAt,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:bg-muted"
                    aria-label="Close order details"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-7 p-6">
                  {/* TRACKING */}
                  <section>
                    <div className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Order tracking
                    </div>

                    {selectedOrder.status === "Cancelled" ? (
                      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                        <div className="font-semibold text-destructive">
                          Order cancelled
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          This order is no longer being processed.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {trackingSteps.map((step, index) => {
                          const currentIndex = getStatusIndex(
                            selectedOrder.status,
                          );

                          const completed =
                            index <= currentIndex;

                          const current =
                            index === currentIndex;

                          return (
                            <div
                              key={step.status}
                              className="flex items-center gap-3"
                            >
                              <div
                                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                                  completed
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {completed ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <span className="text-xs">
                                    {index + 1}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1">
                                <div
                                  className={`text-sm ${
                                    current
                                      ? "font-semibold text-primary"
                                      : completed
                                        ? "font-medium"
                                        : "text-muted-foreground"
                                  }`}
                                >
                                  {step.label}
                                </div>

                                {current && (
                                  <div className="text-xs text-muted-foreground">
                                    Current status
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {/* ITEMS */}
                  <section>
                    <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Craft items
                    </div>

                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex gap-4 rounded-2xl border border-border/60 p-3"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-20 w-20 rounded-xl object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="font-medium">
                              {item.title}
                            </div>

                            <div className="mt-1 text-xs text-muted-foreground">
                              Artisan: {item.artisanName}
                            </div>

                            <div className="mt-1 text-xs text-muted-foreground">
                              Quantity: {item.quantity}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold">
                              ₹
                              {item.totalPrice.toLocaleString(
                                "en-IN",
                              )}
                            </div>

                            <div className="mt-1 text-xs text-muted-foreground">
                              ₹
                              {item.unitPrice.toLocaleString(
                                "en-IN",
                              )}{" "}
                              each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* SHIPPING */}
                  <section>
                    <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Shipping address
                    </div>

                    <div className="rounded-2xl border border-border/60 p-4 text-sm">
                      <div className="font-semibold">
                        {selectedOrder.shippingAddress.name}
                      </div>

                      <div className="mt-1 text-muted-foreground">
                        {selectedOrder.shippingAddress.phone}
                      </div>

                      <div className="mt-2 text-muted-foreground">
                        {selectedOrder.shippingAddress.line1}
                        <br />
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.state}
                        <br />
                        {selectedOrder.shippingAddress.pincode}
                      </div>
                    </div>
                  </section>

                  {/* PAYMENT + SUMMARY */}
                  <section>
                    <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      Payment & summary
                    </div>

                    <div className="rounded-2xl border border-border/60 p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Subtotal
                          </span>

                          <span>
                            ₹
                            {selectedOrder.subtotal.toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Shipping
                          </span>

                          <span>
                            {selectedOrder.shipping === 0
                              ? "Free"
                              : `₹${selectedOrder.shipping.toLocaleString(
                                  "en-IN",
                                )}`}
                          </span>
                        </div>

                        <div className="flex justify-between border-t border-border pt-3 font-semibold">
                          <span>Total</span>

                          <span className="text-primary">
                            ₹
                            {selectedOrder.total.toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-xs">
                        <span className="text-muted-foreground">
                          Payment status
                        </span>

                        <span className="font-semibold">
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}