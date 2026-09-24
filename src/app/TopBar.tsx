import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Keyboard, Search } from 'lucide-react';
import * as DM from '@radix-ui/react-dropdown-menu';
import { Avatar } from '@/components/Avatar';
import { StageChip } from '@/components/Badges';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUi } from '@/store/ui';
import { useDemo } from '@/store/demo';
import { clock, longDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ROLES, roleById, type RoleId } from './roles';

function RoleSwitcher() {
  const navigate = useNavigate();
  const roleId = useUi((s) => s.role);
  const setRole = useUi((s) => s.setRole);
  const role = roleById(roleId);

  const onChange = (value: string) => {
    const next = roleById(value as RoleId);
    setRole(next.id);
    navigate(next.landing);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded py-1 pl-1 pr-2 text-left hover:bg-mist" data-tour="role-switcher">
        <Avatar name={role.persona} tone={role.id === 'patient' ? 'saffron' : role.id === 'navigator' ? 'saffron' : role.id === 'embryologist' ? 'ink' : 'lagoon'} size={30} />
        <span className="hidden whitespace-nowrap leading-tight lg:block">
          <span className="block text-sm font-medium text-ink">{role.persona}</span>
          <span className="block text-xs text-slate">{role.label}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>View Anvaya as</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={roleId} onValueChange={onChange}>
          {ROLES.map((r) => (
            <DropdownMenuRadioItem key={r.id} value={r.id}>
              <span className="leading-tight">
                <span className="block">{r.label}</span>
                <span className="block text-xs text-slate">{r.persona}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PatientSearch() {
  const patients = useDemo((s) => s.patients);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const digits = t.replace(/\D/g, '');
    return patients
      .filter((p) => p.name.toLowerCase().includes(t) || p.id.toLowerCase().includes(t) || p.partner?.name.toLowerCase().includes(t) || (digits.length >= 3 && p.phoneMasked.replace(/\D/g, '').endsWith(digits)))
      .slice(0, 7);
  }, [q, patients]);

  const go = (id: string) => {
    navigate(`/patients/${id}`);
    setQ('');
    ref.current?.blur();
  };

  return (
    <div className="relative w-full max-w-md">
      <label className="relative flex items-center">
        <span className="sr-only">Search patients</span>
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate" />
        <input
          ref={ref}
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setIdx(0); }}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
            if (e.key === 'Enter' && results[idx]) go(results[idx]!.id);
            if (e.key === 'Escape') { setQ(''); ref.current?.blur(); }
          }}
          placeholder="Search patients by name, ID or phone"
          className="h-9 w-full rounded border border-line bg-mist pl-9 pr-3 text-sm text-ink placeholder:text-slate focus:border-lagoon focus:bg-paper focus:outline-none focus-visible:ring-0"
        />
      </label>
      {focus && q && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded border border-line bg-paper shadow-pop">
          {results.length ? (
            <ul>
              {results.map((p, i) => (
                <li key={p.id}>
                  <button type="button" onMouseDown={() => go(p.id)} className={cn('flex w-full items-center justify-between gap-3 px-3 py-2 text-left', i === idx ? 'bg-mist' : 'hover:bg-mist')}>
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-[15px] text-ink">{p.name}</span>
                      <span className="num block text-xs text-slate">{p.id} · {p.phoneMasked}</span>
                    </span>
                    <StageChip stage={p.stage} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-slate">No patients match “{q}”.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const notifications = useDemo((s) => s.notifications);
  const markRead = useDemo((s) => s.markNotificationsRead);
  const unread = notifications.filter((n) => !n.read);
  const critical = unread.some((n) => n.tone === 'critical');
  return (
    <DM.Root onOpenChange={(o) => !o && markRead()}>
      <DM.Trigger className="relative flex h-9 w-9 items-center justify-center rounded text-slate hover:bg-mist hover:text-ink" aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`}>
        <Bell className="h-[18px] w-[18px]" />
        {unread.length > 0 && (
          <span className={cn('num absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white', critical ? 'bg-rose' : 'bg-lagoon')}>{unread.length}</span>
        )}
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="end" sideOffset={6} className="z-50 w-[380px] rounded border border-line bg-paper shadow-pop focus-visible:ring-0">
          <div className="border-b border-line px-4 py-2.5 text-sm font-semibold">Notifications</div>
          {notifications.length ? (
            <ul className="max-h-[420px] overflow-y-auto">
              {notifications.map((n) => (
                <DM.Item key={n.id} asChild>
                  <Link to={n.href ?? '#'} className="flex gap-3 border-b border-line px-4 py-3 outline-none last:border-0 hover:bg-mist focus:bg-mist">
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.tone === 'critical' ? 'bg-rose' : n.tone === 'positive' ? 'bg-sage' : n.tone === 'attention' ? 'bg-saffron' : 'bg-lagoon')} />
                    <span className="min-w-0">
                      <span className={cn('block text-sm', n.tone === 'critical' ? 'font-semibold text-rose' : 'text-ink', !n.read && 'font-medium')}>{n.title}</span>
                      {n.detail && <span className="block text-xs text-slate">{n.detail}</span>}
                      <span className="num block text-[11px] text-slate">{n.at.slice(11, 16)}</span>
                    </span>
                  </Link>
                </DM.Item>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-slate">Nothing new since 09:10.</p>
          )}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

export function TopBar() {
  const setShortcuts = useDemo((s) => s.setShortcutsOpen);
  return (
    <header className="flex h-16 items-center gap-4 border-b border-line bg-paper/95 px-6 backdrop-blur">
      <PatientSearch />
      <div className="ml-auto flex shrink-0 items-center gap-3 xl:gap-4">
        <span className="num hidden whitespace-nowrap text-xs text-slate xl:inline">
          {longDate()} · {clock()} IST
        </span>
        <span
          className="whitespace-nowrap rounded-full border border-saffron/40 bg-saffron-50 px-2.5 py-0.5 text-xs font-medium text-ink"
          title="All patients, staff and records shown are fictional."
        >
          Concept demo
        </span>
        <button type="button" onClick={() => setShortcuts(true)} className="hidden h-9 w-9 items-center justify-center rounded text-slate hover:bg-mist hover:text-ink 2xl:flex" aria-label="Keyboard shortcuts">
          <Keyboard className="h-[18px] w-[18px]" />
        </button>
        <Notifications />
        <RoleSwitcher />
      </div>
    </header>
  );
}
