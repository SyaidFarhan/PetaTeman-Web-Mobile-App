import { Routes, Route, Navigate } from 'react-router-dom'
import { Map } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useFriends } from './hooks/useFriends'
import { Navbar } from './components/Navbar'
import { AuthPage } from './pages/AuthPage'
import { MapPage } from './pages/MapPage'
import { FriendsPage } from './pages/FriendsPage'
import { PinsPage } from './pages/PinsPage'
import { SplitBillPage } from './pages/SplitBillPage'
import { ProfilePage } from './pages/ProfilePage'

function AuthenticatedApp({ profile }) {
    const { pending } = useFriends()
    return (
        <>
            <Routes>
                <Route path="/" element={<MapPage profile={profile} />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/pins" element={<PinsPage profile={profile} />} />
                <Route path="/bills" element={<SplitBillPage profile={profile} />} />
                <Route path="/profile" element={<ProfilePage profile={profile} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Navbar pendingCount={pending.length} />
        </>
    )
}

export function App() {
    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '16px', color: 'var(--accent)' }}><Map size={48} /></div>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Memuat Peta...</p>
                </div>
            </div>
        )
    }

    if (!user) return <AuthPage />
    return <AuthenticatedApp profile={profile} />
}
