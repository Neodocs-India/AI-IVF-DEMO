// Pre-written "AI" output and message content — CLAUDE.md §11.
// Nothing here is generated at runtime; the UI types it out to feel live.

import type { Message, SourceSystem } from './types';

// ---------------------------------------------------------------------------
// §11.3 WhatsApp thread — Priya Deshmukh

export const PRIYA_MSG_1: Message = {
  id: 'M-24817-1',
  channel: 'WhatsApp',
  direction: 'Outbound',
  sentBy: 'Deepa Shetty',
  at: '2026-09-22T11:04',
  textOriginal: 'नमस्कार प्रिया, तुमची पुढील भेट ठरवण्यासाठी कृपया आम्हाला कळवा.', // TODO: native-speaker review
  textEnglish: 'Hello Priya, please let us know so we can schedule your next visit.',
  status: 'Unanswered',
};

export const PRIYA_MSG_2: Message = {
  id: 'M-24817-2',
  channel: 'WhatsApp',
  direction: 'Outbound',
  sentBy: 'Deepa Shetty',
  at: '2026-09-30T16:20',
  textOriginal: 'नमस्कार प्रिया, डॉ. मेहता यांच्यासोबत भेटीसाठी वेळ ठरवायची असल्यास आम्हाला कळवा.', // TODO: native-speaker review
  textEnglish: 'Hello Priya, let us know if you would like to schedule a time with Dr. Mehta.',
  status: 'Unanswered',
};

export const PRIYA_STAFF_NOTE =
  'Automated nudges paused — sensitive period after negative result. Human contact required (R-07).';

export const PRIYA_MSG_CONFIRM: Message = {
  id: 'M-24817-3',
  channel: 'WhatsApp',
  direction: 'Outbound',
  sentBy: 'Sneha Pawar',
  at: '2026-10-12T09:24',
  textOriginal:
    'नमस्कार प्रियाताई, आज दुपारी ४:३० वाजता डॉ. मेहता यांच्यासोबत तुमची भेट निश्चित झाली आहे. भेटीनंतर आमच्या समुपदेशक रितू मल्होत्रा तुमच्याशी बोलतील. काही प्रश्न असल्यास इथे लिहा.', // TODO: native-speaker review
  textEnglish:
    'Hello Priya, your appointment with Dr. Mehta is confirmed for 4:30 pm today. After the appointment, our counsellor Ritu Malhotra will speak with you. Write here if you have any questions.',
  status: 'Replied',
};

export const PRIYA_MSG_REPLY: Message = {
  id: 'M-24817-4',
  channel: 'WhatsApp',
  direction: 'Inbound',
  sentBy: 'Priya Deshmukh',
  at: '2026-10-12T09:31',
  textOriginal: 'धन्यवाद. मी आणि रोहन येऊ.', // TODO: native-speaker review
  textEnglish: 'Thank you. Rohan and I will come.',
  status: 'Read',
};

// ---------------------------------------------------------------------------
// §11.4 Neha Gupta — Hindi

export const NEHA_MSG: Message = {
  id: 'M-24390-1',
  channel: 'WhatsApp',
  direction: 'Outbound',
  sentBy: 'Deepa Shetty',
  at: '2026-10-03T12:15',
  textOriginal:
    'नमस्ते नेहा जी, आपकी जाँचों के लिए अपॉइंटमेंट बुक करने में हम आपकी मदद कर सकते हैं। कृपया बताएं कौन सा दिन आपके लिए ठीक रहेगा।', // TODO: native-speaker review
  textEnglish: 'Hello Neha, we can help you book your tests. Please let us know which day suits you.',
  status: 'Read',
};

// ---------------------------------------------------------------------------
// §10.1 Call log (pre-filled)

export const PRIYA_CALL_NOTES =
  'Spoke with Priya. Feeling low after second negative result and worried about the cost of another cycle. Not aware that her 2 frozen embryos can be used without new injections. Agreed to meet Dr. Mehta today with Rohan.';

export const PRIYA_CALL_STEPS = [
  { id: 'book', label: 'Book review consult — today 16:30, Dr. Mehta' },
  { id: 'counsellor', label: 'Refer to counsellor (Ritu Malhotra)' },
  { id: 'fet', label: 'Share FET cost estimate' },
  { id: 'confirm', label: 'Send appointment confirmation in Marathi' },
] as const;

// ---------------------------------------------------------------------------
// §11.1 AI pre-consultation summary — Priya Deshmukh

