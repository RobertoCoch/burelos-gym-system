import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface BottomNavProps {
  items: NavItem[];
}

export default function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-[26rem] p-2 sm:p-[9px] bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50">
      <ul className="flex justify-between items-center">
        {items.map((item) => (
          <li key={item.path} className="flex-1 flex justify-center">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                twMerge(
                  clsx(
                    'w-[95%] max-w-[3.75rem] sm:max-w-[4.5rem] aspect-square flex flex-col items-center justify-center rounded-xl sm:rounded-[1.25rem] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                    'hover:text-[#FFC107]/80',
                    isActive
                      ? 'bg-[#FFC107]/20 border border-[#FFC107]/30 text-[#FFC107] backdrop-blur-md -translate-y-5 sm:-translate-y-6 shadow-[0_0_20px_rgba(255,193,7,0.25)]'
                      : 'text-gray-400 translate-y-0 hover:bg-white/5'
                  )
                )
              }
            >
              <div className="text-[1.25rem] sm:text-2xl mb-0.5 sm:mb-1">
                {item.icon}
              </div>
              <span className="text-[8px] sm:text-[10px] font-bold tracking-wider uppercase">
                {item.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
