import { useState } from 'react'
import { DollarSign, Check, Clock, Plus, CheckSquare, Square } from 'lucide-react'
import { useSplitBill } from '../hooks/useSplitBill'
import { useFriends } from '../hooks/useFriends'
import { formatCurrency, formatTime, getInitials } from '../utils/helpers'

export function SplitBillPage({ profile }) {
    const { bills, loading, create, pay } = useSplitBill()
    const { friends } = useFriends()
    const [tab, setTab] = useState('history')
    const [form, setForm] = useState({ title: '', total_amount: '', splitType: 'equal', custom: {} })
    const [selectedFriends, setSelectedFriends] = useState([])
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState(null)

    const toggleFriend = (userId) => {
        setSelectedFriends(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        )
    }

    const getFriendUser = (f) => {
        if (!profile) return null
        return f.requester?.id === profile.id ? f.receiver : f.requester
    }

    const totalAmt = parseFloat(form.total_amount) || 0
    const allParticipants = profile ? [profile.id, ...selectedFriends] : selectedFriends
    const perPerson = allParticipants.length > 0 ? totalAmt / allParticipants.length : 0

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!form.title || !form.total_amount || selectedFriends.length === 0) {
            setError('Lengkapi semua field dan pilih minimal 1 teman')
            return
        }
        setCreating(true)
        setError(null)
        try {
            const participants = allParticipants.map(uid => ({
                user_id: uid,
                amount_owed: form.splitType === 'equal' ? perPerson : (parseFloat(form.custom[uid]) || perPerson)
            }))
            await create({ title: form.title, total_amount: totalAmt, participants })
            setTab('history')
            setForm({ title: '', total_amount: '', splitType: 'equal', custom: {} })
            setSelectedFriends([])
        } catch (err) {
            setError(err.response?.data?.error || err.message)
        } finally {
            setCreating(false)
        }
    }

    if (loading) return <div className="loading-center"><div className="spinner" /></div>

    return (
        <div className="page">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
                <DollarSign size={22} /> Split Bill
            </h2>
            <div className="tab-bar">
                <button className={`tab-item ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Riwayat</button>
                <button className={`tab-item ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>
                    <Plus size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Buat Baru
                </button>
            </div>

            {/* History */}
            {tab === 'history' && (
                bills.length === 0
                    ? <div className="empty-state">
                        <div className="empty-icon"><DollarSign size={44} /></div>
                        <p>Belum ada sesi split bill.</p>
                    </div>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {bills.map(bill => {
                            const paidCount = (bill.participants || []).filter(p => p.is_paid).length
                            const totalPaid = (bill.participants || []).filter(p => p.is_paid).reduce((s, p) => s + p.amount_owed, 0)
                            const myPart = (bill.participants || []).find(p => p.user_id === profile?.id)
                            return (
                                <div key={bill.id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>{bill.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                oleh @{bill.creator?.username} · {formatTime(bill.created_at)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{formatCurrency(bill.total_amount)}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{paidCount}/{(bill.participants || []).length} sudah bayar</span>
                                            <span style={{ color: 'var(--green)' }}>{formatCurrency(totalPaid)}</span>
                                        </div>
                                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(bill.participants || []).length > 0 ? (paidCount / (bill.participants || []).length) * 100 : 0}%`,
                                                background: 'var(--green)',
                                                transition: 'width 0.4s ease'
                                            }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                                        {(bill.participants || []).map(p => (
                                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="avatar avatar-sm">{getInitials(p.user?.username)}</div>
                                                <span style={{ flex: 1, fontSize: '0.875rem' }}>@{p.user?.username}</span>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(p.amount_owed)}</span>
                                                <span className={`badge ${p.is_paid ? 'badge-green' : 'badge-red'}`}>
                                                    {p.is_paid
                                                        ? <><Check size={11} /> Lunas</>
                                                        : <><Clock size={11} /> Belum</>
                                                    }
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {myPart && !myPart.is_paid && (
                                        <button className="btn btn-primary btn-full btn-sm" onClick={() => pay(bill.id)}>
                                            <Check size={15} /> Tandai Bagianku Lunas – {formatCurrency(myPart.amount_owed)}
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
            )}

            {/* Create */}
            {tab === 'create' && (
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {error && <div className="alert alert-error">{error}</div>}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Judul</label>
                        <input className="input" placeholder="Mis: Makan malam @Warung Bu Sri" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Total Tagihan (Rp)</label>
                        <input className="input" type="number" placeholder="150000" min="0" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Pilih Teman</label>
                        {friends.length === 0
                            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada teman.</p>
                            : <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {friends.map(f => {
                                    const u = getFriendUser(f)
                                    if (!u) return null
                                    const selected = selectedFriends.includes(u.id)
                                    return (
                                        <div
                                            key={f.id}
                                            className="card"
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                                                borderColor: selected ? 'var(--accent)' : 'var(--border)',
                                                background: selected ? 'rgba(62,145,255,0.1)' : 'var(--bg-card)'
                                            }}
                                            onClick={() => toggleFriend(u.id)}
                                        >
                                            <div className="avatar avatar-sm">{getInitials(u.username)}</div>
                                            <span style={{ flex: 1, fontWeight: 500 }}>@{u.username}</span>
                                            {selected
                                                ? <CheckSquare size={20} color="var(--accent)" />
                                                : <Square size={20} color="var(--text-muted)" />
                                            }
                                        </div>
                                    )
                                })}
                            </div>
                        }
                    </div>

                    {selectedFriends.length > 0 && totalAmt > 0 && (
                        <div className="card" style={{ background: 'rgba(62,145,255,0.08)', borderColor: 'var(--border-active)' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Dibagi {allParticipants.length} orang (termasuk kamu)
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-light)' }}>
                                {formatCurrency(perPerson)} / orang
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-full" disabled={creating}>
                        {creating ? 'Membuat...' : <><DollarSign size={16} /> Buat Split Bill</>}
                    </button>
                </form>
            )}
        </div>
    )
}
