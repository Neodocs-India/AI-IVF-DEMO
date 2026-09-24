# CLAUDE.md — Anvaya: AI Fertility Navigation Platform (Concept Demo)

> This file is the single source of truth for this project. Read it fully at the start of every session. When anything in the code conflicts with this file, this file wins. If something is ambiguous, ask before guessing.

---

## 1. What we are building

**Anvaya** (Sanskrit: *continuity, connection*) is an AI Fertility Navigation Platform for IVF clinics. It tracks every patient from first enquiry to delivery, shows every patient's current stage in real time, flags patients who are overdue for follow-up, predicts dropout risk, manages frozen embryo storage follow-up, and generates AI summaries for clinicians. It sits **on top of** the clinic's existing IVF software and EMR; it does not replace them.

This repository is a **concept demo**, not a working product. It will be screen-recorded and shown to a senior IVF specialist to demonstrate how the finished product will look and behave.

### Hard constraints
- **Front-end only.** No backend, no database, no authentication, no real API calls, no real AI calls.
- **All data is fictional mock data** generated in `/src/data`. Never use real patient names, real clinic records, or real staff names.
- **Every "AI" output is pre-written text**, displayed with a short typing animation to feel live.
- **Fixed demo date: Monday, 12 October 2026, 09:10 IST.** All "today", "overdue", "days since" and "due in" calculations use this constant, never the system clock.
- Deployable to **Netlify** as a static single-page app.
- A small, unobtrusive **"Concept demo"** badge is visible in the top bar at all times.

### Success criteria
A clinician watching an 8-minute recording should (1) recognise his own clinic's problems in the first 30 seconds, (2) believe the clinical content is accurate, and (3) be able to picture his team using it on Monday morning.

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Build | Vite + React 18 + TypeScript (strict) |
| Styling | Tailwind CSS with design tokens defined in `tailwind.config.ts` (see §9) |
| Components | shadcn/ui (Radix-based), restyled to match our tokens — never left at default styling |
| Icons | lucide-react |
| Charts | Recharts |
| Routing | React Router v6 |
| State | Zustand (in-memory only) for the scripted demo state |
| Motion | Framer Motion, used sparingly (see §9.5) |
| Dates | date-fns, with the fixed `DEMO_NOW` constant |
| Formatting | `Intl.NumberFormat('en-IN')` for lakh/crore grouping; ₹ symbol |

Do **not** add a backend, Firebase, Supabase, auth libraries, or any analytics/tracking script.

### Project structure

```
/src
  /app            App shell, router, layout, role switcher, demo controls
  /components     Shared UI (JourneyRail, RiskBadge, SourceChip, PhoneFrame, KpiTile, ...)
  /features
    /command-centre
    /worklist
    /patient-360
    /doctor
    /patient-app
    /cryo
    /analytics
    /integrations
    /rules
  /data
    constants.ts      DEMO_NOW, clinic, staff, stage definitions, KPI targets
    types.ts          All data model types (§5)
    heroes.ts         Hand-authored hero patients (§6) — never generated
    generate.ts       Deterministic generator for background patients
    seed.ts           Combines heroes + generated patients, exports the dataset
    scripts.ts        Pre-written AI summaries, messages, call notes
  /store          Zustand demo store (initial state from seed, actions, reset)
  /lib            Formatting helpers, selectors, risk helpers
/scripts
  verify-data.ts   Asserts KPI targets (§7) — must pass before any UI work
netlify.toml
```

---

## 3. Fictional clinic and staff

**Clinic:** Aarambh Fertility Centre, Andheri West, Mumbai (single centre in the demo; the data model supports multiple centres). A second centre, **Aarambh Fertility Centre, Vashi**, exists only in the analytics centre-comparison chart.

| Name | Role | Used in |
|---|---|---|
| Dr. Anil Mehta | Medical Director & Senior IVF Consultant | Director view, Doctor view |
| Dr. Shruti Kulkarni | IVF Consultant | Doctor filter, assignments |
| Sneha Pawar | Fertility Navigator (primary operator) | Worklist |
| Imran Sayyed | Fertility Navigator | Worklist assignments |
| Lata D'Souza | Senior IVF Nurse / Cycle Coordinator | Critical alerts, stimulation tasks |
| Dr. Farhan Qureshi | Chief Embryologist | Cryo register |
| Ritu Malhotra | Counsellor (psychological & financial) | Referrals |
| Deepa Shetty | Front desk & billing | Package / payment status |

Avatars: initials in a coloured circle. No stock photos of people.

---

## 4. Roles and navigation

A **role switcher** in the top bar changes the current persona. Switching role changes the landing page, the greeting, and the sidebar order, but every screen stays reachable (this is a demo; the presenter needs to move freely).

| Role | Persona | Landing route |
|---|---|---|
| Medical Director | Dr. Anil Mehta | `/` Command Centre |
| Fertility Navigator | Sneha Pawar | `/worklist` |
| Doctor | Dr. Anil Mehta (consultant hat) | `/doctor` |
| Embryologist | Dr. Farhan Qureshi | `/cryo` |
| Patient (phone) | Priya Deshmukh | `/patient-app` |

### Routes

| Route | Screen |
|---|---|
| `/` | Command Centre |
| `/worklist` | Navigator Worklist |
| `/patients` | Patient directory (searchable table) |
| `/patients/:id` | Patient 360 |
| `/doctor` | Doctor's Day |
| `/patient-app` | Patient companion inside a phone frame |
| `/cryo` | Cryo-Storage Register |
| `/analytics` | Analytics |
| `/integrations` | Integrations |
| `/rules` | Follow-up Rules (configuration) |

