"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, Trash2, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentWhitelistManager } from "@/components/PaymentWhitelistManager";
import { api } from "@/lib/axios";
import { toast } from "@/lib/toast";

type ManageUser = {
  clerkId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  plan: string;
  createdAt: string;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function ManageUsersPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [users, setUsers] = useState<ManageUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [whitelistingEmail, setWhitelistingEmail] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<ManageUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const { data } = await api.get<{ users: ManageUser[] }>("/api/manage-users");
      setUsers(data.users ?? []);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (status === 403) {
        setForbidden(true);
        setUsers([]);
      } else {
        setError(msg ?? "Failed to load users.");
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      window.location.href = "/login?redirect=/manage-users";
      return;
    }
    fetchUsers();
  }, [isLoaded, isSignedIn]);

  const handleDeleteClick = (user: ManageUser) => {
    setConfirmUser(user);
  };

  const handleConfirmClose = () => {
    if (!deletingId) setConfirmUser(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmUser) return;
    const clerkId = confirmUser.clerkId;
    setDeletingId(clerkId);
    try {
      await api.delete("/api/manage-users", { data: { clerkId } });
      setUsers((prev) => prev.filter((u) => u.clerkId !== clerkId));
      setConfirmUser(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      alert(msg ?? "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleWhitelistUser = async (user: ManageUser) => {
    if (!user.email) {
      toast.error("User does not have an email address.");
      return;
    }
    setWhitelistingEmail(user.email);
    try {
      await fetch("/api/payment-whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      toast.success("User added to payment whitelist.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to whitelist user.");
    } finally {
      setWhitelistingEmail(null);
    }
  };

  if (!isLoaded || (!isSignedIn && !forbidden)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Skeleton className="h-12 w-64 rounded-md" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Access denied</h1>
          <p className="text-muted-foreground">
            This page is for admins only. Only the configured admin email can manage users.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard" aria-label="Back to dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold text-foreground">Manage users</h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Admin only — delete user data from DB</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Payment Whitelist Section */}
        <PaymentWhitelistManager />

        {/* Users Management Section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Users</h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">No users in the database.</p>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-medium text-foreground w-14">Photo</th>
                      <th className="text-left p-3 font-medium text-foreground">Email</th>
                      <th className="text-left p-3 font-medium text-foreground">Name</th>
                      <th className="text-left p-3 font-medium text-foreground">Plan</th>
                      <th className="text-left p-3 font-medium text-foreground">Created</th>
                      <th className="text-left p-3 font-medium text-foreground">Clerk ID</th>
                      <th className="text-right p-3 font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.clerkId} className="border-b border-border/60 hover:bg-muted/30">
                        <td className="p-3">
                          {u.imageUrl ? (
                            <img
                              src={u.imageUrl}
                              alt={u.name ?? u.email ?? "Avatar"}
                              className="h-9 w-9 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div
                              className="h-9 w-9 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground text-xs font-medium"
                              title="No photo"
                            >
                              {(u.name ?? u.email ?? "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-foreground">{u.email ?? "—"}</td>
                        <td className="p-3 text-foreground">{u.name ?? "—"}</td>
                        <td className="p-3 text-muted-foreground">{u.plan}</td>
                        <td className="p-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground max-w-[140px] truncate" title={u.clerkId}>
                          {u.clerkId}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWhitelistUser(u)}
                              disabled={!u.email || whitelistingEmail === u.email}
                              aria-label={`Whitelist user ${u.email ?? u.clerkId}`}
                            >
                              {whitelistingEmail === u.email ? (
                                "Whitelisting…"
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Whitelist
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(u)}
                              disabled={deletingId === u.clerkId}
                              aria-label={`Delete user ${u.email ?? u.clerkId}`}
                            >
                              {deletingId === u.clerkId ? (
                                "Deleting…"
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!confirmUser} onOpenChange={(open) => !open && handleConfirmClose()}>
        <DialogContent showCloseButton={!deletingId} onPointerDownOutside={handleConfirmClose}>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              {confirmUser ? (
                <>
                  This will permanently delete all data for{" "}
                  <span className="font-medium text-foreground">
                    {confirmUser.name ?? confirmUser.email ?? confirmUser.clerkId}
                  </span>
                  {confirmUser.email && confirmUser.email !== (confirmUser.name ?? "") && (
                    <> ({confirmUser.email})</>
                  )}
                  {" "}from the database (user record, QR codes, and scan analytics). This cannot be undone.
                </>
              ) : (
                "This action cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleConfirmClose}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!!deletingId}
            >
              {deletingId ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
