import { useEffect, useState } from "react";
import { api } from "./api";
import { Brand, Icon, Notice, Password } from "./ui";
import { usePage } from "./data";
import StudentDashboard from "./StudentDashboard";
import VendorDashboard from "./VendorDashboard";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api("/auth/me")
      .then((data) => {
        if (active) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setChecking(false);
        }
      });
    const expired = () => {
      setUser(null);
      setError("Your session expired. Please log in again.");
    };
    window.addEventListener("washtrack-session-expired", expired);
    return () => {
      active = false;
      window.removeEventListener("washtrack-session-expired", expired);
    };
  }, []);
  async function logout() {
    setBusy(true);
    setError("");
    try {
      await api("/auth/logout", { method: "POST", body: {} });
      setUser(null);
      window.location.hash = "/login";
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (checking) {
    return (
      <div className="loading-screen">
        <Brand />
        <p role="status">Loading your workspace…</p>
      </div>
    );
  }
  if (!user) {
    return (
      <Auth
        onLogin={setUser}
        sessionError={error}
      />
    );
  }
  const Dashboard = user.role === "STAFF" ? VendorDashboard : StudentDashboard;
  return (
    <>
      <div className="global-notice">
        <Notice error={error} />
      </div>
      <Dashboard
        user={user}
        onSignOut={logout}
        signingOut={busy}
      />
    </>
  );
}
function Auth({ onLogin, sessionError }) {
  const [page, go] = usePage("/login");
  const signup = page === "/signup";
  const [role, setRole] = useState("STUDENT");
  const [gender, setGender] = useState("B");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  function switchPage(next) {
    setError("");
    setMessage("");
    go(next);
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (signup) {
        if (fields.password !== fields.confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        await api("/auth/register", {
          method: "POST",
          body: {
            name: fields.name.trim(),
            email: fields.email.trim(),
            bagNo: `${gender}-${Number(fields.bagDigits)}`,
            password: fields.password,
            confirmPassword: fields.confirmPassword,
          },
        });
        go("/login");
        setMessage("Account created. Log in with your email and password.");
        setRole("STUDENT");
      } else {
        const data = await api("/auth/login", {
          method: "POST",
          body: { email: fields.email.trim(), password: fields.password },
        });
        if (data.user.role !== role) {
          await api("/auth/logout", { method: "POST", body: {} });
          throw new Error(
            `Choose ${data.user.role === "STAFF" ? "Laundry Staff" : "Student"} to log in to this account.`,
          );
        }
        go(data.user.role === "STAFF" ? "/staff" : "/home");
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={`auth-shell ${signup ? "signup-shell" : ""}`}>
      <header className="auth-header">
        <Brand />
        <h1>{signup ? "Create your account" : "Welcome back"}</h1>
        <p>
          {signup
            ? "Laundry tracking starts here."
            : "Your laundry, one tap away."}
        </p>
      </header>
      <section className="auth-body">
        <nav
          className="segments auth-tabs"
          aria-label="Account access"
        >
          <button
            className={!signup ? "selected" : ""}
            onClick={() => switchPage("/login")}
          >
            Log In
          </button>
          <button
            className={signup ? "selected" : ""}
            onClick={() => switchPage("/signup")}
          >
            Sign Up
          </button>
        </nav>
        <Notice
          error={error || sessionError}
          message={message}
        />
        <form
          key={signup ? "signup" : "login"}
          onSubmit={submit}
          className="auth-form"
        >
          <fieldset disabled={busy}>
            {!signup && (
              <div
                className="segments role-tabs"
                aria-label="Account role"
              >
                <button
                  type="button"
                  className={role === "STUDENT" ? "selected" : ""}
                  onClick={() => setRole("STUDENT")}
                >
                  Student
                </button>
                <button
                  type="button"
                  className={role === "STAFF" ? "selected" : ""}
                  onClick={() => setRole("STAFF")}
                >
                  Laundry Staff
                </button>
              </div>
            )}
            {signup && (
              <label className="field">
                Full name
                <input
                  name="name"
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </label>
            )}
            <label className="field">
              College email
              <input
                name="email"
                type="email"
                placeholder="you@rishihood.edu.in"
                autoComplete="username"
                required
                maxLength={254}
              />
            </label>
            {signup && (
              <>
                <div className="field">
                  <span>Gender</span>
                  <div className="segments role-tabs">
                    <button
                      type="button"
                      className={gender === "B" ? "selected" : ""}
                      onClick={() => setGender("B")}
                    >
                      Boy
                    </button>
                    <button
                      type="button"
                      className={gender === "G" ? "selected" : ""}
                      onClick={() => setGender("G")}
                    >
                      Girl
                    </button>
                  </div>
                </div>
                <label className="field">
                  Bag number
                  <span className="bag-input">
                    <span>{gender}-</span>
                    <input
                      aria-label="Bag number digits"
                      name="bagDigits"
                      type="text"
                      inputMode="numeric"
                      pattern="[1-9][0-9]{0,7}"
                      placeholder="69"
                      required
                      maxLength={8}
                    />
                  </span>
                  <small>Boy: B- · Girl: G-</small>
                </label>
              </>
            )}
            <Password creating={signup} />
            {signup && (
              <Password
                label="Confirm password"
                name="confirmPassword"
                creating
              />
            )}
            <button
              className="primary wide auth-submit"
              disabled={busy}
            >
              {busy ? "Please wait…" : signup ? "Create Account" : "Log In"}
              <Icon name="arrow" />
            </button>
          </fieldset>
        </form>
        {signup ? (
          <p className="auth-bottom">
            Already registered?{" "}
            <button
              className="text-button"
              onClick={() => switchPage("/login")}
            >
              Log In
            </button>
          </p>
        ) : (
          <>
            <p className="auth-bottom muted">
              Track your bag. Skip the waiting.
            </p>
            <p className="campus-note">
              <Icon name="check" />
              Made for Rishihood students
            </p>
          </>
        )}
      </section>
    </main>
  );
}
