import { Github, Globe, Linkedin, Mail, MapPin, Phone, ExternalLink } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ResumeData {
  name: string
  email: string
  department: string
  roll_number?: string
  semester?: number
  phone?: string
  address?: string
  photo_url?: string
  bio?: string
  college_name?: string
  degree?: string
  cgpa?: number
  linkedin_url?: string
  github_url?: string
  website_url?: string
  skills: { id: string; name: string; category: 'technical' | 'soft' }[]
  projects: {
    id: string; title: string; description?: string
    tech_stack?: string[]; project_url?: string; github_url?: string
  }[]
  achievements: {
    id: string; title: string; issuer?: string
    date_awarded?: string; description?: string; cert_url?: string
  }[]
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-3 mt-0">
      <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 print:text-gray-500">
        {title}
      </h2>
      <div className="mt-1 h-px bg-slate-200 print:bg-gray-300" />
    </div>
  )
}

// ─── ResumePreview component ──────────────────────────────────────────────────
export function ResumePreview({ data }: { data: ResumeData }) {
  const technicalSkills = data.skills.filter(s => s.category === 'technical')
  const softSkills = data.skills.filter(s => s.category === 'soft')
  const hasSkills = data.skills.length > 0
  const hasProjects = data.projects.length > 0
  const hasAchievements = data.achievements.length > 0
  const hasEducation = !!(data.college_name || data.degree || data.department)

  const contactItems = [
    data.email     && { icon: Mail,     label: data.email,       href: `mailto:${data.email}` },
    data.phone     && { icon: Phone,    label: data.phone,       href: `tel:${data.phone}` },
    data.address   && { icon: MapPin,   label: data.address,     href: null },
    data.linkedin_url && { icon: Linkedin, label: 'LinkedIn',    href: data.linkedin_url },
    data.github_url   && { icon: Github,   label: 'GitHub',      href: data.github_url },
    data.website_url  && { icon: Globe,    label: 'Portfolio',   href: data.website_url },
  ].filter(Boolean) as { icon: React.ElementType; label: string; href: string | null }[]

  return (
    // A4 canvas — white, letter-spaced, minimal
    <div
      id="resume-content"
      className="
        bg-white font-sans text-slate-800
        w-full max-w-[794px] mx-auto
        px-[52px] py-[48px]
        print:px-[40px] print:py-[36px]
        print:shadow-none print:border-none
        shadow-2xl shadow-slate-200
        text-[13px] leading-relaxed
      "
      style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}
    >
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="mb-6 print:mb-5">
        <h1 className="text-[28px] font-black tracking-tight text-slate-900 print:text-[26px] leading-none">
          {data.name}
        </h1>

        {(data.degree || data.department) && (
          <p className="mt-1 text-[13px] font-semibold text-slate-500 print:text-gray-500">
            {[data.degree, data.department].filter(Boolean).join(' · ')}
          </p>
        )}

        {data.bio && (
          <p className="mt-3 text-[12.5px] text-slate-600 print:text-gray-600 max-w-2xl leading-relaxed">
            {data.bio}
          </p>
        )}

        {/* Contact row */}
        {contactItems.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {contactItems.map(({ icon: Icon, label, href }, i) =>
              href ? (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11.5px] text-slate-500 hover:text-slate-800 print:text-gray-500 transition-colors"
                >
                  <Icon className="w-3 h-3 opacity-70" />
                  {label}
                </a>
              ) : (
                <span key={i} className="flex items-center gap-1 text-[11.5px] text-slate-500 print:text-gray-500">
                  <Icon className="w-3 h-3 opacity-70" />
                  {label}
                </span>
              )
            )}
          </div>
        )}
      </div>

      {/* ── EDUCATION ──────────────────────────────────────── */}
      {hasEducation && (
        <section className="mb-5">
          <SectionHeading title="Education" />
          <div className="flex items-start justify-between gap-4">
            <div>
              {data.college_name && (
                <p className="font-bold text-slate-800 text-[13px]">{data.college_name}</p>
              )}
              <p className="text-[12.5px] text-slate-600 mt-0.5">
                {[data.degree, data.department].filter(Boolean).join(' — ')}
              </p>
              {data.roll_number && (
                <p className="text-[11.5px] text-slate-400 mt-0.5">Roll No: {data.roll_number}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              {data.cgpa && (
                <span className="inline-block text-[13px] font-bold text-slate-800">
                  CGPA: {data.cgpa}
                </span>
              )}
              {data.semester && (
                <p className="text-[11.5px] text-slate-400 mt-0.5">Semester {data.semester}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── SKILLS ─────────────────────────────────────────── */}
      {hasSkills && (
        <section className="mb-5">
          <SectionHeading title="Skills" />
          <div className="space-y-2">
            {technicalSkills.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[11.5px] font-bold text-slate-500 w-[90px] flex-shrink-0 pt-0.5">Technical</span>
                <div className="flex flex-wrap gap-1.5">
                  {technicalSkills.map(s => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 border border-slate-200 rounded text-[11.5px] text-slate-700 print:border-gray-300"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {softSkills.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[11.5px] font-bold text-slate-500 w-[90px] flex-shrink-0 pt-0.5">Soft Skills</span>
                <p className="text-[12px] text-slate-600">{softSkills.map(s => s.name).join(' · ')}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── PROJECTS ───────────────────────────────────────── */}
      {hasProjects && (
        <section className="mb-5">
          <SectionHeading title="Projects" />
          <div className="space-y-4">
            {data.projects.map(p => (
              <div key={p.id}>
                {/* Title row */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-bold text-slate-800 text-[13px]">{p.title}</p>
                  <div className="flex items-center gap-3">
                    {p.project_url && (
                      <a
                        href={p.project_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-0.5 text-[11px] text-slate-400 hover:text-slate-600 print:text-gray-400"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> Live Demo
                      </a>
                    )}
                    {p.github_url && (
                      <a
                        href={p.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-0.5 text-[11px] text-slate-400 hover:text-slate-600 print:text-gray-400"
                      >
                        <Github className="w-2.5 h-2.5" /> GitHub
                      </a>
                    )}
                  </div>
                </div>

                {/* Tech stack */}
                {p.tech_stack && p.tech_stack.length > 0 && (
                  <p className="text-[11.5px] text-slate-400 mt-0.5 print:text-gray-400">
                    {p.tech_stack.join(' · ')}
                  </p>
                )}

                {/* Description */}
                {p.description && (
                  <p className="text-[12.5px] text-slate-600 mt-1 leading-relaxed print:text-gray-600">
                    {p.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ACHIEVEMENTS ───────────────────────────────────── */}
      {hasAchievements && (
        <section className="mb-5">
          <SectionHeading title="Achievements &amp; Certifications" />
          <div className="space-y-2.5">
            {data.achievements.map(a => (
              <div key={a.id} className="flex items-start gap-2">
                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 text-[13px]">{a.title}</span>
                  {(a.issuer || a.date_awarded) && (
                    <span className="text-[11.5px] text-slate-400 ml-2 print:text-gray-400">
                      {[a.issuer, a.date_awarded ? new Date(a.date_awarded).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : null].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  {a.description && (
                    <p className="text-[12px] text-slate-600 mt-0.5 print:text-gray-600">{a.description}</p>
                  )}
                  {a.cert_url && (
                    <a href={a.cert_url} target="_blank" rel="noreferrer"
                      className="text-[11px] text-brand-600 hover:underline print:text-gray-500">
                      View Certificate ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ResumePreview
