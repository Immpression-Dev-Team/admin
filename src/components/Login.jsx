import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, verifyLoginOtp } from "../api/API";
import logo from "@assets/Immpression_Logo_Transparent.png";
import ImmpressionLogo from "@assets/Immpression.png";
import { useAuth } from "@/context/authContext";
import { ADMIN_ROLES, CONTENT_EDITOR_DEFAULT_PATH } from "@/constants/adminRoles";
import "@styles/login.css";

const RESEND_COOLDOWN_SECONDS = 30;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { login, msg, setMsg } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const requestCode = async () => {
    setSubmitting(true);
    setMsg(null);
    try {
      const response = await loginAdmin(email, password);
      if (response.requires2FA) {
        setStep("otp");
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      }
    } catch (err) {
      setMsg({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    await requestCode();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const response = await verifyLoginOtp(email, otp);
      login(response.token, response.email, response.role, response.id);
      navigate(response.role === ADMIN_ROLES.CONTENT_EDITOR ? CONTENT_EDITOR_DEFAULT_PATH : "/home");
    } catch (err) {
      setMsg({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || submitting) return;
    await requestCode();
  };

  const handleUseDifferentAccount = () => {
    setStep("credentials");
    setOtp("");
    setMsg(null);
  };

  return (
    <div className="lg-page">
      {/* ─── Left brand panel ─── */}
      <div className="lg-brand">
        <div className="lg-brand-top">
          <img src={logo} alt="Immpression" className="lg-brand-logo" />
          <img src={ImmpressionLogo} alt="Immpression" className="lg-brand-wordmark" />
          <p className="lg-brand-tagline">
            Internal admin dashboard for managing artworks, users, orders, and platform operations.
          </p>
        </div>
        <span className="lg-brand-bottom">Immpression &copy; {new Date().getFullYear()}</span>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="lg-form-panel">
        <div className="lg-form-box">
          {step === "credentials" ? (
            <>
              <div className="lg-form-heading">
                <h1 className="lg-form-title">Admin Login</h1>
                <p className="lg-form-subtitle">Sign in to access the dashboard.</p>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="lg-fields">
                <div className="lg-field">
                  <label className="lg-label" htmlFor="lg-email">Email</label>
                  <input
                    id="lg-email"
                    type="email"
                    className="lg-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="lg-field">
                  <label className="lg-label" htmlFor="lg-password">Password</label>
                  <input
                    id="lg-password"
                    type="password"
                    className="lg-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                {msg && (
                  <div className={msg.type === "error" ? "lg-error" : "lg-success"}>
                    {msg.message}
                  </div>
                )}

                <button type="submit" className="lg-submit" disabled={submitting}>
                  {submitting ? "Sending code…" : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="lg-form-heading">
                <h1 className="lg-form-title">Enter Verification Code</h1>
                <p className="lg-form-subtitle">We emailed a 6-digit code to {email}. It expires in 10 minutes.</p>
              </div>

              <form onSubmit={handleOtpSubmit} className="lg-fields">
                <div className="lg-field">
                  <label className="lg-label" htmlFor="lg-otp">Verification Code</label>
                  <input
                    id="lg-otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="lg-input lg-otp-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    autoComplete="one-time-code"
                    autoFocus
                    required
                  />
                </div>

                {msg && (
                  <div className={msg.type === "error" ? "lg-error" : "lg-success"}>
                    {msg.message}
                  </div>
                )}

                <button type="submit" className="lg-submit" disabled={submitting || otp.length !== 6}>
                  {submitting ? "Verifying…" : "Verify & Sign In"}
                </button>

                <div className="lg-otp-actions">
                  <button type="button" className="lg-link-btn" onClick={handleResend} disabled={resendCooldown > 0 || submitting}>
                    {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
                  </button>
                  <button type="button" className="lg-link-btn" onClick={handleUseDifferentAccount} disabled={submitting}>
                    Use a different account
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
