import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { SyntheticDataBadge } from './SyntheticDataBadge';

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <Leaf className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            Coolara
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-50">
              Dashboard
            </Link>
            <Link href="/simulator" className="hover:text-slate-900 dark:hover:text-slate-50">
              Simulator
            </Link>
          </nav>
        </div>
        <SyntheticDataBadge />
      </div>
    </header>
  );
}
