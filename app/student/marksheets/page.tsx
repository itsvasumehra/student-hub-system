'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, Trash2, Download, Loader2, CheckCircle2, AlertCircle, Plus, X, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import type { Marksheet } from '@/lib/types'

const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

export default function StudentMarksheetsPage() {
  const [marksheets, setMarksheets] = useState<Marksheet[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ label: '', semester: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchMarksheets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/student/marksheets')
      const json = await res.json()
      if (res.ok && json.data) setMarksheets(json.data)
    } catch { console.error('Failed to load marksheets') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMarksheets() }, [fetchMarksheets])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !form.label.trim()) {
      showToast('Label and file are required', 'error'); return
    }

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const ext = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('marksheets')
        .upload(fileName, selectedFile, { contentType: selectedFile.type })

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabase.storage.from('marksheets').getPublicUrl(uploadData.path)

      // Save record via API
      const res = await fetch('/api/student/marksheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: form.label.trim(),
          file_url: publicUrl,
          file_name: selectedFile.name,
          semester: form.semester ? parseInt(form.semester) : undefined,
        }),
      })

      const json = await res.json()
      if (res.ok) {
        showToast('Mark sheet uploaded!', 'success')
        setShowForm(false)
        setForm({ label: '', semester: '' })
        setSelectedFile(null)
        await fetchMarksheets()
      } else {
        showToast(json.error ?? 'Upload failed', 'error')
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Upload error', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, fileUrl: string) => {
    setDeleting(id)
    try {
      // Remove storage file
      const url = new URL(fileUrl)
      const pathParts = url.pathname.split('/marksheets/')
      if (pathParts.length > 1) {
        await supabase.storage.from('marksheets').remove([pathParts[1]])
      }
      // Delete DB record
      const res = await fetch(`/api/student/marksheets?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (res.ok) {
        showToast('Deleted', 'success')
        setMarksheets(m => m.filter(s => s.id !== id))
      } else {
        showToast(json.error ?? 'Delete failed', 'error')
      }
    } catch { showToast('Delete error', 'error') }
    finally { setDeleting(null) }
  }

  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium
              ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" /> Mark Sheets
          </h1>
          <p className="text-slate-500 mt-1">Upload and manage your semester mark sheets.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-brand-500/20"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Upload New'}
        </button>
      </motion.div>

      {/* Upload Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass p-6 rounded-2xl border border-brand-100"
          >
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Label *</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Semester 3 Result"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Semester</label>
                  <select
                    value={form.semester}
                    onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                  >
                    <option value="">Select semester…</option>
                    {SEMESTER_OPTIONS.map(n => <option key={n} value={n}>Semester {n}</option>)}
                  </select>
                </div>
              </div>

              {/* File Drop Area */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                  ${selectedFile ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-6 h-6 text-brand-500" />
                    <div className="text-left">
                      <p className="font-medium text-slate-900 text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null) }}
                      className="ml-auto text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Click to select a file</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG, JPEG, WEBP</p>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !form.label.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading…' : 'Upload Mark Sheet'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marksheets List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
        </div>
      ) : marksheets.length === 0 ? (
        <motion.div initial="hidden" animate="visible" variants={fadeIn}
          className="py-20 text-center glass rounded-3xl">
          <FileText className="w-14 h-14 mx-auto mb-4 text-slate-200" />
          <h3 className="font-semibold text-slate-700 mb-1">No mark sheets uploaded yet</h3>
          <p className="text-slate-400 text-sm">Click "Upload New" to add your semester mark sheets.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {marksheets.map((sheet, idx) => (
            <motion.div
              key={sheet.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="glass p-5 rounded-2xl flex items-center gap-4 group hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {sheet.label}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {sheet.semester && (
                    <span className="text-xs text-slate-500">Semester {sheet.semester}</span>
                  )}
                  {sheet.file_name && (
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">{sheet.file_name}</span>
                  )}
                  <span className="text-xs text-slate-300">
                    {new Date(sheet.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={sheet.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <a
                  href={sheet.file_url}
                  download={sheet.file_name ?? 'marksheet'}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(sheet.id, sheet.file_url)}
                  disabled={deleting === sheet.id}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  {deleting === sheet.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
