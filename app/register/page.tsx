'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Presentation,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  Hash,
  Calendar,
  BadgeCheck,
  Loader2,
  ArrowRight,
  ChevronLeft
} from 'lucide-react'

type Step = 'role' | 'details'
type Role = 'student' | 'faculty' | null

interface Subject {
  id: string
  code: string
  name: string
  semester?: number
}




export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<Role>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    department: 'Computer Science',
    roll_number: '',
    semester: '6',
    employee_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [subjectsFetchError, setSubjectsFetchError] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { signUp } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (role === 'faculty') {
      fetchSubjects()
    }
  }, [role, formData.department, formData.semester])

  const fetchSubjects = async () => {
    setLoadingSubjects(true)
    setSubjectsFetchError(false)
    try {
      const params = new URLSearchParams({ department: formData.department })
      if (role === 'student') params.set('semester', formData.semester)
      const url = `/api/public/subjects?${params.toString()}`
      const res = await fetch(url)
      const json = await res.json()
      if (res.ok && Array.isArray(json.data) && json.data.length > 0) {
        setSubjects(json.data)
      } else {
        console.warn('[Register] API returned empty subjects. RLS may be blocking reads.')
        setSubjects([])
        setSubjectsFetchError(true)
      }
    } catch (err) {
      console.error('[Register] Fetch error:', err)
      setSubjects([])
      setSubjectsFetchError(true)
    } finally {
      setLoadingSubjects(false)
    }
  }

  const handleRoleSelect = (selectedRole: 'student' | 'faculty') => {
    setRole(selectedRole)
    setStep('details')
    setError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    )
  }

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (role === 'student' && !formData.roll_number) {
      setError('Roll number is required for students')
      return false
    }
    if (role === 'faculty' && !formData.employee_id) {
      setError('Employee ID is required for faculty')
      return false
    }
    if (role === 'faculty' && selectedSubjects.length === 0) {
      setError('Please select at least one subject you teach')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateForm() || !role) return
    setLoading(true)

    const additionalData = role === 'student'
      ? {
        roll_number: formData.roll_number.toUpperCase(),
        semester: parseInt(formData.semester),
        department: formData.department,
      }
      : {
        employee_id: formData.employee_id.toUpperCase(),
        department: formData.department,
        subjects: selectedSubjects,
      }

    const result = await signUp(formData.email, formData.password, role, formData.name, additionalData)
    setLoading(false)

    if (result.success) {
      setSuccessMessage('Registration successful! Please log in.')
      setTimeout(() => router.push('/login'), 2500)
    } else {
      setError(result.error || 'Registration failed. Please try again.')
    }
  }

  // Animation variants
  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
  const slideIn = {
    enter: { x: 50, opacity: 0 },
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: { zIndex: 0, x: -50, opacity: 0 }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 py-12 px-4">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-400/20 blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-xl">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Create an account</h1>
          <p className="text-slate-500">Join Student Hub to manage your academic journey</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="glass p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          {/* Error & Success Messages at the top level */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-start gap-3"
              >
                <div className="shrink-0 mt-0.5">⚠️</div>
                <p>{error}</p>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-200 flex items-start gap-3"
              >
                <BadgeCheck className="shrink-0 mt-0.5 w-5 h-5 text-green-500" />
                <p>{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ── STEP 1: ROLE SELECTION ── */}
            {step === 'role' && (
              <motion.div
                key="role-step"
                variants={slideIn}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <button
                  onClick={() => handleRoleSelect('student')}
                  className="w-full flex items-center p-6 bg-white/60 border border-slate-200 rounded-2xl hover:bg-white hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-8 h-8 text-brand-600" />
                  </div>
                  <div className="ml-6 text-left">
                    <h3 className="text-lg font-semibold text-slate-900">Student Account</h3>
                    <p className="text-sm text-slate-500 mt-1">View marks, submit assignments, track attendance</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleRoleSelect('faculty')}
                  className="w-full flex items-center p-6 bg-white/60 border border-slate-200 rounded-2xl hover:bg-white hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Presentation className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="ml-6 text-left">
                    <h3 className="text-lg font-semibold text-slate-900">Faculty Account</h3>
                    <p className="text-sm text-slate-500 mt-1">Upload marks, create assignments, manage students</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </button>

                <div className="text-center pt-6">
                  <p className="text-slate-600 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: DETAILS FORM ── */}
            {step === 'details' && (
              <motion.form
                key="details-step"
                variants={slideIn}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => { setStep('role'); setRole(null); setError('') }}
                    className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-semibold border border-brand-100">
                    {role === 'student' ? <GraduationCap className="w-4 h-4" /> : <Presentation className="w-4 h-4" />}
                    <span className="capitalize">{role} Details</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm" placeholder="Your Name" required />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm" placeholder="Your E-mail" required />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Department</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <select name="department" value={formData.department} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm" required>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="Information Technology">Information Technology</option>
                      </select>
                    </div>
                  </div>

                  {role === 'student' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1">Roll Number</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Hash className="w-4 h-4" />
                          </div>
                          <input type="text" name="roll_number" value={formData.roll_number} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm" placeholder="e.g. CS2021001" required />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 pl-1">Semester</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <select name="semester" value={formData.semester} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm" required>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                              <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {role === 'faculty' && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 pl-1">Employee ID</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <BadgeCheck className="w-4 h-4" />
                        </div>
                        <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm" placeholder="e.g. FAC001" required />
                      </div>
                    </div>
                  )}
                </div>

                {role === 'faculty' && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-slate-700 pl-1">Subjects You Teach (Select at least one)</label>
                    <div className="bg-white/50 border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto w-full">
                      {loadingSubjects ? (
                        <p className="text-sm text-slate-500 flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading subjects from department...</p>
                      ) : subjects.length === 0 ? (
                        <div className="text-center py-3">
                          <p className="text-sm text-slate-500">
                            {subjectsFetchError
                              ? 'Could not load subjects from the database. Please check your connection and try again.'
                              : 'No subjects found for this department.'}
                          </p>
                          <button type="button" onClick={fetchSubjects} className="mt-2 px-4 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition">
                            Retry
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {subjects.map(subject => (
                            <label key={subject.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer transition-colors group">
                              <div className="relative flex items-center">
                                <input type="checkbox" checked={selectedSubjects.includes(subject.id)} onChange={() => toggleSubject(subject.id)} className="peer h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-600 transition-all cursor-pointer" />
                              </div>
                              <span className="text-sm text-slate-700 group-hover:text-slate-900"><strong>{subject.code}</strong><br /><span className="text-xs text-slate-500">{subject.name}</span></span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full pl-9 pr-10 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm" placeholder="••••••••" required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 pl-1">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-9 pr-10 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm" placeholder="••••••••" required minLength={6} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Setting up account...</span></>
                  ) : (
                    <><BadgeCheck className="w-5 h-5" /><span>Complete Registration</span></>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}