# Anvaya demo: recording script (about 8 minutes)

A rough script for the screen recording. Each scene has **what to click**, **what to say**, the **URL** you should be on, and **what should be on screen** so you can check you're on track.

---

## Before you hit record

**Base URL.** Use your Netlify address once it's deployed, or run locally:

| Where | Base URL |
|---|---|
| Local (`npm run dev`) | `http://localhost:5173` |
| Netlify | `https://<your-site>.netlify.app` |

The paths below go after the base URL, for example `http://localhost:5173/worklist`.

> **Important: click, don't type URLs, once the demo has started.**
> The demo state lives in the browser's memory. Typing a URL into the address bar (or refreshing) reloads the page and **undoes Priya's call and the live events**. Use the sidebar, links and buttons to move around. The URLs are here so you know where you should be, and for setting up before a take.

**Setup checklist**

1. Browser window at **1920×1080** (or 1440×900), zoom 100%, bookmarks bar hidden, no other tabs visible.
2. Open the base URL: `/` (Command Centre).
3. Press **`R`** to reset. You should see "Demo reset", and the top line reads **37 patients / 23 / ₹1.42 Cr**.
4. Check the top-right shows **Dr. Anil Mehta, Medical Director**. If not, use the role switcher (top right) and choose **Medical Director**.
5. Don't have a text box selected when you press shortcut keys (click on empty page space first).

**Shortcut keys used in this script**

| Key | What it does |
|---|---|
| `B` | Beta hCG result arrives for Fatima Shaikh (412 mIU/mL, positive) |
| `O` | Critical OHSS alert for Pooja Reddy |
| `R` | Reset everything (use between takes) |
| `T` | Guided tour panel, a step-by-step prompter for this storyline. Keep it hidden while recording, or use it to rehearse. |

---

## Scene 1: Command Centre, 09:10 Monday (about 45 s)

**URL:** `/`

**On screen:** "Good morning, Dr. Mehta", Monday, 12 October 2026. The journey rail settles into place the first time the page loads.

**Do:**
1. Pause on the page for a moment so the rail animation finishes.
2. Hover over the sentence at the top.
3. Point at the rail: **Review after negative result: 27 (6 overdue)** and **Awaiting transfer: 58 (6 overdue)**.
4. Optional: click **Awaiting transfer** on the rail to show the side panel listing those patients, then close it.

**Say:**
> "This is Monday morning at a fertility clinic in Mumbai, at ten past nine. Before anyone has opened a file, Anvaya has read the clinic's IVF software, EMR, lab and billing systems and put every active patient on one line: 412 patients, from first enquiry to early pregnancy.
>
> The first sentence is the one that matters: 37 patients are overdue for follow-up, 23 are at high risk of dropping out, and one crore forty-two lakh rupees of planned treatment is waiting.
>
> Each stage shows how many patients are in it, and the saffron marks underneath show who is overdue. Look here: six patients have had a negative result and no one has booked their review. And six have embryos frozen with no transfer planned."

---

## Scene 2: The Worklist, and who to call first (about 40 s)

**URL:** `/worklist?tab=overdue` (you get there by clicking **37 patients** in the top sentence)

**On screen:** "Good morning, Sneha. 37 patients need follow-up." **Priya Deshmukh** is the first row, with risk **82 High** and "Negative result 29 days ago, no review booked".

**Do:**
1. On the Command Centre, click the underlined **37 patients**.
2. Let the list sit for a second, then point at Priya's row.

**Say:**
> "This is what the navigator, Sneha, sees when she logs in. Not a spreadsheet: a list of the 37 people who need a human call today, sorted by how likely they are to drop out.
>
> At the top is Priya Deshmukh. Her second ICSI cycle was negative 29 days ago. The clinic's own rule says a review should happen within 21 days, so she's eight days overdue. Two WhatsApp messages have gone unanswered."

---

## Scene 3: Priya's record, Patient 360 (about 60 s)

**URL:** `/patients/P-24817`

**On screen:** header "Priya Deshmukh (34) and Rohan Deshmukh (36)". The journey rail shows **Cycle 1 · Mar 2026** and **Cycle 2 · Aug 2026** loops, and the branch "Now: Review after negative result".

**Do:**
1. Click Priya's row. A drawer opens on the right.
2. Click **Open full record** in the drawer.
3. Point at the journey rail and its two cycle loops.
4. Click the **Cycles** tab and scroll slowly through cycle 2 then cycle 1.
5. Click the **Embryos & storage** tab (2 blastocysts, Tank 2, Canister B, Cane 14).
6. Click the **Messages** tab (two unanswered Marathi messages, with the staff-only note).
7. Click the **Overview** tab and point at the risk factors on the right.

