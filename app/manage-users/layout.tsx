import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage users",
  description: "Admin-only: manage and delete users from the DB",
  robots: { index: false, follow: false },
};

export default function ManageUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