export interface SummaryChip {
  source: SourceSystem;
  date?: string;
}
export interface SummaryLine {
  text: string;
  chips: SummaryChip[];
}
export interface SummarySection {
  heading: string;
  lines: SummaryLine[];
}
export interface AiSummary {
  title: string;
  subtitle: string;
  sections: SummarySection[];
}

export const PRIYA_SUMMARY: AiSummary = {
  title: 'Review consultation — Priya Deshmukh (34) and Rohan Deshmukh (36)',
  subtitle: 'Primary infertility, 4 years. Referred by Dr. Sujata Rane, Thane.',
  sections: [
    {
      heading: 'Background',
      lines: [
        { text: 'Diminished ovarian reserve: AMH 1.2 ng/mL, AFC 7.', chips: [{ source: 'Lab', date: '12 Jan 2026' }, { source: 'EMR', date: '15 Jan 2026' }] },
        { text: 'Mild male factor: concentration 22 M/mL, progressive motility 28%, normal morphology 3%.', chips: [{ source: 'Lab', date: '12 Jan 2026' }] },
        { text: 'TSH 2.1 mIU/L. Vitamin D 18 ng/mL, low; no supplementation documented.', chips: [{ source: 'Lab', date: '12 Jan 2026' }] },
      ],
    },
    {
      heading: 'Treatment so far',
      lines: [
        { text: 'Cycle 1, March 2026: antagonist ICSI, 10 stimulation days. 6 oocytes, 5 MII, 4 fertilised. One day-5 blastocyst (4AB) transferred fresh. Beta hCG <2 mIU/mL.', chips: [{ source: 'IVF software' }] },
        { text: 'Cycle 2, August 2026: antagonist ICSI, 9 stimulation days. 8 oocytes, 6 MII, 5 fertilised. Day-5 blastocyst (4AA) transferred fresh on 2 Sep, endometrium 9.2 mm trilaminar. Beta hCG <2 mIU/mL on 13 Sep.', chips: [{ source: 'IVF software' }] },
      ],
    },
    {
      heading: 'In storage',
      lines: [{ text: '2 vitrified blastocysts: day-5 4BB and day-6 3BB. Tank 2, Canister B, Cane 14.', chips: [{ source: 'Cryo register' }] }],
    },
    {
      heading: 'Since the last result',
      lines: [
        { text: 'No contact for 29 days. Two messages from the front desk unanswered.', chips: [{ source: 'WhatsApp' }] },
        { text: 'Reached by phone today by Sneha Pawar: feeling low, worried about the cost of another cycle, unaware frozen embryos can be used without a new stimulation.', chips: [{ source: 'Anvaya', date: '12 Oct 2026' }] },
        { text: 'Cost concern also recorded at the 2 Sep visit.', chips: [{ source: 'EMR', date: '2 Sep 2026' }] },
      ],
    },
    {
      heading: 'Points to discuss',
      lines: [
        { text: 'Frozen embryo transfer using the 2 stored blastocysts before considering a new stimulation cycle.', chips: [] },
        { text: 'Findings from two unsuccessful transfers of good-quality blastocysts, and whether further evaluation is indicated.', chips: [] },
        { text: 'Low vitamin D not yet addressed.', chips: [] },
        { text: 'Emotional wellbeing: counsellor referral made today; wellbeing screen not yet completed.', chips: [] },
        { text: 'Cost: estimated FET package ₹65,000–₹85,000 compared with ₹1.8–2.2 lakh for a new ICSI cycle.', chips: [{ source: 'Billing' }] },
      ],
    },
  ],
};

export const AI_DISCLAIMER = 'Generated from clinic records. Review before clinical use.';

// ---------------------------------------------------------------------------
// §11.2 Patient-friendly summary

export const PRIYA_FRIENDLY = {
  English:
    'Priya and Rohan, thank you for coming in today. You have 2 embryos safely frozen from your August treatment. Dr. Mehta will talk with you about using them in a frozen embryo transfer, which does not need another round of injections. Ritu Malhotra, our counsellor, is available to talk with you about how you are feeling and about costs. You can message us on this number any time.',
  Marathi:
    'प्रिया आणि रोहन, आज आल्याबद्दल धन्यवाद. ऑगस्टमधील उपचारातून तुमचे २ भ्रूण सुरक्षितपणे गोठवून ठेवलेले आहेत. डॉ. मेहता तुमच्याशी फ्रोझन एम्ब्रियो ट्रान्सफरमध्ये त्यांचा वापर करण्याबद्दल बोलतील; त्यासाठी पुन्हा इंजेक्शन्सची गरज नसते. आमच्या समुपदेशक रितू मल्होत्रा तुम्हाला कसे वाटते आहे आणि खर्चाबद्दल तुमच्याशी बोलण्यासाठी उपलब्ध आहेत. तुम्ही कधीही या नंबरवर आम्हाला संदेश पाठवू शकता.', // TODO: native-speaker review
};

