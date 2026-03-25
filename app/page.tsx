// 'use client'

// import { useState } from 'react'
// import JobDescriptionForm from '@/components/JobDescriptionForm'
// import ResumeUploader from '@/components/ResumeUploader'
// import ProcessingScreen from '@/components/ProcessingScreen'
// import type { CandidateResult, ScreeningResponse } from '@/types'

// type View = 'setup' | 'processing' | 'results'

// const recommendationStyle = (rec: string) => {
//   switch (rec) {
//     case 'Strong Yes': return { bg: '#dcfce7', color: '#15803d', border: '#86efac' }
//     case 'Yes': return { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' }
//     case 'Maybe': return { bg: '#fef9c3', color: '#854d0e', border: '#fde047' }
//     case 'No': return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
//     default: return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' }
//   }
// }

// const ScoreBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
//   <div style={{ height: 5, background: '#e5e3de', borderRadius: 99, overflow: 'hidden' }}>
//     <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
//   </div>
// )

// export default function Home() {
//   const [view, setView] = useState<View>('setup')
//   const [jd, setJd] = useState('')
//   const [apiKey, setApiKey] = useState('')
//   const [files, setFiles] = useState<File[]>([])
//   const [results, setResults] = useState<ScreeningResponse | null>(null)
//   const [error, setError] = useState('')
//   const [processing, setProcessing] = useState({ current: 0, stage: '' })
//   const [expandedId, setExpandedId] = useState<string | null>(null)

//   const canSubmit = jd.trim().length >= 20 && files.length > 0 && apiKey.trim().length > 10

//   const runScreening = async () => {
//     setError('')
//     setView('processing')
//     setProcessing({ current: 0, stage: 'Initializing pipeline…' })

//     const formData = new FormData()
//     formData.append('jobDescription', jd)
//     formData.append('apiKey', apiKey)
//     files.forEach(f => formData.append('resumes', f))

//     // Simulate progress updates
//     const interval = setInterval(() => {
//       setProcessing(prev => {
//         const stages = [
//           'parse agent — extracting text from resumes…',
//           'score agent — matching skills & experience…',
//           'justify agent — Gemini AI assessing role fit…',
//           'rank agent — sorting candidates…',
//         ]
//         const nextStage = stages[Math.min(Math.floor(prev.current / (files.length / 4 + 1)), stages.length - 1)]
//         return { current: Math.min(prev.current + 1, files.length - 1), stage: nextStage }
//       })
//     }, 900)

//     try {
//       const res = await fetch('/api/screen', { method: 'POST', body: formData })
//       clearInterval(interval)
//       if (!res.ok) {
//         const data = await res.json()
//         throw new Error(data.error || 'Request failed')
//       }
//       const data: ScreeningResponse = await res.json()
//       setResults(data)
//       setView('results')
//     } catch (err: unknown) {
//       clearInterval(interval)
//       setError(err instanceof Error ? err.message : 'Unknown error')
//       setView('setup')
//     }
//   }

//   const reset = () => {
//     setView('setup')
//     setResults(null)
//     setError('')
//     setExpandedId(null)
//   }

//   // ── RESULTS VIEW ───────────────────────────────────────────────────────────
//   if (view === 'results' && results) {
//     const shortlisted = results.candidates.filter(c => ['Strong Yes', 'Yes'].includes(c.aiAssessment.recommendation))
//     return (
//       <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
//         {/* Header */}
//         <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//             <span style={{ fontSize: 20 }}>🤖</span>
//             <span style={{ fontWeight: 700, fontSize: 15 }}>HireAgent</span>
//             <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border)' }}>Results</span>
//           </div>
//           <button
//             onClick={reset}
//             style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: '1px solid #bfdbfe', borderRadius: 'var(--radius)', padding: '6px 14px', cursor: 'pointer', fontWeight: 500 }}
//           >
//             ← New Screening
//           </button>
//         </header>

//         <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
//           {/* Summary stats */}
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
//             {[
//               { label: 'Total Screened', value: results.totalResumes, icon: '📋' },
//               { label: 'Shortlisted', value: shortlisted.length, icon: '✅' },
//               { label: 'Avg Score', value: `${Math.round(results.candidates.reduce((s, c) => s + c.finalScore, 0) / results.candidates.length)}`, icon: '📊' },
//               { label: 'Top Score', value: results.candidates[0]?.finalScore ?? 0, icon: '🏆' },
//             ].map(stat => (
//               <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
//                 <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
//                 <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
//                 <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</div>
//               </div>
//             ))}
//           </div>

