<div align="center">

# 🏦 LoanFlow AI
### Multi-Agent Loan Processing Platform

**Built for AI Multi-Agent Hackathon · Powered by band.ai · Featherless AI**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-6C47FF?style=for-the-badge&logo=react)](https://4hqf4m.csb.app)
[![band.ai](https://img.shields.io/badge/Agents-band.ai-00A878?style=for-the-badge)](https://app.band.ai)
[![Featherless AI](https://img.shields.io/badge/Model-Featherless%20AI-FF6B35?style=for-the-badge)](https://featherless.ai)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

> An intelligent 3-agent AI pipeline that automates the complete loan application process —
> from document collection to risk assessment to final loan offer generation.

![Dashboard Preview](https://placehold.co/900x480/534AB7/ffffff?text=LoanFlow+AI+Dashboard&font=montserrat)

</div>

---

## 🌐 Live Demo

| Resource | Link |
|---|---|
| 🚀 Live Dashboard | **https://loan-agent-repo-henna.vercel.app/** |
| 🤖 Docs Collection Agent | https://app.band.ai/agents/@kshahmir822/docs-collection-agent |
| 🔍 Risk Management Agent | https://app.band.ai/agents/@kshahmir822/risk-management-agent |
| 🏦 Loan Decision Agent | https://app.band.ai/agents/@kshahmir822/loan-decision-agent |

> **To test the live dashboard:** Visit the link above, enter your Featherless AI API key, and click **"Start loan application"**

---

## 📌 Overview

**LoanFlow AI** is a collaborative multi-agent system that processes loan applications end-to-end using three specialised AI agents working in sequence. Each agent has a single responsibility and hands off a structured data payload to the next — simulating a real-world loan processing pipeline.

Built on **band.ai** for agent orchestration and **Featherless AI** for model inference, the system demonstrates how multiple AI agents can collaborate on a complex financial workflow without human intervention.

---

## 🤖 The Three Agents

### Agent 1 — 📋 Docs Collection Agent
`@kshahmir822/docs-collection-agent`

The user's first touchpoint. Greets applicants warmly and collects all required documents conversationally, one step at a time.

**Collects:**
- Government-issued CNIC
- Monthly income (PKR)
- Employer name & years of employment
- Number of existing loans & outstanding balance

**Handoff:** Packages all data into a structured JSON payload and forwards it to the Risk Management Agent via `send_direct_message_service`.

---

### Agent 2 — 🔍 Risk Management Agent
`@kshahmir822/risk-management-agent`

The analytical core. Validates the submitted documents and computes a risk profile using three financial indicators.

**Computes:**
| Metric | Formula | Risk Bands |
|---|---|---|
| Debt-to-Income (DTI) | `(balance/12) / income × 100` | <20% Low · 20-40% Medium · >40% High |
| Employment Stability | Years employed | ≥3 Stable · 1-2 Moderate · <1 Unstable |
| Loan Burden | Existing loans count | 0 Clean · 1 Acceptable · 2+ High |

**Handoff:** Sends enriched risk profile with overall risk band (LOW / MEDIUM / HIGH) to the Loan Decision Agent.

---

### Agent 3 — 🏦 Loan Decision Agent
`@kshahmir822/loan-decision-agent`

The final step. Makes a credit decision based on the risk profile and generates a personalised loan offer.

**Decision logic:**
| Risk Profile | Decision | Amount | Rate | Tenures |
|---|---|---|---|---|
| LOW RISK | ✅ Approved | Income × 10 | 12% p.a. | 12 / 24 / 36 months |
| MEDIUM RISK | ⚠️ Conditional | Income × 6 | 18% p.a. | 12 / 24 months |
| HIGH RISK | ❌ Declined | — | — | Actionable next steps |

**EMI Formula:** `P × r × (1+r)^n / ((1+r)^n - 1)`

---

## 🔄 System Architecture

```
User
 │
 ▼
┌─────────────────────────────────┐
│   Agent 1: Docs Collection      │  ← Conversational intake
│   @kshahmir822/docs-collection  │
└──────────────┬──────────────────┘
               │ JSON payload via
               │ send_direct_message_service
               ▼
┌─────────────────────────────────┐
│   Agent 2: Risk Management      │  ← DTI · Employment · Loan burden
│   @kshahmir822/risk-management  │
└──────────────┬──────────────────┘
               │ Enriched risk profile
               │ send_direct_message_service
               ▼
┌─────────────────────────────────┐
│   Agent 3: Loan Decision        │  ← Approve · Conditional · Decline
│   @kshahmir822/loan-decision    │
└─────────────────────────────────┘
               │
               ▼
    Personalised loan offer
    presented to user
```

---

## 🖥️ Dashboard Features

- **Live chat interface** — conversational UI to interact with all three agents
- **Agent status panel** — real-time pipeline tracker (Waiting → Processing → Complete)
- **Loan offer card** — auto-populates with approved amount, rate, and EMI options
- **Progress bar** — visual step indicator across the 3-agent pipeline
- **3 decision outcomes** — Approved / Conditional / Declined with full details
- **New application** — reset and start fresh anytime

---

## 🧪 Test the Platform

Use these three profiles to test all possible outcomes:

### ✅ Profile 1 — Low Risk (Approved)
```
Name:               Ahmed Raza
CNIC:               35202-1234567-8
Monthly Income:     PKR 85,000
Employer:           Systems Limited
Years Employed:     4
Existing Loans:     1
Outstanding:        PKR 150,000
Expected outcome:   APPROVED · PKR 850,000 at 12% p.a.
```

### ⚠️ Profile 2 — Medium Risk (Conditional)
```
Name:               Sara Khan
CNIC:               35202-9876543-2
Monthly Income:     PKR 60,000
Employer:           Freelance
Years Employed:     2
Existing Loans:     1
Outstanding:        PKR 180,000
Expected outcome:   CONDITIONAL · PKR 360,000 at 18% p.a.
```

### ❌ Profile 3 — High Risk (Declined)
```
Name:               Bilal Hussain
CNIC:               35202-1111111-3
Monthly Income:     PKR 45,000
Employer:           Small shop
Years Employed:     0.5
Existing Loans:     3
Outstanding:        PKR 400,000
Expected outcome:   DECLINED · Reason + 3 next steps
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Agent platform | [band.ai](https://app.band.ai) |
| Model inference | [Featherless AI](https://featherless.ai) |
| Model | `DCAgent/a1-nebius_swe_agent` |
| Frontend | React (CodeSandbox) |
| Agent communication | `send_direct_message_service` |
| Data format | JSON payload handoff |

---

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/kshahmir822/loanflow-ai.git
cd loanflow-ai

# Install dependencies
npm install

# Start the app
npm start
```

Then open `http://localhost:3000` and enter your Featherless AI API key to begin.

---

## 📁 Project Structure

```
loanflow-ai/
├── src/
│   └── App.js              # Main dashboard component
├── public/
│   └── index.html
├── package.json
└── README.md
```

---

## 👥 Team

Built by **Shahmir Khan** (`@kshahmir822`) and team for the AI Multi-Agent Hackathon.

| Member | Role |
|---|---|
| Shahmir Khan | Agent architecture · Backend · band.ai setup |
| Alishba Iftikhar | Testing · QA · User experience |

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for the AI Multi-Agent Hackathon**

[🚀 Try Live Demo](https://4hqf4m.csb.app) · [🤖 View Agents on band.ai](https://app.band.ai/agents/@kshahmir822/docs-collection-agent)

</div>
