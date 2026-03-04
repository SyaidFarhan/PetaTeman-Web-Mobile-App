import { useState } from 'react'
import { MapPin, Pin, Users, Clock, Timer, MessageCircle, Trash2 } from 'lucide-react'
import { usePins } from '../hooks/usePins'
import { formatTime, formatClock, PIN_CATEGORIES } from '../utils/helpers'
import { PinDetailModal } from '../components/PinDetailModal'

export function PinsPage({ profile }) {
    const { pins, loading, remove: deletePin, addReview, getDetail } = usePins()
    const [selectedPinId, setSelectedPinId] = useState(null)

    const myPins = pins.filter(p => p.user_id === profile?.id)
    const friendPins = pins.filter(p => p.user_id !== profile?.id)

    const getCategoryLabel = (cat) => PIN_CATEGORIES.find(c => c.value === cat)?.label || 'Lainnya'

    if (loading) return <div className="loading-center"><div className="spinner" /></div>

    return (
        <div className="page">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
                <MapPin size={22} /> Pin Lokasi
            </h2>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                {pins.length} pin aktif · Tap pin di peta untuk detail
            </div>

            {/* My pins */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="section-header">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Pin size={16} /> Pin Saya ({myPins.length})
                    </h4>
                </div>
                {myPins.length === 0 ? (
                    <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                        <div className="empty-icon"><MapPin size={40} /></div>
                        <p>Tap lokasi di peta untuk buat pin baru!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {myPins.map(pin => (
                            <div key={pin.id} className="card" onClick={() => setSelectedPinId(pin.id)} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <MapPin size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: '2px' }}>{pin.title}</div>
                                        {pin.description && (
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                                {pin.description}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span className="badge badge-accent">{getCategoryLabel(pin.category)}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <Clock size={11} /> {formatClock(pin.created_at)}
                                            </span>
                                            {pin.expires_at && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--orange)' }}>
                                                    <Timer size={11} /> {formatTime(pin.expires_at)}
                                                </span>
                                            )}
                                            {pin.reviews?.length > 0 && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    <MessageCircle size={11} /> {pin.reviews.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={e => { e.stopPropagation(); deletePin(pin.id) }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Friend pins */}
            {friendPins.length > 0 && (
                <div>
                    <div className="section-header">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={16} /> Pin Teman ({friendPins.length})
                        </h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {friendPins.map(pin => (
                            <div key={pin.id} className="card" onClick={() => setSelectedPinId(pin.id)} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <MapPin size={20} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: '2px' }}>{pin.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            @{pin.user?.username} · {formatTime(pin.created_at)}
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            <span className="badge badge-accent">{getCategoryLabel(pin.category)}</span>
                                            {pin.reviews?.length > 0 && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    <MessageCircle size={11} /> {pin.reviews.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedPinId && (
                <PinDetailModal
                    pinId={selectedPinId}
                    currentUserId={profile?.id}
                    onClose={() => setSelectedPinId(null)}
                    getDetail={getDetail}
                    addReview={addReview}
                    onDelete={deletePin}
                />
            )}
        </div>
    )
}
