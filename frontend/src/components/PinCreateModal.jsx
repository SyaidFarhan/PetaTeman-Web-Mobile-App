import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { PIN_CATEGORIES, DURATION_OPTIONS, getExpiresAt } from '../utils/helpers'

export function PinCreateModal({ latlng, onClose, onCreate }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'other',
        durationHours: 6
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await onCreate({
                latitude: latlng.lat,
                longitude: latlng.lng,
                title: form.title,
                description: form.description,
                category: form.category,
                expires_at: getExpiresAt(form.durationHours)
            })
            onClose()
        } catch (err) {
            setError(err.response?.data?.error || err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                <div className="modal-handle" />
                <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} /> Buat Pin Baru</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                    {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
                </p>

                {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Judul *
                        </label>
                        <input
                            className="input"
                            placeholder="Mis: Makanannya enak di sini!"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            required
                            maxLength={80}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Deskripsi
                        </label>
                        <textarea
                            className="input"
                            placeholder="Cerita lebih lanjut..."
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={3}
                            style={{ resize: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Kategori
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {PIN_CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                                    style={{
                                        padding: '8px 4px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: `1px solid ${form.category === cat.value ? 'var(--accent)' : 'var(--border)'}`,
                                        background: form.category === cat.value ? 'rgba(62,145,255,0.15)' : 'var(--bg-glass)',
                                        color: form.category === cat.value ? 'var(--accent-light)' : 'var(--text-secondary)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all var(--transition)'
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Durasi Aktif
                        </label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {DURATION_OPTIONS.map(opt => (
                                <button
                                    key={opt.label}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, durationHours: opt.hours }))}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 'var(--radius-full)',
                                        border: `1px solid ${form.durationHours === opt.hours ? 'var(--accent)' : 'var(--border)'}`,
                                        background: form.durationHours === opt.hours ? 'var(--accent)' : 'var(--bg-glass)',
                                        color: form.durationHours === opt.hours ? '#fff' : 'var(--text-secondary)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                        <button type="button" className="btn btn-secondary btn-full" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary btn-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} disabled={loading || !form.title}>
                            {loading ? '...' : <><MapPin size={15} /> Buat Pin</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