//           {/* Candidate cards */}
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//             {results.candidates.map(c => {
//               const rec = recommendationStyle(c.aiAssessment.recommendation)
//               const isOpen = expandedId === c.id
//               return (
//                 <div
//                   key={c.id}
//                   className="fade-in"
//                   style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}
//                 >
//                   {/* Card header */}
//                   <div
//                     onClick={() => setExpandedId(isOpen ? null : c.id)}
//                     style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}
//                   >
//                     {/* Rank */}
//                     <div style={{ width: 32, height: 32, borderRadius: 8, background: c.rank === 1 ? '#fef9c3' : c.rank === 2 ? '#f1f5f9' : 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: c.rank <= 3 ? 'var(--text-primary)' : 'var(--text-muted)', flexShrink: 0 }}>
//                       {c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : `#${c.rank}`}
//                     </div>

//                     {/* Name */}
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                         {c.fileName.replace(/\.[^.]+$/, '')}
//                       </div>
//                       <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
//                         {c.ruleScore.experienceYears > 0 ? `${c.ruleScore.experienceYears} yrs exp · ` : ''}{c.ruleScore.matchedSkills.slice(0, 3).join(', ') || 'No skills matched'}
//                       </div>
//                     </div>

//                     {/* Score */}
//                     <div style={{ textAlign: 'center', flexShrink: 0 }}>
//                       <div style={{ fontSize: 20, fontWeight: 700, color: c.finalScore >= 70 ? 'var(--success)' : c.finalScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
//                         {c.finalScore}
//                       </div>
//                       <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ 100</div>
//                     </div>

//                     {/* Recommendation badge */}
//                     <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: rec.bg, color: rec.color, border: `1px solid ${rec.border}`, flexShrink: 0 }}>
//                       {c.aiAssessment.recommendation}
//                     </span>

//                     {/* Expand chevron */}
//                     <span style={{ color: 'var(--text-muted)', fontSize: 12, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
//                   </div>

//                   {/* Expanded detail */}
//                   {isOpen && (
//                     <div style={{ borderTop: '1px solid var(--border)', padding: '18px 18px 18px', background: 'var(--bg)' }}>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//                         {/* Scores breakdown */}
//                         <div>
//                           <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score Breakdown</div>
//                           {[
//                             { label: 'Skill Match', value: c.ruleScore.skillScore, max: 40, color: '#3b82f6' },
//                             { label: 'Experience', value: c.ruleScore.experienceScore, max: 30, color: '#8b5cf6' },
//                             { label: 'Education', value: c.ruleScore.educationScore, max: 30, color: '#f59e0b' },
//                             { label: 'AI Role Fit', value: c.aiAssessment.roleFitScore, max: 100, color: '#10b981' },
//                           ].map(s => (
//                             <div key={s.label} style={{ marginBottom: 10 }}>
//                               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
//                                 <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
//                                 <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}/{s.max}</span>
//                               </div>
//                               <ScoreBar value={s.value} max={s.max} color={s.color} />
//                             </div>
//                           ))}
//                         </div>

//                         {/* AI assessment */}
//                         <div>
//                           <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Assessment</div>
//                           <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
//                             {c.aiAssessment.explanation}
//                           </p>
//                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//                             <div>
//                               <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', marginBottom: 6 }}>✓ Strengths</div>
//                               {c.aiAssessment.strengths.map((s, i) => (
//                                 <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '3px 0', borderBottom: '1px solid var(--border)', lineHeight: 1.4 }}>{s}</div>
//                               ))}
//                             </div>
//                             <div>
//                               <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>✗ Gaps</div>
//                               {c.aiAssessment.gaps.map((g, i) => (
//                                 <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '3px 0', borderBottom: '1px solid var(--border)', lineHeight: 1.4 }}>{g}</div>
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Matched skills */}
//                       {c.ruleScore.matchedSkills.length > 0 && (
//                         <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
//                           <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>MATCHED SKILLS</div>
//                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
//                             {c.ruleScore.matchedSkills.map(s => (
//                               <span key={s} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 4, border: '1px solid #bfdbfe' }}>
//                                 {s}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )
//             })}
//           </div>

//           <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 24 }}>
//             Processed {results.totalResumes} resumes · {new Date(results.processedAt).toLocaleString()}
//           </p>
//         </div>
//       </div>
//     )
//   }

