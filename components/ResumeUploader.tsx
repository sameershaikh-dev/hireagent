'use client'

import { useRef, useState } from 'react'

interface Props {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

export default function ResumeUploader({ files, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    const valid = Array.from(incoming).filter(f => allowed.includes(f.type) || f.name.endsWith('.txt') || f.name.endsWith('.pdf') || f.name.endsWith('.docx'))
    const combined = [...files, ...valid].slice(0, 20)
    const deduped = combined.filter((f, i, arr) => arr.findIndex(x => x.name === f.name) === i)
    onChange(deduped)
  }

  const remove = (name: string) => onChange(files.filter(f => f.name !== name))

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const fileIcon = (name: string) => {
    if (name.endsWith('.pdf')) return { label: 'PDF', color: '#dc2626', bg: '#fef2f2' }
    if (name.endsWith('.docx')) return { label: 'DOC', color: '#2563eb', bg: '#eff6ff' }
    return { label: 'TXT', color: '#6b6860', bg: '#f3f2ef' }
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
            Resumes <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({files.length}/20)</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF, DOCX, or TXT — up to 20 files</div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: dragging ? 'var(--accent-light)' : 'var(--bg)',
          transition: 'all 0.15s',
          marginBottom: files.length > 0 ? 14 : 0,
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 6 }}>📂</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {dragging ? 'Drop files here' : 'Click or drag & drop resumes'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Supports PDF, DOCX, TXT
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        multiple
        style={{ display: 'none' }}
        onChange={e => addFiles(e.target.files)}
      />

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {files.map(f => {
            const icon = fileIcon(f.name)
            return (
              <div
                key={f.name}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: icon.color, background: icon.bg, padding: '2px 5px', borderRadius: 4 }}>
                  {icon.label}
                </span>
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {formatSize(f.size)}
                </span>
                {!disabled && (
                  <button
                    onClick={e => { e.stopPropagation(); remove(f.name) }}
                    style={{ fontSize: 14, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
