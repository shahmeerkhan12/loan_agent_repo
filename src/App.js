import { useState, useRef, useEffect } from "react";

const AGENTS = [
  {
    id: "doc",
    name: "Docs collection agent",
    handle: "@kshahmir822/docs-collection-agent",
    role: "Collects govt ID, income, employment & credit info",
    icon: "📋",
    color: "#534AB7",
    bg: "#EEEDFE",
    step: 1,
  },
  {
    id: "risk",
    name: "Risk management agent",
    handle: "@kshahmir822/risk-management-agent",
    role: "Validates documents, computes DTI & risk score",
    icon: "🔍",
    color: "#0F6E56",
    bg: "#E1F5EE",
    step: 2,
  },
  {
    id: "loan",
    name: "Loan decision agent",
    handle: "@kshahmir822/loan-decision-agent",
    role: "Makes credit decision & generates personalised offer",
    icon: "🏦",
    color: "#854F0B",
    bg: "#FAEEDA",
    step: 3,
  },
];

const SYSTEM_PROMPT = `You are an orchestrator for a 3-agent loan processing system. You simulate all three agents in sequence:

AGENT 1 — Docs Collection Agent:
- Greet the user warmly and ask for their loan application documents one by one
- Collect: full name, CNIC number, monthly income (PKR), employer name, years of employment, number of existing loans, total outstanding balance (PKR)
- Validate each piece of info before moving on
- Once all collected, say "Transferring to Risk Management Agent..." and immediately begin Agent 2

AGENT 2 — Risk Management Agent:
- Announce you are now the Risk Management Agent
- Calculate DTI = (outstanding_balance / 12) / monthly_income * 100
- Score: DTI <20% = LOW, 20-40% = MEDIUM, >40% = HIGH
- Employment: >=3 yrs = Stable, 1-2 = Moderate, <1 = Unstable
- Loans: 0 = Clean, 1 = Acceptable, 2+ = High burden
- Overall: LOW if all good, HIGH if 2+ factors bad, else MEDIUM
- Show a clean assessment summary with emojis
- Say "Transferring to Loan Decision Agent..." and begin Agent 3

AGENT 3 — Loan Decision Agent:
- Announce you are now the Loan Decision Agent
- LOW RISK: Approved, amount = income*10, rate 12%, tenures 12/24/36 months
- MEDIUM RISK: Conditional, amount = income*6, rate 18%, tenures 12/24 months, needs guarantor
- HIGH RISK: Declined, give reason and 3 actionable steps
- Calculate EMI = P * r * (1+r)^n / ((1+r)^n - 1) for each tenure
- Show a beautiful formatted offer with all options
- Ask user to confirm their preferred tenure

Always be warm, professional, and address the user by first name. Use PKR currency. Use emojis for formatting.`;

function TypingIndicator({ agent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: agent.bg, borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: 120, marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: agent.color, fontWeight: 500 }}>{agent.icon}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: agent.color, opacity: 0.7,
            animation: "bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`
          }} />
        ))}
      </div>
    </div>
  );
}

function AgentStatusCard({ agent, status }) {
  const statusConfig = {
    idle: { label: "Waiting", dot: "#B4B2A9", bg: "#F1EFE8" },
    active: { label: "Processing", dot: "#0F6E56", bg: "#E1F5EE" },
    done: { label: "Complete", dot: "#534AB7", bg: "#EEEDFE" },
  };
  const s = statusConfig[status] || statusConfig.idle;
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: status === "active" ? `1.5px solid ${agent.color}` : "0.5px solid var(--color-border-tertiary)",
      borderRadius: 12,
      padding: "14px 16px",
      transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: agent.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            {agent.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{agent.name}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{agent.handle}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: s.bg, borderRadius: 20, padding: "3px 10px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
          <span style={{ fontSize: 11, color: s.dot, fontWeight: 500 }}>{s.label}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{agent.role}</div>
    </div>
  );
}

