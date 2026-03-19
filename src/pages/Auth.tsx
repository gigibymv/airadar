import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const { user, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;

        // When email confirmation is enabled, Supabase creates the user but does not create a session.
        if (data.user && !data.session) {
          setNotice("Account created. Check your email to confirm your account before signing in.");
          setIsSignUp(false);
          setPassword("");
          return;
        }

        setNotice("Account created. You are now signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const rawMessage =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Something went wrong";

      if (rawMessage.toLowerCase().includes("invalid login credentials")) {
        setError("Invalid credentials, or your email is not confirmed yet.");
      } else {
        setError(rawMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/ai-icon.png"
            alt="AI Radar mark"
            className="h-10 w-10 object-contain"
          />
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            AI Radar
          </h1>
          <p className="text-[12px] text-muted-foreground">
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </p>
        </div>

        {isSignUp && (
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full px-4 py-3 text-sm border border-input text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all bg-transparent"
          />
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoFocus
          className="w-full px-4 py-3 text-sm border border-input text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all bg-transparent"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={6}
          className="w-full px-4 py-3 text-sm border border-input text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all bg-transparent"
        />

        {error && (
          <p className="text-[11px] text-destructive font-medium">{error}</p>
        )}
        {notice && (
          <p className="text-[11px] text-primary font-medium">{notice}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 text-[13px] font-semibold border border-border text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
        >
          {submitting ? "..." : isSignUp ? "Create Account" : "Sign In"}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setNotice("");
          }}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  );
}
