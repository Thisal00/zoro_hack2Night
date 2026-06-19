'use client'

import Link from "next/link";
import { loginUser } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [authLoading, setAuthLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await loginUser(formData);
    if (result?.error) {
      alert(result.error);
    }
  };

  const handleOAuth = async (provider: string) => {
    setAuthLoading(provider);
    // Fake delay for realistic feeling
    await new Promise(resolve => setTimeout(resolve, 5000));
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 sm:p-8 font-sans selection:bg-[#ff5a1f] selection:text-white">
      
      <div className="w-full max-w-[1100px] min-h-[700px] flex flex-col md:flex-row bg-[#111111] rounded-[24px] overflow-hidden shadow-2xl border border-white/5">
        
        {/* Left Branding Pane (Image Background) */}
        <div className="hidden md:flex flex-col w-[45%] p-10 justify-between relative">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" }}
          ></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#111111]/80 via-[#111111]/60 to-[#111111]/90"></div>

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="text-white bg-[#ff5a1f] p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-wide text-white">Nova<span className="text-white/60">Bank</span></span>
          </div>

          {/* Center Text */}
          <div className="relative z-10 space-y-4 -mt-20">
            <div className="inline-block px-3 py-1 rounded-full bg-[#ff5a1f]/10 border border-[#ff5a1f]/20">
              <p className="text-[#ff5a1f] text-[10px] font-bold tracking-[0.15em] uppercase">
                Digital Ecosystem
              </p>
            </div>
            <h1 className="text-[3.2rem] font-semibold leading-[1.05] text-white">
              Finance<br/>Reimagined.
            </h1>
            <p className="text-gray-400 text-[15px] leading-relaxed max-w-[280px]">
              Secure. Intelligent. Built for the future of capital.
            </p>
          </div>

          {/* Bottom Security Badge */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Bank-grade security</p>
              <p className="text-gray-500 text-xs">Encrypted. Protected. Trusted.</p>
            </div>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="w-full md:w-[55%] p-10 lg:p-14 flex flex-col justify-center relative">
          
          <h2 className="text-[28px] font-semibold text-white mb-2" style={{ color: '#ffffff' }}>Welcome back</h2>
          <p className="text-[14px] text-gray-400 mb-10">
            Log in to access your NovaBank account.
          </p>

          <form action={handleSubmit} className="space-y-5">
            
            {/* Account Identity */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-white">Account Identity</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="admin"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white text-[15px] focus:bg-white/10 focus:border-[#ff5a1f] focus:ring-1 focus:ring-[#ff5a1f] transition-all outline-none placeholder-gray-500"
                    required
                  />
              </div>
            </div>

            {/* Security Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-white">Security Key</label>
                <Link href="/reset-password" className="text-[12px] text-gray-500 hover:text-white transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white text-[15px] focus:bg-white/10 focus:border-[#ff5a1f] focus:ring-1 focus:ring-[#ff5a1f] transition-all outline-none placeholder-gray-500 tracking-widest"
                    required
                  />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="pt-1 pb-3">
              <label className="flex items-center gap-3 cursor-pointer group w-max">
                <div className="relative flex items-center justify-center w-5 h-5 rounded bg-[#ff5a1f]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span className="text-[13px] text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-medium py-3.5 rounded-xl transition-all transform active:scale-[0.98] text-[15px] flex items-center justify-center gap-2"
            >
              Log in
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </form>

          {/* Divider */}
          <div className="mt-10 mb-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button disabled={authLoading !== null} onClick={() => handleOAuth('Google')} type="button" className={`flex items-center justify-center gap-3 px-4 py-3 border border-white/10 rounded-xl transition-all text-[14px] font-medium text-white ${authLoading === 'Google' ? 'bg-white/10' : 'hover:bg-white/5 disabled:opacity-50'}`}>
              {authLoading === 'Google' ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M21.3 12.23c0-.8-.06-1.56-.18-2.3H12v4.36h5.2a4.46 4.46 0 0 1-1.92 2.92v2.4h3.1c1.82-1.68 2.92-4.14 2.92-7.38Z"/><path d="M12 21.5c2.6 0 4.8-1.12 6.4-3.04l-3.1-2.4c-.88.6-2 .96-3.3.96-2.52 0-4.66-1.68-5.42-3.92H3.34v2.44C4.94 19.34 8.24 21.5 12 21.5Z"/><path d="M6.58 13.1A5.3 5.3 0 0 1 6.3 12c0-.38.08-.76.16-1.1v-2.44H3.34a9.54 9.54 0 0 0 0 7.08l3.24-2.44Z"/><path d="M12 6.54c1.42 0 2.68.48 3.7 1.44l2.76-2.76A9.56 9.56 0 0 0 12 2.5C8.24 2.5 4.94 4.66 3.34 7.56l3.24 2.44c.76-2.24 2.9-3.92 5.42-3.92Z"/></svg>
              )}
              {authLoading === 'Google' ? 'Connecting...' : 'Google'}
            </button>
            <button disabled={authLoading !== null} onClick={() => handleOAuth('Apple')} type="button" className={`flex items-center justify-center gap-3 px-4 py-3 border border-white/10 rounded-xl transition-all text-[14px] font-medium text-white ${authLoading === 'Apple' ? 'bg-white/10' : 'hover:bg-white/5 disabled:opacity-50'}`}>
              {authLoading === 'Apple' ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0" className="text-white"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z"/></svg>
              )}
              {authLoading === 'Apple' ? 'Connecting...' : 'Apple'}
            </button>
          </div>

          {/* Footer Texts */}
          <div className="mt-14 text-center">
            <p className="text-[14px] text-gray-500">
              New to NovaBank? <Link href="/sign-up" className="font-semibold text-[#ff5a1f] hover:text-[#e64a15] transition-colors">Create an account</Link>
            </p>
          </div>

          <div className="mt-auto pt-10 flex items-center justify-center gap-2 text-gray-600 text-xs w-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            © 2024 NovaBank. All rights reserved.
          </div>

        </div>
      </div>
    </main>
  );
}