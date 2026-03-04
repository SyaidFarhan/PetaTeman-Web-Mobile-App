import { useState, useEffect } from 'react'
import { Clock, Timer, MessageCircle, Trash2, Utensils, Cloud, Car, Calendar, AlertTriangle, MapPin, Send, ExternalLink } from 'lucide-react'
import { formatTime, formatClock } from '../utils/helpers'

const REACTIONS = ['👍', '❤️', '😮']

export function PinDetailModal({ pinId, currentUserId, onClose, getDetail, addReview, onDelete }) {
    const [pin, setPin] = useState(null)
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState('')
    const [selectedReaction, setSelectedReaction] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!pinId) return
        getDetail(pinId).then(data => {
            setPin(data)
            setLoading(false)
        })
    }, [pinId, getDetail])

    const handleReview = async () => {
        if (!comment && !selectedReaction) return
        setSubmitting(true)
        try {
            const newReview = await addReview(pinId, { comment, reaction: selectedReaction })
            setPin(prev => ({ ...prev, reviews: [...(prev.reviews || []), newReview] }))
            setComment('')
            setSelectedReaction(null)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                <div className="modal-handle" />
                {loading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : !pin ? (
                    <p className="empty-state">Pin tidak ditemukan</p>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)' }}>
                                        {pin.category === 'food' ? <Utensils size={18} /> : pin.category === 'weather' ? <Cloud size={18} /> :
                                            pin.category === 'traffic' ? <Car size={18} /> : pin.category === 'event' ? <Calendar size={18} /> :
                                                pin.category === 'warning' ? <AlertTriangle size={18} /> : <MapPin size={18} />}
                                    </span>
                                    <h3>{pin.title}</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                    <span>@{pin.user?.username}</span>
                                    <span>·</span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Clock size={12} /> {formatClock(pin.created_at)}</span>
                                    <span>·</span>
                                    <span>{formatTime(pin.created_at)}</span>
                                </div>
                            </div>
                            {pin.user?.id === currentUserId && (
                                <button
                                    className="btn btn-danger btn-sm"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => { onDelete(pinId); onClose() }}
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                        </div>

                        {pin.description && (
                            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
                                {pin.description}
                            </p>
                        )}

                        {pin.expires_at && (
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Timer size={13} /> Aktif hingga: {new Date(pin.expires_at).toLocaleString('id-ID')}
                            </div>
                        )}

                        {pin.latitude && pin.longitude && (
                            <a
                                href={`https://www.google.com/maps?q=${pin.latitude},${pin.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-md)', padding: '8px 14px', borderRadius: '8px', background: 'rgba(62,145,255,0.1)', border: '1px solid rgba(62,145,255,0.25)', color: '#5ba5ff', fontSize: '0.8125rem', textDecoration: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                            >
                                <ExternalLink size={14} /> Buka di Google Maps
                            </a>
                        )}

                        <div className="divider" />

                        {/* Reviews */}
                        <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MessageCircle size={17} /> Ulasan ({(pin.reviews || []).length})
                        </h4>

                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(pin.reviews || []).length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                                    Belum ada ulasan. Jadilah yang pertama!
                                </p>
                            ) : (
                                pin.reviews.map(r => (
                                    <div key={r.id} className="card" style={{ padding: '10px 12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>@{r.user?.username}</span>
                                            {r.reaction && <span style={{ fontSize: '1rem' }}>{r.reaction}</span>}
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                                {formatTime(r.created_at)}
                                            </span>
                                        </div>
                                        {r.comment && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{r.comment}</p>}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add review */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            {REACTIONS.map(r => (
                                <button
                                    key={r}
                                    onClick={() => setSelectedReaction(prev => prev === r ? null : r)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: 'var(--radius-full)',
                                        border: `2px solid ${selectedReaction === r ? 'var(--accent)' : 'var(--border)'}`,
                                        background: selectedReaction === r ? 'rgba(62,145,255,0.15)' : 'var(--bg-glass)',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                className="input"
                                placeholder="Tambahkan komentar..."
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleReview()}
                            />
                            <button
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px' }}
                                onClick={handleReview}
                                disabled={submitting || (!comment && !selectedReaction)}
                            >
                                {submitting ? '...' : <Send size={16} />}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
