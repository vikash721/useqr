"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Info,
  MapPin,
  Package,
  Truck,
  Bell,
} from "lucide-react";
import { useLottie } from "lottie-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  getDummyOrders,
  formatOrderStatus,
  formatCurrency,
  formatOrderDate,
  type Order,
  type OrderStatus,
} from "./dummy-data";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  processing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  shipped: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-zinc-500/15 text-zinc-500",
};

function DeliveryAnimation() {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    fetch("/lottie/Delivery.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load animation:", err));
  }, []);

  const { View } = useLottie({
    animationData: animationData || {},
    loop: true,
    autoplay: true,
  });

  if (!animationData) return null;

  return (
    <div className="relative w-64 h-64 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-border/50 shadow-lg">
      {View}
    </div>
  );
}

export default function MyOrdersPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <DashboardHeader />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Coming Soon Section with Lottie */}
          <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border border-border bg-gradient-to-b from-card to-muted/20 px-6 py-12 text-center shadow-sm">
            <DeliveryAnimation />
            
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Orders Coming Soon
            </h1>
            
            <p className="mt-3 max-w-md text-base text-muted-foreground">
              We&apos;re putting the finishing touches on our order management system. 
              Soon you&apos;ll be able to track your sticker orders right here!
            </p>

            <div className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5">
              <Bell className="size-4 shrink-0 text-emerald-500" />
              <p className="text-sm text-emerald-200/90">
                <span className="font-medium text-emerald-400">We&apos;ll notify you</span>{" "}
                as soon as this feature goes live
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span>Real-time tracking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span>Order history</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span>Delivery updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function OrderCard({
  order,
  isExpanded,
  onToggle,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const statusStyle = STATUS_STYLES[order.status];

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/50 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/30 sm:gap-6"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-4">
          <div>
            <p className="font-medium text-foreground">{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground">
              {formatOrderDate(order.placedAt)}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex rounded-md px-2.5 py-0.5 text-xs font-medium",
              statusStyle
            )}
          >
            {formatOrderStatus(order.status)}
          </span>
          <p className="text-sm text-muted-foreground">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
            {itemCount} sticker{itemCount !== 1 ? "s" : ""}
          </p>
          <p className="ml-auto text-sm font-semibold text-foreground">
            {formatCurrency(order.totalCents)}
          </p>
        </div>
        <span className="shrink-0 text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-border bg-muted/20 px-6 py-4">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Items */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Items
              </h3>
              <ul className="space-y-2">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline justify-between text-sm"
                  >
                    <span className="text-foreground">
                      {item.name} · {item.size} × {item.quantity}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.unitPriceCents * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotalCents)}</span>
              </div>
              {order.shippingCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.shippingCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.taxCents)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.totalCents)}</span>
              </div>
            </div>

            {/* Shipping & tracking */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="size-3.5" />
                  Shipping address
                </h3>
                <p className="text-sm text-foreground">
                  {order.shippingAddress.name}
                  <br />
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 && (
                    <>
                      <br />
                      {order.shippingAddress.line2}
                    </>
                  )}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </p>
              </div>
              {order.trackingNumber && order.carrier && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Truck className="size-3.5" />
                    Tracking
                  </h3>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{order.carrier}</span>{" "}
                    <span className="font-mono text-muted-foreground">
                      {order.trackingNumber}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
