// web/app/signup/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 28px" }}>
      <section style={card}>
        <div style={badge}>Create your account</div>
        <h1 style={title}>Sign up</h1>
        <p style={desc}>
          Join Solace to access the chat experience and build a healthier weekly routine.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Submitted (connect backend next)");
          }}
          style={{ display: "grid", gap: 12, marginTop: 14, maxWidth: 520 }}
        >
          <LabeledInput label="Email" placeholder="you@example.com" type="email" />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            show={showPass}
            toggle={() => setShowPass((v) => !v)}
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="••••••••"
            show={showConfirm}
            toggle={() => setShowConfirm((v) => !v)}
          />

          <PrimaryButton label="Create account" full />

          <div style={bottomText}>
            Already have an account?{" "}
            <Link href="/login" style={linkStrong}>
              Login
            </Link>
          </div>

          <p style={finePrint}>
            By continuing, you agree to our terms. Solace is not a licensed professional and isn’t a
            substitute for therapy.
          </p>
        </form>
      </section>
    </main>
  );
}

/* -------------------- UI Bits (same as login) -------------------- */

function PrimaryButton({ label, full }: { label: string; full?: boolean }) {
  return (
    <button
      type="submit"
      style={{
        width: full ? "100%" : "auto",
        background: "linear-gradient(180deg, #3B1D86 0%, #2A005C 100%)",
        color: "white",
        border: "1px solid rgba(255,255,255,0.18)",
        padding: "12px 16px",
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 10px 24px rgba(42,0,92,0.22)",
      }}
    >
      {label}
    </button>
  );
}

function LabeledInput({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 900, color: "#1a0044" }}>{label}</div>
      <input
        type={type}
        required
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 12px",
          borderRadius: 12,
          border: "1px solid rgba(20,20,40,0.12)",
          outline: "none",
          fontSize: 15,
          background: "white",
        }}
      />
    </label>
  );
}

function PasswordInput({
  label,
  placeholder,
  show,
  toggle,
}: {
  label: string;
  placeholder: string;
  show: boolean;
  toggle: () => void;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 900, color: "#1a0044" }}>{label}</div>

      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          required
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "12px 44px 12px 12px",
            borderRadius: 12,
            border: "1px solid rgba(20,20,40,0.12)",
            outline: "none",
            fontSize: 15,
            background: "white",
          }}
        />

        <button
          type="button"
          onClick={toggle}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 16,
          }}
          aria-label="Toggle password visibility"
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </label>
  );
}

/* -------------------- Styles (matches login cards) -------------------- */

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 26,
  padding: 26,
  border: "1px solid rgba(20,20,40,0.06)",
  boxShadow: "0 22px 60px rgba(16, 16, 30, 0.06)",
};

const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(59, 29, 134, 0.08)",
  color: "#3B1D86",
  fontWeight: 900,
  fontSize: 13,
};

const title: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: 34,
  lineHeight: 1.1,
  color: "#1a0044",
  fontWeight: 950,
};

const desc: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#4F4F63",
  fontSize: 15,
  lineHeight: 1.6,
  maxWidth: 740,
};

const bottomText: React.CSSProperties = {
  fontSize: 14,
  color: "#5B5B6A",
  textAlign: "left",
  marginTop: 2,
};

const linkStrong: React.CSSProperties = {
  color: "#3C1A7A",
  fontWeight: 800,
  textDecoration: "none",
};

const finePrint: React.CSSProperties = {
  marginTop: 6,
  fontSize: 13,
  lineHeight: 1.5,
  color: "rgba(79,79,99,0.9)",
};
