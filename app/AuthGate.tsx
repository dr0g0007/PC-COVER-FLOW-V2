"use client";

import { FormEvent, useEffect, useState } from "react";
import CaseEngineScene from "./CaseEngineScene";

export const DEMO_USERNAME = "PCFUser";
export const DEMO_PASSWORD = "PCFPassword";

const SESSION_KEY = "pc-coverflow-v2-beta-access";

const pageStyle = {
  position: "fixed",
  inset: 0,
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 18% 70%, rgba(87, 76, 255, 0.42), transparent 28%), radial-gradient(circle at 78% 20%, rgba(0, 195, 255, 0.3), transparent 26%), linear-gradient(135deg, #030712 0%, #050617 45%, #02030a 100%)",
  color: "#ffffff",
  fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
} as const;

const panelStyle = {
  position: "relative",
  zIndex: 1,
  width: "min(560px, calc(100vw - 32px))",
  padding: "42px 48px 28px",
  border: "1px solid rgba(135, 199, 255, 0.72)",
  borderRadius: 28,
  background: "linear-gradient(180deg, rgba(10, 14, 31, 0.86), rgba(8, 7, 21, 0.72))",
  boxShadow:
    "0 0 60px rgba(72, 124, 255, 0.34), inset 0 0 44px rgba(162, 90, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(22px)",
} as const;

const inputWrapStyle = {
  display: "grid",
  gridTemplateColumns: "28px 1fr",
  alignItems: "center",
  gap: 14,
  minHeight: 56,
  padding: "0 20px",
  border: "1px solid rgba(91, 132, 255, 0.58)",
  borderRadius: 9,
  background: "rgba(2, 6, 23, 0.7)",
  boxShadow: "inset 0 0 24px rgba(3, 10, 29, 0.5)",
} as const;

const inputStyle = {
  width: "100%",
  border: 0,
  outline: 0,
  background: "transparent",
  color: "#f8fbff",
  fontSize: 15,
  letterSpacing: 0,
} as const;

function LoginGlyph({ type }: { type: "user" | "lock" }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
      {type === "user" ? (
        <>
          <path d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z" stroke="#8ec5ff" strokeWidth="1.5" />
          <path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0" stroke="#8ec5ff" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M6.5 10.25h11v9h-11v-9Z" stroke="#8ec5ff" strokeWidth="1.5" />
          <path d="M8.75 10.25V7.8a3.25 3.25 0 0 1 6.5 0v2.45" stroke="#8ec5ff" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function LoginEmblem() {
  return (
    <svg aria-hidden="true" width="76" height="76" viewBox="0 0 96 96" fill="none">
      <path d="M48 7 82 26v40L48 89 14 66V26L48 7Z" stroke="url(#emblemStroke)" strokeWidth="7" />
      <path d="M64 35 48 26 31 36v20l17 10 16-9" stroke="url(#emblemCore)" strokeWidth="7" strokeLinecap="round" />
      <path d="M48 48h29" stroke="#b993ff" strokeWidth="7" strokeLinecap="round" />
      <defs>
        <linearGradient id="emblemStroke" x1="12" x2="88" y1="78" y2="18">
          <stop stopColor="#35c9ff" />
          <stop offset="0.52" stopColor="#6388ff" />
          <stop offset="1" stopColor="#b35cff" />
        </linearGradient>
        <linearGradient id="emblemCore" x1="28" x2="70" y1="62" y2="29">
          <stop stopColor="#2bc6ff" />
          <stop offset="1" stopColor="#b56cff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AuthGate() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storageCheck = window.setTimeout(() => {
      try {
        setIsAuthenticated(sessionStorage.getItem(SESSION_KEY) === "true");
      } catch {
        setIsAuthenticated(false);
      }
    }, 0);

    return () => window.clearTimeout(storageCheck);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const usernameMatches = username.trim() === DEMO_USERNAME;
    const passwordMatches = password === DEMO_PASSWORD;

    if (!usernameMatches || !passwordMatches) {
      setError("Access denied. Check the username and password.");
      return;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Continue into the prototype even when browser storage is unavailable.
    }
    setError("");
    setIsAuthenticated(true);
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Storage may be blocked in some mobile/private browser modes.
    }
    setPassword("");
    setIsAuthenticated(false);
  }

  if (isAuthenticated) {
    return <CaseEngineScene onLogout={handleLogout} />;
  }

  return (
    <main style={pageStyle}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage: "radial-gradient(circle at center, black, transparent 72%)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "8vw",
          top: "16vh",
          width: 260,
          height: 260,
          borderRadius: 28,
          background: "linear-gradient(135deg, rgba(72, 151, 255, 0.34), rgba(164, 80, 255, 0.1))",
          filter: "blur(28px)",
          transform: "rotate(18deg)",
        }}
      />
      <section style={panelStyle} aria-label="PC Cover Flow private beta login">
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "18%",
            right: "18%",
            top: -2,
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.98), transparent)",
            boxShadow: "0 0 24px rgba(255, 255, 255, 0.9)",
          }}
        />
        <div style={{ display: "grid", justifyItems: "center", gap: 13, marginBottom: 28 }}>
          <LoginEmblem />
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(28px, 9vw, 54px)",
              lineHeight: 1,
              letterSpacing: 0,
              fontWeight: 800,
              whiteSpace: "nowrap",
              textShadow: "0 0 24px rgba(111, 137, 255, 0.65)",
            }}
          >
            PC Cover Flow
          </h1>
          <p
            style={{
              margin: 0,
              color: "rgba(220, 229, 255, 0.72)",
              fontSize: 15,
              letterSpacing: 4,
            }}
          >
            Private Beta Access
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={inputWrapStyle}>
            <LoginGlyph type="user" />
            <input
              autoComplete="username"
              placeholder="Username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError("");
              }}
              style={inputStyle}
            />
          </label>
          <label style={inputWrapStyle}>
            <LoginGlyph type="lock" />
            <input
              autoComplete="current-password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              style={inputStyle}
            />
          </label>
          <button
            type="submit"
            style={{
              minHeight: 58,
              border: "1px solid rgba(172, 202, 255, 0.7)",
              borderRadius: 9,
              background: "linear-gradient(100deg, #44c7ff 0%, #6965ff 48%, #b65cff 100%)",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 2,
              boxShadow: "0 0 28px rgba(98, 123, 255, 0.52)",
            }}
          >
            Sign In <span aria-hidden="true" style={{ marginLeft: 18 }}>-&gt;</span>
          </button>
          <p
            role={error ? "alert" : undefined}
            style={{
              minHeight: 21,
              margin: 0,
              color: error ? "#ff9ab0" : "rgba(205, 216, 255, 0.68)",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {error || "Private beta access only"}
          </p>
        </form>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
            marginTop: 18,
            paddingTop: 20,
            borderTop: "1px solid rgba(135, 163, 255, 0.16)",
            color: "rgba(239, 244, 255, 0.86)",
            fontSize: 12,
            letterSpacing: 0.5,
            textAlign: "center",
          }}
        >
          <span>Innovation.</span>
          <span>Performance.</span>
          <span>Experience.</span>
        </div>
      </section>
    </main>
  );
}
