'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Eye, EyeOff, Building2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || 'Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-[#222222]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">PharmaTrack</span>
          <span className="text-[10px] text-[#3D3D3D] ml-2">by 4Viso</span>
        </div>

        <div className="max-w-sm">
          <h1 className="text-[32px] font-light text-[#F5F5F5] leading-tight mb-6">
            Pharmaceutical Supply Chain Intelligence
          </h1>
          <p className="text-[13px] text-[#6B6B6B] leading-relaxed">
            Real-time visibility into temperature-sensitive logistics. Monitor GDP compliance and mitigate supply chain risks.
          </p>
        </div>

        <div className="text-[11px] text-[#3D3D3D]">
          2024 4Viso. All rights reserved.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#111111]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-12">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">PharmaTrack</span>
          </div>

          <div className="mb-8">
            <h2 className="text-[15px] font-medium text-[#F5F5F5] mb-1">Sign in</h2>
            <p className="text-[13px] text-[#6B6B6B]">Enter your credentials to continue</p>
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
                  className="h-10 text-[13px] bg-[#0A0A0A] border-[#222222] placeholder:text-[#3D3D3D] focus:border-[#2E2E2E]"
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
                    className="h-10 text-[13px] bg-[#0A0A0A] border-[#222222] placeholder:text-[#3D3D3D] focus:border-[#2E2E2E] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D3D3D] hover:text-[#6B6B6B] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              className="w-full h-10 text-[13px] bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]"
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
              className="w-full h-10 text-[13px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Single Sign-On
            </Button>
          </form>

          <p className="mt-8 text-center text-[12px] text-[#3D3D3D]">
            Need access?{' '}
            <a href="#" className="text-[#6B6B6B] hover:text-[#F5F5F5] transition-colors">
              Contact administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