Sidebar sections: **Today** (Command Centre, Worklist, Doctor's Day), **Patients** (Directory, Cryo-Storage), **Insights** (Analytics), **Setup** (Integrations, Follow-up Rules), **Patient view** (Patient app).

---

## 5. Data model (`/src/data/types.ts`)

```ts
type StageId =
  | 'enquiry' | 'first_consult' | 'workup' | 'plan_counselling'
  | 'stimulation' | 'opu_embryology' | 'awaiting_transfer'
  | 'transfer_luteal' | 'beta_awaited' | 'early_pregnancy'
  | 'review_after_negative' | 'paused_by_choice'
  | 'obstetric_handover' | 'delivered' | 'exited';

type TreatmentType = 'IVF_ICSI' | 'FET' | 'IUI' | 'OI' | 'FERTILITY_PRESERVATION' | 'DONOR_OOCYTE';

interface Patient {
  id: string;                    // e.g. 'P-24817'
  name: string;                  // female partner, or individual
  age: number;
  partner?: { name: string; age: number };
  locality: string;              // Mumbai / Thane / Navi Mumbai areas
  distanceKm: number;
  language: 'English' | 'Marathi' | 'Hindi' | 'Gujarati';
  phoneMasked: string;           // '+91 98•• ••• 214'
  referralSource: 'Self' | 'Gynaecologist referral' | 'Google' | 'Instagram' | 'Corporate tie-up' | 'Past patient';
  referrerName?: string;
  consultantId: string;
  navigatorId: string;
  treatmentType: TreatmentType;
  stage: StageId;
  stageEnteredOn: string;        // ISO date
  nextExpectedEvent: { label: string; dueOn: string };
  isOverdue: boolean;
  overdueDays?: number;
  overdueRuleId?: string;
  risk: RiskAssessment;
  estimatedValueINR: number;     // value of the next treatment step
  clinical: ClinicalSnapshot;
  cycles: Cycle[];
  cryo: CryoItem[];
  timeline: TimelineEvent[];
  messages: Message[];
  tasks: Task[];
  financial: { package: string; paidINR: number; dueINR: number; emi?: boolean; note?: string };
  wellbeing?: { lastScreenOn?: string; score?: number; band?: 'Low' | 'Moderate' | 'High distress' };
  pausedUntil?: string;
}

interface ClinicalSnapshot {
  amh?: number;                  // ng/mL
  afc?: number;
  bmi?: number;
  tsh?: number;
  diagnosis: string[];           // e.g. ['Diminished ovarian reserve', 'Mild male factor']
  semen?: { concentration: number; progressiveMotility: number; morphology: number };
  infertilityYears: number;
  type: 'Primary' | 'Secondary';
}

interface Cycle {
  id: string; number: number; type: TreatmentType;
  protocol: string;              // 'Antagonist', 'Long agonist', 'Natural FET', 'HRT FET'
  startOn: string; stimDays?: number; gonadotropins?: string;
  triggerOn?: string; opuOn?: string;
  oocytes?: number; mii?: number; fertilised2PN?: number;
  blastocysts?: { day: 5 | 6; grade: string; fate: 'Transferred' | 'Vitrified' | 'Discarded' }[];
  transferOn?: string; endometriumMm?: number;
  betaOn?: string; betaValue?: number | '<2';
  outcome: 'Ongoing' | 'Negative' | 'Biochemical' | 'Clinical pregnancy' | 'Miscarriage' | 'Cancelled';
}

interface CryoItem {
  id: string; kind: 'Embryo' | 'Oocytes' | 'Sperm';
  count: number; grade?: string; dayFrozen?: 5 | 6;
  frozenOn: string; tank: string; canister: string; cane: string;
  storageRenewalDue: string;
  consentValidUntil: string;
  feeStatus: 'Paid' | 'Due' | 'Overdue';
  lastContactOn: string; contactAttempts: number;
  disposition: 'Continue storage' | 'Planned FET' | 'Pending decision' | 'Unreachable protocol';
}

interface RiskAssessment {
  score: number;                 // 0–100
  band: 'Low' | 'Moderate' | 'High';   // <40, 40–69, ≥70
  factors: { label: string; weight: number }[];   // weights sum to score
  suggestedActions: string[];
  trend: 'Rising' | 'Stable' | 'Falling';
}

interface Task {
  id: string; patientId: string; title: string;
  ownerRole: 'Navigator' | 'Nurse' | 'Doctor' | 'Counsellor' | 'Embryologist' | 'Front desk';
  assigneeId?: string; dueOn: string;
  priority: 'Critical' | 'High' | 'Normal';
  status: 'Open' | 'Done' | 'Snoozed';
  source: 'Rule' | 'Manual' | 'AI suggestion' | 'Patient message';
  ruleId?: string;
}

interface Message {
  id: string; channel: 'WhatsApp' | 'SMS' | 'Call';
  direction: 'Outbound' | 'Inbound';
  sentBy: 'Automated' | string;  // staff name if human
  at: string; textOriginal: string; textEnglish?: string;
  status: 'Delivered' | 'Read' | 'Unanswered' | 'Replied';
}

interface TimelineEvent {
  at: string; type: 'Consult' | 'Investigation' | 'Scan' | 'Procedure' | 'Lab' | 'Message' | 'Call' | 'Payment' | 'Note' | 'Alert';
  title: string; detail?: string; source: 'EMR' | 'IVF software' | 'Lab' | 'Billing' | 'WhatsApp' | 'Anvaya';
}

interface FollowUpRule {
  id: string; name: string; stage: StageId;
  condition: string;             // human-readable
  thresholdDays: number;
  ownerRole: Task['ownerRole'];
  escalateAfterDays: number; escalateTo: Task['ownerRole'];
  sensitive: boolean;            // true = no automated nudges, human contact only
  enabled: boolean;
  firedLast30Days: number;
}
```

### Stage definitions (`constants.ts`)
Each stage has: `id`, `label`, `shortLabel`, `order`, `expectedDurationDays`, `owner`, and a one-line description. Labels:

Enquiry → First consult → Work-up → Plan & counselling → Stimulation → OPU & embryology → Awaiting transfer → Transfer & luteal support → Beta awaited → Early pregnancy → Obstetric handover → Delivered.
Side stages: Review after negative result, Paused by choice, Exited.

---

## 6. Hero patients (hand-authored in `heroes.ts`)

These patients carry the demo story. Their data must be exactly as written below. Every number must be consistent across every screen.

### 6.1 Priya Deshmukh — the main story (ID `P-24817`)
- 34 years, Thane West, 38 km. Partner **Rohan Deshmukh**, 36. Language: Marathi. Primary infertility, 4 years. Referred by Dr. Sujata Rane (gynaecologist, Thane).
- Consultant: Dr. Anil Mehta. Navigator: Sneha Pawar.
- **Clinical:** AMH 1.2 ng/mL, AFC 7, BMI 23.4, TSH 2.1 mIU/L, Vitamin D 18 ng/mL (noted low; no treatment documented). Semen: concentration 22 M/mL, progressive motility 28%, normal morphology 3%. Diagnosis: diminished ovarian reserve; mild male factor (asthenozoospermia).
- **Cycle 1 (ICSI), March 2026:** antagonist protocol, rFSH 300 IU + hMG 75 IU, 10 stim days. OPU 14 Mar: 6 oocytes, 5 MII, 4 2PN. One day-5 blastocyst 4AB, fresh transfer 19 Mar. Beta 30 Mar: <2 mIU/mL. Negative.
- **Cycle 2 (ICSI), August 2026:** antagonist protocol, same doses, 9 stim days. OPU 28 Aug: 8 oocytes, 6 MII, 5 2PN. Three blastocysts: day-5 **4AA transferred fresh on 2 Sep** (endometrium 9.2 mm, trilaminar); day-5 **4BB vitrified**; day-6 **3BB vitrified**. Beta 13 Sep: **<2 mIU/mL. Negative.**
- **Cryo:** 2 blastocysts, Tank 2, Canister B, Cane 14. Frozen 2–3 Sep 2026. Fees paid. Disposition: Pending decision.
- **Financial:** cost concern recorded by Dr. Mehta at 2 Sep visit ("Couple anxious about cost of a third cycle"). Current package: ICSI cycle 2 fully paid.
- **Messages:** two front-desk WhatsApp messages asking her to book a review, sent 22 Sep and 30 Sep, both **Unanswered**. No contact since the negative result.
- **Status on demo date:** stage `review_after_negative`, **29 days since negative beta**, rule R-07 threshold 21 days, so **overdue by 8 days**.
- **Risk: 82 (High), trend Rising.** Factors:
  - 29 days without contact after negative result: +28
  - Two unanswered messages: +18
  - Two unsuccessful transfers: +16
  - Cost concern documented: +14
  - Travel distance 38 km: +6
- **Suggested actions:** personal call from navigator (not an automated message); offer review consultation with Dr. Mehta; counsellor referral; financial counselling on FET using the 2 vitrified blastocysts (FET package ₹65,000–₹85,000 versus a new stimulation cycle ₹1.8–2.2 lakh).
- `estimatedValueINR`: **85,000**.

### 6.2 Other hero patients

| ID | Patient | Situation on demo date | Demo purpose |
|---|---|---|---|
| P-25102 | **Anjali Nair**, 31, Powai; partner Vivek, 33. Antagonist ICSI cycle. | Stimulation day 8. Follicle-tracking scan and E2 due today 08:30; not checked in by 09:10. | "Due today" alert to nurse Lata; shows stimulation monitoring. |
| P-25077 | **Fatima Shaikh**, 29, Kurla; partner Arif, 32. HRT FET. | Beta awaited — blood drawn this morning. | Live event: press `B` and the beta result arrives (412 mIU/mL, positive). |
| P-25143 | **Pooja Reddy**, 27, Goregaon; partner Karthik, 30. PCOS, antagonist protocol, freeze-all. | OPU on 9 Oct: 24 oocytes, freeze-all for OHSS risk. | Live event: press `O` for a critical OHSS-symptom alert. |
| P-24390 | **Neha Gupta**, 36, Malad; partner Amit, 38. Language: Hindi. | First consult 23 Sep. No work-up booked in 19 days (rule R-02, threshold 14). Front desk note: asked about total cost twice. Risk 74 High. | Early-funnel leakage; financial hesitation flag. |
| P-22761 | **Sunita Patil**, 38, Dadar; partner Mahesh, 41. | 3 vitrified blastocysts (Jan 2026), no FET plan for 9 months (rule R-11). | Frozen-embryo conversion gap. |
| P-18244 | **Kavita Iyer**, 42, Chembur; partner Suresh, 45. | Embryos stored since Nov 2022. Storage renewal due 30 Oct 2026. 3 contact attempts (call, WhatsApp, letter) unanswered. | Unreachable-patient protocol in the cryo register. |
| P-25010 | **Meera Joshi**, 31, Bandra (single). | Elective oocyte freezing completed Aug 2026: 14 MII oocytes vitrified. | Fertility-preservation track. |
| P-23905 | **Rashmi & Nikhil Kamat** | 11 weeks pregnant after FET. Obstetric handover due at 12 weeks. | Pregnancy-to-delivery continuity. |

---

## 7. KPI targets (the numbers on screen)

`generate.ts` uses a **seeded PRNG (mulberry32, seed 20261012)** to create background patients with Indian names, Mumbai-region localities and realistic distributions, so the dataset is identical on every build. All on-screen numbers are **computed from the data** by selectors in `/src/lib`, never hard-coded in components. The generator is tuned so these targets hold, and `scripts/verify-data.ts` (run with `npm run verify-data`) asserts every one of them.

### Command Centre (initial state)
| Metric | Target |
|---|---|
| Active patients | **412** |
| Overdue for follow-up | **37** |
| High dropout risk (score ≥ 70) | **23** |
| Treatment value at risk | **₹1.42 Cr** (sum of `estimatedValueINR` for overdue patients plus stalled-FET patients, counted once each; must fall between ₹1,41,50,000 and ₹1,42,49,999) |
| Due today | **14** tasks |
| Consults today | **14** (Dr. Mehta 9, Dr. Kulkarni 5) |

### Active patients by stage (sums to 412)
Enquiry 46 · First consult 52 · Work-up 48 · Plan & counselling 31 · Stimulation 29 · OPU & embryology 14 · Awaiting transfer 58 · Transfer & luteal 21 · Beta awaited 12 · Early pregnancy 34 · Review after negative 27 · Paused by choice 40.

### Cryo-Storage Register
| Metric | Target |
|---|---|
| Patients with stored material | **186** |
| Embryos in storage | **461** |
| Oocytes in storage | **212** (from 17 patients) |
| Sperm samples | **38** |
| Patients with embryos and no FET plan for > 6 months | **42** |
| Storage renewals due in next 60 days | **11** |
| Unreachable (≥ 3 failed contact attempts) | **3** |

### Analytics (last 12 months, Oct 2025 – Sep 2026)
Funnel: Enquiries 2,140 → First consults 1,284 → Work-up complete 968 → Treatment started 612 → OPU 498 → Embryo transfer 441 → Clinical pregnancy 214 → Ongoing pregnancy / live birth 172.

Reasons for drop-out (where recorded): Cost 34% · Emotional fatigue 22% · Unknown / lost contact 16% · Relocation 11% · Moved to another clinic 9% · Medical advice to stop 8%.

Average time from first consult to treatment start: 47 days (target line at 30).
Clinical pregnancy rate per transfer: 48.5% (214 / 441).
FET conversion within 6 months of freeze-all: 61%.
Patients recovered from overdue by navigators this quarter: 58.

---

## 8. Screens

For each screen: what it shows, and what must be clickable. Use real clinical terminology throughout. No lorem ipsum anywhere.

### 8.1 Command Centre (`/`)
Greeting: "Good morning, Dr. Mehta" with "Monday, 12 October 2026" and the clinic name.

1. **Attention strip** at the top: a single sentence with the key numbers, e.g. "37 patients are overdue for follow-up, 23 are at high risk of dropping out, and ₹1.42 Cr of planned treatment is waiting." Each number is a link (to the filtered worklist, risk list, and value breakdown).
2. **Journey pipeline** — the signature visual (see §9.4): all 12 active stages as a horizontal rail, each showing its patient count and an overdue count in the stage's attention colour. Clicking a stage opens a side panel listing its patients with days-in-stage.
3. **Today** panel: consults today, scans and procedures scheduled, tasks due, critical alerts (0 initially).
4. **Needs your decision** (Director / Doctor items): e.g. "3 treatment plans awaiting approval", "2 FET timing decisions".
5. **Cryo summary** card: 42 no FET plan, 11 renewals due, 3 unreachable — links to `/cryo` with filters.
6. **Team load**: open tasks per navigator/nurse with overdue counts.

### 8.2 Navigator Worklist (`/worklist`)
Greeting: "Good morning, Sneha. 37 patients need follow-up."

- Tabs: **Overdue (37)** · **Due today (14)** · **Critical (0)** · **Snoozed** · **Done today**.
- Each row: patient name and partner, stage chip, reason in plain language ("Negative result 29 days ago, no review booked"), days overdue, risk badge with score, language, preferred channel, last contact, assigned navigator.
- Default sort: risk score descending. **Priya Deshmukh is the first row.**
- Row click opens a **right-side drawer** (not a new page) with: risk factors, last 3 timeline events, message history, suggested actions, and action buttons: **Log call**, **Send WhatsApp**, **Book appointment**, **Refer to counsellor**, **Escalate to doctor**, **Snooze**, **Open full record**.
- The **Log call** flow for Priya is scripted (§10.1).

### 8.3 Patient 360 (`/patients/:id`)
- Header: names, ages, ID, locality, language, consultant, navigator, risk badge, treatment type, current stage.
- **Personal journey rail** showing the stages this patient has passed, with dates, and where she is now. Previous cycles appear as loops on the rail.
- Tabs: **Overview** · **Timeline** · **Cycles** · **Embryos & storage** · **Messages** · **Tasks** · **Financial** · **Wellbeing**.
- Overview: clinical snapshot (AMH, AFC, semen parameters, diagnosis), risk panel with factor bars and suggested actions, next expected event, open tasks.
- Cycles tab: one card per cycle with protocol, stim days, oocytes / MII / 2PN / blastocysts, transfer, beta, outcome — laid out like an embryology summary, not a generic card grid.
- Every data point shows a small **source chip** (EMR, IVF software, Lab, Billing, WhatsApp) to reinforce that Anvaya reads from existing systems.

### 8.4 Doctor's Day (`/doctor`)
- Today's consult list with time, patient, visit type, and a one-line AI brief ("Review after second negative ICSI; 2 blastocysts vitrified; cost concern").
- **Priya's review consult is at 16:30** (it appears only after the navigator books it in §10.1; before that the 16:30 slot shows as open).
- Selecting a consult opens the **AI pre-consultation summary** (§11.1) with a typing animation the first time it is opened, then static.
- Each line of the summary has a source chip. A footer reads: "Generated from clinic records. Review before clinical use."
- Buttons: **Copy to EMR note**, **Mark reviewed**, **Share patient-friendly summary** (opens the Marathi/English patient version, §11.2).
- Side panel: "Needs your decision" items and flagged patients in this doctor's panel.

### 8.5 Patient companion (`/patient-app`)
Rendered inside a realistic **phone frame** centred on the page, with a language toggle (Marathi / English) above it. The phone shows Priya's WhatsApp-style chat with "Aarambh Fertility Centre" (verified business look, green-free palette is fine — do not copy WhatsApp's branding exactly; make it clearly a chat app).

