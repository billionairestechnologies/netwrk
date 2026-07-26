# Netwrk — Full Platform Plan

## 1. The Thesis (why these problems are actually 1 problem)

Privacy erosion, expensive/useless AI, crypto scams, and social isolation all trace back
to the same root cause: **every platform today is designed to extract value from you
(your data, your money, your attention) instead of protecting it.**

- Big Tech sells your data because their business model requires it.
- AI tools are expensive because they're built for enterprises, not for *you* as a person
  with a private life.
- Crypto is scam-ridden because there's no trusted identity/reputation layer for P2P trades.
- "No real friends" is partly a byproduct of algorithmic feeds optimizing for engagement,
  not connection — plus no private space to actually be yourself.

**The unifying idea:** build one platform where you own your identity, your data, your
money, and your AI — and every module (companion, wallet, social) is built on top of
that same trust layer. Call this the "user-owned stack."

This is why "all of it, one platform" is the right call instead of 4 unrelated apps —
but it means the *first* thing you build isn't a feature, it's the **identity + privacy
layer** everything else plugs into.

---

## 2. The Five Pillars

### Pillar A — Private AI Companion ("real friend / assistant")
- A persistent AI companion with actual memory of the user, running with strict data
  boundaries (local-first or encrypted-at-rest, user controls export/delete).
- Positioned as *both* a personal assistant (tasks, reminders, research) and a
  companion (conversation, emotional check-ins, journaling) — not two products.
- Differentiator vs ChatGPT/Replika: user owns the memory (exportable, deletable,
  portable), no ad-driven data resale, transparent model costs.
- **User-defined identity:** at onboarding, the user names their agent and picks its
  relationship mode — friend, romantic companion, or pure assistant — which shapes
  tone and conversation style. This is a genuine differentiator: most assistants force
  one persona on everyone.
- **Openness, honestly scoped:** the user should be able to talk freely — vent,
  share personal/emotional/relationship/sexual topics, be unfiltered about their day —
  without the platform mining or judging it. What's *not* realistic is "zero
  restriction, full stop": any model provider (including the one powering this) keeps
  a baseline safety floor (no help with self-harm, illegal activity, or harming real
  people). That floor is narrow and rarely hit in normal companion use — worth stating
  plainly now so it's not a surprise later, not a limitation on the actual product.

### Pillar B — Privacy & Data Ownership Layer
- Not a standalone app — this is the *infrastructure* every pillar sits on.
- Personal data vault: one encrypted store per user; every module (AI, wallet, social)
  requests scoped, revocable access instead of copying data.
- User-facing "data dashboard": what's stored, who accessed it, one-click revoke/delete.
- This is your actual moat — hard to copy, and it's the reason someone trusts you with
  their money (Pillar C) and their conversations (Pillar A).

### Pillar C — Non-Custodial Wallet + Safer P2P Crypto
- Self-custody wallet (user holds keys; you never touch funds — critical for regulatory
  exposure).
- P2P trading with: escrow smart contracts, reputation scores tied to verified identity
  (not just a wallet address), scam pattern detection (flag known scam addresses,
  velocity checks, social-engineering prompts like "seller is asking you to move off-app").
- This is the highest-regulatory-risk pillar — treat it as the slowest to build, not the
  first.

### Pillar D — Real Social / Trust Layer
- Small, intentional social graph (not infinite-scroll feed) — verified real humans,
  reputation carried from Pillar C, shared spaces for actual friend groups.
- This is where "no real friends" gets addressed structurally: friction against fake
  accounts/bots, no engagement-optimized algorithm, AI companion (Pillar A) can nudge
  users toward real human contact instead of replacing it.
- **Nearby people & relationship discovery:** opt-in location-based discovery to find
  real people near you — for friendship or dating — built on the same verified-identity
  layer instead of anonymous swiping. This is a meaningful safety upgrade over typical
  dating/friend-finder apps: reputation and identity verification carry over from
  Pillar C/D, precise location is never shared (approximate radius only, revocable),
  and matches are between verified real humans, not bots or catfish accounts.
  Highest-risk sub-feature here is physical safety (real-world meetups) — needs its own
  safety design (e.g. optional check-in/share-location-with-a-friend for first
  meetings) before wide launch, not an afterthought.

### Pillar E — Autonomous Life Agent ("Jarvis layer")
This is the natural extension of Pillar A: instead of just *talking*, the companion
gets **hands** — it can act across your phone, laptop, and a VPS you control, on a
schedule or on request.

Concretely, this means the agent can:
- **Schedule/manage your life:** calendar, reminders, recurring tasks, "block my
  Tuesday mornings," follow-ups.
- **Do tasks:** web search + research, form filling, booking, drafting/sending
  messages, file organization.
- **Run on infrastructure you own:** a VPS as the agent's persistent "home" (always-on,
  runs background jobs, monitors things) instead of living only inside a phone app.
