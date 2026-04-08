'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import {
  Trophy, CheckCircle2, XCircle, Clock, Search, Filter,
  FileText, User, Calendar, RefreshCw, Loader2, ChevronDown,
  BadgeCheck, AlertCircle, Eye
} from 'lucide-react'

interface Activity {
  id: string
  title: string
  category: string
  description?: string
  date: string
  proof_url?: string
  approval_status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles?: {
    id: string
    name: string
    roll_number?: string
    department?: string
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  sports: 'Sports',
  cultural: 'Cultural',
  technical: 'Technical',
  social: 'Social',
  other: 'Other',
}

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400',   icon: Clock },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    icon: XCircle },
}

const FILTERS = ['all', 'pending', 'approved', 'rejected'] as const
type FilterType = typeof FILTERS[number]

export default function FacultyActivitiesPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !profile)) router.replace('/login')
    else if (!authLoading && profile && profile.role !== 'faculty') router.replace('/student/dashboard')
  }, [authLoading, user, profile, router])

  const fetchActivities = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError('')
    try {
      const res = await fetch('/api/faculty/activities-list')
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Failed to load activities'); return }
      setActivities(json.data ?? [])
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchActivities()
  }, [user, fetchActivities])

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/faculty/activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: status }),
      })
      const json = await res.json()
      if (!res.ok) { alert(json.error || 'Update failed'); return }
      setActivities(prev => prev.map(a => a.id === id ? { ...a, approval_status: status } : a))
    } catch {
      alert('Network error')
    } finally {
      setUpdating(null)
    }
  }

  // Filtered + searched list
  const filtered = activities.filter(a => {
    const matchSearch = search === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.profiles?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.profiles?.roll_number ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filter === 'all' || a.approval_status === filter
    const matchCat = categoryFilter === 'all' || a.category === categoryFilter
    return matchSearch && matchStatus && matchCat
  })

  // Stats
  const counts = {
    all: activities.length,
    pending: activities.filter(a => a.approval_status === 'pending').length,
    approved: activities.filter(a => a.approval_status === 'approved').length,
    rejected: activities.filter(a => a.approval_status === 'rejected').length,
  }

  if (authLoading || !profile) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Student Activities
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Review and approve student extra-curricular submissions.</p>
        </div>
        <button
          onClick={() => fetchActivities(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {([
          { key: 'all',      label: 'Total',    color: 'from-slate-600 to-slate-700' },
          { key: 'pending',  label: 'Pending',  color: 'from-amber-500 to-orange-500' },
          { key: 'approved', label: 'Approved', color: 'from-emerald-500 to-teal-500' },
          { key: 'rejected', label: 'Rejected', color: 'from-rose-500 to-pink-500' },
        ] as const).map(stat => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key)}
            className={`rounded-2xl p-4 text-left transition-all shadow-sm border
              ${filter === stat.key ? 'ring-2 ring-brand-400 border-brand-200 bg-white' : 'bg-white border-slate-100 hover:border-slate-200'}`}
          >
            <p className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {counts[stat.key]}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</p>
          </button>
        ))}
      </motion.div>

      {/* Filters + Search */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-slate-400"
            placeholder="Search by title, student name, or roll number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none bg-white text-slate-700"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Status filter tabs */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-semibold capitalize transition whitespace-nowrap
                ${filter === f ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading student activities…</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold">No activities found</p>
          <p className="text-slate-400 text-sm mt-1">
            {activities.length === 0 ? 'No students have submitted activities yet.' : 'Try adjusting your search or filter.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {filtered.map((activity, idx) => {
            const statusCfg = STATUS_CONFIG[activity.approval_status]
            const StatusIcon = statusCfg.icon
            const isExpanded = expandedId === activity.id
            const isUpdating = updating === activity.id

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Main row */}
                <div
                  className="flex items-start gap-4 p-4 cursor-pointer hover:bg-slate-50/60 transition"
                  onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                >
                  {/* Category badge */}
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{activity.title}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          {activity.profiles && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <User className="w-3 h-3" />
                              {activity.profiles.name}
                              {activity.profiles.roll_number && ` (${activity.profiles.roll_number})`}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(activity.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                            {CATEGORY_LABELS[activity.category] || activity.category}
                          </span>
                        </div>
                      </div>

                      {/* Status pill */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} flex-shrink-0`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </div>
                    </div>
                  </div>

                  <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform mt-1 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded detail panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100"
                    >
                      <div className="p-5 space-y-4">
                        {/* Description */}
                        {activity.description && (
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Description</p>
                            <p className="text-sm text-slate-600">{activity.description}</p>
                          </div>
                        )}

                        {/* Student info */}
                        {activity.profiles && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50">
                            <div>
                              <p className="text-xs text-slate-400 font-medium">Student</p>
                              <p className="text-sm font-semibold text-slate-700">{activity.profiles.name}</p>
                            </div>
                            {activity.profiles.roll_number && (
                              <div>
                                <p className="text-xs text-slate-400 font-medium">Roll No.</p>
                                <p className="text-sm font-semibold text-slate-700">{activity.profiles.roll_number}</p>
                              </div>
                            )}
                            {activity.profiles.department && (
                              <div>
                                <p className="text-xs text-slate-400 font-medium">Department</p>
                                <p className="text-sm font-semibold text-slate-700">{activity.profiles.department}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Proof link */}
                        {activity.proof_url && (
                          <a
                            href={activity.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-sm font-medium hover:bg-brand-100 transition"
                          >
                            <Eye className="w-4 h-4" />
                            View Proof / Certificate
                            <FileText className="w-3.5 h-3.5 opacity-60" />
                          </a>
                        )}

                        {/* Action buttons */}
                        {activity.approval_status === 'pending' && (
                          <div className="flex gap-3 pt-1">
                            <button
                              onClick={() => handleApproval(activity.id, 'approved')}
                              disabled={isUpdating}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                            >
                              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproval(activity.id, 'rejected')}
                              disabled={isUpdating}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50"
                            >
                              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              Reject
                            </button>
                          </div>
                        )}
                        {activity.approval_status !== 'pending' && (
                          <div className="flex gap-3 pt-1">
                            <button
                              onClick={() => handleApproval(activity.id, activity.approval_status === 'approved' ? 'rejected' : 'approved')}
                              disabled={isUpdating}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition
                                ${activity.approval_status === 'approved'
                                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                            >
                              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                activity.approval_status === 'approved' ? <XCircle className="w-4 h-4" /> : <BadgeCheck className="w-4 h-4" />}
                              Change to {activity.approval_status === 'approved' ? 'Rejected' : 'Approved'}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
