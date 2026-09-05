import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/portal-shell";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";
import {
  createOrder,
  saveAddress,
  type ShippingAddress,
} from "@/lib/orders";

export const Route = createFileRoute("/portal/customer/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [placingOrder, setPlacingOrder] = useState(false);

  const impactFund = useMemo(() => Math.round(total * 0.02), [total]);

  const grandTotal = total + impactFund;

  if (items.length === 0) {
    return (
      <>
        <PageHeader
          title="Checkout"
          subtitle="Review your order before placing it"
        />

        <div className="rounded-3xl border border-dashed border-border p-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />

          <div className="mt-4 font-display text-2xl">
            Your cart is empty.
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Add a craft to your cart before proceeding to checkout.
          </p>

          <Link
            to="/marketplace"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Browse marketplace
          </Link>
        </div>
      </>
    );
  }

  const handlePlaceOrder = () => {
    if (placingOrder) return;

    /* -------------------------
       FORM VALIDATION
    ------------------------- */

    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!address.trim()) {
      toast.error("Please enter your delivery address.");
      return;
    }

    if (!city.trim()) {
      toast.error("Please enter your city.");
      return;
    }

    if (!state.trim()) {
      toast.error("Please enter your state.");
      return;
    }

    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (paymentMethod !== "cod") {
      toast.error("Online payment is not available yet.");
      return;
    }

    setPlacingOrder(true);

    try {
      /* -------------------------
         CUSTOMER
      ------------------------- */

      let customerId = "customer-demo";
      let customerName = name.trim();

      if (typeof window !== "undefined") {
        try {
          const rawUser = localStorage.getItem("navshakthi_user");

          if (rawUser) {
            const user = JSON.parse(rawUser) as {
              id?: string;
              fullName?: string;
              name?: string;
            };

            if (user.id) {
              customerId = user.id;
            }

            if (!name.trim() && (user.fullName || user.name)) {
              customerName = user.fullName || user.name || name.trim();
            }
          }
        } catch {
          // Keep the safe demo customer fallback.
        }
      }

      /* -------------------------
         SHIPPING ADDRESS
      ------------------------- */

      const shippingAddress: ShippingAddress = {
        name: name.trim(),
        phone: cleanPhone,
        line1: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      };

      /* Save address for future checkout use */
      saveAddress(shippingAddress);

      /* -------------------------
         ORDER ITEMS
      ------------------------- */

      const orderItems = items.map((item) => {
        const product = item.product;

        const artisanId =
          "artisanId" in product &&
          typeof product.artisanId === "string"
            ? product.artisanId
            : "artisan-self";

        const artisanName =
          "artisan" in product && typeof product.artisan === "string"
            ? product.artisan
            : "NAVSHAKTHI artisan";

        return {
          productId: product.id,
          artisanId,
          artisanName,
          title: product.name,
          image: product.image,
          quantity: item.qty,
          unitPrice: product.price,
          totalPrice: product.price * item.qty,
          aiPublished:
            "aiPublished" in product
              ? Boolean(product.aiPublished)
              : false,
        };
      });

      /* -------------------------
         CREATE REAL ORDER
      ------------------------- */

      const order = createOrder({
        customerId,
        customerName,
        items: orderItems,
        subtotal: total,
        shipping: 0,
        total: grandTotal,
        shippingAddress,
        status: "Placed",
        paymentStatus: "Pending",
      });

      /* -------------------------
         CLEAR CART
      ------------------------- */

      clear();

      toast.success("Order placed successfully!", {
        description: `Order ${order.id} has been created.`,
      });

      /* -------------------------
         GO TO MY ORDERS
      ------------------------- */

      navigate({
        to: "/portal/customer/orders",
      });
    } catch (error) {
      console.error("Failed to create order:", error);

      toast.error("Unable to place your order.", {
        description: "Please try again.",
      });

      setPlacingOrder(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Checkout"
        subtitle="Complete your delivery and payment details"
      />

      <div className="mb-6">
        <Link
          to="/portal/customer/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* DELIVERY DETAILS */}
          <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-display text-xl font-bold">
                  Delivery details
                </h2>

                <p className="text-sm text-muted-foreground">
                  Where should your crafts be delivered?
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InputField
                label="Full name"
                icon={<User className="h-4 w-4" />}
                value={name}
                onChange={setName}
                placeholder="Enter your full name"
              />

              <InputField
                label="Phone number"
                value={phone}
                onChange={(value) =>
                  setPhone(value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit mobile number"
                type="tel"
                inputMode="tel"
              />

              <div className="md:col-span-2">
                <label className="text-sm font-medium">
                  Delivery address
                </label>

                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Door No, Street, Area"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <InputField
                label="City"
                value={city}
                onChange={setCity}
                placeholder="City"
              />

              <InputField
                label="State"
                value={state}
                onChange={setState}
                placeholder="State"
              />

              <InputField
                label="PIN code"
                value={pincode}
                onChange={(value) =>
                  setPincode(value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="6-digit PIN"
                inputMode="numeric"
              />
            </div>
          </section>

          {/* PAYMENT */}
          <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-display text-xl font-bold">
                  Payment method
                </h2>

                <p className="text-sm text-muted-foreground">
                  Choose how you want to pay.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <PaymentOption
                selected={paymentMethod === "cod"}
                onClick={() => setPaymentMethod("cod")}
                title="Cash on Delivery"
                description="Pay when your craft is delivered."
              />

              <PaymentOption
                selected={paymentMethod === "online"}
                onClick={() => setPaymentMethod("online")}
                title="Online Payment"
                description="UPI, cards and other online methods."
                disabled
              />
            </div>

            {paymentMethod === "online" && (
              <div className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
                Online payment integration will be enabled in a later stage.
                Cash on Delivery is currently available for the prototype.
              </div>
            )}
          </section>

          {/* TRUST */}
          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <div>
                <div className="font-semibold">
                  Secure marketplace purchase
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your order is connected to the artisan&apos;s published
                  craft listing. The final selling price shown here is the
                  artisan&apos;s chosen marketplace price.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 shadow-sm xl:sticky xl:top-24">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Package className="h-4 w-4" />
            Order summary
          </div>

          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold">
                    {item.product.name}
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    Qty: {item.qty}
                  </div>
                </div>

                <div className="text-sm font-semibold">
                  ₹
                  {(item.product.price * item.qty).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>

              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                India Post shipping
              </span>

              <span className="text-primary">Free</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Artisan impact fund
              </span>

              <span>₹{impactFund.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-5 font-display text-xl">
            <span>Total</span>

            <span className="text-primary">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {placingOrder ? (
              "Placing order..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Place order
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Your order will be saved and appear in My Orders immediately.
          </p>
        </aside>
      </div>
    </>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: ReactNode;
  type?: string;
  inputMode?:
    | "text"
    | "numeric"
    | "decimal"
    | "tel"
    | "email"
    | "url"
    | "search"
    | "none";
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>

      <div className="relative mt-2">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className={`w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary ${
            icon ? "pl-11" : ""
          }`}
        />
      </div>
    </div>
  );
}

/* =========================================================
   PAYMENT OPTION
========================================================= */

function PaymentOption({
  selected,
  onClick,
  title,
  description,
  disabled = false,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/50"
      } ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      <div
        className={`mt-0.5 h-5 w-5 rounded-full border-2 ${
          selected ? "border-primary" : "border-muted-foreground/40"
        }`}
      >
        {selected && (
          <div className="m-1 h-2.5 w-2.5 rounded-full bg-primary" />
        )}
      </div>

      <div>
        <div className="font-semibold">{title}</div>

        <div className="mt-1 text-xs text-muted-foreground">
          {description}
        </div>
      </div>
    </button>
  );
}