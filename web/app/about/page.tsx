// web/app/about/page.tsx
export default function AboutPage() {
    return (
      <main style={pageMain}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 28px" }}>
          <section style={card}>
            <div style={badge}>About Solace</div>
            <h1 style={title}>About</h1>
  
            <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
              <p style={text}>
                Solace is a supportive AI therapist designed to help you talk things through in a calm,
                private space. It listens without judgment, asks thoughtful questions, and suggests
                strategies tailored to what you’re going through whether it’s stress, anxiety, burnout,
                or day-to-day challenges.
              </p>
  
              <p style={text}>
                Alongside conversation support, Solace helps you make life feel more manageable by
                organizing your week. It can break down what you have coming up, map out a realistic
                schedule, and build in time for rest, routines, and recovery so your plan supports your
                mental health instead of adding pressure.
              </p>
  
              <div style={noteBox}>
                <span style={{ fontStyle: "italic", fontWeight: 900 }}>Note:</span>{" "}
                Solace isn’t a licensed professional and isn’t a substitute for therapy. If you’re in
                immediate danger or need urgent help, contact local emergency services or a crisis
                support line.
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }
  
  /** This is the key fix */
  const pageMain: React.CSSProperties = {
    flex: 1, // lets layout push footer to bottom
    background: "#F5F6FB",
  };
  
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
  
  const text: React.CSSProperties = {
    margin: 0,
    color: "#4F4F63",
    fontSize: 15,
    lineHeight: 1.75,
    maxWidth: 900,
  };
  
  const noteBox: React.CSSProperties = {
    marginTop: 6,
    borderRadius: 18,
    padding: "14px 14px",
    border: "1px solid rgba(42,0,92,0.14)",
    background: "linear-gradient(180deg, rgba(42,0,92,0.06) 0%, rgba(26,0,68,0.03) 100%)",
    color: "#3B3B4A",
    lineHeight: 1.65,
  };
  