import type { RoleId } from './roles';

// Guided tour — follows the demo storyline, CLAUDE.md §12
export interface TourStep {
  title: string;
  hint: string;
  to: string;
  target?: string;
  role?: RoleId;
}

export const TOUR: TourStep[] = [
  { title: 'Command Centre', hint: '09:10 Monday. 37 overdue, ₹1.42 Cr of planned treatment waiting.', to: '/', target: 'attention', role: 'director' },
  { title: 'Worklist', hint: 'Priya is at the top: risk 82, negative result 29 days ago.', to: '/worklist?tab=overdue', target: 'priya-row', role: 'navigator' },
  { title: 'Patient record', hint: 'Two cycle loops, 2 embryos in storage, unanswered messages.', to: '/patients/P-24817', target: 'patient-journey' },
  { title: 'Log the call', hint: 'Log call, then Save and complete. Counts drop, risk falls.', to: '/worklist?tab=overdue&patient=P-24817', target: 'log-call', role: 'navigator' },
  { title: "Doctor's Day", hint: 'Priya at 16:30. Open the summary as it types out.', to: '/doctor', target: 'ai-summary', role: 'doctor' },
  { title: 'Patient’s phone', hint: 'The Marathi chat, the confirmation, Priya’s reply, and My journey.', to: '/patient-app', role: 'patient' },
  { title: 'Live events', hint: 'Press B for a beta result, then O for a critical OHSS alert.', to: '/', target: 'pipeline', role: 'director' },
  { title: 'Cryo-storage', hint: '42 without FET plans, 11 renewals, Kavita Iyer unreachable.', to: '/cryo', target: 'cryo-tiles', role: 'embryologist' },
  { title: 'Analytics', hint: 'Where patients are lost and why; navigator impact.', to: '/analytics', role: 'director' },
  { title: 'Integrations', hint: 'Works on top of your existing systems.', to: '/integrations', target: 'integrations' },
];