Chat sequence (scripted, §11.3): two earlier unanswered front-desk messages; then — after the scripted call — the appointment confirmation and counsellor introduction; then Priya's reply.

A second tab inside the phone, **"My journey"**, shows a simple, warm version of her journey rail ("You are here: Review with your doctor"), her next appointment, her stored embryos ("2 embryos safely stored"), and a "Ask a question" button. Plain language, no jargon.

### 8.6 Cryo-Storage Register (`/cryo`)
- Summary tiles from §7 (clickable filters).
- Table: patient, material and count, grade/day, frozen on, tank/canister/cane, storage duration, renewal due, consent valid until, fee status, last contact, attempts, disposition.
- Filter chips: **No FET plan > 6 months (42)** · **Renewal due ≤ 60 days (11)** · **Unreachable (3)** · **Fee overdue** · **Fertility preservation**.
- Row drawer for **Kavita Iyer** shows the unreachable protocol: a checklist of contact attempts with dates and channels (call 14 Sep, WhatsApp 21 Sep, registered letter 28 Sep), next step "Contact alternate number / referrer", and a note: "No disposition action without documented consent. Storage limits and consent follow ART (Regulation) Act, 2021 and clinic policy."
- A small **tank map** visual (4 tanks, canisters as segments) showing occupancy — a quiet, precise diagram, not a 3D illustration.