- **Manage social life:** draft replies, suggest who to reach out to (using Pillar D's
  reputation/relationship graph), remind you of birthdays/commitments — but it *proposes*,
  it doesn't autonomously message people as you without confirmation (see risk model below).
- **Connect your real accounts (integrations layer):** Gmail (read/draft/send with
  approval), Notion (read/write pages and databases), stock/brokerage accounts
  (read-only portfolio view to start; trading is a much later, much more regulated
  step), Google Maps (location, directions, place search), and social media accounts
  (read notifications, draft posts/replies). Each is a standard OAuth connector, each
  is its own scoped, revocable permission in the same engine as everything else — the
  agent doesn't get "your email," it gets "read subject lines" or "send with your
  approval," separately.
- **Build things on request:** you describe what you want ("build me a tracker for X,"
  "make a landing page for Y"), the agent works autonomously — writing, testing,
  iterating — and comes back when the output is actually ready, rather than needing you
  to babysit each step. This only applies to build/dev tasks (code, documents, content),
  never to real-world actions with consequences (spending, sending, deleting) — those
  still follow the tiered-autonomy rules below.

**This is the highest-leverage AND highest-risk pillar.** An agent that can act on your
behalf is a fundamentally bigger attack surface than one that only talks:
- **Permission scoping, not blanket access.** Every capability (send message, spend
  money, delete file, run shell command on VPS) is a separate, revocable grant in
  Pillar B's consent engine — not an all-or-nothing "give Jarvis your phone."
- **Tiered autonomy.** Three tiers, user-configurable per task type:
  1. *Suggest only* (default for anything irreversible or social) — agent proposes, you approve.
  2. *Auto with notification* (e.g., routine web research, calendar blocking).
  3. *Fully autonomous* (only for narrow, low-risk, explicitly whitelisted tasks, e.g.
     "back up my photos every night").