**Say:**
> "Here's Priya's whole story on one page. Two antagonist ICSI cycles, March and August, both negative. Each cycle is laid out the way an embryologist would read it: 8 oocytes, 6 MII, 5 fertilised, a 4AA transferred fresh on 2 September.
>
> And this is the important part: she still has two vitrified blastocysts in storage, a day-5 4BB and a day-6 3BB. Every line has a small label showing where it came from: the lab, the EMR, the IVF software. Anvaya doesn't replace those systems; it reads them.
>
> The messages are in Marathi, her language. The note at the top says automated reminders are paused. After a negative result, this clinic's rule is that a person makes the contact, not a bot.
>
> And here's why the risk is 82: no contact for 29 days, two unanswered messages, two unsuccessful transfers, a cost concern Dr. Mehta wrote down on 2 September, and a 38-kilometre journey from Thane."

---

## Scene 4: The call (about 60 s), the core moment

**URL:** `/worklist?tab=overdue`, with Priya's drawer open

**On screen before:** Overdue **37**, Priya's risk **82 High**.
**On screen after:** Overdue **36**, Priya's risk animates to **58 Moderate** and she leaves the list. The toast reads "Call logged. Review consult booked for 16:30 today."

**Do:**
1. Click **Worklist** in the sidebar.
2. Click Priya's row to open the drawer.
3. Click **Log call**. The dialog is pre-filled.
4. Pause so the viewer can read the notes and the four ticked next steps.
5. Click **Save and complete**.
6. Keep the drawer open for about 3 seconds while the risk score and factors change, then press `Esc`.

**Say:**
> "So Sneha picks up the phone. Anvaya suggested a personal call, not another automated message.
>
> She logs what happened: Priya is feeling low and worried about the cost of a third cycle. She didn't know her two frozen embryos could be used without new injections. She's agreed to come in today with Rohan.
>
> Four next steps, already ticked: book the review with Dr. Mehta at 4:30 today, refer her to the counsellor, share the FET cost estimate, and send the confirmation in Marathi.
>
> Save. Watch what happens: she drops off the overdue list, 37 becomes 36, and her risk falls from 82 to 58."

---

## Scene 5: The rest of the clinic updates (about 20 s)

**URL:** `/`

**On screen:** **36 patients**, **22** high risk, **₹1.41 Cr**. The Today panel shows Consults **15** (Dr. Mehta 10).

**Do:**
1. Click **Command Centre** in the sidebar.
2. Point at the top sentence.

**Say:**
> "Back on the director's screen, the numbers have already moved: 36 overdue, 22 at high risk, and eighty-five thousand rupees of treatment is no longer waiting. One phone call, and everyone in the clinic can see it."

---

## Scene 6: Doctor's Day and the AI summary (about 60 s)

**URL:** `/doctor`

**On screen:** Priya at **16:30** with the tag "Booked today by Sneha Pawar". The pre-consultation summary types out on the right.

**Do:**
1. Open the role switcher (top right), then choose **Doctor**. The app goes to Doctor's Day.
2. Priya's 16:30 consult is selected automatically and the summary types out. Scroll the page gently if needed.
3. Point at the footer: "Generated from clinic records. Review before clinical use."
4. Click **Share patient-friendly summary**, show the Marathi text, switch to **English**, then close the dialog.

**Say:**
> "Now Dr. Mehta's day. Nine consults were already on his list, and at 4:30 there's a new one: Priya, booked by Sneha twenty minutes ago.
>
> Before she walks in, he gets a one-page summary built from the clinic's records: the diagnosis, both cycles, what's in storage, what happened since the result, and the points worth discussing. A frozen embryo transfer with the two stored blastocysts before a new stimulation. Two good-quality transfers that didn't work, and whether that needs more evaluation. A low vitamin D nobody has treated yet.
>
> It suggests; it doesn't decide. Every line shows where it came from, and it says clearly: review before clinical use.
>
> And there's a version for the couple, in Marathi, in plain language."

---

## Scene 7: Priya's phone (about 45 s)

**URL:** `/patient-app`

**On screen:** A phone with the chat from Aarambh Fertility Centre in Marathi: the two earlier messages, Sneha's confirmation, and after a moment Priya's reply "धन्यवाद. मी आणि रोहन येऊ."

**Do:**
1. Role switcher, then **Patient (phone)**.
2. Wait about 2 seconds for Priya's reply to appear.
3. Click **English** above the phone to show the translation.
4. Click the **My journey** tab inside the phone.

**Say:**
> "This is what Priya sees. The message is from Sneha, in Marathi: your appointment with Dr. Mehta is at 4:30 today, and after that Ritu, our counsellor, will talk with you. And Priya replies: 'Thank you. Rohan and I will come.'
>
> Her journey view uses the same rail as the clinic, in simpler words: you are here, review with your doctor. Her next appointment. And two embryos, safely stored, that can be used without new injections."

---

## Scene 8: Live events, a result and an emergency (about 45 s)

**URL:** `/`

