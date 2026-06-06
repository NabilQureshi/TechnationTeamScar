'use client';

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'calendar'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there. I'm Solace. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(userMessage.content),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  // Simple response generator (replace with your AI API)
  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('sad') || lowerInput.includes('down')) {
      return "I hear that you're feeling down. That's completely okay. Remember that feelings come and go like clouds in the sky. Would you like to try a quick breathing exercise together?";
    }
    if (lowerInput.includes('anxious') || lowerInput.includes('stressed')) {
      return "Anxiety can feel overwhelming. Let's ground ourselves for a moment. Can you name three things you can see around you right now?";
    }
    if (lowerInput.includes('happy') || lowerInput.includes('good')) {
      return "I'm glad to hear you're feeling good! What's one small thing that contributed to that today?";
    }
    if (lowerInput.includes('thank')) {
      return "You're very welcome. Remember, I'm always here when you need someone to talk to.";
    }
    return "Thank you for sharing that with me. Could you tell me a bit more about how that makes you feel?";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Calendar view component
  const CalendarView = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a0044', margin: 0 }}>
          Your Calendar
        </h2>
        <p style={{ color: '#4F4F63', fontSize: 14, marginTop: 6 }}>
          Track your mood and activities over time
        </p>
      </div>

      {/* Month header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button style={calendarNavButton}>←</button>
        <span style={{ fontWeight: 700, color: '#1a0044' }}>
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button style={calendarNavButton}>→</button>
      </div>

      {/* Week days */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 6,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 600,
        color: '#8B8B9A',
        marginBottom: 8,
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 6,
      }}>
        {Array.from({ length: 35 }).map((_, i) => {
          const date = i - 2;
          const isToday = date === new Date().getDate();
          return (
            <button
              key={i}
              style={{
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                background: isToday ? '#3B1D86' : 'transparent',
                color: date > 0 && date <= 31 ? (isToday ? 'white' : '#1a0044') : '#C5C5D0',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isToday && date > 0 && date <= 31) {
                  e.currentTarget.style.background = '#F0EEF8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isToday) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {date > 0 && date <= 31 ? date : ''}
            </button>
          );
        })}
      </div>

      {/* Mood summary */}
      <div style={{
        marginTop: 28,
        padding: '18px 20px',
        background: '#FAFAFF',
        borderRadius: 20,
        border: '1px solid rgba(59, 29, 134, 0.10)',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a0044', margin: '0 0 12px 0' }}>
          Recent moods
        </h3>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { mood: '😊', day: 'Mon' },
            { mood: '😐', day: 'Tue' },
            { mood: '😔', day: 'Wed' },
            { mood: '😊', day: 'Thu' },
            { mood: '😌', day: 'Fri' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 28 }}>{item.mood}</div>
              <div style={{ fontSize: 10, color: '#8B8B9A', marginTop: 4 }}>{item.day}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F5F6FB" }}>
      <Header />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 28px" }}>
        <div style={chatCard}>
          {/* Toggle */}
          <div style={toggleContainer}>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                ...toggleButton,
                background: activeTab === 'chat' ? 'linear-gradient(180deg, #3B1D86 0%, #2A005C 100%)' : 'transparent',
                color: activeTab === 'chat' ? 'white' : '#4F4F63',
                boxShadow: activeTab === 'chat' ? '0 6px 14px rgba(42,0,92,0.22)' : 'none',
              }}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              style={{
                ...toggleButton,
                background: activeTab === 'calendar' ? 'linear-gradient(180deg, #3B1D86 0%, #2A005C 100%)' : 'transparent',
                color: activeTab === 'calendar' ? 'white' : '#4F4F63',
                boxShadow: activeTab === 'calendar' ? '0 6px 14px rgba(42,0,92,0.22)' : 'none',
              }}
            >
              Calendar
            </button>
          </div>

          {/* Content */}
          <div style={chatContentArea}>
            {activeTab === 'chat' ? (
              <>
                {/* Messages container */}
                <div style={messagesContainer}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '75%',
                          padding: '10px 16px',
                          borderRadius: 20,
                          fontSize: 14,
                          lineHeight: 1.5,
                          background: message.role === 'user'
                            ? 'linear-gradient(135deg, #3B1D86 0%, #2A005C 100%)'
                            : 'white',
                          color: message.role === 'user' ? 'white' : '#1a0044',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          border: message.role === 'assistant' ? '1px solid rgba(59, 29, 134, 0.12)' : 'none',
                        }}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                      <div style={{
                        background: 'white',
                        padding: '10px 16px',
                        borderRadius: 20,
                        border: '1px solid rgba(59, 29, 134, 0.12)',
                      }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <span style={dotAnimation}>.</span>
                          <span style={{ ...dotAnimation, animationDelay: '0.2s' }}>.</span>
                          <span style={{ ...dotAnimation, animationDelay: '0.4s' }}>.</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div style={inputArea}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      style={{
                        flex: 1,
                        resize: 'none',
                        borderRadius: 20,
                        border: '1px solid rgba(59, 29, 134, 0.16)',
                        padding: '12px 18px',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: 'white',
                        maxHeight: '120px',
                        color: '#1a0044'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3B1D86';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 29, 134, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 29, 134, 0.16)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      style={{
                        background: 'linear-gradient(180deg, #3B1D86 0%, #2A005C 100%)',
                        border: 'none',
                        borderRadius: 20,
                        padding: '0 20px',
                        cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                        opacity: !input.trim() || isLoading ? 0.5 : 1,
                        transition: 'transform 0.1s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="white"
                        style={{ width: 20, height: 20 }}
                      >
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                      </svg>
                    </button>
                  </div>
                  <p style={{
                    marginTop: 12,
                    textAlign: 'center',
                    fontSize: 11,
                    color: '#8B8B9A',
                  }}>
                    Solace is not a medical service. If you need urgent help, contact local emergency services.
                  </p>
                </div>
              </>
            ) : (
              <CalendarView />
            )}
          </div>
        </div>

        <section style={{ marginTop: 24, textAlign: "center" }}>
          <div style={{ color: "#4F4F63", fontSize: 16 }}>
            Ready to continue?
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <PrimaryButton label="Log in" />
            </Link>
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <SecondaryButton label="Sign up" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* -------------------- Header / Footer (same as original) -------------------- */

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

/* -------------------- UI Bits (same as original) -------------------- */

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

/* -------------------- New Chat Card Styles -------------------- */

const chatCard: React.CSSProperties = {
  background: "white",
  borderRadius: 26,
  boxShadow: "0 22px 60px rgba(16, 16, 30, 0.08)",
  border: "1px solid rgba(20,20,40,0.06)",
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const toggleContainer: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  padding: '20px 24px 0 24px',
  borderBottom: '1px solid rgba(59, 29, 134, 0.08)',
};

const toggleButton: React.CSSProperties = {
  flex: 1,
  padding: '10px 16px',
  borderRadius: 40,
  fontSize: 15,
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
};

const chatContentArea: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '540px',
};

const messagesContainer: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
};

const inputArea: React.CSSProperties = {
  padding: '16px 24px 20px',
  borderTop: '1px solid rgba(59, 29, 134, 0.08)',
  background: '#FAFAFF',
};

const dotAnimation: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 20,
  lineHeight: 1,
  animation: 'bounce 1.4s infinite ease-in-out both',
};

/* Add keyframes for bounce animation */
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1.2); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

/* -------------------- Style Objects (same as original) -------------------- */

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

const calendarNavButton: React.CSSProperties = {
  background: '#F0EEF8',
  border: 'none',
  borderRadius: 30,
  padding: '8px 16px',
  fontSize: 14,
  fontWeight: 600,
  color: '#3B1D86',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};