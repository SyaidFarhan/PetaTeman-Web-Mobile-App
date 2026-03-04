import { Ghost, PauseCircle } from 'lucide-react'
import { getInitials, formatTime } from '../utils/helpers'

export function FriendMarker({ friend, isGhost, isParused }) {
    const name = friend.username || 'Unknown'
    const initials = getInitials(name)
    const isDisabled = isGhost || isParused
    const lastActiveText = friend.last_active_at ? formatTime(friend.last_active_at) : ''

    return (
        <div style={{ position: 'relative', textAlign: 'center' }}>
            {/* Avatar circle */}
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: isDisabled
                    ? 'rgba(100,100,120,0.8)'
                    : 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                border: `3px solid ${isDisabled ? 'rgba(255,255,255,0.2)' : 'var(--accent-light)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDisabled ? 'rgba(255,255,255,0.5)' : '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                filter: isDisabled ? 'grayscale(1)' : 'none',
                boxShadow: isDisabled ? 'none' : '0 0 12px var(--accent-glow)',
                transition: 'all 0.3s ease'
            }}>
                {friend.avatar_url
                    ? <img src={friend.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : initials
                }
            </div>

            {/* Status indicator */}
            {isDisabled ? (
                <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: isGhost ? 'var(--orange)' : '#666',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-primary)'
                }}>
                    {isGhost ? <Ghost size={8} /> : <PauseCircle size={8} />}
                </div>
            ) : (
                <div style={{
                    position: 'absolute',
                    bottom: '14px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    background: 'var(--green)',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-primary)',
                    boxShadow: 'var(--shadow-green)'
                }} />
            )}

            {/* Name label */}
            <div style={{
                marginTop: '4px',
                background: 'rgba(10,10,15,0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '2px 8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: isDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
                whiteSpace: 'nowrap',
                border: '1px solid var(--border)'
            }}>
                {name}
                {isDisabled && lastActiveText && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            {isGhost ? <><Ghost size={8} /> Ghost mode</> : <><PauseCircle size={8} /> {lastActiveText}</>}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