### 8.7 Analytics (`/analytics`)
- Period selector (fixed to last 12 months; other options visible but only this one has data).
- **Funnel** from enquiry to ongoing pregnancy/live birth with conversion % between steps.
- **Leakage by stage** bar chart and **drop-out reasons** breakdown.
- **Time to treatment** trend by month with a target line.
- **Outcomes**: clinical pregnancy per transfer, FET conversion, cumulative pregnancy per patient started.
- **Centre comparison** (Andheri vs Vashi) and **referral source** performance table.
- **Navigator impact**: patients recovered from overdue, median response time.
- Every chart has a one-sentence takeaway written above it (e.g. "Most patients are lost between first consult and work-up, and cost is the most common reason given.").

### 8.8 Integrations (`/integrations`)
A calm diagram: the clinic's existing systems on the left (IVF software, EMR, Lab/LIS, Ultrasound reporting, Billing, Telephony, WhatsApp Business), Anvaya in the centre, outputs on the right (dashboards, tasks, patient messages, reports). Each source shows status "Connected · last sync 09:05", records synced today, and mode ("Read-only"). Include a card: "No API? Scheduled Excel/CSV import supported." And "Standards: HL7 / FHIR, ABDM-ready."

### 8.9 Follow-up Rules (`/rules`)
Table of rules with toggle, threshold, owner, escalation, "sensitive" flag, and times fired in the last 30 days. Clicking a rule opens a readable editor ("When a patient has been in **Review after negative result** for more than **21** days without a booked appointment, create a task for the **Navigator**. Escalate to the **Doctor** after **7** more days. **Sensitive: human contact only.**"). Edits can change values in memory but have no real effect.

