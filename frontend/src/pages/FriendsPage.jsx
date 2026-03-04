import { useState } from 'react'
import { Users, Inbox, AlertTriangle, Search, CheckCircle, XCircle, Check, UserPlus } from 'lucide-react'
import { useFriends } from '../hooks/useFriends'
import { getInitials, formatTime } from '../utils/helpers'

export function FriendsPage() {
    const { friends, pending, loading, search, sendRequest, respond, remove } = useFriends()
    const [tab, setTab] = useState('friends')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState(null)
    const [sentTo, setSentTo] = useState(new Set())

    const handleSearch = async (q) => {
        setSearchQuery(q)
        setSearchError(null)
        if (q.length < 2) { setSearchResults([]); return }
        setSearching(true)
        try {
            const results = await search(q)
            setSearchResults(results || [])
        } catch (e) {
            setSearchResults([])
            const msg = e.response?.data?.error || e.message
            setSearchError(msg)
        } finally {
            setSearching(false)
        }
    }

    const handleSendRequest = async (username) => {
        try {
            await sendRequest(username)
            setSentTo(prev => new Set([...prev, username]))
        } catch (e) {
            alert(e.response?.data?.error || e.message)
        }
    }

    if (loading) return <div className="loading-center"><div className="spinner" /></div>

    return (
        <div className="page">
            <h2 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={22} /> Teman</h2>
            <div className="tab-bar">
                <button className={`tab-item ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>
                    Teman ({friends.length})
                </button>
                <button className={`tab-item ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
                    Permintaan {pending.length > 0 && `(${pending.length})`}
                </button>
                <button className={`tab-item ${tab === 'search' ? 'active' : ''}`} onClick={() => setTab('search')}>
                    Cari
                </button>
            </div>

            {/* Friends list */}
            {tab === 'friends' && (
                friends.length === 0
                    ? <div className="empty-state"><div className="empty-icon"><Users size={40} /></div><p>Belum ada teman.<br />Cari pengguna dan kirim permintaan!</p></div>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {friends.map(f => {
                            const other = f.requester_id === f.receiver?.id ? f.requester : f.receiver
                            return (
                                <div key={f.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="avatar">{getInitials(other?.username)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>@{other?.username}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teman sejak {formatTime(f.created_at)}</div>
                                    </div>
                                    <button className="btn btn-secondary btn-sm" onClick={() => remove(f.id)}>Hapus</button>
                                </div>
                            )
                        })}
                    </div>
            )}

            {/* Pending requests */}
            {tab === 'pending' && (
                pending.length === 0
                    ? <div className="empty-state"><div className="empty-icon"><Inbox size={40} /></div><p>Tidak ada permintaan masuk.</p></div>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pending.map(f => (
                            <div key={f.id} className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                    <div className="avatar">{getInitials(f.requester?.username)}</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>@{f.requester?.username}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(f.created_at)}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-primary btn-full btn-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => respond(f.id, true)}><CheckCircle size={15} /> Terima</button>
                                    <button className="btn btn-secondary btn-full btn-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => respond(f.id, false)}><XCircle size={15} /> Tolak</button>
                                </div>
                            </div>
                        ))}
                    </div>
            )}

            {/* Search */}
            {tab === 'search' && (
                <div>
                    <input
                        className="input"
                        placeholder="Cari username..."
                        value={searchQuery}
                        onChange={e => handleSearch(e.target.value)}
                        style={{ marginBottom: 'var(--space-md)' }}
                    />
                    {searching && <div className="loading-center" style={{ minHeight: '80px' }}><div className="spinner" /></div>}
                    {searchError && (
                        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(255,87,87,0.1)', border: '1px solid rgba(255,87,87,0.3)', color: '#ff9999', fontSize: '0.875rem', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={14} style={{ flexShrink: 0 }} /> {searchError}
                        </div>
                    )}
                    {!searchError && searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                        <div className="empty-state"><div className="empty-icon"><Search size={40} /></div><p>Pengguna tidak ditemukan</p></div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {searchResults.map(u => (
                            <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="avatar">{getInitials(u.username)}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>@{u.username}</div>
                                </div>
                                <button
                                    className="btn btn-sm"
                                    onClick={() => !sentTo.has(u.username) && handleSendRequest(u.username)}
                                    disabled={sentTo.has(u.username)}
                                    style={{
                                        background: sentTo.has(u.username) ? 'rgba(34,212,123,0.15)' : 'var(--accent)',
                                        color: sentTo.has(u.username) ? 'var(--green)' : '#fff',
                                        border: `1px solid ${sentTo.has(u.username) ? 'var(--green)' : 'transparent'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    {sentTo.has(u.username) ? <><Check size={14} /> Terkirim</> : <><UserPlus size={14} /> Tambah</>}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
