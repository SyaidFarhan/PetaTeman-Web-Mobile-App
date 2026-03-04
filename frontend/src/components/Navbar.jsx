import { NavLink } from 'react-router-dom'
import { Map, Users, MapPin, DollarSign, User } from 'lucide-react'

const NAV_ITEMS = [
    { to: '/', Icon: Map, label: 'Peta' },
    { to: '/friends', Icon: Users, label: 'Teman' },
    { to: '/pins', Icon: MapPin, label: 'Pin' },
    { to: '/bills', Icon: DollarSign, label: 'Tagihan' },
    { to: '/profile', Icon: User, label: 'Profil' }
]

export function Navbar({ pendingCount = 0 }) {
    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '430px',
            background: 'rgba(13,13,13,0.94)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            zIndex: 900,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}>
            {NAV_ITEMS.map(({ to, Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/'} style={{ flex: 1 }}>
                    {({ isActive }) => (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '10px 0',
                            position: 'relative'
                        }}>
                            <Icon
                                size={22}
                                color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                                strokeWidth={isActive ? 2.2 : 1.8}
                            />
                            <span style={{
                                fontSize: '0.6875rem',
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'var(--accent)' : 'var(--text-muted)'
                            }}>
                                {label}
                            </span>
                            {label === 'Teman' && pendingCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: 'calc(50% - 22px)',
                                    background: 'var(--red)',
                                    color: '#fff',
                                    fontSize: '0.625rem',
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: '10px',
                                    minWidth: '16px',
                                    textAlign: 'center',
                                    lineHeight: '14px'
                                }}>
                                    {pendingCount}
                                </span>
                            )}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '20px',
                                    height: '3px',
                                    background: 'var(--accent)',
                                    borderRadius: '2px 2px 0 0'
                                }} />
                            )}
                        </div>
                    )}
                </NavLink>
            ))}
        </nav>
    )
}