Rules to include:
| ID | Rule | Threshold | Sensitive |
|---|---|---|---|
| R-01 | Enquiry with no first consult booked | 7 days | No |
| R-02 | First consult done, no work-up booked | 14 days | No |
| R-03 | Work-up complete, no plan discussion | 10 days | No |
| R-04 | Plan given, no treatment start | 30 days | No |
| R-05 | Stimulation monitoring visit missed | Same day, 60 min | No |
| R-06 | Beta hCG result not communicated | 1 day | Yes |
| R-07 | Negative result, no review consult | 21 days | Yes |
| R-08 | Positive beta, no viability scan booked | 7 days | No |
| R-09 | Pregnancy, obstetric handover not done | 12 weeks gestation | No |
| R-10 | Freeze-all, no FET plan | 90 days | No |
| R-11 | Embryos stored, no FET plan | 180 days | No |
| R-12 | Storage renewal due | 60 days before due | No |
| R-13 | ≥ 3 failed contact attempts | — | Yes |
| R-14 | Paused by choice, pause period ended | 0 days | Yes |

---

## 9. Design direction

The audience is a senior clinician with decades of experience. The product must feel **calm, precise and trustworthy** — closer to a well-designed clinical instrument than a startup dashboard. Avoid the generic SaaS look: no gradient washes, no identical rounded cards everywhere, no neon accents, no dark mode, no all-caps eyebrow labels, no "→" on buttons.

