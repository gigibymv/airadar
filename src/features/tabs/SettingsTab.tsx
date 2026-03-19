import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function SettingsTab() {
  const { displayName, user, signOut, updateDisplayName } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft(displayName);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft("");
  };

  const saveEdit = async () => {
    if (!draft.trim() || draft.trim() === displayName) {
      cancelEdit();
      return;
    }
    setSaving(true);
    try {
      await updateDisplayName(draft.trim());
      toast.success("Nickname updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update nickname");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight text-foreground leading-[1.1]">
          Settings
        </h2>
        <p className="text-[11px] text-muted-foreground mt-1">
          Account and app preferences
        </p>
      </div>

      <section className="border-t border-border pt-6 space-y-4">
        <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic">
          account
        </h3>

        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">nickname</p>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                autoFocus
                maxLength={40}
                className="text-[14px] text-foreground bg-background border border-input px-2 py-1 w-full sm:w-48 focus:outline-none focus:border-foreground"
              />
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="text-[12px] font-semibold px-3 py-1 border border-border text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-[14px] text-foreground">{displayName || "—"}</p>
              <button
                type="button"
                onClick={startEdit}
                className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">email</p>
          <p className="text-[14px] text-foreground">{user?.email || "—"}</p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={signOut}
            className="px-4 py-2 text-[13px] font-semibold border border-border text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
