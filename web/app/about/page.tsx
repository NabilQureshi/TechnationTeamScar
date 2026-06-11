import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<div style={{ minHeight: "100vh", background: "#F5F6FB" }}>
    		<Header />

     		<main style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 28px", minHeight: "calc(100vh - 200px)"}}>
     			<section style={heroCard}>
	     			<h1 style={headline}>
	              	 About
	              	 <br/>
	              	 Solace
	            	</h1>

	            	<p style={subhead}>
	              		Solace was created with the intention of being a warm and supportive mental wellness companion. 
	              		Our goal was to design an AI that offers gentle emotional support and practical, non-medical coping strategies. 
	              		Solace is here to help you feel heard, understood, and to provide a compassionate, friendly presence whenever you might need a little extra care.
	            	</p>
            	</section>
     		</main>

      		<Footer />
      	</div>
	)
}

function Header() {
  return (
    <header style={topBar}>
      <div style={topBarInner}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/solace-logo.png" alt="Solace" width={72} height={72} />
          <div style={{ color: "white", fontWeight: 800, fontSize: 22, letterSpacing: 0.2 }}>Solace</div>
        </Link>

        <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <NavLink href="/tryout" label="Try Out" />
          <NavLink href="/about" label="About" />
          <NavLink href="/signup" label="Sign Up" />
          <NavLink href="/login" label="Login" primary />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={footerWrap}>
      <div style={footerInner}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/solace-logo.png" alt="Solace" width={34} height={34} />
          <div style={{ color: "white", fontWeight: 800 }}>Solace</div>
        </div>

        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
          © {new Date().getFullYear()} Solace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function NavLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        padding: "10px 14px",
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 700,
        background: primary ? "white" : "rgba(255,255,255,0.12)",
        color: primary ? "#1a0044" : "white",
        border: primary ? "1px solid rgba(255,255,255,0.6)" : "1px solid rgba(255,255,255,0.18)",
        transition: "transform 120ms ease, background 120ms ease",
      }}
    >
      {label}
    </Link>
  );
}

const topBar: React.CSSProperties = {
  background: "linear-gradient(180deg, #2a005c 0%, #1a0044 100%)",
  padding: "20px 22px",
  borderBottomLeftRadius: 26,
  borderBottomRightRadius: 26,
  boxShadow: "0 18px 40px rgba(26,0,68,0.22)",
};

const topBarInner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
};

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

const footerWrap: React.CSSProperties = {
  marginTop: 30,
  background: "linear-gradient(180deg, #2a005c 0%, #1a0044 100%)",
  padding: "18px 18px",
  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,
};

const footerInner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};