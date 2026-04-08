'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trophy, FileText, Loader2, UploadCloud } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DataTable, Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { supabase } from '@/lib/supabase-client'

interface Activity {
  id: string
  title: string
  category: string
  description: string
  date: string
  proof_url: string
  approval_status: 'pending' | 'approved' | 'rejected'
}

export default function StudentActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('technical')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/student/activities')
      if (res.ok) {
        const json = await res.json()
        setActivities(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let proofUrl = ''

      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('activity-proofs')
          .upload(fileName, proofFile)

        if (uploadError) throw new Error(uploadError.message)

        const { data: publicUrlData } = supabase.storage
          .from('activity-proofs')
          .getPublicUrl(fileName)

        proofUrl = publicUrlData.publicUrl
      }

      const res = await fetch('/api/student/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          date,
          proof_url: proofUrl,
        }),
      })

      if (res.ok) {
        setIsModalOpen(false)
        setTitle('')
        setDescription('')
        setDate('')
        setProofFile(null)
        fetchActivities()
      } else {
        const errData = await res.json()
        alert(`Error: ${errData.error}`)
      }
    } catch (err: unknown) {
      if (err instanceof Error) alert(`Upload failed: ${err.message}`)
      else alert(`Upload failed: Unknown error`)
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<Activity>[] = [
    { header: 'Title', accessorKey: 'title' },
    { 
      header: 'Category', 
      cell: (row) => <span className="capitalize">{row.category}</span> 
    },
    { header: 'Date', accessorKey: 'date' },
    { 
      header: 'Status', 
      cell: (row) => {
        const colors = {
          pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
          approved: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
          rejected: 'bg-red-500/20 text-red-600 border-red-500/30'
        }
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${colors[row.approval_status]}`}>
            {row.approval_status}
          </span>
        )
      } 
    },
    { 
      header: 'Proof', 
      cell: (row) => row.proof_url ? (
        <a href={row.proof_url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 underline flex items-center gap-1 text-sm">
          <FileText className="w-4 h-4" /> View
        </a>
      ) : (
        <span className="text-slate-400 text-sm">No proof</span>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Extra-Curricular Activities
          </h1>
          <p className="text-slate-500 mt-1">Log your achievements and events for profile points.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" /> Log Activity
        </button>
      </div>

      <Card className="shadow-xl shadow-slate-200/50 border-white/50 bg-slate-900 overflow-hidden">
        <div className="p-1">
          <DataTable
            data={activities}
            columns={columns}
            searchKey="title"
            searchPlaceholder="Search activities..."
            filterKey="category"
            filterLabel="Category"
          />
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => !submitting && setIsModalOpen(false)} title="Log New Activity">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. Winner at Hackathon"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
              >
                <option value="technical" className="text-black">Technical</option>
                <option value="cultural" className="text-black">Cultural</option>
                <option value="sports" className="text-black">Sports</option>
                <option value="social" className="text-black">Social Worker</option>
                <option value="other" className="text-black">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Date</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Brief details about your role and achievement..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Proof (Certificate/Photo)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-xl hover:border-brand-500/50 transition-colors">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-white/40" />
                <div className="flex text-sm text-white/60">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-transparent font-medium text-brand-400 hover:text-brand-300">
                    <span>Upload a file</span>
                    <input id="file-upload" type="file" className="sr-only" onChange={(e) => setProofFile(e.target.files?.[0] || null)} accept="image/*,.pdf" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-white/40">{proofFile ? proofFile.name : 'PNG, JPG, PDF up to 5MB'}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Activity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
