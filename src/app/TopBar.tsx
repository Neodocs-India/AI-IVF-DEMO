import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Search } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUi } from '@/store/ui';
import { clock, longDate } from '@/lib/format';
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
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded py-1 pl-1 pr-2 text-left hover:bg-mist">
        <Avatar name={role.persona} tone={role.id === 'patient' ? 'saffron' : 'lagoon'} size={30} />
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

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-paper/95 px-6 backdrop-blur">
      <label className="relative flex w-full max-w-md items-center">
        <span className="sr-only">Search patients</span>
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate" />
        <input
          type="search"
          placeholder="Search patients by name, ID or phone"
          className="h-9 w-full rounded border border-line bg-mist pl-9 pr-3 text-sm text-ink placeholder:text-slate focus:border-lagoon focus:bg-paper focus:outline-none focus-visible:ring-0"
        />
      </label>

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
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded text-slate hover:bg-mist hover:text-ink"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <RoleSwitcher />
      </div>
    </header>
  );
}
