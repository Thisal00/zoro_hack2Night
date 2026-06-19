'use client'

import Sidebar from '../../components/sidebar'
import { Bell, Search } from '../../components/Icons'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import FaceScanModal from '../../components/FaceScanModal'

type Transaction = {
  id: string;
  date: string;
  account: string;
  amount: string;
  type: 'incoming' | 'outgoing';
};

const initialTransactions: Transaction[] = [
  { id: '1', date: 'Oct 16, 2025', account: 'Apple Services', amount: '-Rs. 4,500.00', type: 'outgoing' },
  { id: '2', date: 'Oct 15, 2025', account: 'Salary Deposit', amount: '+Rs. 150,000.00', type: 'incoming' },
  { id: '3', date: 'Oct 14, 2025', account: 'Uber Rides', amount: '-Rs. 2,100.00', type: 'outgoing' },
];

const mockAccounts: Record<string, string> = {
  '100245678901': 'Kasun Perera',
  '123456789012': 'Nimali Fernando',
  '987654321098': 'Kamal Silva',
  '888899990000': 'NovaBank Support',
};

export default function Dashboard() {
  const router = useRouter();

  // Core State
  const [balance, setBalance] = useState<number>(245000);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAccount, setTransferAccount] = useState('');
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [showFaceScan, setShowFaceScan] = useState(false);

  // Sync Balance and Transactions with PostgreSQL
  useEffect(() => {
    fetch(`/api/accounts?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.accounts) {
          const mainAcc = data.accounts.find((a: any) => a.account_number === '1000003423')
          if (mainAcc) setBalance(Number(mainAcc.balance))
        }
      })
      .catch(err => console.error('Failed to fetch balance', err))

    fetch(`/api/transactions?account=1000003423&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.transactions) {
          const mapped: Transaction[] = data.transactions.slice(0, 5).map((row: any) => ({
            id: String(row.id),
            date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            account: row.description || 'Transfer',
            amount: (row.from_account === '1000003423' ? '-Rs. ' : '+Rs. ') + Number(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }),
            type: row.from_account === '1000003423' ? 'outgoing' : 'incoming'
          }))
          setTransactions(mapped)
        }
      })
      .catch(err => console.error('Failed to fetch transactions', err))
  }, []);

  // UI Interactivity State
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for scrolling and focus
  const quickTransferRef = useRef<HTMLDivElement>(null);
  const transferInputRef = useRef<HTMLInputElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTransferAccount(val);
    const cleanVal = val.replace(/\s/g, '');
    if (mockAccounts[cleanVal]) {
      setRecipientName(mockAccounts[cleanVal]);
    } else {
      setRecipientName(null);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0 || amount > balance) return;
    
    // Show face scan modal before executing
    setShowFaceScan(true);
  };

  const executeTransfer = async () => {
    setShowFaceScan(false);
    const amount = parseFloat(transferAmount.replace(/,/g, ''));
    
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccount: '1000003423',
          toAccount: transferAccount,
          amount: amount,
          description: `Quick Transfer to ${recipientName || transferAccount}`,
          userId: 1
        })
      })
      const data = await res.json()
      if (data.ok) {
        setBalance(prev => prev - amount);
        
        const newTx: Transaction = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          account: recipientName || transferAccount || 'Quick Transfer',
          amount: `-Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          type: 'outgoing'
        };
        
        setTransactions(prev => [newTx, ...prev].slice(0, 5));
        setTransferAmount('');
        setTransferAccount('');
        setRecipientName(null);
      }
    } catch (err) {
      console.error(err)
    }
  };

  const handleSendMoneyClick = () => {
    quickTransferRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      transferInputRef.current?.focus();
    }, 600);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f0f11] font-sans selection:bg-[#ff5a1f] selection:text-white relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" }}
      ></div>
      <div className="fixed inset-0 z-0 bg-black/85 backdrop-blur-[2px]"></div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 relative z-10 h-screen overflow-y-auto custom-scrollbar scroll-smooth">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-10 relative">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Overview</h1>
            <p className="text-[#8a8a8a] text-sm">Welcome back, Dilara! Here is your financial summary.</p>
          </div>
          <div className="flex items-center gap-6 mt-1">
            
            {/* Search */}
            <div className="relative flex items-center">
              <button 
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="text-[#8a8a8a] hover:text-white transition-colors relative z-10"
              >
                <Search size={20} />
              </button>
              <div className={`absolute right-0 transition-all duration-300 ease-in-out \${isSearchExpanded ? 'w-48 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..." 
                  className="w-full bg-[#17171a] border border-white/10 rounded-full py-1.5 pl-3 pr-10 text-white text-xs focus:outline-none focus:border-[#ff5a1f]"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifDropdownRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="text-[#8a8a8a] hover:text-white transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff5a1f] rounded-full border-2 border-[#111]"></span>
              </button>
              {/* Notif Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-[#17171a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-white/5">
                    <h4 className="text-white text-sm font-bold">Notifications</h4>
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                      <p className="text-white text-xs font-semibold">New Device Login</p>
                      <p className="text-[#8a8a8a] text-[10px] mt-0.5">Windows PC from Colombo</p>
                    </div>
                    <div className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                      <p className="text-white text-xs font-semibold">Salary Deposited</p>
                      <p className="text-[#8a8a8a] text-[10px] mt-0.5">+Rs. 150,000.00 added to account</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-white/5 text-center mt-1">
                    <button className="text-[#ff5a1f] text-xs font-semibold hover:underline">Mark all as read</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-10 h-10 rounded-full border border-white/20 overflow-hidden cursor-pointer hover:border-[#ff5a1f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/50"
              >
                <img src="https://i.pravatar.cc/150?u=dilara" alt="profile" className="w-full h-full object-cover" />
              </button>
              
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#17171a] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-white/5 mb-1">
                    <p className="text-white text-sm font-bold">Dilara W.</p>
                    <p className="text-[#8a8a8a] text-xs">demo@novabank.lk</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors">My Profile</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors">Security</button>
                  <div className="h-[1px] bg-white/5 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/5 transition-colors font-medium">Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Top Grid Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Virtual Card (Spans 1 column) */}
          <div className="relative h-[220px] rounded-3xl overflow-hidden p-6 shadow-2xl group border border-white/5 bg-gradient-to-br from-[#3b211a] via-[#2a110a] to-[#151515] hover:border-[#ff5a1f]/30 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(255,90,31,0.15)]">
            <div className="relative z-10 flex flex-col justify-between h-full w-full">
              <div className="flex justify-between items-center w-full">
                <span className="text-white font-semibold tracking-widest text-xs uppercase">NOVACARD PLATINUM</span>
                <div className="flex items-center relative w-10 h-6">
                  <div className="absolute right-4 w-6 h-6 rounded-full bg-white z-10 opacity-90"></div>
                  <div className="absolute right-0 w-6 h-6 rounded-full bg-[#ff5a1f] z-20 mix-blend-multiply opacity-90"></div>
                </div>
              </div>
              
              <div className="font-mono text-2xl tracking-[0.2em] text-white">
                **** **** **** 3423
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#8a8a8a] mb-1 font-bold">CARD HOLDER</p>
                  <p className="text-sm font-medium text-white">Dilara W.</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#8a8a8a] mb-1 font-bold">EXPIRES</p>
                  <p className="text-sm font-medium text-white">12/28</p>
                </div>
              </div>
            </div>
          </div>

          {/* Balance (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-[#17171a] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/5 hover:-translate-y-1.5 transition-all duration-500 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group">
            {/* Subtle background glow on hover */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5a1f]/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-start gap-6">
              <div>
                <p className="text-white text-[11px] font-bold uppercase tracking-wider mb-2">TOTAL BALANCE</p>
                <h2 className="text-4xl md:text-[40px] font-bold text-white tracking-tight" style={{ color: 'white' }}>
                  Rs. {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsReceiveModalOpen(true)}
                  className="bg-[#2a2a2d] hover:bg-[#333] text-white px-6 py-2.5 rounded-[10px] text-sm font-medium transition-colors border border-white/5 active:scale-95"
                >
                  Receive
                </button>
                <button 
                  onClick={handleSendMoneyClick}
                  className="bg-[#ff5a1f] hover:bg-[#e64a15] text-white px-6 py-2.5 rounded-[10px] text-sm font-medium transition-colors shadow-lg shadow-[#ff5a1f]/20 active:scale-95"
                >
                  Send Money
                </button>
              </div>
            </div>

            {/* Mock Chart Labels */}
            <div className="relative z-10 w-full flex justify-between mt-12 px-2 border-t border-white/5 pt-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <span key={i} className="text-[10px] text-[#666] font-medium">{day}</span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Grid Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Transfer Form (1 column) */}
          <div ref={quickTransferRef} className="bg-[#17171a] rounded-3xl p-8 shadow-2xl border border-white/5 h-[380px] scroll-mt-6 hover:-translate-y-1.5 transition-all duration-500 hover:border-[#ff5a1f]/20 hover:shadow-[0_10px_40px_rgba(255,90,31,0.05)]">
            <h3 className="text-[17px] font-bold text-white mb-8">Quick Transfer</h3>
            <form onSubmit={handleTransfer} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider font-bold">RECIPIENT ACCOUNT</label>
                <input 
                  ref={transferInputRef}
                  type="text" 
                  value={transferAccount}
                  onChange={handleAccountChange}
                  placeholder="e.g. 1002 4567 8901"
                  className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#ff5a1f] transition-all placeholder:text-[#444]"
                  required
                />
                {recipientName && (
                  <p className="text-[12px] text-[#ff5a1f] mt-2 flex items-center gap-1.5 font-medium animate-in fade-in">
                    {recipientName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider font-bold">AMOUNT (RS.)</label>
                <input 
                  type="number" 
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  max={balance}
                  step="0.01"
                  className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#ff5a1f] transition-all placeholder:text-[#444]"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-medium py-3.5 rounded-xl transition-all transform active:scale-[0.98] mt-4 flex justify-center items-center gap-2"
              >
                Send Now
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>

          {/* Recent Transactions (2 columns) */}
          <div className="lg:col-span-2 bg-[#17171a] rounded-3xl p-8 shadow-2xl border border-white/5 flex flex-col h-[380px] hover:-translate-y-1.5 transition-all duration-500 hover:border-white/10 group">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-[17px] font-bold text-white">Recent Transactions</h3>
              <button 
                onClick={() => router.push('/e-statement')}
                className="text-[12px] text-[#ff5a1f] font-bold transition-colors uppercase tracking-wider hover:underline"
              >
                View All
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
              {transactions.length === 0 ? (
                <p className="text-[#666] text-center py-10">No recent transactions.</p>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className={"w-10 h-10 rounded-full flex items-center justify-center " + (t.type === 'incoming' ? 'bg-[#1b2a1e]' : 'bg-[#2a1b1b]')}>
                        {t.type === 'incoming' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-white mb-0.5">{t.account}</p>
                        <p className="text-[11px] text-[#666]">{t.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={"text-[15px] font-bold mb-0.5 " + (t.type === 'incoming' ? 'text-[#22c55e]' : 'text-white')}>
                        {t.amount}
                      </p>
                      <p className="text-[9px] text-[#666] uppercase tracking-wider">COMPLETED</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Receive Funds Modal */}
      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsReceiveModalOpen(false)}
          ></div>
          <div className="relative bg-[#17171a] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <div className="absolute top-4 right-4 cursor-pointer text-[#8a8a8a] hover:text-white" onClick={() => setIsReceiveModalOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Receive Funds</h3>
              <p className="text-[#8a8a8a] text-xs">Share these details to receive money</p>
            </div>

            <div className="bg-[#0f0f11] rounded-xl p-6 flex items-center justify-center mb-6 border border-white/5">
              {/* Dummy QR Code using a generic placeholder or CSS blocks */}
              <div className="w-32 h-32 bg-white rounded p-2 relative">
                <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=1000003423')] bg-contain"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mb-0.5 font-bold">Account Name</p>
                  <p className="text-white text-sm font-semibold">Dilara W.</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mb-0.5 font-bold">Account Number</p>
                  <p className="text-white text-sm font-mono tracking-widest">1000 0034 23</p>
                </div>
                <button 
                  className="text-[#ff5a1f] hover:text-[#e64a15] text-xs font-bold uppercase tracking-wider"
                  onClick={() => {
                    navigator.clipboard.writeText('1000003423');
                    alert('Copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setIsReceiveModalOpen(false)}
              className="w-full mt-6 bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Face Scan Modal */}
      {showFaceScan && (
        <FaceScanModal 
          onScanSuccess={executeTransfer} 
          onCancel={() => setShowFaceScan(false)} 
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  )
}
