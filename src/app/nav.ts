import {
  Activity,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Plug,
  Smartphone,
  Snowflake,
  Stethoscope,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { SectionId } from './roles';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_SECTIONS: Record<SectionId, { label: string; items: NavItem[] }> = {
  today: {
    label: 'Today',
    items: [
      { to: '/', label: 'Command Centre', icon: LayoutDashboard },
      { to: '/worklist', label: 'Worklist', icon: ClipboardList },
      { to: '/doctor', label: "Doctor's Day", icon: Stethoscope },
    ],
  },
  patients: {
    label: 'Patients',
    items: [
      { to: '/patients', label: 'Directory', icon: Users },
      { to: '/cryo', label: 'Cryo-Storage', icon: Snowflake },
    ],
  },
  insights: {
    label: 'Insights',
    items: [{ to: '/analytics', label: 'Analytics', icon: BarChart3 }],
  },
  setup: {
    label: 'Setup',
    items: [
      { to: '/integrations', label: 'Integrations', icon: Plug },
      { to: '/rules', label: 'Follow-up Rules', icon: Workflow },
    ],
  },
  patientView: {
    label: 'Patient view',
    items: [{ to: '/patient-app', label: 'Patient app', icon: Smartphone }],
  },
};

export const BRAND_ICON = Activity;
