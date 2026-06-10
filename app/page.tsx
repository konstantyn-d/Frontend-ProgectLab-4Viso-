'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Eye, EyeOff, Building2 } from 'lucide-react'
import { NetworkBackground } from '@/components/network-background'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    if (email.includes('@') && password.length >= 4) {
      router.push('/dashboard')
    } else {
      setError('Invalid credentials. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* Left Panel - Animated network */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-[#222222] relative overflow-hidden">
        <NetworkBackground />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#10B981]" />
            <span className="text-[12px] uppercase tracking-[0.12em] text-[#F5F5F5] font-medium">
              Pharma<span className="text-[#10B981]">Track</span>
            </span>
            <span className="text-[10px] text-[#6B6B6B] ml-2">
              by 4<span className="text-[#10B981] underline decoration-[#10B981] decoration-2 underline-offset-2">V</span>iso
            </span>
          </div>
        </div>

        <div className="max-w-sm relative z-10">
          <h1 className="text-[32px] font-light text-[#F5F5F5] leading-tight mb-6 text-balance">
            Pharmaceutical Supply Chain Intelligence
          </h1>
          <p className="text-[14px] text-[#A0A0A0] leading-relaxed">
            Real-time visibility into temperature-sensitive logistics. Monitor GDP compliance and mitigate supply chain risks.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#3D3D3D] relative z-10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-60 live-pulse-dot" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]" />
          </span>
          <span>System operational</span>
          <span className="ml-auto">© 2024 4Viso</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#111111]">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 flex items-center gap-2">
            <div className="w-1 h-4 bg-[#10B981]" />
            <span className="text-[12px] uppercase tracking-[0.12em] text-[#F5F5F5] font-medium">
              Pharma<span className="text-[#10B981]">Track</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-1">Sign in</h2>
            <p className="text-[14px] text-[#6B6B6B]">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 text-[14px] bg-[#0A0A0A] border-[#222222] placeholder:text-[#3D3D3D] focus:border-[#10B981] focus-visible:ring-[#10B981]"
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password" className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
                  Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 text-[14px] bg-[#0A0A0A] border-[#222222] placeholder:text-[#3D3D3D] focus:border-[#10B981] focus-visible:ring-[#10B981] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D3D3D] hover:text-[#10B981]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </Field>
            </FieldGroup>

            {error && (
              <div className="text-[12px] text-[#E53E3E] bg-[rgba(229,62,62,0.1)] border-l-2 border-[#E53E3E] px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 text-[14px] bg-[#10B981] text-white hover:bg-[#059669]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#222222]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[11px] text-[#3D3D3D] bg-[#111111]">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 text-[14px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
            >
              <Building2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Single Sign-On
            </Button>
          </form>

          <p className="mt-8 text-center text-[12px] text-[#6B6B6B]">
            Need access?{' '}
            <a href="#" className="text-[#10B981] hover:text-[#34D399]">
              Contact administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