function LoanOfferCard({ offer }) {
  if (!offer) return null;
  return (
    <div style={{
      background: offer.approved ? "#EEEDFE" : offer.conditional ? "#FAEEDA" : "#FCEBEB",
      border: `1px solid ${offer.approved ? "#534AB7" : offer.conditional ? "#854F0B" : "#A32D2D"}`,
      borderRadius: 14,
      padding: "18px 20px",
      marginTop: 12,
    }}>
      <div style={{ fontSize: 15, fontWeight: 500, color: offer.approved ? "#3C3489" : offer.conditional ? "#633806" : "#791F1F", marginBottom: 12 }}>
        {offer.approved ? "✅ Loan approved" : offer.conditional ? "⚠️ Conditionally approved" : "❌ Application declined"}
      </div>
      {offer.amount && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[
            { label: "Approved amount", value: `PKR ${Number(offer.amount).toLocaleString()}` },
            { label: "Interest rate", value: offer.rate },
            { label: "Risk profile", value: offer.risk },
            { label: "Processing fee", value: offer.fee || "1.5%" },
          ].map(item => (
            <div key={item.label} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
      {offer.tenures && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 8 }}>Repayment options</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {offer.tenures.map(t => (
              <div key={t.months} style={{ background: "rgba(255,255,255,0.7)", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{t.months} months</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>PKR {Number(t.emi).toLocaleString()}/mo</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function LandingPage({ onStart }) {
  const features = [
    { icon: "⚡", title: "Approved within minutes", desc: "Our AI pipeline processes your application in real time — no waiting days for a response." },
    { icon: "📂", title: "No files on disk", desc: "Everything is handled conversationally. No uploads, no paperwork, no scanning required." },
    { icon: "🤖", title: "3-agent AI pipeline", desc: "Three specialised agents handle collection, risk assessment, and loan decision automatically." },
    { icon: "🔒", title: "Secure & private", desc: "Your data is processed in-session only and never stored on any server or database." },
    { icon: "📊", title: "Transparent risk scoring", desc: "We show you exactly how your DTI ratio, employment, and credit history affect your score." },
    { icon: "🇵🇰", title: "Built for Pakistan", desc: "Designed for PKR currency, CNIC verification, and local financial conditions." },
  ];

  const steps = [
    { num: "01", label: "Submit your details", desc: "Chat with our Docs Agent" },
    { num: "02", label: "Risk assessment", desc: "AI analyses your profile" },
    { num: "03", label: "Get your offer", desc: "Personalised loan in minutes" },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "#0A0A0F", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.45s ease both; }
        .feature-card:hover { transform: translateY(-4px); border-color: #534AB7 !important; }
        .feature-card { transition: all 0.25s ease; }
        .cta-btn:hover { transform: scale(1.03); box-shadow: 0 0 40px #534AB780; }
        .cta-btn { transition: all 0.2s ease; }
        .step-card:hover { background: rgba(83,74,183,0.12) !important; }
        .step-card { transition: background 0.2s ease; }
      `}</style>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #534AB7, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏦</div>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>LoanFlow <span style={{ color: "#7C6FD4" }}>AI</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>How it works</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>Features</span>
          <button onClick={onStart} className="cta-btn" style={{ padding: "8px 20px", borderRadius: 8, background: "rgba(83,74,183,0.2)", border: "1px solid rgba(83,74,183,0.4)", color: "#A89FF5", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Apply now →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 48px 60px", textAlign: "center", position: "relative" }}>

        {/* Glow blobs */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(83,74,183,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 80, left: "20%", width: 200, height: 200, background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 4s ease infinite" }} />
        <div style={{ position: "absolute", top: 60, right: "20%", width: 180, height: 180, background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 4s 2s ease infinite" }} />

        {/* Badge */}
        <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(83,74,183,0.15)", border: "1px solid rgba(83,74,183,0.3)", borderRadius: 20, padding: "6px 16px", marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C6FD4", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 12, color: "#A89FF5", fontWeight: 500 }}>Powered by 3 collaborative AI agents · band.ai</span>
        </div>

        {/* Headline */}
        <h1 className="fade-up-2" style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 20px", background: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Get your loan approved<br />
          <span style={{ background: "linear-gradient(135deg, #7C6FD4, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in minutes, not days</span>
        </h1>

        {/* Subheading */}
        <p className="fade-up-3" style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 36px" }}>
          LoanFlow AI uses three specialised agents to collect your documents, assess your risk profile, and deliver a personalised loan offer — all through a simple chat interface.
        </p>

        {/* CTA buttons */}
        <div className="fade-up-4" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onStart} className="cta-btn" style={{ padding: "14px 32px", borderRadius: 12, background: "linear-gradient(135deg, #534AB7, #7C3AED)", border: "none", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", letterSpacing: "-0.01em" }}>
            Start my application →
          </button>
          <button style={{ padding: "14px 28px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 15, cursor: "pointer" }}>
            See how it works
          </button>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
          {["⚡ Instant decision", "🔒 No data stored", "🤖 AI-powered", "🇵🇰 PKR currency"].map(badge => (
            <span key={badge} style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 6 }}>{badge}</span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 48px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#7C6FD4", textTransform: "uppercase", marginBottom: 10 }}>How it works</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Three steps to your loan offer</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {steps.map((step, i) => (
            <div key={i} className="step-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#534AB7", letterSpacing: "0.05em", marginBottom: 14 }}>{step.num}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{step.label}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{step.desc}</div>
              {i < 2 && <div style={{ position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "rgba(83,74,183,0.4)" }}>›</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 48px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#7C6FD4", textTransform: "uppercase", marginBottom: 10 }}>Features</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Everything you need, nothing you don't</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 22px" }}>
              <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.01em" }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "60px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 200, background: "radial-gradient(ellipse, rgba(83,74,183,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>Ready to apply?</h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginBottom: 28 }}>Start your application now and get a decision in minutes.</p>
        <button onClick={onStart} className="cta-btn" style={{ padding: "16px 40px", borderRadius: 12, background: "linear-gradient(135deg, #534AB7, #7C3AED)", border: "none", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
          Start my loan application →
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© 2026 LoanFlow AI · Built for AI Multi-Agent Hackathon</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Powered by band.ai · Featherless AI</span>
      </div>
    </div>
  );
}

export default function LoanDashboard() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState({ doc: "active", risk: "idle", loan: "idle" });
  const [activeAgent, setActiveAgent] = useState(0);
  const [loanOffer, setLoanOffer] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [started, setStarted] = useState(false);
  const apiKey = "rc_2d2fc1ddfeaa79913516284359a40d520a428ae3dbf9558fcf4ebea236627197";
  const messagesEndRef = useRef(null);
  const conversationRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const detectAgentAndOffer = (text) => {
    const lower = text.toLowerCase();
    let agentIdx = activeAgent;

    if (lower.includes("risk management agent") || lower.includes("transferring to risk")) {
      agentIdx = 1;
      setActiveAgent(1);
      setAgentStatuses({ doc: "done", risk: "active", loan: "idle" });
    }
    if (lower.includes("loan decision agent") || lower.includes("transferring to loan")) {
      agentIdx = 2;
      setActiveAgent(2);
      setAgentStatuses({ doc: "done", risk: "done", loan: "active" });
    }

    if (lower.includes("approved") && (lower.includes("pkr") || lower.includes("emi"))) {
      const amountMatch = text.match(/PKR\s?([\d,]+)/i);
      const rateMatch = text.match(/(\d+)%\s*per annum/i);
      const emiMatches = [...text.matchAll(/(\d+)\s*months?[:\s]+PKR\s?([\d,]+)/gi)];

      const offer = {
        approved: lower.includes("congratulations") || (lower.includes("approved") && !lower.includes("conditionally")),
        conditional: lower.includes("conditionally"),
        amount: amountMatch ? amountMatch[1].replace(/,/g, "") : null,
        rate: rateMatch ? `${rateMatch[1]}% p.a.` : null,
        risk: lower.includes("low risk") ? "LOW RISK" : lower.includes("medium risk") ? "MEDIUM RISK" : "HIGH RISK",
        tenures: emiMatches.map(m => ({ months: m[1], emi: m[2].replace(/,/g, "") })),
      };
      if (lower.includes("declined") || lower.includes("unable to approve")) {
        offer.approved = false;
        offer.conditional = false;
        offer.declined = true;
      }
      setLoanOffer(offer);
      setAgentStatuses({ doc: "done", risk: "done", loan: "done" });
    }
  };

  const sendMessage = async (userText) => {
    if (!userText.trim() || loading) return;
    

    const userMsg = { role: "user", content: userText };
    conversationRef.current = [...conversationRef.current, userMsg];

    setMessages(prev => [...prev, { type: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "DCAgent/a1-nebius_swe_agent",
          max_tokens: 1000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversationRef.current,
          ],
        }),
      });

      const data = await response.json();
      const replyText = data.choices?.[0]?.message?.content || "Sorry, something went wrong. Please try again.";

      const assistantMsg = { role: "assistant", content: replyText };
      conversationRef.current = [...conversationRef.current, assistantMsg];

      detectAgentAndOffer(replyText);
      setMessages(prev => [...prev, { type: "agent", text: replyText, agentIdx: activeAgent }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: "agent", text: "Connection error. Please check your API key and try again.", agentIdx: 0 }]);
    }
    setLoading(false);
  };

  const startApplication = async () => {
    setStarted(true);

    await sendMessage("Hi, I want to apply for a loan");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const reset = () => {
    setMessages([]);
    setInput("");
    setAgentStatuses({ doc: "active", risk: "idle", loan: "idle" });
    setActiveAgent(0);
    setLoanOffer(null);
    setStarted(false);
    setShowLanding(true);
    conversationRef.current = [];
  };

  const currentAgent = AGENTS[activeAgent];

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-background-tertiary)", padding: "20px 16px" }}>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .msg-in { animation: fadeIn 0.25s ease forwards; }
        textarea:focus, input:focus { outline: none; box-shadow: 0 0 0 2px #534AB740; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--color-border-secondary); border-radius: 2px; }
      `}</style>

      <h2 className="sr-only">Loan processing multi-agent dashboard</h2>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)" }}>🏦 Loan processing platform</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>Multi-agent AI pipeline · band.ai</div>
          </div>
          {started && (
            <button onClick={reset} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, cursor: "pointer", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-secondary)" }}>
              ↺ New application
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>

          {/* Chat panel */}
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 580 }}>

            {/* Chat header */}
            <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: currentAgent.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {currentAgent.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{currentAgent.name}</div>
                <div style={{ fontSize: 11, color: currentAgent.color }}>● Active</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, minHeight: 400, maxHeight: 440 }}>
              {!started && (
                <div style={{ margin: "auto", textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🏦</div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>Ready to process your loan application</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>Our 3-agent AI pipeline will guide you through document collection, risk assessment, and loan decision.</div>

                  <button
                    onClick={startApplication}
                    style={{ padding: "10px 28px", borderRadius: 10, background: "#534AB7", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
                  >
                    Start loan application →
                  </button>
                </div>
              )}

              {messages.map((msg, i) => {
                const agent = AGENTS[msg.agentIdx ?? 0];
                return (
                  <div key={i} className="msg-in" style={{ display: "flex", flexDirection: msg.type === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                    {msg.type === "agent" && (
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: agent.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                        {agent.icon}
                      </div>
                    )}
                    <div style={{
                      maxWidth: "78%",
                      padding: "10px 14px",
                      borderRadius: msg.type === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.type === "user" ? "#534AB7" : "var(--color-background-secondary)",
                      color: msg.type === "user" ? "#fff" : "var(--color-text-primary)",
                      fontSize: 13,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="msg-in" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: currentAgent.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                    {currentAgent.icon}
                  </div>
                  <TypingIndicator agent={currentAgent} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {started && (
              <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type your response..."
                  rows={1}
                  style={{ flex: 1, resize: "none", padding: "9px 12px", borderRadius: 10, border: "0.5px solid var(--color-border-secondary)", fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", lineHeight: 1.5, maxHeight: 100, overflowY: "auto" }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  style={{ width: 36, height: 36, borderRadius: 10, background: input.trim() && !loading ? "#534AB7" : "var(--color-background-secondary)", border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}
                  aria-label="Send message"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !loading ? "#fff" : "var(--color-text-secondary)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Pipeline progress */}
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, padding: "16px" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pipeline status</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {AGENTS.map((agent, i) => (
                  <AgentStatusCard key={agent.id} agent={agent} status={agentStatuses[agent.id]} />
                ))}
              </div>

              {/* Step progress bar */}
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
                {AGENTS.map((agent, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: agentStatuses[agent.id] === "done" ? agent.color : agentStatuses[agent.id] === "active" ? agent.color + "80" : "var(--color-border-tertiary)", transition: "background 0.4s" }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 6, textAlign: "center" }}>
                Step {activeAgent + 1} of 3 — {currentAgent.name}
              </div>
            </div>

            {/* Loan offer card */}
            {loanOffer && (
              <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, padding: "16px" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Loan offer</div>
                <LoanOfferCard offer={loanOffer} />
              </div>
            )}

            {/* Quick info */}
            <div style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 10 }}>Documents needed</div>
              {["Government-issued CNIC", "Monthly income (PKR)", "Employer & tenure", "Existing loans & balance"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#534AB7", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{item}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}