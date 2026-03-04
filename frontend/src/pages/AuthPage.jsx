import { useState } from 'react'
import { Map, LogIn, UserPlus, Mail } from 'lucide-react'
import { signIn, signUp, resetPassword } from '../api/auth.api'

export function AuthPage() {
    const [tab, setTab] = useState('login')
    const [form, setForm] = useState({ email: '', password: '', username: '' })
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [loading, setLoading] = useState(false)

    const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)
        try {
            if (tab === 'login') {
                await signIn(form.email, form.password)
            } else if (tab === 'register') {
                await signUp(form.email, form.password, form.username)
                setSuccess('Akun berhasil dibuat! Cek email untuk verifikasi.')
            } else {
                await resetPassword(form.email)
                setSuccess('Link reset password telah dikirim ke email kamu.')
            }
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-primary)',
            padding: 'var(--space-lg)',
            paddingTop: '10vh'
        }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)', animation: 'fadeInUp 0.5s 0.1s both' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #3e91ff, #2a7aee)',
                    margin: '0 auto var(--space-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(62,145,255,0.4)'
                }}>
                    <Map size={36} color="#fff" strokeWidth={2} />
                </div>
                <h1 style={{ marginBottom: '8px' }}>Peta</h1>
                <p style={{ color: 'var(--text-muted)' }}>Selalu tahu di mana temanmu berada</p>
            </div>

            {/* Card */}
            <div className="glass-card fade-in-up" style={{ animationDelay: '0.2s' }}>
                {/* Tabs */}
                <div className="tab-bar" style={{ marginBottom: 'var(--space-lg)' }}>
                    {[['login', 'Masuk'], ['register', 'Daftar'], ['reset', 'Reset']].map(([val, label]) => (
                        <button
                            key={val}
                            className={`tab-item ${tab === val ? 'active' : ''}`}
                            onClick={() => { setTab(val); setError(null); setSuccess(null) }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
                {success && <div className="alert alert-success" style={{ marginBottom: 'var(--space-md)' }}>{success}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {tab === 'register' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Username
                            </label>
                            <input
                                className="input"
                                placeholder="username_kamu"
                                value={form.username}
                                onChange={e => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                                required
                                pattern="[a-z0-9_]{3,20}"
                                title="3–20 karakter, huruf kecil, angka, underscore"
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Email
                        </label>
                        <input
                            className="input"
                            type="email"
                            placeholder="kamu@email.com"
                            value={form.email}
                            onChange={e => update('email', e.target.value)}
                            required
                        />
                    </div>

                    {tab !== 'reset' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Password
                            </label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Minimal 6 karakter"
                                value={form.password}
                                onChange={e => update('password', e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                        style={{ marginTop: 'var(--space-sm)' }}
                    >
                        {loading
                            ? <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Loading...</>
                            : tab === 'login'
                                ? <><LogIn size={16} /> Masuk</>
                                : tab === 'register'
                                    ? <><UserPlus size={16} /> Buat Akun</>
                                    : <><Mail size={16} /> Kirim Link Reset</>
                        }
                    </button>
                </form>
            </div>

            <p style={{
                textAlign: 'center',
                marginTop: 'var(--space-lg)',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                animation: 'fadeIn 0.5s 0.4s both'
            }}>
                Dengan mendaftar, kamu setuju dengan Syarat Layanan kami.
            </p>
        </div>
    )
}
