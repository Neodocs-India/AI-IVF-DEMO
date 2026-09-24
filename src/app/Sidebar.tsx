import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CLINIC } from '@/data/constants';
import { useUi } from '@/store/ui';
import { roleById } from './roles';
import { NAV_SECTIONS } from './nav';

function Wordmark() {
  return (
    <div className="flex items-center gap-3 px-5 pb-6 pt-5">
      {/* A miniature journey rail: the product's signature mark. */}
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <line x1="3" y1="17" x2="25" y2="17" stroke="#5B6B7C" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="17" r="3" fill="#0D7377" />
        <circle cx="14" cy="17" r="3" fill="#0D7377" />
        <circle cx="22" cy="17" r="3" fill="none" stroke="#D9971E" strokeWidth="1.5" />
      </svg>
      <div className="leading-tight">
        <div className="font-serif text-lg font-medium text-white">Anvaya</div>
        <div className="text-xs text-slate-300">Fertility navigation</div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const role = useUi((s) => roleById(s.role));

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-sidebar flex-col bg-ink text-slate-300">
      <Wordmark />
      <nav className="flex-1 overflow-y-auto px-3" aria-label="Main">
        {role.sectionOrder.map((sectionId) => {
          const section = NAV_SECTIONS[sectionId];
          return (
            <div key={sectionId} className="mb-5">
              <div className="px-2 pb-1.5 text-xs text-slate-400">{section.label}</div>
              <ul className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded px-2 py-2 text-sm transition-colors',
                          isActive ? 'bg-ink-700 text-white' : 'hover:bg-ink-800 hover:text-white',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            aria-hidden
                            className={cn(
                              'absolute -left-3 top-1.5 bottom-1.5 w-[3px] rounded-r bg-lagoon transition-opacity',
                              isActive ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <Icon className={cn('h-4 w-4', isActive ? 'text-lagoon-100' : 'text-slate-400 group-hover:text-slate-300')} />
                          {label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-ink-700 px-5 py-4 text-xs leading-relaxed text-slate-400">
        {CLINIC.name}
        <br />
        {CLINIC.area}
      </div>
    </aside>
  );
}
