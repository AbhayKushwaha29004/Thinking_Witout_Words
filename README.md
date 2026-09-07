# 🧠 Thinking Without Words

**An interactive visual explainer on latent reasoning in AI — featuring BDH-CQ as a live case study.**

> *"A model can solve novel reasoning tasks by iteratively refining a hidden state rather than generating a verbal chain of thought — more latent iterations improve accuracy up to a point, but some problems resist latent reasoning entirely."*

Built for **DataForge 2026 × Pathway Track** · Aligned with **NeurIPS 2026 Education Track**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-7c3aed?style=for-the-badge)](https://your-vercel-url.vercel.app)
[![arXiv](https://img.shields.io/badge/BDH%20Paper-arXiv%3A2509.26507-06b6d4?style=for-the-badge)](https://arxiv.org/abs/2509.26507)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)

---

## 🎯 What This Teaches

Most AI reasoning models generate a chain of thought — writing every intermediate step as tokens before answering. **BDH-CQ does the opposite**: it refines a hidden state vector through multiple recurrent iterations, producing an answer with zero reasoning tokens.

This explainer makes that difference **tangible and falsifiable** through six interactive sections.

---

## 🖥️ Live Sections

| Section | What It Does |
|---|---|
| **§01 — The Problem** | Animated CoT token stream. Drag the difficulty slider and watch reasoning costs explode. |
| **§02 — Live Demo** | A real GRU toy model solves ARC-style grid puzzles. Hit **▶ Watch It Think** to see accuracy climb with each latent iteration. Click any predicted cell to inspect its full color probability distribution. |
| **§03 — Inference-Time Scaling** | Interactive scatter chart comparing token scaling vs. latent scaling on accuracy/cost. |
| **§04 — BDH-CQ Architecture** | Animated architecture diagram with data pulses travelling along edges. Click any node for details. Interactive KaTeX equations from the Dragon Hatchling paper. |
| **§05 — Pareto Frontier** | Cost-accuracy scatter plot for ARC-AGI-1. Hover any model for source details. |
| **§06 — Limitations** | Side-by-side comparison: easy puzzle (latent reasoning works) vs. symbolic puzzle (latent reasoning fails). |

---

## ⚡ Interactive Features

- **▶ Watch It Think** — auto-plays all 20 latent iterations at 220ms/step
- **Iteration timeline** — 20 clickable dots, jump to any step instantly
- **Neuron firing canvas** — live animated graph showing 8 input + 12 hidden neurons with travelling synapse pulses
- **32-neuron heatmap** — the actual hidden state vector, updated every iteration
- **Cell confidence inspector** — click any predicted grid cell to see its 8-color probability distribution
- **Accuracy curve** — animated SVG with live dot tracking current iteration
- **3D mouse-tilt cards** — every card responds to cursor with perspective transform
- **Animated architecture** — BDH-CQ diagram with data pulses animated on a canvas overlay
- **Particle background** — interactive neural network particles, hub nodes follow cursor
- **3D brain** (hero) — Three.js brain with orbiting neurons, synaptic connections, orbital rings

---

## 🏗️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| 3D rendering | Three.js + @react-three/fiber + @react-three/drei |
| Toy model | Pure JavaScript GRU (zero dependencies) |
| Visualisation | D3-style SVG + Canvas 2D API |
| Animations | CSS keyframes + Framer Motion + requestAnimationFrame |
| Math rendering | KaTeX |
| Styling | Vanilla CSS with custom properties |
| Deployment | Vercel |

---

## 🔬 The Toy Model

The interactive demo uses an **independent toy GRU model** implemented from scratch in pure JavaScript (`src/utils/latentModel.js`).

Architecture:
- Input encoding: 18-dimensional (9 grid cells × position + color)
- Hidden state: 32-dimensional GRU
- Output: 9 cells × 8 colors = 72-dimensional logit vector
- Deterministic weights (seeded random init — fully reproducible)

The accuracy improvement with iterations is real GRU recurrence, not scripted animation.

---

## 📊 BDH-CQ Data

All BDH-CQ performance numbers shown in §04 and §05 are from the **published BDH-CQ technical report** (developer-reported by Pathway).

| Effort Level | ARC-AGI-1 Accuracy | Cost per Task |
|---|---|---|
| Low | 18.2% | $0.00007 |
| Medium | 25.0% | $0.00035 |
| High | **29.5%** | $0.00070 |

**Evidence label:** Developer-reported benchmark results. Not independently reproduced at time of writing. A benchmark result ≠ a deployment. A developer-reported result ≠ an external reproduction.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── BrainCanvas3D.jsx      # Three.js 3D brain (hero)
│   ├── ParticleBackground.jsx # Interactive particle network
│   ├── KatexEquation.jsx      # LaTeX math renderer
│   ├── FloatingCard.jsx       # Mouse-tilt 3D card
│   ├── AnimatedCounter.jsx    # Scroll-triggered count-up
│   └── TypewriterText.jsx     # Typewriter effect
├── sections/
│   ├── HeroSection.jsx        # Title + 3D brain + stats
│   ├── CotCostSection.jsx     # §01 token cost demo
│   ├── LatentReasoningSection.jsx  # §02 live demo (main)
│   ├── ScalingSection.jsx     # §03 scaling chart
│   ├── BDHSection.jsx         # §04 architecture + equations
│   ├── ParetoSection.jsx      # §05 Pareto frontier
│   └── LimitationsSection.jsx # §06 failure cases
├── utils/
│   ├── latentModel.js         # Toy GRU model (pure JS)
│   └── scrollAnimation.js     # Intersection observer helpers
├── data/
│   └── bdh_data.js            # Precomputed BDH-CQ data + papers
├── App.jsx                    # Root component + nav
└── index.css                  # Design system + animations
```

---

## 🚀 Running Locally

```bash
git clone https://github.com/your-username/dataforge-thinking-without-words
cd dataforge-thinking-without-words
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for production
```bash
npm run build
npm run preview
```

---

## 📄 Primary Sources

All technical claims are grounded in primary sources:

1. **Dragon Hatchling (BDH)** — Pathway Research, arXiv:2509.26507  
   https://arxiv.org/abs/2509.26507

2. **Training LLMs to Reason in Continuous Latent Space (Coconut)** — Hao et al., 2024, arXiv:2412.06769  
   https://arxiv.org/abs/2412.06769

3. **On the Measure of Intelligence (ARC)** — Chollet, 2019, arXiv:1911.01547  
   https://arxiv.org/abs/1911.01547

4. **Using Fast Weights to Attend to the Recent Past** — Ba et al., 2016, arXiv:1610.06258  
   https://arxiv.org/abs/1610.06258

5. **Transformers are RNNs (Linear Attention)** — Katharopoulos et al., 2020, arXiv:2006.16236  
   https://arxiv.org/abs/2006.16236

---

## 🤖 AI Assistance Disclosure

AI assistance (Claude / Kiro) was used for:
- Code scaffolding and React component structure
- CSS design system and animation patterns
- Data formatting and documentation

**All components are understood and can be explained and defended by the team.** Every equation, data point, and architectural claim has been verified against primary sources.

---

## 📝 License

MIT License — see [LICENSE](LICENSE)

Fonts: Space Grotesk, Inter, JetBrains Mono (Google Fonts — OFL)  
Icons: Unicode emoji (no license required)  
Three.js: MIT  
React: MIT  

---

## 🏆 Submission Details

- **Track:** DataForge 2026 × Pathway × rime
- **Topic:** Alternatives to Chain-of-Thought Reasoning (+ Inference-Time Scaling)
- **Target audience:** CS undergraduates and data scientists familiar with basic neural networks
- **Prerequisites:** What attention is, basic neural network concepts
- **Central claim:** Falsifiable — testable directly in §02 by dragging the iteration slider