### 9.1 Colour tokens
| Token | Hex | Use |
|---|---|---|
| `ink` | `#18263A` | Primary text, sidebar background |
| `lagoon` | `#0D7377` | Primary actions, links, active states |
| `mist` | `#F3F6F7` | App background (cool, not cream) |
| `paper` | `#FFFFFF` | Surfaces |
| `line` | `#DCE3E6` | Borders and dividers |
| `saffron` | `#D9971E` | Overdue / needs attention (not panic) |
| `rose` | `#B83A4B` | Critical only (clinical alerts) |
| `sage` | `#4E8B66` | Positive outcomes, completed |
| `slate` | `#5B6B7C` | Secondary text |

Risk bands: Low = `sage`, Moderate = `saffron`, High = `rose` at reduced intensity (badge background 10–12% tint, text full colour). Reserve full-strength `rose` for critical clinical alerts so they stand out.

### 9.2 Typography
- **UI and data:** "Instrument Sans" (Google Fonts), fallback `system-ui, sans-serif`. Use `font-variant-numeric: tabular-nums` for every number column and KPI.
- **Patient names, AI summaries and patient-facing text:** "Newsreader" (Google Fonts) serif, fallback `Georgia, serif`. This gives summaries the feel of a well-written clinical letter and distinguishes AI-authored prose from interface chrome.
- **Marathi and Hindi:** "Noto Sans Devanagari".
- Sentence case everywhere. Type scale: 12 / 14 / 16 / 20 / 28 / 40.

### 9.3 Layout
- Fixed left sidebar (ink background, 240 px), top bar with role switcher, global patient search, demo badge, and notifications bell.
- Content max width 1440 px, left-aligned. Optimise for 1920×1080 and 1440×900 recording; must remain usable at 1024 px (tablet).
- Vary component treatment by hierarchy: tables as flat bordered tables, the journey rail as the hero element, summaries as document-like panels with generous margins. Not everything is a card.

### 9.4 Signature element: the journey rail
One consistent visual language for the patient journey, reused on the Command Centre (all patients), Patient 360 (one patient, with cycle loops), and the patient app (simplified, friendly). A horizontal line with stage nodes; node size or a small bar encodes volume; overdue counts sit as saffron marks under the node. This is the one place to be visually bold. Everything around it stays quiet.

### 9.5 Motion
- One orchestrated moment on first load of the Command Centre: pipeline counts settle into place.
- Motion otherwise responds only to user actions: drawer open, row leaving the overdue list, counter decrement, toast, AI summary typing.
- Respect `prefers-reduced-motion`.

### 9.6 Copy rules
- Plain, specific, active voice. Buttons say exactly what happens ("Book review consult", not "Submit"). The toast repeats the same verb ("Review consult booked").
- AI outputs never claim certainty or make treatment decisions. Use "Consider", "Discuss", "Suggested". Every AI panel carries: "Generated from clinic records. Review before clinical use."
- Never show survival or success guarantees. No pregnancy-success prediction in this demo (mentioned only as a future phase on the Integrations page roadmap card).

---

## 10. Scripted interactions (Zustand store)

All state changes live in the Zustand store, initialised from `seed.ts`. The **reset** action restores the initial state exactly.

### 10.1 Priya's recovery flow (the core demo moment)
1. In the Worklist, open Priya's drawer and click **Log call**.
2. A call-log dialog opens, pre-filled (editable) with:
   - Outcome: **Reached patient**
   - Notes: "Spoke with Priya. Feeling low after second negative result and worried about the cost of another cycle. Not aware that her 2 frozen embryos can be used without new injections. Agreed to meet Dr. Mehta today with Rohan."
   - Next steps (checkboxes, all pre-ticked): **Book review consult — today 16:30, Dr. Mehta** · **Refer to counsellor (Ritu Malhotra)** · **Share FET cost estimate** · **Send appointment confirmation in Marathi**.
3. Click **Save and complete**. Then, with short staggered animations:
   - Toast: "Call logged. Review consult booked for 16:30 today."
   - Priya leaves the Overdue list; the tab count goes **37 → 36**.
   - Her risk score animates **82 → 58 (Moderate)**, trend Falling. Factor "Two unanswered messages" is replaced by "Reached by phone today (−24)".
   - Command Centre: overdue 36, treatment value at risk **₹1.42 Cr → ₹1.41 Cr**, high-risk count **23 → 22**.
   - Doctor's Day: Priya appears at 16:30 with an AI brief.
   - Patient app: the confirmation message and counsellor introduction appear (§11.3).
   - Timeline: new events "Call — Sneha Pawar" and "Appointment booked".
   - Counsellor task created for Ritu Malhotra.

