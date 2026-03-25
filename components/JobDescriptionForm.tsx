'use client'

interface Props {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export default function JobDescriptionForm({ value, onChange, disabled }: Props) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Job Description</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Paste the full JD to match candidates against</div>
        </div>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste the job description here…&#10;&#10;Example:&#10;We are looking for a Senior React Developer with 4+ years experience in TypeScript, Node.js, and REST APIs. The ideal candidate has a Bachelor's degree in CS or related field and experience with PostgreSQL and cloud deployments."
        style={{
          width: '100%',
          minHeight: 180,
          resize: 'vertical',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '12px',
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          background: disabled ? 'var(--bg)' : 'var(--surface)',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {value.length > 0 ? `${value.length} characters` : 'Min. 50 characters recommended'}
        </span>
        {value.length > 0 && (
          <button
            onClick={() => onChange('')}
            disabled={disabled}
            style={{ fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
