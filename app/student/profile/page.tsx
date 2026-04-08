'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, GraduationCap, Wrench, FolderGit2, Trophy,
  Save, Plus, Trash2, ExternalLink, Github, Linkedin,
  Phone, MapPin, Globe, Loader2, CheckCircle2, Camera,
  ChevronDown, ChevronUp, AlertCircle, X
} from 'lucide-react'
import type {
  StudentExtendedProfile, StudentSkill,
  StudentProject, StudentAchievement
} from '@/lib/types'

// ─── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'basic',        label: 'Basic Info',    icon: User },
  { id: 'academic',     label: 'Academic',      icon: GraduationCap },
  { id: 'skills',       label: 'Skills',        icon: Wrench },
  { id: 'projects',     label: 'Projects',      icon: FolderGit2 },
  { id: 'achievements', label: 'Achievements',  icon: Trophy },
] as const
type TabId = typeof TABS[number]['id']

// ─── Small reusable bits ─────────────────────────────────────────────────────
function InputField({
  label, value, onChange, placeholder = '', type = 'text', textarea = false
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; textarea?: boolean
}) {
  const cls = `w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800
    focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
    placeholder:text-slate-400 text-sm transition`
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {textarea
        ? <textarea rows={3} className={cls} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input type={type} className={cls} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}

function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold
        hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-brand-200"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
    </button>
  )
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-brand-900 transition-colors"><X className="w-3 h-3" /></button>
    </span>
  )
}

// ─── Profile completeness bar ─────────────────────────────────────────────────
function CompletenessBar({ profile, skills, projects, achievements }: {
  profile: Partial<StudentExtendedProfile> & { name?: string; email?: string; department?: string }
  skills: StudentSkill[]; projects: StudentProject[]; achievements: StudentAchievement[]
}) {
  const checks = [
    !!profile.name, !!profile.phone, !!profile.address,
    !!profile.bio, !!profile.college_name, !!profile.degree, !!profile.cgpa,
    skills.length > 0, projects.length > 0, achievements.length > 0,
  ]
  const filled = checks.filter(Boolean).length
  const pct = Math.round((filled / checks.length) * 100)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">Profile Completeness</span>
        <span className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{pct}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {pct < 100 && (
        <p className="text-xs text-slate-400 mt-2">
          {pct < 50 ? 'Add your skills, projects, and bio to stand out.' : 'Almost there! Fill in the remaining sections.'}
        </p>
      )}
    </div>
  )
}