### 10.2 Live events (keyboard triggers for recording)
| Key | Event | Effect |
|---|---|---|
| `B` | Beta result for Fatima Shaikh | Notification + toast "Beta hCG result: Fatima Shaikh — 412 mIU/mL (positive)". Fatima moves Beta awaited → Early pregnancy (counts update). Task "Book viability scan at 6–7 weeks" created for Nurse. The result is not auto-messaged to the patient; a task "Call patient with result — Dr. Mehta" is created (rule R-06, sensitive). |
| `O` | OHSS symptoms for Pooja Reddy | Critical banner in `rose` across all staff screens: "Pooja Reddy reported abdominal bloating and breathlessness on WhatsApp (3 days post-OPU). Possible OHSS. Assigned to Lata D'Souza — call now." Critical tab count 0 → 1. Clicking opens her record with the inbound message highlighted. |
| `A` | Anjali Nair missed scan | Due-today task escalates to High priority with note "Not checked in for 08:30 scan. Day 8 of stimulation." |
| `R` | Reset | Restores initial state; toast "Demo reset". |
| `T` | Toggle guided tour | Shows/hides a small step indicator (§10.3). |
| `?` | Shortcuts | Opens a small shortcuts panel. |

Keyboard shortcuts must not fire while typing in an input.

### 10.3 Guided tour (optional overlay)
A minimal floating panel at the bottom-right: "Step 3 of 8 — Patient record" with Previous / Next buttons that navigate to the right route and highlight the relevant element with a soft outline. Steps follow the storyline in §12. Hidden by default.

---

## 11. Pre-written AI and message content (`scripts.ts`)

### 11.1 AI pre-consultation summary — Priya Deshmukh
Render with section headings and a source chip after each line.

**Review consultation — Priya Deshmukh (34) and Rohan Deshmukh (36)**
Primary infertility, 4 years. Referred by Dr. Sujata Rane, Thane.

**Background**
- Diminished ovarian reserve: AMH 1.2 ng/mL, AFC 7. [Lab · 12 Jan 2026] [EMR · 15 Jan 2026]
- Mild male factor: concentration 22 M/mL, progressive motility 28%, normal morphology 3%. [Lab · 12 Jan 2026]
- TSH 2.1 mIU/L. Vitamin D 18 ng/mL, low; no supplementation documented. [Lab · 12 Jan 2026]

**Treatment so far**
- Cycle 1, March 2026: antagonist ICSI, 10 stimulation days. 6 oocytes, 5 MII, 4 fertilised. One day-5 blastocyst (4AB) transferred fresh. Beta hCG <2 mIU/mL. [IVF software]
- Cycle 2, August 2026: antagonist ICSI, 9 stimulation days. 8 oocytes, 6 MII, 5 fertilised. Day-5 blastocyst (4AA) transferred fresh on 2 Sep, endometrium 9.2 mm trilaminar. Beta hCG <2 mIU/mL on 13 Sep. [IVF software]

**In storage**
- 2 vitrified blastocysts: day-5 4BB and day-6 3BB. Tank 2, Canister B, Cane 14. [Cryo register]

**Since the last result**
- No contact for 29 days. Two messages from the front desk unanswered. [WhatsApp]
- Reached by phone today by Sneha Pawar: feeling low, worried about the cost of another cycle, unaware frozen embryos can be used without a new stimulation. [Anvaya · 12 Oct 2026]
- Cost concern also recorded at the 2 Sep visit. [EMR · 2 Sep 2026]

**Points to discuss**
- Frozen embryo transfer using the 2 stored blastocysts before considering a new stimulation cycle.
- Findings from two unsuccessful transfers of good-quality blastocysts, and whether further evaluation is indicated.
- Low vitamin D not yet addressed.
- Emotional wellbeing: counsellor referral made today; wellbeing screen not yet completed.
- Cost: estimated FET package ₹65,000–₹85,000 compared with ₹1.8–2.2 lakh for a new ICSI cycle. [Billing]

*Generated from clinic records. Review before clinical use.*

### 11.2 Patient-friendly summary (for "Share patient-friendly summary")
English version (Marathi toggle shows a translation marked for native-speaker review):
"Priya and Rohan, thank you for coming in today. You have 2 embryos safely frozen from your August treatment. Dr. Mehta will talk with you about using them in a frozen embryo transfer, which does not need another round of injections. Ritu Malhotra, our counsellor, is available to talk with you about how you are feeling and about costs. You can message us on this number any time."

### 11.3 WhatsApp thread — Priya (Marathi with English translation on toggle)
All Marathi and Hindi text must be reviewed by a native speaker before recording. Add a code comment `// TODO: native-speaker review` next to each string.

1. **22 Sep, 11:04 — Front desk (Deepa Shetty), Unanswered**
   Marathi: "नमस्कार प्रिया, तुमची पुढील भेट ठरवण्यासाठी कृपया आम्हाला कळवा."
   English: "Hello Priya, please let us know so we can schedule your next visit."
2. **30 Sep, 16:20 — Front desk (Deepa Shetty), Unanswered**
   Marathi: "नमस्कार प्रिया, डॉ. मेहता यांच्यासोबत भेटीसाठी वेळ ठरवायची असल्यास आम्हाला कळवा."
   English: "Hello Priya, let us know if you would like to schedule a time with Dr. Mehta."