//   // ── PROCESSING VIEW ────────────────────────────────────────────────────────
//   if (view === 'processing') {
//     return (
//       <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
//         <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 10 }}>
//           <span style={{ fontSize: 20 }}>🤖</span>
//           <span style={{ fontWeight: 700, fontSize: 15 }}>HireAgent</span>
//         </header>
//         <ProcessingScreen total={files.length} current={processing.current} stage={processing.stage} />
//       </div>
//     )
//   }

//   // ── SETUP VIEW ─────────────────────────────────────────────────────────────
//   return (
//     <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
//       {/* Header */}
//       <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
//         <span style={{ fontSize: 20 }}>🤖</span>
//         <div>
//           <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>HireAgent</span>
//           <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>Agentic AI Resume Screener</span>
//         </div>
//       </header>

//       <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
//         {/* Hero */}
//         <div style={{ textAlign: 'center', marginBottom: 36 }}>
//           <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
//             Screen Resumes Instantly
//           </h1>
//           <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto' }}>
//             Upload up to 20 resumes and a job description. A 3-agent AI pipeline will parse, score, and rank candidates automatically.
//           </p>

//           {/* Pipeline badges */}
//           <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
//             {[
//               { icon: '📄', label: 'Parse Agent' },
//               { icon: '→', label: '', plain: true },
//               { icon: '📊', label: 'Score Agent' },
//               { icon: '→', label: '', plain: true },
//               { icon: '🤖', label: 'Justify Agent (Gemini)' },
//               { icon: '→', label: '', plain: true },
//               { icon: '🏆', label: 'Ranked Shortlist' },
//             ].map((b, i) => b.plain ? (
//               <span key={i} style={{ color: 'var(--text-muted)', fontSize: 14 }}>{b.icon}</span>
//             ) : (
//               <span key={i} style={{ fontSize: 12, padding: '4px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--text-secondary)' }}>
//                 {b.icon} {b.label}
//               </span>
//             ))}
//           </div>
//         </div>

//         {error && (
//           <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--danger)' }}>
//             ⚠️ {error}
//           </div>
//         )}

//         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//           {/* API Key */}
//           <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
//               <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 🔑
//               </div>
//               <div>
//                 <div style={{ fontWeight: 600, fontSize: 14 }}>Gemini API Key</div>
//                 <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//                   Get a free key at{' '}
//                   <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
//                     aistudio.google.com
//                   </a>
//                 </div>
//               </div>
//             </div>
//             <input
//               type="password"
//               value={apiKey}
//               onChange={e => setApiKey(e.target.value)}
//               placeholder="AIza…"
//               style={{
//                 width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
//                 padding: '10px 12px', fontSize: 13, fontFamily: 'monospace',
//                 color: 'var(--text-primary)', background: 'var(--bg)', outline: 'none',
//               }}
//               onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
//               onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
//             />
//           </div>

//           <JobDescriptionForm value={jd} onChange={setJd} />
//           <ResumeUploader files={files} onChange={setFiles} />

//           {/* Submit */}
//           <button
//             onClick={runScreening}
//             disabled={!canSubmit}
//             style={{
//               width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
//               background: canSubmit ? 'var(--accent)' : '#93c5fd',
//               color: '#fff', fontWeight: 600, fontSize: 15,
//               border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
//               transition: 'background 0.15s', letterSpacing: '-0.01em',
//             }}
//             onMouseEnter={e => { if (canSubmit) (e.target as HTMLButtonElement).style.background = 'var(--accent-hover)' }}
//             onMouseLeave={e => { if (canSubmit) (e.target as HTMLButtonElement).style.background = 'var(--accent)' }}
//           >
//             🚀 Screen {files.length > 0 ? `${files.length} Resume${files.length > 1 ? 's' : ''}` : 'Resumes'}
//           </button>

//           {!canSubmit && (
//             <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: -8 }}>
//               {!apiKey ? 'Add your Gemini API key · ' : ''}{jd.trim().length < 20 ? 'Add a job description · ' : ''}{files.length === 0 ? 'Upload at least one resume' : ''}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
'use client'

import { useState } from 'react'
import JobDescriptionForm from '@/components/JobDescriptionForm'
import ResumeUploader from '@/components/ResumeUploader'
import ProcessingScreen from '@/components/ProcessingScreen'
import type { CandidateResult, ScreeningResponse } from '@/types'

type View = 'setup' | 'processing' | 'results'