**On screen after `B`:** toast "Beta hCG result: Fatima Shaikh — 412 mIU/mL (positive)". The bell shows a badge, and **Beta awaited** on the rail changes from 12 to 11.
**On screen after `O`:** a red banner across the top: "Pooja Reddy reported abdominal bloating and breathlessness on WhatsApp (3 days post-OPU). Possible OHSS. Assigned to Lata D'Souza — call now."

**Do:**
1. Role switcher, then **Medical Director**, which takes you to the Command Centre.
2. Click an empty area of the page, then press **`B`**.
3. Point at the rail: Beta awaited drops by one and Early pregnancy goes up by one. Point at **Needs your decision**: "1 result to call the patient about".
4. Press **`O`**.
5. Click **Open record** in the red banner. It opens Pooja's messages with her WhatsApp highlighted.

**Say:**
> "Two things happen during a real morning. First, a lab result: Fatima's beta hCG is positive, 412. Anvaya moves her to early pregnancy, but notice what it doesn't do: it doesn't message her the result. That's sensitive, so it's routed to Dr. Mehta to call her himself, and a viability scan task goes to the nurse.
>
> Second, Pooja, three days after egg collection with 24 oocytes, messages that she's bloated and breathless. That's a possible OHSS. It goes straight to the top of every staff screen in red, assigned to Lata, the senior nurse, to call now. One click opens the message."

---

## Scene 9: Cryo-Storage Register (about 45 s)

**URL:** `/cryo`

**On screen:** tiles **186 patients · 461 embryos · 212 oocytes · 38 sperm · 42 · 11 · 3**. **Kavita Iyer** is the first row.

**Do:**
1. Click **Cryo-Storage** in the sidebar.
2. Click the **42** tile (no FET plan > 6 months), then click **All** to clear the filter.
3. Click **Kavita Iyer**'s row. The drawer shows the unreachable protocol.
4. Point at the tank map beside or below the table; Kavita's canister is highlighted.

**Say:**
> "Every clinic has a freezer full of embryos, and some of those are decisions nobody has made. 461 embryos here. 42 couples have had embryos frozen for more than six months with no transfer planned. That's treatment, and hope, waiting.
>
> Eleven storage renewals fall due in the next 60 days. Kavita Iyer's is on the 30th. The team has tried a call, a WhatsApp and a registered letter. Anvaya tracks each attempt and the next step. And it's explicit: no action on stored embryos without documented consent, under the ART Act."

---

## Scene 10: Analytics (about 40 s)

**URL:** `/analytics`

**Do:**
1. Click **Analytics** in the sidebar.
2. Scroll slowly: the funnel, where patients are lost, reasons for dropping out, time to treatment, then **Navigator impact** at the bottom.

**Say:**
> "Over the last twelve months: 2,140 enquiries, 612 couples started treatment. Once patients have met a doctor, 672 were lost before treatment started, and where a reason was recorded, cost comes first.
>
> Patients wait 47 days from first consult to treatment, against a target of 30.
>
> And this is what navigators do: 58 patients brought back into care this quarter."

---

## Scene 11: Integrations and close (about 30 s)

**URL:** `/integrations`

**Do:**
1. Click **Integrations** in the sidebar.
2. Let the diagram sit on screen.

**Say:**
> "None of this means replacing the systems the clinic already uses. Anvaya sits on top of the IVF software, the EMR, the lab, billing, telephony and WhatsApp, and reads from them. Where there's no API, a nightly Excel export is enough to start.
>
> The same 37 patients are in every clinic on Monday morning. The question is whether someone calls them."

**End:** hold on the diagram for 2 seconds, then stop recording. Press **`R`** before the next take.

---

## If something goes wrong mid-take

| Problem | Fix |
|---|---|
| Numbers don't match the script | Press `R` and restart from Scene 1 |
| Shortcut key did nothing | Click an empty area first (a text box may be selected), then press it again |
| Page was refreshed, and Priya is back on the overdue list | Refreshing resets the demo. Press `R` and restart the take |
| Summary on Doctor's Day doesn't type out | It only types the first time. Press `R`, redo Scene 4, then return to Doctor's Day |
| Priya's reply already shown on the phone | It only animates the first time. Press `R` and redo from Scene 4 |
| Red OHSS banner in the way | The × on the right hides it |

## Quick URL list

| Scene | Screen | Path |
|---|---|---|
| 1, 5, 8 | Command Centre | `/` |
| 2, 4 | Worklist (overdue) | `/worklist?tab=overdue` |
| 3 | Priya's record | `/patients/P-24817` |
| 6 | Doctor's Day | `/doctor` |
| 7 | Patient phone | `/patient-app` |
| 8 | Pooja's messages | `/patients/P-25143?tab=messages` |
| 9 | Cryo register | `/cryo` |
| 10 | Analytics | `/analytics` |
| 11 | Integrations | `/integrations` |
| Extra | Follow-up rules | `/rules` |
| Extra | Patient directory, high risk | `/patients?risk=high` |
