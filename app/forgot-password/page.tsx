'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Sparkles, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const redirectTo = `${window.location.origin}/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 px-4">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-400/20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl shadow-xl">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-slate-700 font-medium">Check your email</p>
              <p className="text-sm text-slate-500">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium rounded-xl flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
