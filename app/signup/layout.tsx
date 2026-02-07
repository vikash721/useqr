import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your UseQR account",
  robots: { index: false, follow: true },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
