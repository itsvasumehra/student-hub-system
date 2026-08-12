'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Download, Loader2, AlertCircle, UserCircle2, RefreshCw,
  FileText, Printer
} from 'lucide-react'
import { ResumePreview, type ResumeData } from '@/components/resume/ResumePreview'

export default function ResumePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !profile)) router.replace('/login')
    else if (!authLoading && profile && profile.role !== 'student') router.replace('/faculty/dashboard')
  }, [authLoading, user, profile, router])

  const fetchResume = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/student/resume')
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Failed to load resume data'); return }
      setResumeData({ ...json.data, experience: json.data.experience ?? [] })
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchResume()
  }, [user])

  const handlePrint = () => window.print()

  // ── Empty state helpers ─────────────────────────────────────────────────────
  const isEmpty = resumeData && (
    !resumeData.phone && !resumeData.address && !resumeData.bio &&
    !resumeData.college_name && !resumeData.degree && !resumeData.cgpa &&
    resumeData.skills.length === 0 &&
    resumeData.projects.length === 0 &&
    resumeData.achievements.length === 0
  )

  if (authLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <>
      {/* ── Print CSS injected into <head> ── */}
      <style>{`
        @media print {
          /* Hide EVERYTHING except the resume canvas */
          body * { visibility: hidden !important; }
          #resume-content,
          #resume-content * { visibility: visible !important; }

          /* Position the resume at the top-left */
          #resume-content {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 28px 44px !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 12px !important;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 print:hidden-wrapper">

        {/* ── Page header (hidden on print) ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden"
        >
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-brand-500" />
              My Resume
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Auto-generated from your profile data.
              {' '}
              <a href="/student/profile" className="text-brand-600 hover:underline font-medium">
                Update your profile
              </a>
              {' '}to improve this resume.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchResume}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handlePrint}
              disabled={loading || !!error}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-md shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </motion.div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm print:hidden">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200 p-12 flex flex-col items-center gap-4 text-slate-400 print:hidden">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
            <p className="text-sm">Building your resume…</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && isEmpty && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl shadow-slate-100 p-12 flex flex-col items-center gap-4 text-center print:hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center">
              <UserCircle2 className="w-8 h-8 text-brand-500" />
            </div>
            <div>
              <p className="text-slate-700 font-bold text-lg">Your profile is empty</p>
              <p className="text-slate-400 text-sm mt-1 max-w-sm">
                Fill in your skills, projects, academic info, and achievements to generate a professional resume.
              </p>
            </div>
            <a
              href="/student/profile"
              className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition shadow-md shadow-brand-200"
            >
              <UserCircle2 className="w-4 h-4" />
              Complete Your Profile
            </a>
          </motion.div>
        )}

        {/* ── Resume preview ── */}
        {!loading && !error && resumeData && !isEmpty && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            {/* Tip bar (screen only) */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium mb-4 print:hidden">
              <Printer className="w-3.5 h-3.5 flex-shrink-0" />
              Tip: Click <strong className="mx-1">Download PDF</strong> to save as PDF — only the resume will be printed.
            </div>

            {/* A4 Preview wrapper */}
            <div className="overflow-x-auto rounded-2xl shadow-2xl shadow-slate-200/70 ring-1 ring-slate-100">
              <ResumePreview data={resumeData} />
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
