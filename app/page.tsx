'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Building2 } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { Sun, Moon } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('s.chen@4viso.com')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 650))
    if (email.includes('@') && password.length >= 4) {
      router.push('/dashboard')
    } else {
      setError('Invalid credentials. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen grid"
      style={{ gridTemplateColumns: '1.05fr 0.95fr', background: 'var(--background)' }}
    >
      {/* Left Panel — Brand */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-[56px] overflow-hidden border-r border-border"
        style={{ background: 'var(--card)' }}
      >
        {/* Ambient blobs */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full"
            style={{
              left: '55%', top: '8%', width: 320, height: 320,
              background: 'var(--primary)',
              opacity: 0.09, filter: 'blur(80px)',
              animation: 'washfloat0 18s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              left: '30%', top: '55%', width: 280, height: 280,
              background: 'var(--primary)',
              opacity: 0.07, filter: 'blur(90px)',
              animation: 'washfloat1 22s ease-in-out infinite',
              animationDelay: '4s',
            }}
          />
        </div>
        <style>{`
          @keyframes washfloat0{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,40px) scale(1.12)}}
          @keyframes washfloat1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-20px) scale(1.08)}}
        `}</style>

        {/* Brand mark */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center"
            style={{ background: 'var(--primary)', boxShadow: '0 6px 16px -6px rgba(16,185,129,0.55)' }}
          >
            <Image src="/4viso-logo.png" alt="4Viso" width={22} height={22} className="object-contain" />
          </div>
          <div>
            <div
              className="text-[17px] leading-none tracking-[-0.03em] text-foreground"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
            >
              PharmaTrack
            </div>
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
              by 4Viso
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h1
            className="leading-[0.96] tracking-[-0.04em] mb-[22px]"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(36px, 4.2vw, 60px)',
              color: 'var(--foreground)',
              maxWidth: '12ch',
            }}
          >
            Pharmaceutical supply chain{' '}
            <span style={{ color: 'var(--accent-deep)', fontStyle: 'italic' }}>intelligence.</span>
          </h1>
          <p className="text-[16px] leading-[1.55]" style={{ color: 'var(--muted-foreground)', maxWidth: '42ch' }}>
            Real-time visibility into temperature-sensitive logistics. Monitor GDP compliance and mitigate supply-chain risk across every corridor.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-3 font-mono text-[11px] tracking-[0.06em]" style={{ color: 'var(--text-muted)' }}>
          <span className="pulse-dot" style={{ color: 'var(--primary)' }} />
          System operational
          <span className="ml-auto">© 2026 4Viso</span>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div
        className="flex items-center justify-center p-10 relative"
        style={{ background: 'var(--background)' }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-5 right-5 w-[38px] h-[38px] rounded-full flex items-center justify-center border transition-all duration-200 hover:-translate-y-px"
          style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-[17px] h-[17px]" strokeWidth={1.5} /> : <Moon className="w-[17px] h-[17px]" strokeWidth={1.5} />}
        </button>

        <div className="w-full max-w-[380px]">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center"
              style={{ background: 'var(--primary)' }}
            >
              <Image src="/4viso-logo.png" alt="4Viso" width={22} height={22} className="object-contain" />
            </div>
            <div
              className="text-[17px] leading-none tracking-[-0.03em] text-foreground"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
            >
              PharmaTrack
            </div>
          </div>

          <h2
            className="tracking-[-0.03em] mb-[6px]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--foreground)', margin: '0 0 6px' }}
          >
            Sign in
          </h2>
          <p className="text-[14px] mb-[30px]" style={{ color: 'var(--muted-foreground)' }}>
            Enter your credentials to continue.
          </p>

          {error && (
            <div
              className="text-[12.5px] mb-4 px-3 py-2.5 rounded-[6px] border-l-2"
              style={{ color: 'var(--danger)', background: 'var(--danger-bg)', borderLeftColor: 'var(--danger)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[18px]">
            {/* Email */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full h-[46px] px-4 text-[14px] outline-none transition-all duration-200"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  color: 'var(--foreground)',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px var(--accent-wash)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full h-[46px] px-4 pr-12 text-[14px] outline-none transition-all duration-200"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    color: 'var(--foreground)',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px var(--accent-wash)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-deep)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                >
                  {showPassword ? <EyeOff className="w-[17px] h-[17px]" strokeWidth={1.5} /> : <Eye className="w-[17px] h-[17px]" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[46px] text-[13.5px] font-medium rounded-full transition-all duration-200 hover:-translate-y-[2px] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: 'var(--primary)',
                color: 'var(--on-accent)',
                boxShadow: '0 10px 24px -8px rgba(16,185,129,0.55)',
              }}
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-[22px]">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* SSO */}
          <button
            type="button"
            className="w-full h-[46px] text-[13.5px] font-medium rounded-full flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-px"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              boxShadow: 'var(--shadow-1)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-line)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent-deep)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--foreground)' }}
          >
            <Building2 className="w-4 h-4" strokeWidth={1.5} />
            Single Sign-On
          </button>

          <p className="text-center mt-[26px] text-[12.5px]" style={{ color: 'var(--muted-foreground)' }}>
            Need access?{' '}
            <a href="#" style={{ color: 'var(--accent-deep)', fontWeight: 500, textDecoration: 'none' }}>
              Contact administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