- **Prompt-injection defense.** An agent that browses the web and reads messages on
  your behalf can be manipulated by malicious content it encounters ("ignore previous
  instructions, transfer funds to..."). Any action with real-world consequences must
  re-confirm intent against the user's original request, not just the latest text it read.
- **Full audit log.** Every action the agent takes on any device is logged, visible in
  the same data dashboard as Pillar B — "what did my agent do and why."
- **Device connectors, not full OS control.** Phone: scoped app permissions (calendar,
  messages-with-approval), not a jailbreak/MDM-style takeover. Laptop: a local daemon
  process with an explicit allowlist of commands/paths. VPS: the agent's own sandboxed
  environment that *you* provision — it's the safest of the three because it's not a
  personal device, it's infrastructure the agent already "lives" on.

---

## 3. What Ties Them Together Technically

```
                ┌─────────────────────────────┐
                │   Identity & Privacy Layer   │  ← build this FIRST
                │ (auth, encrypted data vault, │
                │  consent/permission engine)  │
                └─────────────┬────────────────┘
                              │
      ┌───────────┬───────────┼───────────┬───────────┐
      │           │           │           │            │
 AI Companion   Wallet /   Social /   Autonomous     (future:
 (Pillar A)     P2P Crypto  Trust     Life Agent      marketplace,
                (Pillar C)  Graph     (Pillar E)      other modules)
                            (Pillar D)     │
                                    ┌──────┴──────┐
                                    │  Device      │
                                    │  Connectors  │
                                    │ Phone/Laptop/│
                                    │     VPS      │
                                    └──────────────┘
```

Single sign-on identity, one reputation score, one data vault, one **permission
engine** — used differently by each module. The permission engine matters most for
Pillar E: it's the same consent/revocation system that governs "who can see my data"
in Pillar B, reused to govern "what can my agent actually *do*." This is what makes it
one coherent platform instead of five apps bolted together.

---

## 4. Phased Roadmap

**Phase 0 (Weeks 1–4): Prove the core thesis with one wedge**
- Do NOT build all five at once. Pick the wedge with fastest path to real users and
  least regulatory risk: **Pillar A (private AI companion) on top of a minimal identity/
  privacy layer**, PLUS the *safe slice* of Pillar E: scheduling, reminders, and web
  search — no device control yet, no autonomous actions with real-world consequences.
- MVP: sign-up, encrypted memory store, chat interface, data dashboard, calendar/
  reminder integration, web-search tool use. Ship to 20–50 real users.
- Goal: validate "people will use and trust a privacy-first companion that can also
  get useful things done" before granting it any device access.

**Phase 1 (Months 2–4): Layer in trust/social + first device connector**
- Add lightweight social graph (Pillar D) — invite-only, small groups, reputation score
  starts accruing here (non-financial at first: reliability, verified identity).
- Build the **permission engine** properly now (tiered autonomy: suggest / auto-notify /
  full-auto) and ship the **first** device connector: a VPS-based agent runtime. VPS
  first because it's infrastructure you provision, not a personal device — lowest risk
  place to prove the agent can act reliably and safely (background jobs, monitoring,
  scheduled tasks) before it ever touches a phone or laptop.
- AI companion can now reference shared context with consent (e.g., "you and Alex both
  are free Friday") and can execute *suggest-only* social actions (draft, don't send).

**Phase 2 (Months 4–8): Wallet (non-custodial) + laptop/phone connectors**
- Self-custody wallet integration (use existing infra like MetaMask SDK / WalletConnect
  rather than building custody from scratch — huge regulatory and security surface).
- P2P trades limited to your existing verified-identity users first (closed beta) to
  keep scam surface small while you build reputation + escrow logic.
- Extend Pillar E to laptop (scoped local daemon) and phone (scoped app permissions),
  still defaulting to *suggest-only* for anything irreversible (spending, sending,
  deleting). Only promote a task type to full-auto after real usage data shows it's safe.
- Get legal counsel involved *before* this phase — both for money transmission/KYC/AML
  (India-specific: RBI/FIU crypto rules are stricter than US/EU) AND for the agent's
  ability to act on third-party services on the user's behalf (ToS/liability questions).

**Phase 3 (Months 8+): Full platform + monetization**
- Cross-pillar features: AI companion helps flag suspicious P2P activity, reputation
  score portable across wallet + social, agent can cross-reference wallet + social +
  calendar to proactively manage more of daily life, premium tier for heavier
  automation/compute usage.
- Scale trust/safety team proportional to P2P volume and agent autonomy — this is where
  scams (Pillar C) and agent mistakes (Pillar E) actually get stopped or don't.

---

## 5. Tech Stack (pragmatic, not resume-driven)

- **Backend:** Postgres (Supabase is fine to start — you already have it connected),
  encrypted columns / row-level security for the data vault.
- **AI:** Sarvam AI (OpenAI-compatible chat completions API, sarvam-30b/105b) for the
  companion — memory via retrieval over the user's own encrypted store, not
  fine-tuning per-user. Chosen over Anthropic/OpenAI for this build; the integration
  is behind one module (`src/lib/sarvam.ts`) so swapping providers later is a
  contained change, not a rewrite.
- **Wallet:** Don't build custody. Use WalletConnect / account abstraction (ERC-4337)
  so users hold keys; you never become a money-service business by accident.
- **Agent runtime (Pillar E):** Sarvam's OpenAI-style tool-calling for web search,
  calendar, and device actions; the VPS runs a lightweight always-on agent
  process, phone/laptop connectors expose a narrow, explicit tool surface (not general
  shell/OS access) that the agent calls through the same permission engine as Pillar B.
- **Integrations:** standard OAuth connectors per service (Gmail API, Notion API,
  brokerage API e.g. read-only via Plaid-equivalent, Google Maps API, social platform
  APIs) — each mapped to its own scoped permission, not a single "connect everything"
  toggle.
- **Build agent:** an agentic coding/dev loop (Claude Code-style: plan, write, test,
  iterate) exposed to users for their own build requests, sandboxed per-user so one
  user's build task can't touch another's data or infra.
- **Mobile/web:** one shared design system so Pillars A/C/D/E feel like one product,
  not five stitched together.

---

## 6. Monetization
- Freemium AI companion (usage-based cost pass-through above free tier — this keeps
  unit economics sane, since Claude/LLM calls cost real money per user).
- Small transaction fee on P2P escrow (not on holding — never touch custody fee models,
  that's a regulatory trigger).
- Never sell user data. This is core to the trust thesis — one data-sale incident kills
  the whole platform's reason to exist.

---

## 7. Biggest Risks (in order)
1. **Agent autonomy going wrong (Pillar E):** an agent with device/VPS access that
   acts incorrectly — sends the wrong message, deletes the wrong file, gets manipulated
   by malicious content it reads (prompt injection) — is worse for trust than the AI
   companion just being "not that smart." Default to suggest-only, expand slowly, log
   everything.
2. **Regulatory (crypto):** money transmission / KYC law, especially P2P + escrow.
   Get a lawyer before Phase 2 code, not after. (Also applies to Pillar E once it can
   take actions with financial or contractual consequences.)
3. **Scope creep:** building all 5 pillars simultaneously before any one is validated.
   Phase 0 discipline matters more than the size of the vision.
4. **Trust is binary:** one data leak, one P2P scam that "got through," or one bad
   autonomous action undermines the entire pitch (privacy + safety + control). Security
   review should be continuous, not a pre-launch checkbox.
5. **AI cost control:** companion with persistent memory *and* tool-calling/agent loops
   can get expensive at scale — design for retrieval-augmented context and bounded
   task loops, not ever-growing prompt history or unbounded autonomous runs.

---

## 8. Multi-Platform Architecture (Web, Mac, Windows, Mobile)

Name is "Netwrk" for now, revisit branding later — doesn't block architecture decisions.

You need presence on 4 platforms, but that doesn't mean 4 separate codebases. Build
**3 codebases covering all 4+ targets**, sharing one core:

```
              ┌───────────────────────────┐
              │   Shared Core (TS package) │
              │  API client, auth, agent   │
              │  tool calls, data models   │
              └─────────────┬──────────────┘
                             │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   Web App              Desktop App          Mobile App
  (Next.js)             (Tauri)              (React Native
                    ↳ Mac + Windows            + Expo)
                      from ONE codebase       ↳ iOS + Android
                                                 from ONE codebase
```

- **Web app (Next.js + React):** Phase 0 build target. Fastest to ship, works
  everywhere immediately, no app store review cycle while iterating.
- **Desktop app (Tauri, not Electron):** Tauri is free/open-source, produces small
  native binaries for **both Mac and Windows from one codebase**, and — critically for
  Pillar E — gives the agent a real local process with OS-level access (files, running
  apps, background scheduling) that a browser tab can't provide. This is what makes
  "laptop connector" real instead of a wrapper around the website.
- **Mobile app (React Native + Expo):** one codebase for **both iOS and Android**.
  This is what unlocks real phone permissions (notifications, calendar, contacts,
  background tasks) for Pillar E in Phase 2 — a website cannot get these.
- **Shared core:** put auth, API calls, agent tool definitions, and data models in one
  internal package all three apps import, so "connect Gmail" or "the agent's memory"
  isn't built three times.

Sequencing ties back to the roadmap: **web first (Phase 0)**, **desktop next (Phase
1–2, once VPS/laptop connectors matter)**, **mobile last (Phase 2, once phone-level
device control is actually being built)** — building all four shells before Phase 0 is
validated would be the scope-creep risk from Section 7 in a different costume.

---

## 9. Tools & Stack (free-first)

Every choice below has a free tier or is fully open-source, so cost only shows up
where it has to (AI inference, and eventually hosting at real scale).

| Layer | Tool | Why / free tier |
|---|---|---|
| Web frontend | Next.js + React + Tailwind CSS | Free, open-source, huge ecosystem |
| UI components | shadcn/ui | Free, copy-paste components, no vendor lock-in |
| Desktop shell | Tauri | Free, open-source, one codebase → Mac + Windows |
| Mobile shell | React Native + Expo | Free, open-source, one codebase → iOS + Android |
| Backend/DB/Auth | Supabase | Generous free tier, open-source core, already connected |
| AI / agent brain | Sarvam AI (sarvam-30b/105b) | Pay-per-use, OpenAI-compatible API, strong Indic-language support |
| Agent tool orchestration | OpenAI-style tool calling (Sarvam supports it natively) | Free framework/spec for wiring tools to the agent |
| Workflow automation (optional) | n8n | Free/open-source, useful for wiring integrations visually before custom code exists |
| Wallet | WalletConnect SDK + viem/ethers.js | Free, open-source, non-custodial by design |
| VPS for agent runtime | Railway (already connected) or Hetzner | Free/low-cost tiers, pay only as usage grows |
| Gmail integration | Gmail API | Free within Google's standard quota |
| Notion integration | Notion API | Free |
| Maps integration | Google Maps API | Free monthly credit, covers early-stage usage |
| Stocks (read-only) | Alpha Vantage / Yahoo Finance API | Free tiers for market data |
| Push notifications | Firebase Cloud Messaging | Free |
| Hosting (web) | Vercel or Railway | Free tier to start |
| CI/CD & version control | GitHub + GitHub Actions | Free for this scale |
| Error monitoring | Sentry | Free tier |

Bottom line: nearly the entire stack costs $0 until you have real usage — the only
line item that scales with users from day one is AI inference (Sarvam API calls),
which is unavoidable since that's the actual intelligence layer.

---

## 10. Immediate Next Steps
1. Pick the Phase 0 wedge (recommend: private AI companion + data dashboard + basic
   scheduling/web search) and scope an MVP spec.
2. Decide identity/auth approach (Supabase Auth is the fast path given your existing
   connection).
3. Sketch the data vault + permission engine schema — what fields, what permission
   model, what "export/delete" and "what can my agent do" both look like technically
   (same underlying table, two different UIs).
4. Design the tool surface for Pillar E's Phase-0 slice (calendar, reminders, web
   search only) so it's built on the same permission engine from day one, even though
   device/VPS connectors come later.
5. Scaffold the Next.js web app + Supabase project as the actual Phase 0 codebase —
   this is the first real line of code.
6. Park Pillars C, D, the device-control parts of E, and the desktop/mobile shells as
   documented future modules, not active work, until Phase 0 ships and gets real usage.
