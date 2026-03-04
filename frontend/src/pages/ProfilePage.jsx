import { useState } from 'react'
import { Radio, PauseCircle, Ghost, Map, Check, Info, LogOut } from 'lucide-react'
import { updateMe } from '../api/location.api'
import { signOut } from '../api/auth.api'
import { getInitials } from '../utils/helpers'

const LOCATION_MODES = [
    { value: 'realtime', Icon: Radio, label: 'Real-time', desc: 'Lokasi diperbarui secara langsung' },
    { value: 'paused', Icon: PauseCircle, label: 'Dijeda', desc: 'Teman melihat posisi terakhirmu' },
    { value: 'ghost', Icon: Ghost, label: 'Ghost', desc: 'Avatar tidak terlihat sama sekali' }
]

export function ProfilePage({ profile }) {
    const [locationMode, setLocationMode] = useState(profile?.location_mode || 'realtime')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleModeChange = async (mode) => {
        setLocationMode(mode)
        setSaving(true)
        try {
            await updateMe({ location_mode: mode })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } finally {
            setSaving(false)
        }
    }

    if (!profile) return (
        <div className="loading-center"><div className="spinner" /></div>
    )

    return (
        <div className="page">
            {/* Profile hero */}
            <div style={{
                textAlign: 'center',
                padding: 'var(--space-xl) 0 var(--space-lg)',
                animation: 'fadeInUp 0.4s both'
            }}>
                <div className="avatar avatar-lg" style={{ margin: '0 auto var(--space-md)', boxShadow: 'var(--shadow-accent)' }}>
                    {profile.avatar_url
                        ? <img src={profile.avatar_url} alt={profile.username} />
                        : getInitials(profile.username)
                    }
                </div>
                <h2>@{profile.username}</h2>
                {profile.email && (
                    <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>{profile.email}</p>
                )}
            </div>

            {/* Location mode */}
            <div className="card" style={{ marginBottom: 'var(--space-md)', animation: 'fadeInUp 0.4s 0.1s both' }}>
                <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Map size={18} /> Mode Lokasi
                    {saving && <span style={{ marginLeft: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Menyimpan...</span>}
                    {saved && <span style={{ marginLeft: '4px', fontSize: '0.75rem', color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Check size={13} /> Tersimpan</span>}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {LOCATION_MODES.map(({ value, Icon, label, desc }) => (
                        <div
                            key={value}
                            onClick={() => handleModeChange(value)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                border: `1px solid ${locationMode === value ? 'var(--accent)' : 'var(--border)'}`,
                                background: locationMode === value ? 'rgba(62,145,255,0.08)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all var(--transition)'
                            }}
                        >
                            <Icon size={18} color={locationMode === value ? 'var(--accent)' : 'var(--text-muted)'} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{label}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{desc}</div>
                            </div>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: `2px solid ${locationMode === value ? 'var(--accent)' : 'var(--border)'}`,
                                background: locationMode === value ? 'var(--accent)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {locationMode === value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* App info */}
            <div className="card" style={{ marginBottom: 'var(--space-md)', animation: 'fadeInUp 0.4s 0.2s both' }}>
                <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}><Info size={18} /> Tentang Peta</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                        ['Versi', '1.0.0'],
                        ['Platform', 'Mobile Web (PWA)'],
                        ['Realtime', 'Supabase + WebSocket']
                    ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                            <span>{v}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sign out */}
            <button
                className="btn btn-danger btn-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', animation: 'fadeInUp 0.4s 0.3s both' }}
                onClick={() => { if (confirm('Yakin ingin keluar?')) signOut() }}
            >
                <LogOut size={16} /> Keluar
            </button>
        </div>
    )
}
