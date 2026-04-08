'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Users, Loader2, FileText, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DataTable, Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { supabase } from '@/lib/supabase-client'

interface StudentProfile {
  id: string
  name: string
  roll_number: string
  department: string
}

interface Activity {
  id: string
  title: string
  category: string
  description: string
  date: string
  proof_url: string
  approval_status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles: StudentProfile
}

export default function FacultyStudentsPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal for individual activity review
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchActivities = async () => {
    try {
      // Need a custom API to get activities along with student profiles
      // We will create /api/faculty/activities instead of reusing students API for simplicity,
      // but if we used supabase directly here it is faster for prototyping:
      
      const res = await fetch('/api/faculty/activities-list') // Will build this.
      if (res.ok) {
        const json = await res.json()
        setActivities(json.data || [])
      } else {
        // Fallback to supabase direct query if API is missing
        const { data, error } = await supabase
          .from('activities')
          .select(`
            *,
            profiles!activities_student_id_fkey ( id, name, roll_number, department )
          `)
          .order('created_at', { ascending: false })
          
        if (data) setActivities(data as any[])
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

  const handleReview = (activity: Activity) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
  }

  const updateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedActivity) return
    setActionLoading(true)
    
    try {
      const res = await fetch(`/api/faculty/activities/${selectedActivity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: status })
      })
      
      if (res.ok) {
        setIsModalOpen(false)
        fetchActivities()
      } else {
        const err = await res.json()
        alert(`Error: ${err.error}`)
      }
    } catch (error: unknown) {
      alert(`Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const columns: Column<Activity>[] = [
    { 
      header: 'Student', 
      accessorKey: 'profiles',
      cell: (row) => (
        <div>
          <div className="font-semibold text-white">{row.profiles.name}</div>
          <div className="text-xs text-white/50">{row.profiles.roll_number}</div>
        </div>
      )
    },
    { header: 'Title', accessorKey: 'title' },
    { 
      header: 'Category', 
      cell: (row) => <span className="capitalize text-white/70">{row.category}</span> 
    },
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
      header: 'Action',
      cell: (row) => (
        <button
          onClick={() => handleReview(row)}
          className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
        >
          Review
        </button>
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-600" />
          Student Activities Review
        </h1>
        <p className="text-slate-500 mt-1">Review and approve extra-curricular logs submitted by students.</p>
      </div>

      <Card className="bg-slate-900 overflow-hidden border-white/10">
        <div className="p-1">
          <DataTable 
            data={activities} 
            columns={columns} 
            searchKey="title" 
            searchPlaceholder="Search activity title..." 
          />
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => !actionLoading && setIsModalOpen(false)} title="Review Activity">
        {selectedActivity && (
          <div className="space-y-6 text-white/90">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/50 mb-1">Student</p>
                <p className="font-semibold">{selectedActivity.profiles.name}</p>
                <p className="text-sm">{selectedActivity.profiles.roll_number}</p>
              </div>
              <div>
                <p className="text-sm text-white/50 mb-1">Date</p>
                <p>{new Date(selectedActivity.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-semibold mb-2 text-brand-300">{selectedActivity.title}</h4>
              <p className="text-sm text-white/70 mb-4">{selectedActivity.description}</p>
              
              {selectedActivity.proof_url ? (
                <a 
                  href={selectedActivity.proof_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                >
                  <FileText className="w-4 h-4" /> View Proof <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              ) : (
                <p className="text-sm text-amber-500">No proof provided.</p>
              )}
            </div>

            {selectedActivity.approval_status === 'pending' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl font-medium transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateStatus('approved')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve
                </button>
              </div>
            )}
            
            {selectedActivity.approval_status !== 'pending' && (
              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-sm text-white/50">
                  This activity has already been <span className="font-semibold text-white">{selectedActivity.approval_status}</span>.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