// ---------------------------------------------------------------------------
// Priya's brief on Doctor's Day (after the call)
export const PRIYA_BRIEF = 'Review after second negative ICSI; 2 blastocysts vitrified; cost concern';

// ---------------------------------------------------------------------------
// §10.2 Live event copy

export const OHSS_BANNER =
  "Pooja Reddy reported abdominal bloating and breathlessness on WhatsApp (3 days post-OPU). Possible OHSS. Assigned to Lata D'Souza — call now.";

export const POOJA_OHSS_MSG: Message = {
  id: 'M-25143-9',
  channel: 'WhatsApp',
  direction: 'Inbound',
  sentBy: 'Pooja Reddy',
  at: '2026-10-12T09:12',
  textOriginal:
    'Since last night my stomach is very bloated and tight, and I feel breathless when I lie down. Passed very little urine this morning. Is this normal after egg collection?',
  status: 'Unanswered',
  highlight: true,
};

export const ANJALI_ESCALATION_NOTE = 'Not checked in for 08:30 scan. Day 8 of stimulation.';

// ---------------------------------------------------------------------------
// Patient app (Priya's phone) — interface strings

export const PHONE_UI = {
  English: {
    chat: 'Chat',
    journey: 'My journey',
    verified: 'Verified business',
    online: 'Usually replies within an hour',
    today: 'Today',
    youAreHere: 'You are here',
    nextAppointment: 'Your next appointment',
    noAppointment: 'No appointment booked yet. We will call you to find a time that suits you.',
    embryos: '2 embryos safely stored',
    embryosDetail: 'Frozen in September 2026 from your August treatment. They can be used in a frozen embryo transfer without new injections.',
    ask: 'Ask a question',
    typeMessage: 'Type a message',
    withDoctor: 'Review with Dr. Mehta',
    counsellor: 'Then a conversation with Ritu Malhotra, counsellor',
    steps: ['First visit', 'Tests', 'Treatment plan', 'Treatment', 'Review with your doctor', 'Next step together'],
    greeting: 'Hello Priya',
    journeyIntro: 'Here is where you are in your care with us.',
  },
  Marathi: {
    chat: 'गप्पा', // TODO: native-speaker review
    journey: 'माझा प्रवास', // TODO: native-speaker review
    verified: 'सत्यापित व्यवसाय', // TODO: native-speaker review
    online: 'साधारणपणे एका तासात उत्तर देतात', // TODO: native-speaker review
    today: 'आज', // TODO: native-speaker review
    youAreHere: 'तुम्ही इथे आहात', // TODO: native-speaker review
    nextAppointment: 'तुमची पुढील भेट', // TODO: native-speaker review
    noAppointment: 'अजून भेट ठरलेली नाही. तुमच्या सोयीची वेळ ठरवण्यासाठी आम्ही तुम्हाला फोन करू.', // TODO: native-speaker review
    embryos: '२ भ्रूण सुरक्षितपणे साठवलेले', // TODO: native-speaker review
    embryosDetail: 'ऑगस्टमधील उपचारातून सप्टेंबर २०२६ मध्ये गोठवलेले. नवीन इंजेक्शन्सशिवाय फ्रोझन एम्ब्रियो ट्रान्सफरमध्ये वापरता येतात.', // TODO: native-speaker review
    ask: 'प्रश्न विचारा', // TODO: native-speaker review
    typeMessage: 'संदेश लिहा', // TODO: native-speaker review
    withDoctor: 'डॉ. मेहता यांच्यासोबत भेट', // TODO: native-speaker review
    counsellor: 'त्यानंतर समुपदेशक रितू मल्होत्रा यांच्याशी संवाद', // TODO: native-speaker review
    steps: ['पहिली भेट', 'तपासण्या', 'उपचार योजना', 'उपचार', 'डॉक्टरांसोबत आढावा', 'पुढचे पाऊल एकत्र'], // TODO: native-speaker review
    greeting: 'नमस्कार प्रिया', // TODO: native-speaker review
    journeyIntro: 'आमच्यासोबतच्या तुमच्या उपचारात तुम्ही इथे आहात.', // TODO: native-speaker review
  },
} as const;
