export type RoleId = 'director' | 'navigator' | 'doctor' | 'embryologist' | 'patient';

export interface RoleDef {
  id: RoleId;
  label: string;
  persona: string;
  /** How the greeting addresses this persona */
  greetingName: string;
  landing: string;
  /** Sidebar section order for this role — every section stays reachable (§4). */
  sectionOrder: SectionId[];
}

export type SectionId = 'today' | 'patients' | 'insights' | 'setup' | 'patientView';

export const ROLES: RoleDef[] = [
  { id: 'director', label: 'Medical Director', persona: 'Dr. Anil Mehta', greetingName: 'Dr. Mehta', landing: '/', sectionOrder: ['today', 'patients', 'insights', 'setup', 'patientView'] },
  { id: 'navigator', label: 'Fertility Navigator', persona: 'Sneha Pawar', greetingName: 'Sneha', landing: '/worklist', sectionOrder: ['today', 'patients', 'patientView', 'insights', 'setup'] },
  { id: 'doctor', label: 'Doctor', persona: 'Dr. Anil Mehta', greetingName: 'Dr. Mehta', landing: '/doctor', sectionOrder: ['today', 'patients', 'insights', 'patientView', 'setup'] },
  { id: 'embryologist', label: 'Embryologist', persona: 'Dr. Farhan Qureshi', greetingName: 'Dr. Qureshi', landing: '/cryo', sectionOrder: ['patients', 'today', 'insights', 'setup', 'patientView'] },
  { id: 'patient', label: 'Patient (phone)', persona: 'Priya Deshmukh', greetingName: 'Priya', landing: '/patient-app', sectionOrder: ['patientView', 'today', 'patients', 'insights', 'setup'] },
];

export const roleById = (id: RoleId) => ROLES.find((r) => r.id === id)!;
