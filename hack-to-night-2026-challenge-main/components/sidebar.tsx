'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const LayoutGrid = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
  </svg>
)

const Settings = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const HelpCircle = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Sidebar() {
  const pathname = usePathname()
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const menuItems = [
    { label: 'DASHBOARD', path: '/dashboard' },
    { label: 'ACCOUNTS', path: '/bank-accounts' },
    { label: 'BANK TRANSFER', path: '/bank-transfer' },
    { label: 'PAY BILLS', path: '/pay-bills' },
    { label: 'SMART SPEND', path: '/smart-spend' },
    { label: 'E-STATEMENT', path: '/e-statement' },
    { label: 'SETTINGS', path: '/settings' }
  ]

  return (
    <aside className="w-full md:w-[280px] bg-[#0f0f11] flex flex-col justify-between shrink-0 h-auto md:h-screen sticky top-0 z-50">
      <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar">
        {/* Logo */}
        <div className="flex items-center gap-3 px-8 pt-10 pb-12">
          <div className="bg-[#ff5a1f] p-2 rounded-[10px] shrink-0 shadow-lg shadow-[#ff5a1f]/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
          <h1 className="text-xl font-extrabold tracking-wide text-white">Nova<span className="text-[#a0a0a0] font-medium">Bank</span></h1>
        </div>

        {/* Menu */}
        <nav className="flex flex-row md:flex-col gap-3 px-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 hide-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link key={item.label} href={item.path} className="no-underline shrink-0">
                <button 
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 text-[12px] font-bold tracking-[0.05em] uppercase
                    ${isActive 
                      ? 'bg-[#ff5a1f] text-white shadow-[0_4px_14px_rgba(255,90,31,0.25)]' 
                      : 'text-[#8a8a8a] hover:text-white hover:bg-white/5'
                    }`}
                >
                  {item.label === 'DASHBOARD' && <LayoutGrid size={16} />}
                  {item.label === 'SETTINGS' && <Settings size={16} />}
                  {item.label}
                </button>
              </Link>
            )
          })}
        </nav>

        {/* Promo Card */}
        <div className="hidden md:block px-6 mt-8 mb-6">
          <div className="relative overflow-hidden rounded-[18px] p-[1px] group">
            {/* Animated glowing border */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a1f] via-purple-600 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Card Content */}
            <div className="relative bg-[#0f0f11] rounded-[17px] p-5 h-full overflow-hidden">
              {/* Inner glowing blob */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff5a1f]/20 rounded-full blur-[30px] group-hover:bg-[#ff5a1f]/30 transition-colors duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff5a1f] to-purple-600 mb-3 flex items-center justify-center shadow-lg shadow-[#ff5a1f]/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                
                <h4 className="text-white text-[14px] font-extrabold mb-1.5 leading-snug tracking-wide">
                  Unlock more with NovaBank benefits
                </h4>
                
                <p className="text-[#8a8a8a] text-[10px] mb-4 leading-relaxed font-medium">
                  Experience premium banking without limits. Get exclusive rewards today.
                </p>
                
                <button 
                  onClick={() => setActiveModal('upgrade')}
                  className="w-full relative group/btn overflow-hidden rounded-[10px] bg-white/5 border border-white/10 text-white text-[11px] font-bold py-2.5 transition-all hover:border-[#ff5a1f]/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff5a1f] to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-1.5 tracking-wider">
                    UPGRADE NOW
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/btn:translate-x-1"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex gap-6 px-10 pb-10 pt-6 text-[#8a8a8a] items-center border-t border-white/5">
        <button onClick={() => setActiveModal('settings')} className="hover:text-white transition-colors"><Settings size={22} /></button>
        <button onClick={() => setActiveModal('help')} className="hover:text-white transition-colors"><HelpCircle size={22} /></button>
      </div>

      {/* Global Sidebar Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setActiveModal(null)}
          ></div>
          <div className="relative bg-[#17171a] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 fade-in duration-200 text-center">
            <div className="absolute top-4 right-4 cursor-pointer text-[#8a8a8a] hover:text-white" onClick={() => setActiveModal(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            
            {activeModal === 'upgrade' && (
              <>
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#ff5a1f] to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#ff5a1f]/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Premium Upgrade</h3>
                <p className="text-[#8a8a8a] text-sm mb-6">Redirecting to our secure payment gateway to process your premium subscription...</p>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Continue
                </button>
              </>
            )}

            {activeModal === 'settings' && (
              <>
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <Settings size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Settings</h3>
                <p className="text-[#8a8a8a] text-sm mb-6">The settings module is currently under maintenance. Please try again later.</p>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Close
                </button>
              </>
            )}

            {activeModal === 'help' && (
              <>
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <HelpCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Help & Support</h3>
                <p className="text-[#8a8a8a] text-sm mb-6">Our support agents are currently busy. Please leave a message and we'll get back to you.</p>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Chat with Us
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </aside>
  )
}
