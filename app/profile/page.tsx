'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { useRouter } from 'next/navigation'

const Bell = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Password state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false)

  function getCookie(name: string) {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
    return null
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = getCookie('user_id') || '1'
      try {
        const res = await fetch(`/api/user/profile?userId=${userId}`)
        const data = await res.json()
        if (data.ok) {
          setProfile(data.user)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Password Strength Logic
  const getPasswordStrength = (pwd: string) => {
    let score = 0
    if (!pwd) return score
    if (pwd.length > 8) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1
    return score
  }

  const strength = getPasswordStrength(newPassword)
  const strengthText = strength === 0 ? '' : strength <= 2 ? 'Weak' : strength === 3 ? 'Medium' : 'Strong'
  const strengthColor = strength === 0 ? 'bg-slate-200' : strength <= 2 ? 'bg-red-400' : strength === 3 ? 'bg-yellow-400' : 'bg-green-500'

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!")
      return
    }
    if (strength < 3) {
      alert("Please choose a stronger password.")
      return
    }

    try {
      const userId = getCookie('user_id') || '1'
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, oldPassword, newPassword })
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        alert('Password successfully updated!')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        alert(data.message || 'Failed to update password')
      }
    } catch (err) {
      alert('Network error occurred')
    }
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your account details and security.</p>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-48 md:w-64 rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] shadow-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e65a28] transition-colors">
                <SearchIcon size={16} />
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-[#e65a28]" />
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-slate-900">Login from new device</p>
                      <p className="text-xs text-slate-500 mt-1">Chrome on Windows • 2 mins ago</p>
                    </div>
                    <div className="p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-slate-900">Password reset request</p>
                      <p className="text-xs text-slate-500 mt-1">Please ignore if this wasn't you.</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-100 text-center">
                    <button className="text-xs font-semibold text-[#e65a28]">Mark all as read</button>
                  </div>
                </div>
              )}
            </div>
            
            <button className="size-10 overflow-hidden rounded-full border-2 border-slate-200 hover:border-[#e65a28] transition-all shadow-sm">
              <img src="/person-logo.png" alt="profile" className="size-full object-cover" />
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Details */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h2>
            {loading ? (
              <p className="text-slate-500">Loading profile...</p>
            ) : profile ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                  <p className="text-lg font-medium text-slate-900">{profile.full_name}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Username</label>
                  <p className="text-lg font-medium text-slate-900">{profile.username}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <p className="text-lg font-medium text-slate-900">{profile.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">NIC</label>
                  <p className="text-lg font-medium text-slate-900">{profile.nic || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p className="text-red-500">Failed to load profile.</p>
            )}
          </div>

          {/* Password Reset */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Change Password</h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28]"
                  required
                />
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-500">Password Strength</span>
                      <span className={`text-xs font-bold ${strength <= 2 ? 'text-red-500' : strength === 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {strengthText}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`flex-1 rounded-full transition-colors ${strength >= level ? strengthColor : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Use 8+ characters, uppercase, numbers, and symbols.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28]"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full mt-4 rounded-xl bg-[#e65a28] px-8 py-3.5 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#d44d1e] hover:shadow-lg hover:shadow-orange-500/30"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
