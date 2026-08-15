'use client'
import Link from 'next/link'
import { Activity, BarChart3, ChevronRight, FlaskConical, LayoutDashboard, Menu, Play, ShieldAlert, SlidersHorizontal, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const titles: Record<string, string> = {
  '/dashboard': 'Command Center',
  '/telemetry': 'Telemetry',
  '/anomalies': 'Anomalies',
  '/simulator': 'What-if Simulator',
  '/reports': 'Reports'
}

export function AppShell({
  children,
  anomaliesCount = 0,
}: Readonly<{ children: React.ReactNode; anomaliesCount?: number }>) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navigation = [
    { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { href: '/telemetry', label: 'Telemetry', icon: Activity },
    { href: '/anomalies', label: 'Anomalies', icon: ShieldAlert, badge: anomaliesCount > 0 ? String(anomaliesCount) : undefined },
    { href: '/simulator', label: 'Simulator', icon: SlidersHorizontal },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen flex">
      {open && (
        <button 
          className="fixed inset-0 bg-black/60 border-0 z-[9] lg:hidden w-full h-full cursor-pointer" 
          aria-label="Close navigation" 
          onClick={() => setOpen(false)} 
        />
      )}
      
      <aside className={`w-[264px] min-h-screen shrink-0 p-[26px_15px_16px] bg-[#12181b] border-r border-surface-line fixed inset-y-0 left-0 flex flex-col z-10 transition-transform duration-200 ${open ? 'translate-x-0 shadow-[8px_0_30px_#0008]' : '-translate-x-full'} lg:translate-x-0 lg:shadow-none`}>
        <div className="flex items-center gap-[11px] px-[10px] pb-[30px]">
          <div className="w-[35px] h-[35px] grid place-items-center rounded-[9px] bg-status-teal/20 text-status-teal">
            <FlaskConical size={20} />
          </div>
          <div>
            <strong className="block text-[17px]">Coolara</strong>
            <span className="block text-content-muted text-[11px] mt-[2px]">Sustainability Guardian</span>
          </div>
          <button 
            className="ml-auto bg-transparent border-0 text-content-base p-1 lg:hidden rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal transition-colors hover:text-white" 
            aria-label="Close sidebar" 
            onClick={() => setOpen(false)}
          >
            <X size={19} />
          </button>
        </div>
        
        <nav className="grid gap-1">
          {navigation.map(({ href, label, icon: Icon, badge }) => (
            <Link 
              onClick={() => setOpen(false)} 
              className={`h-[44px] px-[11px] flex items-center gap-[12px] rounded-[7px] relative transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal ${pathname === href ? 'text-white bg-[#20292d]' : 'text-[#aeb9bc] hover:bg-[#1a2226] hover:text-white'}`} 
              href={href} 
              key={href}
            >
              {pathname === href && (
                <div className="absolute left-[-15px] w-[3px] h-[22px] bg-status-teal rounded-[4px]" />
              )}
              <Icon size={18} />
              <span>{label}</span>
              {badge && (
                <em
                  className="ml-auto not-italic text-surface-bg bg-status-red min-w-[20px] text-center leading-[20px] rounded-[10px] text-[11px] font-bold"
                  aria-label={`${badge} recent finding${badge === '1' ? '' : 's'}`}
                >
                  {badge}
                </em>
              )}
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto">
          <div className="text-[#bdc7c9] border border-surface-line text-[11px] p-2 rounded-[6px] flex items-center gap-[6px]">
            <FlaskConical size={14} /> Synthetic data
          </div>
          <div className="p-[18px_4px_5px] flex items-center gap-[9px] text-content-muted">
            <div className="w-[29px] h-[29px] grid place-items-center rounded-full text-[#182023] bg-[#cbd7d5] text-[10px] font-bold">
              MD
            </div>
            <div>
              <strong className="text-[12px] block text-content-base">Operations team</strong>
              <span className="block text-[11px] mt-[2px]">DC-01 · Jakarta</span>
            </div>
            <ChevronRight className="ml-auto" size={16} />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 lg:ml-[264px] w-full">
        <header className="min-h-[70px] px-4 sm:px-6 lg:px-[42px] border-b border-surface-line flex items-center justify-between gap-5">
          <button 
            className="bg-transparent border-0 text-content-base p-1 lg:hidden rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal transition-colors hover:text-white" 
            aria-label="Open sidebar" 
            aria-expanded={open} 
            onClick={() => setOpen(true)}
          >
            <Menu size={21} />
          </button>
          
          <div className="text-content-muted hidden sm:flex gap-2 items-center text-[12px]">
            Operations <ChevronRight size={14} /> <strong className="text-content-base">{titles[pathname] ?? 'Coolara'}</strong>
          </div>
          
          <div className="flex items-center gap-[18px] ml-auto sm:ml-0">
            <span className="text-[11px] text-[#b1c1bd] hidden sm:flex items-center gap-[6px]">
              <i className="w-[7px] h-[7px] rounded-full bg-status-teal" /> Stream simulated
            </span>
            <span className="text-[11px] text-content-muted hidden sm:block">Updated 10:42 WIB</span>
            <Link 
              className="border-0 rounded-[6px] bg-status-teal text-[#10201f] font-bold inline-flex items-center justify-center gap-[7px] px-[11px] py-[8px] text-[12px] hover:bg-[#5bd5c6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg" 
              href="/simulator"
            >
              <Play size={14} fill="currentColor" /> Run simulation
            </Link>
          </div>
        </header>
        
        <div className="p-[22px_16px_42px] lg:p-[35px_42px_52px] max-w-[1530px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
