'use client'

interface Props {
  total: number
  current: number
  stage: string
}

const stages = [
  { key: 'parse', label: 'Parse Agent', desc: 'Extracting text from resumes', icon: '📄' },
  { key: 'score', label: 'Score Agent', desc: 'Rule-based skill matching & scoring', icon: '📊' },
  { key: 'justify', label: 'Justify Agent', desc: 'Gemini AI role fit assessment', icon: '🤖' },
  { key: 'rank', label: 'Ranking', desc: 'Sorting candidates by final score', icon: '🏆' },
]

export default function ProcessingScreen({ total, current, stage }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const activeIdx = stages.findIndex(s => stage.includes(s.key))

  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 32, padding: 40,
    }}>
      {/* Spinner */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.9s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 28,
        }}>
          {stages[Math.max(0, activeIdx)]?.icon ?? '⚙️'}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          Screening Resumes…
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Processing {current} of {total} candidates
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 99 }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'var(--accent)',
            width: `${pct}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Agent pipeline steps */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 480 }}>
        {stages.map((s, i) => {
          const done = i < activeIdx
          const active = i === activeIdx
          return (
            <div
              key={s.key}
              style={{
                padding: '6px 12px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 500,
                border: '1px solid',
                borderColor: active ? 'var(--accent)' : done ? 'var(--success)' : 'var(--border)',
                background: active ? 'var(--accent-light)' : done ? 'var(--success-light)' : 'transparent',
                color: active ? 'var(--accent)' : done ? 'var(--success)' : 'var(--text-muted)',
                transition: 'all 0.3s',
              }}
            >
              {done ? '✓ ' : ''}{s.label}
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        {stage}
      </div>
    </div>
  )
}
