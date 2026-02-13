"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type PlanId = "starter" | "pro" | "business";

type PaddleContextValue = {
  isReady: boolean;
  openCheckout: (
    planId: PlanId,
    options?: { clerkId?: string; email?: string }
  ) => Promise<boolean>;
};

const PaddleContext = createContext<PaddleContextValue | null>(null);

const PADDLE_SCRIPT = "https://cdn.paddle.com/paddle/v2/paddle.js";

/** Custom event dispatched when Paddle checkout completes successfully. Listen for this to show confirmation and refetch user. */
export const PADDLE_CHECKOUT_COMPLETED_EVENT = "paddle:checkout:completed";

declare global {
  interface Window {
    Paddle?: {
      Environment?: { set: (env: "sandbox" | "production") => void };
      Initialize: (opts: {
        token: string;
        checkout?: { settings?: object };
        eventCallback?: (data: { name: string; data?: unknown }) => void;
      }) => void;
      Checkout: {
        open: (opts: {
          items?: Array<{ priceId: string; quantity?: number }>;
          customer?: { email?: string };
          customData?: Record<string, string>;
          settings?: { displayMode?: string; theme?: string; locale?: string };
        }) => void;
        close: () => void;
      };
    };
  }
}

export function PaddleProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);

  const openCheckout = useCallback(
    async (
      planId: PlanId,
      options?: { clerkId?: string; email?: string }
    ): Promise<boolean> => {
      const res = await fetch("/api/paddle/price-ids");
      const data = (await res.json()) as {
        starter?: string | null;
        pro?: string | null;
        business?: string | null;
      };
      const priceId = data[planId];
      if (!priceId) {
        return false;
      }
      if (typeof window === "undefined" || !window.Paddle?.Checkout?.open) {
        console.error("[Paddle] Paddle.js not ready yet");
        return false;
      }
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        ...(options?.email && { customer: { email: options.email } }),
        ...(options?.clerkId && {
          customData: { clerkId: options.clerkId },
        }),
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "en",
        },
      });
      return true;
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined" || initRef.current) return;
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token || !window.Paddle) return;
    initRef.current = true;
    try {
      // Sandbox tokens (test_*) must use sandbox environment or checkout returns 403
      if (token.startsWith("test_") && window.Paddle.Environment?.set) {
        window.Paddle.Environment.set("sandbox");
      }
      window.Paddle.Initialize({
        token,
        checkout: {
          settings: {
            displayMode: "overlay",
            theme: "dark",
            locale: "en",
          },
        },
        eventCallback: (eventData) => {
          if (eventData.name === "checkout.completed") {
            window.Paddle?.Checkout?.close?.();
            window.dispatchEvent(new CustomEvent(PADDLE_CHECKOUT_COMPLETED_EVENT));
          }
        },
      });
      setIsReady(true);
    } catch (e) {
      console.error("[Paddle] Initialize failed", e);
    }
  }, []);

  return (
    <PaddleContext.Provider value={{ isReady, openCheckout }}>
      <Script
        src={PADDLE_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => {
          const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
          if (token && window.Paddle && !initRef.current) {
            initRef.current = true;
            try {
              if (token.startsWith("test_") && window.Paddle.Environment?.set) {
                window.Paddle.Environment.set("sandbox");
              }
              window.Paddle.Initialize({
                token,
                checkout: {
                  settings: {
                    displayMode: "overlay",
                    theme: "dark",
                    locale: "en",
                  },
                },
                eventCallback: (eventData) => {
                  if (eventData.name === "checkout.completed") {
                    window.Paddle?.Checkout?.close?.();
                    window.dispatchEvent(new CustomEvent(PADDLE_CHECKOUT_COMPLETED_EVENT));
                  }
                },
              });
              setIsReady(true);
            } catch (e) {
              console.error("[Paddle] Initialize failed", e);
            }
          }
        }}
      />
      {children}
    </PaddleContext.Provider>
  );
}

export function usePaddle(): PaddleContextValue {
  const ctx = useContext(PaddleContext);
  if (!ctx) {
    throw new Error("usePaddle must be used within PaddleProvider");
  }
  return ctx;
}
