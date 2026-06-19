'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { Bell, Search } from '@/components/Icons'

type UserProfile = {
  id: string
  username: string
  full_name: string
  email: string
  avatar?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  
  // Security Form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Prefs
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)
  const [marketingNotif, setMarketingNotif] = useState(false)

  useEffect(() => {
    // Fetch profile data from user API
    fetch('/api/user?id=1')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.user) {
          setProfile({
            id: String(data.user.id),
            username: data.user.username,
            full_name: data.user.full_name,
            email: data.user.email || '',
            avatar: data.user.avatar || ''
          })
        }
      })
      .catch(err => console.error(err))
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfile(prev => prev ? { ...prev, avatar: reader.result as string } : null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      const data = await res.json()
      if (data.ok) {
        alert('Profile saved successfully!')
      } else {
        alert('Failed to save profile.')
      }
    } catch (err) {
      console.error(err)
      alert('Error saving profile.')
    }
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match")
      return
    }
    // Simulate API call
    alert("Password successfully updated.")
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f0f11] font-sans selection:bg-[#ff5a1f] selection:text-white relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" }}
      ></div>
      <div className="fixed inset-0 z-0 bg-black/85 backdrop-blur-[2px]"></div>

      {/* Sidebar */}
      <div className="relative z-10 shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col overflow-y-auto hide-scrollbar h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 sticky top-0 bg-[#0f0f11]/80 backdrop-blur-md z-40 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white tracking-wide">Settings</h2>
          <div className="flex items-center gap-5">
            <button className="text-[#8a8a8a] hover:text-white transition-colors">
              <Search size={22} />
            </button>
            <button className="text-[#8a8a8a] hover:text-white transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#ff5a1f] rounded-full border-2 border-[#0f0f11]"></span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 ml-2 relative">
              <Image src={profile?.avatar || "/avatar.png"} alt="Profile" fill className="object-cover" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-4xl">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-max mb-8 border border-white/5">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all ${activeTab === 'profile' ? 'bg-[#ff5a1f] text-white shadow-lg' : 'text-[#8a8a8a] hover:text-white'}`}
            >
              Profile Info
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all ${activeTab === 'security' ? 'bg-[#ff5a1f] text-white shadow-lg' : 'text-[#8a8a8a] hover:text-white'}`}
            >
              Security
            </button>
            <button 
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all ${activeTab === 'preferences' ? 'bg-[#ff5a1f] text-white shadow-lg' : 'text-[#8a8a8a] hover:text-white'}`}
            >
              Preferences
            </button>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[24px] p-8">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 relative">
                    <Image src={profile?.avatar || "/avatar.png"} alt="Profile" fill className="object-cover" />
                  </div>
                  <div>
                    <label className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-all mb-2 cursor-pointer inline-block">
                      Change Avatar
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                    <p className="text-[#8a8a8a] text-xs">JPG or PNG. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Full Name</label>
                    <input type="text" value={profile?.full_name || ''} onChange={e => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5a1f]/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Username</label>
                    <input type="text" value={profile?.username || ''} onChange={e => setProfile(prev => prev ? {...prev, username: e.target.value} : null)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5a1f]/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Email Address</label>
                    <input type="email" value={profile?.email || ''} onChange={e => setProfile(prev => prev ? {...prev, email: e.target.value} : null)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5a1f]/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">User ID</label>
                    <input type="text" readOnly value={profile?.id || ''} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[#666] focus:outline-none cursor-not-allowed" />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-8 flex justify-end">
                  <button type="submit" className="px-8 py-3 rounded-xl bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold tracking-wide transition-all shadow-lg shadow-[#ff5a1f]/20">
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Current Password</label>
                    <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5a1f]/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">New Password</label>
                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5a1f]/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider">Confirm New Password</label>
                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5a1f]/50 transition-colors" />
                  </div>
                  <button type="submit" className="w-full mt-4 bg-gradient-to-r from-[#ff5a1f] to-[#e0450e] hover:from-[#e0450e] hover:to-[#c23b0c] text-white font-bold text-sm tracking-wider py-3.5 rounded-xl shadow-lg shadow-[#ff5a1f]/20 transition-all transform hover:-translate-y-0.5 uppercase">
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Notification Preferences</h3>
                  <p className="text-sm text-[#8a8a8a] mb-6">Manage how you receive alerts and updates from NovaBank.</p>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:bg-black/40 transition-colors">
                      <div>
                        <div className="text-white font-bold mb-1">Email Notifications</div>
                        <div className="text-[#8a8a8a] text-xs">Receive transaction alerts and statements via email</div>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${emailNotif ? 'bg-[#ff5a1f]' : 'bg-white/10'}`} onClick={() => setEmailNotif(!emailNotif)}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailNotif ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:bg-black/40 transition-colors">
                      <div>
                        <div className="text-white font-bold mb-1">SMS Alerts</div>
                        <div className="text-[#8a8a8a] text-xs">Receive instant security codes and transfer alerts</div>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${smsNotif ? 'bg-[#ff5a1f]' : 'bg-white/10'}`} onClick={() => setSmsNotif(!smsNotif)}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${smsNotif ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:bg-black/40 transition-colors">
                      <div>
                        <div className="text-white font-bold mb-1">Marketing Emails</div>
                        <div className="text-[#8a8a8a] text-xs">Receive offers and promotional content</div>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${marketingNotif ? 'bg-[#ff5a1f]' : 'bg-white/10'}`} onClick={() => setMarketingNotif(!marketingNotif)}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${marketingNotif ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
