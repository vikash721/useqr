import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your UseQR password",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