const recommendationStyle = (rec: string) => {
  switch (rec) {
    case 'Strong Yes': return { bg: '#dcfce7', color: '#15803d', border: '#86efac' }
    case 'Yes': return { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' }
    case 'Maybe': return { bg: '#fef9c3', color: '#854d0e', border: '#fde047' }
    case 'No': return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
    default: return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' }
  }
}

const ScoreBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div style={{ height: 5, background: '#e5e3de', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
  </div>
)

export default function Home() {
  const [view, setView] = useState<View>('setup')
  const [jd, setJd] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<ScreeningResponse | null>(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState({ current: 0, stage: '' })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const canSubmit = jd.trim().length >= 20 && files.length > 0 && apiKey.trim().length > 10

  const runScreening = async () => {
    setError('')
    setView('processing')
    setProcessing({ current: 0, stage: 'Initializing pipeline…' })

    const formData = new FormData()
    formData.append('jobDescription', jd)
    formData.append('apiKey', apiKey)
    files.forEach(f => formData.append('resumes', f))

    // Simulate progress updates
    const interval = setInterval(() => {
      setProcessing(prev => {
        const stages = [
          'parse agent — extracting text from resumes…',
          'score agent — matching skills & experience…',
          'justify agent — Gemini AI assessing role fit…',
          'rank agent — sorting candidates…',
        ]
        const nextStage = stages[Math.min(Math.floor(prev.current / (files.length / 4 + 1)), stages.length - 1)]
        return { current: Math.min(prev.current + 1, files.length - 1), stage: nextStage }
      })
    }, 900)

    try {
      const res = await fetch('/api/screen', { method: 'POST', body: formData })
      clearInterval(interval)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Request failed')
      }
      const data: ScreeningResponse = await res.json()
      setResults(data)
      setView('results')
    } catch (err: unknown) {
      clearInterval(interval)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setView('setup')
    }
  }

  const reset = () => {
    setView('setup')
    setResults(null)
    setError('')
    setExpandedId(null)
  }

  // ── RESULTS VIEW ───────────────────────────────────────────────────────────
  if (view === 'results' && results) {
    const shortlisted = results.candidates.filter(c => ['Strong Yes', 'Yes'].includes(c.aiAssessment.recommendation))
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Header */}
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>HireAgent</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border)' }}>Results</span>
          </div>
          <button
            onClick={reset}
            style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: '1px solid #bfdbfe', borderRadius: 'var(--radius)', padding: '6px 14px', cursor: 'pointer', fontWeight: 500 }}
          >
            ← New Screening
          </button>
        </header>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Screened', value: results.totalResumes, icon: '📋' },
              { label: 'Shortlisted', value: shortlisted.length, icon: '✅' },
              { label: 'Avg Score', value: `${Math.round(results.candidates.reduce((s, c) => s + c.finalScore, 0) / results.candidates.length)}`, icon: '📊' },
              { label: 'Top Score', value: results.candidates[0]?.finalScore ?? 0, icon: '🏆' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Candidate cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.candidates.map(c => {
              const rec = recommendationStyle(c.aiAssessment.recommendation)
              const isOpen = expandedId === c.id
              return (
                <div
                  key={c.id}
                  className="fade-in"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}
                >
                  {/* Card header */}
                  <div
                    onClick={() => setExpandedId(isOpen ? null : c.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}
                  >
                    {/* Rank */}
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: c.rank === 1 ? '#fef9c3' : c.rank === 2 ? '#f1f5f9' : 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: c.rank <= 3 ? 'var(--text-primary)' : 'var(--text-muted)', flexShrink: 0 }}>
                      {c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : `#${c.rank}`}
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.fileName.replace(/\.[^.]+$/, '')}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {c.ruleScore.experienceYears > 0 ? `${c.ruleScore.experienceYears} yrs exp · ` : ''}{c.ruleScore.matchedSkills.slice(0, 3).join(', ') || 'No skills matched'}
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: c.finalScore >= 70 ? 'var(--success)' : c.finalScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                        {c.finalScore}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ 100</div>
                    </div>

                    {/* Recommendation badge */}
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: rec.bg, color: rec.color, border: `1px solid ${rec.border}`, flexShrink: 0 }}>
                      {c.aiAssessment.recommendation}
                    </span>

                    {/* Expand chevron */}
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '18px 18px 18px', background: 'var(--bg)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {/* Scores breakdown */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score Breakdown</div>
                          {[
                            { label: 'Skill Match', value: c.ruleScore.skillScore, max: 40, color: '#3b82f6' },
                            { label: 'Experience', value: c.ruleScore.experienceScore, max: 30, color: '#8b5cf6' },
                            { label: 'Education', value: c.ruleScore.educationScore, max: 30, color: '#f59e0b' },
                            { label: 'AI Role Fit', value: c.aiAssessment.roleFitScore, max: 100, color: '#10b981' },
                          ].map(s => (
                            <div key={s.label} style={{ marginBottom: 10 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}/{s.max}</span>
                              </div>
                              <ScoreBar value={s.value} max={s.max} color={s.color} />
                            </div>
                          ))}
                        </div>

                        {/* AI assessment */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Assessment</div>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                            {c.aiAssessment.explanation}
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', marginBottom: 6 }}>✓ Strengths</div>
                              {c.aiAssessment.strengths.map((s, i) => (
                                <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '3px 0', borderBottom: '1px solid var(--border)', lineHeight: 1.4 }}>{s}</div>
                              ))}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>✗ Gaps</div>
                              {c.aiAssessment.gaps.map((g, i) => (
                                <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '3px 0', borderBottom: '1px solid var(--border)', lineHeight: 1.4 }}>{g}</div>
                              ))}
                            </div>
                          </div>
                          {/* Why Select / Why Not */}
                          {(c.aiAssessment.whySelect || c.aiAssessment.whyNotSelect) && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                              {c.aiAssessment.whySelect && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 12px' }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', marginBottom: 5 }}>👍 Why Select</div>
                                  <p style={{ fontSize: 11, color: '#166534', lineHeight: 1.5 }}>{c.aiAssessment.whySelect}</p>
                                </div>
                              )}
                              {c.aiAssessment.whyNotSelect && (
                                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '10px 12px' }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#c2410c', marginBottom: 5 }}>👎 Why Not Select</div>
                                  <p style={{ fontSize: 11, color: '#9a3412', lineHeight: 1.5 }}>{c.aiAssessment.whyNotSelect}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Matched skills */}
                      {c.ruleScore.matchedSkills.length > 0 && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>MATCHED SKILLS</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {c.ruleScore.matchedSkills.map(s => (
                              <span key={s} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 4, border: '1px solid #bfdbfe' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 24 }}>
            Processed {results.totalResumes} resumes · {new Date(results.processedAt).toLocaleString()}
          </p>
        </div>
      </div>
    )
  }

  // ── PROCESSING VIEW ────────────────────────────────────────────────────────
  if (view === 'processing') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>HireAgent</span>
        </header>
        <ProcessingScreen total={files.length} current={processing.current} stage={processing.stage} />
      </div>
    )
  }

  // ── SETUP VIEW ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>HireAgent</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>Agentic AI Resume Screener</span>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Screen Resumes Instantly
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto' }}>
            Upload up to 20 resumes and a job description. A 3-agent AI pipeline will parse, score, and rank candidates automatically.
          </p>

          {/* Pipeline badges */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { icon: '📄', label: 'Parse Agent' },
              { icon: '→', label: '', plain: true },
              { icon: '📊', label: 'Score Agent' },
              { icon: '→', label: '', plain: true },
              { icon: '🤖', label: 'Justify Agent (Gemini)' },
              { icon: '→', label: '', plain: true },
              { icon: '🏆', label: 'Ranked Shortlist' },
            ].map((b, i) => b.plain ? (
              <span key={i} style={{ color: 'var(--text-muted)', fontSize: 14 }}>{b.icon}</span>
            ) : (
              <span key={i} style={{ fontSize: 12, padding: '4px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--text-secondary)' }}>
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--danger)' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* API Key */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🔑
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Gemini API Key</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Get a free key at{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                    aistudio.google.com
                  </a>
                </div>
              </div>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIza…"
              style={{
                width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                padding: '10px 12px', fontSize: 13, fontFamily: 'monospace',
                color: 'var(--text-primary)', background: 'var(--bg)', outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>

          <JobDescriptionForm value={jd} onChange={setJd} />
          <ResumeUploader files={files} onChange={setFiles} />

          {/* Submit */}
          <button
            onClick={runScreening}
            disabled={!canSubmit}
            style={{
              width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
              background: canSubmit ? 'var(--accent)' : '#93c5fd',
              color: '#fff', fontWeight: 600, fontSize: 15,
              border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s', letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { if (canSubmit) (e.target as HTMLButtonElement).style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { if (canSubmit) (e.target as HTMLButtonElement).style.background = 'var(--accent)' }}
          >
            🚀 Screen {files.length > 0 ? `${files.length} Resume${files.length > 1 ? 's' : ''}` : 'Resumes'}
          </button>

          {!canSubmit && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: -8 }}>
              {!apiKey ? 'Add your Gemini API key · ' : ''}{jd.trim().length < 20 ? 'Add a job description · ' : ''}{files.length === 0 ? 'Upload at least one resume' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
