import { useMemo, useState } from "react";
import { login, signup } from "../services/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

function Login({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const heading = useMemo(
    () =>
      mode === "login"
        ? "Sign in to manage your charity rounds"
        : "Create your golfer account",
    [mode]
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;

      const response = mode === "login" ? await login(payload) : await signup(payload);
      setSuccess(mode === "login" ? "Welcome back." : "Account created successfully.");
      onAuthSuccess(response);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="auth-copy">
          <p className="eyebrow">Golf Charity Platform</p>
          <h1>Turn every round into community impact.</h1>
          <p className="hero-text">
            Track your best scores, choose a charity, and enter each draw with a dashboard
            that feels polished on every screen.
          </p>

          <div className="hero-points">
            <div className="hero-point">
              <strong>5-score rolling history</strong>
              <span>Keep your most recent rounds front and center.</span>
            </div>
            <div className="hero-point">
              <strong>Live charity selection</strong>
              <span>Save your preferred cause right from the dashboard.</span>
            </div>
            <div className="hero-point">
              <strong>Instant draw feedback</strong>
              <span>See your matches and entered numbers immediately.</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="segmented-control" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === "login" ? "segment active" : "segment"}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={mode === "signup" ? "segment active" : "segment"}
              onClick={() => setMode("signup")}
            >
              Create Account
            </button>
          </div>

          <div className="form-intro">
            <h2>{heading}</h2>
            <p>
              {mode === "login"
                ? "Use your email and password to access your golfer dashboard."
                : "Join the platform and start supporting your chosen cause."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label className="field">
                <span>Full name</span>
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Jordan Spieth"
                  autoComplete="name"
                  required
                />
              </label>
            ) : null}

            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="golfer@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </label>

            {error ? <p className="status-banner error">{error}</p> : null}
            {success ? <p className="status-banner success">{success}</p> : null}

            <button className="button primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;