// ─── Tab: Basic Info ─────────────────────────────────────────────────────────
function BasicInfoTab({ profile, baseProfile, onSave }: {
  profile: Partial<StudentExtendedProfile>
  baseProfile: { name: string; email: string; department: string; roll_number?: string; semester?: number }
  onSave: (data: Partial<StudentExtendedProfile>) => void
}) {
  const [form, setForm] = useState({
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    bio: profile.bio ?? '',
    linkedin_url: profile.linkedin_url ?? '',
    github_url: profile.github_url ?? '',
    website_url: profile.website_url ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await onSave(form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Read-only from auth profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Full Name</p>
          <p className="text-sm font-semibold text-slate-700">{baseProfile.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Email</p>
          <p className="text-sm text-slate-700">{baseProfile.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Department</p>
          <p className="text-sm text-slate-700">{baseProfile.department}</p>
        </div>
        {baseProfile.roll_number && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Roll Number</p>
            <p className="text-sm text-slate-700">{baseProfile.roll_number}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" type="tel" />
        <InputField label="Address" value={form.address} onChange={set('address')} placeholder="City, State, Country" />
      </div>
      <InputField label="Bio / About" value={form.bio} onChange={set('bio')} placeholder="A short intro about yourself…" textarea />

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Social Links</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800
                focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm placeholder:text-slate-400 transition"
              placeholder="LinkedIn URL"
              value={form.linkedin_url}
              onChange={e => set('linkedin_url')(e.target.value)}
            />
          </div>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800
                focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm placeholder:text-slate-400 transition"
              placeholder="GitHub URL"
              value={form.github_url}
              onChange={e => set('github_url')(e.target.value)}
            />
          </div>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800
                focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm placeholder:text-slate-400 transition"
              placeholder="Personal Website"
              value={form.website_url}
              onChange={e => set('website_url')(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}

// ─── Tab: Academic Info ───────────────────────────────────────────────────────
function AcademicTab({ profile, baseProfile, onSave }: {
  profile: Partial<StudentExtendedProfile>
  baseProfile: { department: string; semester?: number }
  onSave: (data: Partial<StudentExtendedProfile>) => void
}) {
  const [form, setForm] = useState({
    college_name: profile.college_name ?? '',
    degree: profile.degree ?? '',
    cgpa: profile.cgpa ? String(profile.cgpa) : '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await onSave({ ...form, cgpa: form.cgpa ? parseFloat(form.cgpa) : undefined })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Department</p>
          <p className="text-sm font-semibold text-slate-700">{baseProfile.department}</p>
        </div>
        {baseProfile.semester && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Current Semester</p>
            <p className="text-sm font-semibold text-slate-700">Semester {baseProfile.semester}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="College / University Name" value={form.college_name} onChange={set('college_name')} placeholder="e.g. IIT Bombay" />
        <InputField label="Degree" value={form.degree} onChange={set('degree')} placeholder="e.g. B.Tech, B.E., MCA" />
        <InputField label="CGPA / Percentage" value={form.cgpa} onChange={set('cgpa')} placeholder="e.g. 8.5" type="number" />
      </div>
      <div className="flex justify-end">
        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}

// ─── Tab: Skills ──────────────────────────────────────────────────────────────
function SkillsTab({ skills: initialSkills }: { skills: StudentSkill[] }) {
  const [skills, setSkills] = useState(initialSkills)
  const [techInput, setTechInput] = useState('')
  const [softInput, setSoftInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addSkill = async (name: string, category: 'technical' | 'soft') => {
    if (!name.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/student/profile/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), category }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to add'); return }
      setSkills(prev => [...prev, data.data])
      if (category === 'technical') setTechInput('')
      else setSoftInput('')
    } finally { setLoading(false) }
  }

  const removeSkill = async (id: string) => {
    setSkills(prev => prev.filter(s => s.id !== id))
    await fetch('/api/student/profile/skills', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  const technical = skills.filter(s => s.category === 'technical')
  const soft = skills.filter(s => s.category === 'soft')

  const TagInput = ({ value, onChange, placeholder, category }: {
    value: string; onChange: (v: string) => void; placeholder: string; category: 'technical' | 'soft'
  }) => (
    <div className="flex gap-2">
      <input
        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition placeholder:text-slate-400"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(value, category) } }}
      />
      <button
        onClick={() => addSkill(value, category)}
        disabled={loading || !value.trim()}
        className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition disabled:opacity-40"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-rose-500 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Technical Skills</h3>
        </div>
        <TagInput value={techInput} onChange={setTechInput} placeholder="Type a skill and press Enter…" category="technical" />
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {technical.length === 0
            ? <p className="text-sm text-slate-400 italic">No technical skills added yet.</p>
            : technical.map(s => <Tag key={s.id} label={s.name} onRemove={() => removeSkill(s.id)} />)
          }
        </div>
      </div>

      <div className="border-t border-slate-100" />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Soft Skills</h3>
        </div>
        <TagInput value={softInput} onChange={setSoftInput} placeholder="e.g. Leadership, Communication…" category="soft" />
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {soft.length === 0
            ? <p className="text-sm text-slate-400 italic">No soft skills added yet.</p>
            : soft.map(s => (
              <span key={s.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                {s.name}
                <button onClick={() => removeSkill(s.id)} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
              </span>
            ))
          }
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Projects ────────────────────────────────────────────────────────────
function ProjectsTab({ projects: initialProjects }: { projects: StudentProject[] }) {
  const [projects, setProjects] = useState(initialProjects)
  const [adding, setAdding] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', tech_stack: '', project_url: '', github_url: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => setForm({ title: '', description: '', tech_stack: '', project_url: '', github_url: '' })
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Project title is required'); return }
    setSaving(true); setError('')
    const payload = {
      ...form,
      tech_stack: form.tech_stack ? form.tech_stack.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    try {
      if (editId) {
        const res = await fetch('/api/student/profile/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...payload }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Failed to update'); return }
        setProjects(prev => prev.map(p => p.id === editId ? data.data : p))
      } else {
        const res = await fetch('/api/student/profile/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Failed to add'); return }
        setProjects(prev => [...prev, data.data])
      }
      resetForm(); setAdding(false); setEditId(null)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    await fetch('/api/student/profile/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  const startEdit = (p: StudentProject) => {
    setForm({
      title: p.title, description: p.description ?? '',
      tech_stack: (p.tech_stack ?? []).join(', '),
      project_url: p.project_url ?? '', github_url: p.github_url ?? '',
    })
    setEditId(p.id); setAdding(true)
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-rose-500 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}

      {/* Project list */}
      <div className="space-y-3">
        {projects.length === 0 && !adding && (
          <div className="text-center py-10 text-slate-400">
            <FolderGit2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No projects yet. Add your first project!</p>
          </div>
        )}
        {projects.map(p => (
          <div key={p.id} className="border border-slate-100 rounded-2xl bg-white shadow-xs overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <FolderGit2 className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                  {p.tech_stack && p.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.tech_stack.slice(0, 4).map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{t}</span>
                      ))}
                      {p.tech_stack.length > 4 && <span className="text-xs text-slate-400">+{p.tech_stack.length - 4}</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); startEdit(p) }} className="p-2 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={e => { e.stopPropagation(); handleDelete(p.id) }} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
                {expanded === p.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            <AnimatePresence>
              {expanded === p.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="px-4 pb-4 border-t border-slate-100"
                >
                  {p.description && <p className="text-sm text-slate-600 mt-3">{p.description}</p>}
                  <div className="flex gap-3 mt-3">
                    {p.project_url && (
                      <a href={p.project_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" />Live Demo
                      </a>
                    )}
                    {p.github_url && (
                      <a href={p.github_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-slate-600 hover:underline">
                        <Github className="w-3.5 h-3.5" />GitHub
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="border border-brand-200 rounded-2xl bg-brand-50/50 p-5 space-y-4"
          >
            <p className="text-sm font-bold text-slate-700">{editId ? 'Edit Project' : 'Add New Project'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Project Title *" value={form.title} onChange={set('title')} placeholder="e.g. Student Hub App" />
              <InputField label="Tech Stack (comma-separated)" value={form.tech_stack} onChange={set('tech_stack')} placeholder="React, Node.js, PostgreSQL" />
              <InputField label="Live Demo URL" value={form.project_url} onChange={set('project_url')} placeholder="https://..." />
              <InputField label="GitHub URL" value={form.github_url} onChange={set('github_url')} placeholder="https://github.com/..." />
            </div>
            <InputField label="Description" value={form.description} onChange={set('description')} placeholder="What does this project do?" textarea />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setAdding(false); setEditId(null); resetForm(); setError('') }}
                className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition">Cancel</button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editId ? 'Update' : 'Add Project'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!adding && (
        <button onClick={() => { setAdding(true); setEditId(null); resetForm() }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-brand-300 text-brand-600 text-sm font-semibold hover:bg-brand-50 transition w-full justify-center">
          <Plus className="w-4 h-4" />Add Project
        </button>
      )}
    </div>
  )
}

// ─── Tab: Achievements ────────────────────────────────────────────────────────
function AchievementsTab({ achievements: initialAch }: { achievements: StudentAchievement[] }) {
  const [achievements, setAchievements] = useState(initialAch)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', issuer: '', date_awarded: '', description: '', cert_url: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reset = () => setForm({ title: '', issuer: '', date_awarded: '', description: '', cert_url: '' })
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      if (editId) {
        const res = await fetch('/api/student/profile/achievements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...form }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); return }
        setAchievements(prev => prev.map(a => a.id === editId ? data.data : a))
      } else {
        const res = await fetch('/api/student/profile/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); return }
        setAchievements(prev => [...prev, data.data])
      }
      reset(); setAdding(false); setEditId(null)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id))
    await fetch('/api/student/profile/achievements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  const startEdit = (a: StudentAchievement) => {
    setForm({ title: a.title, issuer: a.issuer ?? '', date_awarded: a.date_awarded ?? '', description: a.description ?? '', cert_url: a.cert_url ?? '' })
    setEditId(a.id); setAdding(true)
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-rose-500 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}

      <div className="space-y-3">
        {achievements.length === 0 && !adding && (
          <div className="text-center py-10 text-slate-400">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No achievements yet. Add certifications, awards or honours!</p>
          </div>
        )}
        {achievements.map(a => (
          <div key={a.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Trophy className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{a.title}</p>
              {a.issuer && <p className="text-xs text-slate-500 mt-0.5">{a.issuer}</p>}
              {a.date_awarded && <p className="text-xs text-slate-400 mt-0.5">{new Date(a.date_awarded).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</p>}
              {a.description && <p className="text-xs text-slate-600 mt-1">{a.description}</p>}
              {a.cert_url && (
                <a href={a.cert_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline mt-1">
                  <ExternalLink className="w-3 h-3" />View Certificate
                </a>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => startEdit(a)} className="p-2 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition">
                <Save className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="border border-yellow-200 rounded-2xl bg-yellow-50/50 p-5 space-y-4"
          >
            <p className="text-sm font-bold text-slate-700">{editId ? 'Edit Achievement' : 'Add Achievement'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Title *" value={form.title} onChange={set('title')} placeholder="e.g. AWS Certified Developer" />
              <InputField label="Issuer / Organization" value={form.issuer} onChange={set('issuer')} placeholder="e.g. Amazon Web Services" />
              <InputField label="Date" value={form.date_awarded} onChange={set('date_awarded')} type="date" />
              <InputField label="Certificate URL" value={form.cert_url} onChange={set('cert_url')} placeholder="https://..." />
            </div>
            <InputField label="Description" value={form.description} onChange={set('description')} placeholder="Brief description…" textarea />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setAdding(false); setEditId(null); reset(); setError('') }}
                className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition">Cancel</button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-yellow-500 text-white text-sm font-semibold hover:bg-yellow-600 transition disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                {editId ? 'Update' : 'Add Achievement'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!adding && (
        <button onClick={() => { setAdding(true); setEditId(null); reset() }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-yellow-300 text-yellow-600 text-sm font-semibold hover:bg-yellow-50 transition w-full justify-center">
          <Plus className="w-4 h-4" />Add Achievement
        </button>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [extProfile, setExtProfile] = useState<Partial<StudentExtendedProfile>>({})
  const [skills, setSkills] = useState<StudentSkill[]>([])
  const [projects, setProjects] = useState<StudentProject[]>([])
  const [achievements, setAchievements] = useState<StudentAchievement[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const skillsLoaded = useRef(false)
  const projectsLoaded = useRef(false)
  const achLoaded = useRef(false)

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !profile)) router.replace('/login')
    else if (!authLoading && profile && profile.role !== 'student') router.replace('/faculty/dashboard')
  }, [authLoading, user, profile, router])

  // Load profile data
  useEffect(() => {
    if (!user) return
    const load = async () => {
      setPageLoading(true)
      try {
        const [profRes, skillsRes, projRes, achRes] = await Promise.all([
          fetch('/api/student/profile'),
          fetch('/api/student/profile/skills'),
          fetch('/api/student/profile/projects'),
          fetch('/api/student/profile/achievements'),
        ])
        const [profData, skillsData, projData, achData] = await Promise.all([
          profRes.json(), skillsRes.json(), projRes.json(), achRes.json()
        ])
        if (profData.data) setExtProfile(profData.data)
        if (skillsData.data) setSkills(skillsData.data)
        if (projData.data) setProjects(projData.data)
        if (achData.data) setAchievements(achData.data)
        skillsLoaded.current = true
        projectsLoaded.current = true
        achLoaded.current = true
      } finally { setPageLoading(false) }
    }
    load()
  }, [user])

  const saveProfile = useCallback(async (data: Partial<StudentExtendedProfile>) => {
    const res = await fetch('/api/student/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (result.data) setExtProfile(prev => ({ ...prev, ...result.data }))
  }, [])

  if (authLoading || pageLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    )
  }

  const baseProfile = {
    name: profile.name,
    email: profile.email,
    department: profile.department,
    roll_number: profile.roll_number,
    semester: profile.semester,
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-1">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
              {extProfile.photo_url
                ? <img src={extProfile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                : profile.name.charAt(0).toUpperCase()
              }
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-brand-50 transition shadow-sm">
              <Camera className="w-3 h-3 text-slate-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{profile.name}</h1>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              {profile.department}
              {profile.semester && ` · Semester ${profile.semester}`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Completeness bar */}
      <CompletenessBar profile={{ ...extProfile, name: profile.name, email: profile.email }} skills={skills} projects={projects} achievements={achievements} />

      {/* Tab navigation */}
      <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-1 justify-center
                ${isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
      >
        {activeTab === 'basic' && (
          <BasicInfoTab profile={extProfile} baseProfile={baseProfile} onSave={saveProfile} />
        )}
        {activeTab === 'academic' && (
          <AcademicTab profile={extProfile} baseProfile={baseProfile} onSave={saveProfile} />
        )}
        {activeTab === 'skills' && (
          <SkillsTab skills={skills} />
        )}
        {activeTab === 'projects' && (
          <ProjectsTab projects={projects} />
        )}
        {activeTab === 'achievements' && (
          <AchievementsTab achievements={achievements} />
        )}
      </motion.div>
    </div>
  )
}