3. *(System note shown only in staff view, not in the phone: "Automated nudges paused — sensitive period after negative result. Human contact required (R-07).")*
4. **12 Oct, after scripted call — Sneha Pawar**
   Marathi: "नमस्कार प्रियाताई, आज दुपारी ४:३० वाजता डॉ. मेहता यांच्यासोबत तुमची भेट निश्चित झाली आहे. भेटीनंतर आमच्या समुपदेशक रितू मल्होत्रा तुमच्याशी बोलतील. काही प्रश्न असल्यास इथे लिहा."
   English: "Hello Priya, your appointment with Dr. Mehta is confirmed for 4:30 pm today. After the appointment, our counsellor Ritu Malhotra will speak with you. Write here if you have any questions."
5. **12 Oct, reply — Priya**
   Marathi: "धन्यवाद. मी आणि रोहन येऊ."
   English: "Thank you. Rohan and I will come."

### 11.4 Neha Gupta — Hindi example (visible in her message tab)
Outbound, 3 Oct, front desk: "नमस्ते नेहा जी, आपकी जाँचों के लिए अपॉइंटमेंट बुक करने में हम आपकी मदद कर सकते हैं। कृपया बताएं कौन सा दिन आपके लिए ठीक रहेगा।" — English: "Hello Neha, we can help you book your tests. Please let us know which day suits you." Status: Read, not replied.

### 11.5 Short AI briefs for other consults on Doctor's Day
Write 13 more one-line briefs in the same style for the other consults today (new consults, work-up reviews, stimulation reviews, a pregnancy scan, an IUI planning visit). Keep them clinically plausible and varied.

---

## 12. Demo storyline (the recording, about 8 minutes)

Build and test in this order. The guided tour (§10.3) follows the same steps.

1. **Command Centre, 09:10 Monday.** The attention strip and journey pipeline. "37 overdue, ₹1.42 Cr waiting."
2. **Click "37 overdue" → Worklist.** Priya is at the top with risk 82 and plain-language reasons.
3. **Open Priya's record (Patient 360).** Journey rail with two cycle loops, cycles tab, 2 embryos in storage, unanswered messages, risk factors.
4. **Back to Worklist → Log call → Save.** Counts drop, risk falls, appointment booked.
5. **Switch role to Doctor → Doctor's Day.** Priya at 16:30; open the AI summary as it types out.
6. **Switch to Patient (phone).** The Marathi chat, the confirmation, Priya's reply, and the "My journey" tab.
7. **Press `B`, then `O`.** A positive beta arrives and is routed to the doctor to call; a critical OHSS alert goes straight to the nurse.
8. **Cryo-Storage Register.** 42 without FET plans, 11 renewals, Kavita Iyer's unreachable protocol.
9. **Analytics.** Where patients are lost and why; navigator impact.
10. **Integrations.** "Works on top of your existing systems."

---

## 13. Build plan (stop points are mandatory)

Work in these milestones. **Stop at the end of each one**, run the app, summarise what was built, and wait for approval before continuing.

1. **Scaffold:** Vite + React + TS + Tailwind + shadcn/ui, tokens from §9, fonts, `netlify.toml`, empty routes, app shell with sidebar, top bar, role switcher and demo badge.
2. **Data:** `types.ts`, `constants.ts`, `heroes.ts`, `generate.ts`, `seed.ts`, selectors, and `scripts/verify-data.ts`. **Stop and show the verify-data output.** No UI work until every KPI target passes.
3. **Command Centre** including the journey rail component.
4. **Worklist** with drawer.
5. **Patient 360.**
6. **Scripted flow §10.1** and the Zustand store with reset.
7. **Doctor's Day** with AI summary typing effect.
8. **Patient companion** in phone frame.
9. **Cryo-Storage Register** with tank map.
10. **Analytics.**
11. **Integrations** and **Follow-up Rules.**
12. **Live events** (§10.2), shortcuts, guided tour.
13. **Polish pass:** consistency of numbers across screens, empty states, focus states, reduced motion, 1024 px check, copy review against §9.6.
14. **Deploy** to Netlify.

---

## 14. Netlify

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
Add `<meta name="robots" content="noindex">` to `index.html` so the demo is not indexed by search engines.

---

## 15. Acceptance checklist (before recording)

- [ ] `npm run verify-data` passes; every number in §7 matches on screen.
- [ ] The same number is identical everywhere it appears (e.g. 37 overdue on Command Centre, Worklist tab, and attention strip).
- [ ] Priya's flow (§10.1) works end to end and updates all five screens.
- [ ] `R` fully resets state, including Priya, Fatima, Pooja and Anjali.
- [ ] Live events `B`, `O`, `A` work from any screen and do not fire while typing.
- [ ] No lorem ipsum, no placeholder names, no "John Doe", no US date formats (use 12 Oct 2026), no $ signs.
- [ ] Currency uses Indian grouping (₹1,42,00,000 / ₹1.42 Cr / ₹85,000).
- [ ] Every AI panel shows the review disclaimer; no AI text makes treatment decisions or promises outcomes.
- [ ] Marathi and Hindi strings flagged for native-speaker review.
- [ ] Looks right at 1920×1080 and 1440×900; usable at 1024 px.
- [ ] "Concept demo" badge visible on every screen.
- [ ] No console errors.
