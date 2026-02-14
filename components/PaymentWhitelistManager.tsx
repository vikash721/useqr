"use client";

import { useState, useEffect } from "react";
import { Loader2, Mail, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

interface WhitelistEntry {
  email: string;
  addedBy: string;
  addedAt: string;
  reason?: string;
}

export function PaymentWhitelistManager() {
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newReason, setNewReason] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchWhitelist = async () => {
    try {
      const response = await fetch("/api/payment-whitelist");
      if (!response.ok) throw new Error("Failed to fetch whitelist");
      const data = await response.json();
      setWhitelist(data.whitelist);
    } catch (error) {
      toast.error("Failed to load whitelist");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAdding(true);
    try {
      const response = await fetch("/api/payment-whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          reason: newReason.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add email");
      }

      toast.success("Email added to whitelist");
      setNewEmail("");
      setNewReason("");
      setShowAddForm(false);
      await fetchWhitelist();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add email");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Remove ${email} from whitelist?`)) return;

    try {
      const response = await fetch("/api/payment-whitelist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to remove email");

      toast.success("Email removed from whitelist");
      await fetchWhitelist();
    } catch (error) {
      toast.error("Failed to remove email");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Payment Whitelist
          </h2>
          <p className="text-sm text-muted-foreground">
            Emails allowed to purchase plans on production ({whitelist.length} total)
          </p>
        </div>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="size-4" />
            Add Email
          </Button>
        )}
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-lg border border-border bg-card p-4 space-y-4"
        >
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-foreground">Add Email to Whitelist</h3>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewEmail("");
                setNewReason("");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                required
                disabled={adding}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Reason (optional)
              </label>
              <Input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g., Beta tester, Team member"
                disabled={adding}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={adding} className="gap-2">
              {adding && <Loader2 className="size-4 animate-spin" />}
              Add to Whitelist
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewEmail("");
                setNewReason("");
              }}
              disabled={adding}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {whitelist.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/50 px-6 py-12 text-center">
          <Mail className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-4 font-medium text-foreground">No whitelisted emails</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add emails to allow specific users to purchase plans on production
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="divide-y divide-border">
            {whitelist.map((entry) => (
              <div
                key={entry.email}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0 text-muted-foreground" />
                    <p className="font-medium text-foreground truncate">
                      {entry.email}
                    </p>
                  </div>
                  {entry.reason && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {entry.reason}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Added {new Date(entry.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(entry.email)}
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
