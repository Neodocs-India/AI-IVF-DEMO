import { Link } from 'react-router-dom';
import type { Patient } from '@/data/types';
import { cn } from '@/lib/utils';

export function PatientName({ patient, link = true, className, partner = true }: { patient: Patient; link?: boolean; className?: string; partner?: boolean }) {
  const name = (
    <span className={cn('font-serif text-base font-medium text-ink', link && 'hover:text-lagoon', className)}>{patient.name}</span>
  );
  return (
    <span className="min-w-0">
      {link ? <Link to={`/patients/${patient.id}`}>{name}</Link> : name}
      {partner && patient.partner && <span className="block truncate text-xs text-slate">with {patient.partner.name.split(' ')[0]} · {patient.age} y</span>}
      {partner && !patient.partner && <span className="block truncate text-xs text-slate">{patient.age} y</span>}
    </span>
  );
}
