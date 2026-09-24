// Combines hand-authored heroes with the deterministic background patients.
import type { Appointment, Patient, ScheduleItem } from './types';
import { HEROES } from './heroes';
import { generateBackground, tuneValue } from './generate';
import { valueAtRisk } from '@/lib/selectors';

export interface Dataset {
  patients: Patient[];
  appointments: Appointment[];
  schedule: ScheduleItem[];
}

function build(): Dataset {
  const bg = generateBackground();
  const heroes: Patient[] = structuredClone(HEROES);
  const patients = [...heroes, ...bg.patients];
  tuneValue(patients, valueAtRisk(patients));
  return { patients, appointments: bg.appointments, schedule: bg.schedule };
}

export const SEED: Dataset = build();

/** A fresh, deep copy of the initial dataset (used by the store and by reset). */
export const freshDataset = (): Dataset => structuredClone(SEED);
