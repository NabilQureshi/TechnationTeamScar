// web/app/login/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 28px" }}>
      <div style={pageGrid}>
        {/* Left: small marketing card */}
        <section style={sideCard}>
          <div style={badge}>Welcome back</div>
          <h1 style={title}>Sign in to Solace</h1>
          <p style={desc}>
            Continue your reflections, routines, and progress — privately and securely.
          </p>

          <div style={illusShell}>
            <Image
              src="/therapy.png"
              alt="Solace illustration"
              width={560}
              height={420}
              style={{ width: "100%", height: "auto" }}
              priority
            />
          </div>
        </section>

        {/* Right: login form */}
        <section style={formCard}>
          <h2 style={formTitle}>Login</h2>
          <p style={formSub}>Use your email and password. Firebase Auth hookup next.</p>

          <form style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <LabeledInput label="Email" placeholder="you@example.com" />
            <LabeledInput label="Password" placeholder="••••••••" type="password" />

            <div style={rowBetween}>
              <label style={remember}>
                <input type="checkbox" />
                Remember me
              </label>

              <Link href="/forgot" style={linkSmall}>
                Forgot password?
              </Link>
            </div>

            <PrimaryButton label="Continue" full />

            <div style={bottomText}>
              New here?{" "}
              <Link href="/signup" style={linkStrong}>
                Create an account
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

/* -------------------- UI Bits -------------------- */

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

/* -------------------- Styles -------------------- */

const pageGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 18,
  alignItems: "stretch",
};

const sideCard: React.CSSProperties = {
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
  maxWidth: 520,
};

const illusShell: React.CSSProperties = {
  marginTop: 16,
  borderRadius: 22,
  padding: 12,
  background: "linear-gradient(180deg, rgba(42,0,92,0.08) 0%, rgba(26,0,68,0.04) 100%)",
  border: "1px solid rgba(42,0,92,0.10)",
};

const formCard: React.CSSProperties = {
  background: "white",
  borderRadius: 26,
  padding: 26,
  border: "1px solid rgba(20,20,40,0.06)",
  boxShadow: "0 22px 60px rgba(16, 16, 30, 0.06)",
};

const formTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 950,
  color: "#1a0044",
};

const formSub: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#5B5B6A",
  fontSize: 14,
};

const rowBetween: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 2,
};

const remember: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  fontSize: 14,
  color: "#3B3B4A",
};

const linkSmall: React.CSSProperties = {
  fontSize: 14,
  color: "#3C1A7A",
  textDecoration: "none",
  fontWeight: 700,
};

const bottomText: React.CSSProperties = {
  fontSize: 14,
  color: "#5B5B6A",
  textAlign: "center",
  marginTop: 2,
};

const linkStrong: React.CSSProperties = {
  color: "#3C1A7A",
  fontWeight: 800,
  textDecoration: "none",
};
