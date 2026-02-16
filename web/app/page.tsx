// web/app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#F5F6FB" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 28px" }}>
        <section style={heroCard}>
          <div>
            <div style={badge}>Your mental wellness companion</div>

            <h1 style={headline}>
              Navigating life can be hard.
              <br />
              Let us help you.
            </h1>

            <p style={subhead}>
              Solace helps you reflect, track your mood, and build healthier routines with gentle
              guidance and privacy-first design.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
              <Link href="/tryout" style={{ textDecoration: "none" }}>
                <PrimaryButton label="Try Solace" />
              </Link>
              <Link href="/signup" style={{ textDecoration: "none" }}>
                <SecondaryButton label="Create account" />
              </Link>
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
              <MiniStat title="Fast" desc="Start in 30 seconds" />
              <MiniStat title="Private" desc="You control your data" />
              <MiniStat title="Supportive" desc="No judgment, ever" />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={imageShell}>
              <Image
                src="/therapy.png"
                alt="Solace illustration"
                width={560}
                height={420}
                style={{ width: "100%", height: "auto" }}
                priority
              />
            </div>
          </div>
        </section>

        <section style={{ marginTop: 24, textAlign: "center" }}>
          <div style={{ color: "#4F4F63", fontSize: 16 }}>Ready to continue?</div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <Link href="/login" style={{ textDecoration: "none" }}>
              <PrimaryButton label="Login" />
            </Link>
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <SecondaryButton label="Sign up" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

/* -------------------- UI Bits -------------------- */

function PrimaryButton({ label, full }: { label: string; full?: boolean }) {
  return (
    <button
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

function SecondaryButton({ label }: { label: string }) {
  return (
    <button
      style={{
        background: "white",
        color: "#2A005C",
        border: "1px solid rgba(42,0,92,0.14)",
        padding: "12px 16px",
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 10px 24px rgba(20,20,40,0.06)",
      }}
    >
      {label}
    </button>
  );
}

function MiniStat({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        background: "#FAFAFF",
        border: "1px solid rgba(30,20,70,0.08)",
        borderRadius: 14,
        padding: "10px 12px",
        minWidth: 160,
      }}
    >
      <div style={{ fontWeight: 900, color: "#1a0044" }}>{title}</div>
      <div style={{ fontSize: 13, color: "#5B5B6A", marginTop: 2 }}>{desc}</div>
    </div>
  );
}

/* -------------------- Styles -------------------- */

const heroCard: React.CSSProperties = {
  background: "white",
  borderRadius: 26,
  padding: 34,
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr",
  gap: 26,
  alignItems: "center",
  boxShadow: "0 22px 60px rgba(16, 16, 30, 0.08)",
  border: "1px solid rgba(20,20,40,0.06)",
};

const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(59, 29, 134, 0.08)",
  color: "#3B1D86",
  fontWeight: 800,
  fontSize: 13,
};

const headline: React.CSSProperties = {
  margin: "14px 0 0",
  fontSize: 46,
  lineHeight: 1.08,
  color: "#1a0044",
  letterSpacing: -0.6,
  fontWeight: 900,
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
};

const subhead: React.CSSProperties = {
  margin: "14px 0 0",
  color: "#4F4F63",
  fontSize: 16,
  lineHeight: 1.6,
  maxWidth: 520,
};

const imageShell: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  borderRadius: 22,
  padding: 14,
  background: "linear-gradient(180deg, rgba(42,0,92,0.08) 0%, rgba(26,0,68,0.04) 100%)",
  border: "1px solid rgba(42,0,92,0.10)",
};
