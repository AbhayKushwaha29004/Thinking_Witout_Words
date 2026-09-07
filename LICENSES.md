# Source, License, and Asset Record

Complete record of all code, data, assets, weights, fonts, and reused components used in
**Thinking Without Words** (DataForge 2026 × Pathway Track).

---

## Project Code

| Component | Location | License | Notes |
|---|---|---|---|
| All original source code | `src/` | MIT (this project) | Written by Abhay Kushwaha |
| Toy GRU model | `src/utils/latentModel.js` | MIT (this project) | Pure JS, written from scratch — NOT official BDH/BDH-CQ |
| Scroll animation utils | `src/utils/scrollAnimation.js` | MIT (this project) | Original |
| All React section components | `src/sections/` | MIT (this project) | Original |
| All React UI components | `src/components/` | MIT (this project) | Original |
| BDH data module | `src/data/bdh_data.js` | MIT (this project) | Values sourced from published papers (see Data section) |
| Concept summary page | `concept-summary.html` | MIT (this project) | Original |
| Technical explanation page | `technical-explanation.html` | MIT (this project) | Original |

---

## npm Dependencies

| Package | Version | License | Source |
|---|---|---|---|
| react | ^19.2.8 | MIT | https://github.com/facebook/react |
| react-dom | ^19.2.8 | MIT | https://github.com/facebook/react |
| three | ^0.185.1 | MIT | https://github.com/mrdoob/three.js |
| @react-three/fiber | ^9.7.0 | MIT | https://github.com/pmndrs/react-three-fiber |
| @react-three/drei | ^10.7.8 | MIT | https://github.com/pmndrs/drei |
| framer-motion | ^13.2.0 | MIT | https://github.com/framer/motion |
| katex | ^0.18.5 | MIT | https://github.com/KaTeX/KaTeX |
| d3 | ^7.9.0 | ISC | https://github.com/d3/d3 |
| @tensorflow/tfjs | ^4.22.0 | Apache-2.0 | https://github.com/tensorflow/tfjs |
| vite | ^8.2.2 | MIT | https://github.com/vitejs/vite |
| typescript | ~6.0.2 | Apache-2.0 | https://github.com/microsoft/TypeScript |

> **Note:** @tensorflow/tfjs is listed as a dependency but is not actively used in the current
> build. The toy GRU model in `src/utils/latentModel.js` is pure JavaScript with zero external
> dependencies. TFjs was included during an earlier prototype phase.

---

## Fonts

| Font | Provider | License | URL |
|---|---|---|---|
| Space Grotesk | Google Fonts | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Space+Grotesk |
| Inter | Google Fonts | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Inter |
| JetBrains Mono | Google Fonts | SIL Open Font License 1.1 | https://fonts.google.com/specimen/JetBrains+Mono |

All fonts are loaded via Google Fonts CDN (`fonts.googleapis.com`) at runtime. No font files
are bundled in the repository.

---

## Data

All numerical data used in charts and comparisons comes from published primary sources.
No proprietary or confidential data is included.

| Data | Source | Evidence Type |
|---|---|---|
| BDH-CQ ARC-AGI-1: low effort 18.2%, $0.00007/task | Pathway BDH-CQ technical report, arXiv:2509.26507 | Developer-reported |
| BDH-CQ ARC-AGI-1: medium effort 25.0%, $0.00035/task | Pathway BDH-CQ technical report, arXiv:2509.26507 | Developer-reported |
| BDH-CQ ARC-AGI-1: high effort 29.5%, $0.00070/task | Pathway BDH-CQ technical report, arXiv:2509.26507 | Developer-reported |
| GPT-4o ARC-AGI-1: ~5%, ~$0.002/task | ARC Prize 2024 public leaderboard | Public benchmark |
| o3 low compute: ~4.2%, ~$0.0045/task | OpenAI technical report | Developer-reported |
| Claude 3.5: ~21%, ~$0.008/task | Anthropic / ARC Prize 2024 | Public benchmark |
| HRM (test-time opt.): ~62%, ~$0.15/task | HRM paper (developer-reported) | Developer-reported |
| Program synthesis: ~42.2%, ~$0.05/task | ARC Prize 2024 top public entry | Public benchmark |
| CoT token scaling curve (§03) | Illustrative — derived from published CoT benchmarks (Wei et al., 2022) | Illustrative/derived |
| Latent scaling curve (§03) | BDH-CQ low/med/high effort data points + interpolation | Developer-reported + interpolated |

**Important:** Developer-reported results have not been independently reproduced. A benchmark
result ≠ a deployment. A developer-reported result ≠ an external reproduction.

---

## Graphics and Icons

| Asset | Source | License |
|---|---|---|
| All icons used in UI | Unicode emoji (system fonts) | No license required — Unicode standard |
| SVG favicon | `public/favicon.svg` | MIT (this project, original) |
| `public/icons.svg` | `public/icons.svg` | MIT (this project, original) |
| `src/assets/hero.png` | Original asset created for this project | MIT (this project) |

No stock images, third-party illustrations, or copyrighted graphics are used.

---

## Model Weights

This project contains **no trained model weights**. The toy GRU model in `src/utils/latentModel.js`
uses deterministic pseudo-random weight initialisation from a seeded linear congruential generator:

```
s_{n+1} = (9301 * s_n + 49297) mod 233280
```

Weights are computed at runtime from the seed. There are no `.bin`, `.pt`, `.onnx`, or similar
weight files anywhere in the repository. The model is fully reproducible from the source code alone.

---

## External APIs and CDNs

| Service | Purpose | Terms |
|---|---|---|
| Google Fonts CDN | Font delivery at runtime | Google Fonts Terms of Service / OFL |
| KaTeX CDN (concept-summary.html, technical-explanation.html) | Math rendering in standalone HTML pages | MIT |
| Vercel | Deployment and hosting | Vercel Terms of Service |

---

## AI Assistance Disclosure

See `README.md` — "AI Assistance Disclosure" section for full details.

---

## Citation for This Project

If referencing this artifact:

```
Abhay Kushwaha. "Thinking Without Words: An Interactive Visual Explainer on
Latent Reasoning in AI." DataForge 2026 × Pathway Track, September 2026.
https://thinkingwithoutwords.vercel.app/
GitHub: https://github.com/AbhayKushwaha29004/Thinking_Witout_Words
```
