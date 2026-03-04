import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Radio, WifiOff, Ghost, MapPin, PauseCircle, Navigation, Wifi, ExternalLink, Search, X } from 'lucide-react'
import { useGeoLocation } from '../hooks/useGeoLocation'
import { usePins } from '../hooks/usePins'
import { useWebSocket } from '../hooks/useWebSocket'
import { PinCreateModal } from '../components/PinCreateModal'
import { PinDetailModal } from '../components/PinDetailModal'
import { FriendMarker } from '../components/FriendMarker'
import { getFriendsLocations } from '../api/location.api'
import { formatTime } from '../utils/helpers'

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const createFriendIcon = (username, isDisabled) => L.divIcon({
    className: 'friend-marker-icon',
    html: `<div style="
    width:44px;height:44px;border-radius:50%;
    background:${isDisabled ? '#444' : 'linear-gradient(135deg,#3e91ff,#2a7aee)'};
    border:3px solid ${isDisabled ? '#555' : '#5ba5ff'};
    display:flex;align-items:center;justify-content:center;
    color:${isDisabled ? '#888' : '#fff'};font-weight:700;font-size:1rem;
    box-shadow:${isDisabled ? 'none' : '0 0 12px rgba(62,145,255,0.5)'};
    filter:${isDisabled ? 'grayscale(1)' : 'none'};
  ">${username.slice(0, 2).toUpperCase()}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
})

const createPinIcon = (category) => {
    const emojis = { food: '🍜', weather: '🌦️', traffic: '🚗', event: '🎉', warning: '⚠️', other: '📍' }
    return L.divIcon({
        className: '',
        html: `<div style="
      font-size:1.6rem;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      cursor:pointer;
    ">${emojis[category] || '📍'}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
    })
}

function MapClickHandler({ onMapClick }) {
    useMapEvents({ click: onMapClick })
    return null
}

function MapViewPersist() {
    const map = useMap()

    useEffect(() => {
        // Restore saved view on mount
        try {
            const saved = sessionStorage.getItem('map-view')
            if (saved) {
                const { lat, lng, zoom } = JSON.parse(saved)
                map.setView([lat, lng], zoom, { animate: false })
            }
        } catch {}

        // Save view whenever it changes
        const saveView = () => {
            const center = map.getCenter()
            const zoom = map.getZoom()
            sessionStorage.setItem('map-view', JSON.stringify({
                lat: center.lat,
                lng: center.lng,
                zoom
            }))
        }
        map.on('moveend', saveView)
        map.on('zoomend', saveView)
        return () => {
            map.off('moveend', saveView)
            map.off('zoomend', saveView)
        }
    }, [map])

    return null
}

function MapControls({ position }) {
    const map = useMap()
    const controlRef = useRef(null)

    useEffect(() => {
        if (controlRef.current) {
            L.DomEvent.disableClickPropagation(controlRef.current)
        }
    }, [])

    return (
        <div ref={controlRef} style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 800
        }}>
            <button
                onClick={() => map.zoomIn()}
                style={mapBtnStyle}
                title="Perbesar"
            >+</button>
            <button
                onClick={() => map.zoomOut()}
                style={mapBtnStyle}
                title="Perkecil"
            >−</button>
            {position && (
                <button
                    onClick={() => map.flyTo([position.latitude, position.longitude], 17, { duration: 1 })}
                    style={{ ...mapBtnStyle, marginTop: '6px' }}
                    title="Lokasi saya"
                ><Navigation size={16} /></button>
            )}
        </div>
    )
}

const mapBtnStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(18,18,26,0.88)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: '700',
    lineHeight: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
}

function SearchCoordinates({ onSearch }) {
    const map = useMap()
    const containerRef = useRef(null)
    const [open, setOpen] = useState(false)
    const [lat, setLat] = useState('')
    const [lng, setLng] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (containerRef.current) {
            L.DomEvent.disableClickPropagation(containerRef.current)
            L.DomEvent.disableScrollPropagation(containerRef.current)
        }
    }, [])

    const handleSearch = () => {
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lng)
        if (isNaN(latitude) || isNaN(longitude)) {
            setError('Masukkan koordinat yang valid')
            return
        }
        if (latitude < -90 || latitude > 90) {
            setError('Latitude harus antara -90 dan 90')
            return
        }
        if (longitude < -180 || longitude > 180) {
            setError('Longitude harus antara -180 dan 180')
            return
        }
        setError('')
        onSearch({ lat: latitude, lng: longitude })
        map.flyTo([latitude, longitude], 17, { duration: 1.2 })
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch()
    }

    const handleClear = () => {
        setLat('')
        setLng('')
        setError('')
        onSearch(null)
    }

    if (!open) {
        return (
            <div ref={containerRef} style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 800 }}>
                <button
                    onClick={() => setOpen(true)}
                    style={mapBtnStyle}
                    title="Cari Koordinat"
                >
                    <Search size={16} />
                </button>
            </div>
        )
    }

    return (
        <div ref={containerRef} style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 800,
            background: 'rgba(18,18,26,0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            width: '260px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#fff', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={14} /> Cari Koordinat
                </span>
                <button
                    onClick={() => { setOpen(false); setError('') }}
                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '2px', display: 'flex' }}
                >
                    <X size={16} />
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Latitude (misal: -6.2088)"
                    value={lat}
                    onChange={e => setLat(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={searchInputStyle}
                />
                <input
                    type="text"
                    placeholder="Longitude (misal: 106.8456)"
                    value={lng}
                    onChange={e => setLng(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={searchInputStyle}
                />
                {error && <span style={{ color: '#ff6b6b', fontSize: '0.75rem' }}>{error}</span>}
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={handleSearch} style={searchBtnStyle}>
                        <Search size={13} /> Cari
                    </button>
                    {(lat || lng) && (
                        <button onClick={handleClear} style={{ ...searchBtnStyle, background: 'rgba(255,255,255,0.06)', color: '#aaa', flex: 'none', paddingInline: '10px' }}>
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

const searchInputStyle = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: '0.8125rem',
    outline: 'none',
    boxSizing: 'border-box',
}

const searchBtnStyle = {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(62,145,255,0.3)',
    background: 'rgba(62,145,255,0.15)',
    color: '#5ba5ff',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
}

export function MapPage({ profile }) {
    const { position, isSharing, toggleSharing } = useGeoLocation()
    const { pins, create: createPin, remove: deletePin, addReview, getDetail } = usePins()
    const [friendLocations, setFriendLocations] = useState([])
    const [pinCreatePos, setPinCreatePos] = useState(null)
    const [selectedPinId, setSelectedPinId] = useState(null)
    const [ghostMode, setGhostMode] = useState(false)
    const [searchMarker, setSearchMarker] = useState(null)
    const mapRef = useRef(null)

    useEffect(() => {
        getFriendsLocations().then(data => setFriendLocations(data || []))
    }, [])

    useWebSocket((update) => {
        setFriendLocations(prev => {
            const idx = prev.findIndex(l => l.user_id === update.user_id)
            if (idx >= 0) {
                const next = [...prev]
                next[idx] = { ...next[idx], ...update }
                return next
            }
            return [...prev, update]
        })
    })

    const handleMapClick = (e) => {
        setPinCreatePos(e.latlng)
    }

    // Restore saved map view or use current position or default
    const savedView = (() => {
        try {
            const s = sessionStorage.getItem('map-view')
            return s ? JSON.parse(s) : null
        } catch { return null }
    })()

    const defaultCenter = savedView
        ? [savedView.lat, savedView.lng]
        : position
            ? [position.latitude, position.longitude]
            : [-6.2088, 106.8456]

    const defaultZoom = savedView ? savedView.zoom : 15

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ width: '100%', height: '100%' }}
                ref={mapRef}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    maxZoom={19}
                />
                <MapViewPersist />
                <MapClickHandler onMapClick={handleMapClick} />
                <MapControls position={position} />
                <SearchCoordinates onSearch={setSearchMarker} />

                {/* Search result marker */}
                {searchMarker && (
                    <Marker position={[searchMarker.lat, searchMarker.lng]}>
                        <Popup>
                            <div style={{ color: '#fff', fontSize: '0.875rem' }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Search size={14} /> Hasil Pencarian</strong>
                                <div style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '4px' }}>
                                    {searchMarker.lat.toFixed(6)}, {searchMarker.lng.toFixed(6)}
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${searchMarker.lat},${searchMarker.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(62,145,255,0.15)', border: '1px solid rgba(62,145,255,0.3)', color: '#5ba5ff', fontSize: '0.75rem', textDecoration: 'none', cursor: 'pointer' }}
                                >
                                    <ExternalLink size={12} /> Buka di Google Maps
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* My position */}
                {position && !ghostMode && (
                    <Marker position={[position.latitude, position.longitude]}>
                        <Popup>
                            <div style={{ color: '#fff', fontSize: '0.875rem' }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> Posisi Kamu</strong>
                                {!isSharing && <div style={{ color: '#ff9999', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><PauseCircle size={12} /> Berbagi dimatikan</div>}
                                <a
                                    href={`https://www.google.com/maps?q=${position.latitude},${position.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(62,145,255,0.15)', border: '1px solid rgba(62,145,255,0.3)', color: '#5ba5ff', fontSize: '0.75rem', textDecoration: 'none', cursor: 'pointer' }}
                                >
                                    <ExternalLink size={12} /> Buka di Google Maps
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Friend locations */}
                {friendLocations.map(loc => {
                    if (!loc.latitude || !loc.longitude) return null
                    const isGhost = loc.user?.location_mode === 'ghost'
                    if (isGhost) return null
                    const isPaused = !loc.is_realtime_active
                    return (
                        <Marker
                            key={loc.user_id}
                            position={[loc.latitude, loc.longitude]}
                            icon={createFriendIcon(loc.user?.username || '??', isPaused)}
                        >
                            <Popup>
                                <div style={{ color: '#fff', fontSize: '0.875rem', minWidth: '140px' }}>
                                    <strong>@{loc.user?.username}</strong>
                                    {isPaused ? (
                                        <div style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '4px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> Lokasi dinonaktifkan</span>
                                            Terakhir aktif: {formatTime(loc.last_active_at)}
                                        </div>
                                    ) : (
                                        <div style={{ color: '#22D47B', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Wifi size={12} color='#22D47B'/> Online</div>
                                    )}
                                    <a
                                        href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(62,145,255,0.15)', border: '1px solid rgba(62,145,255,0.3)', color: '#5ba5ff', fontSize: '0.75rem', textDecoration: 'none', cursor: 'pointer' }}
                                    >
                                        <ExternalLink size={12} /> Buka di Google Maps
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}

                {/* Pins */}
                {pins.map(pin => (
                    <Marker
                        key={pin.id}
                        position={[pin.latitude, pin.longitude]}
                        icon={createPinIcon(pin.category)}
                        eventHandlers={{ click: () => setSelectedPinId(pin.id) }}
                    />
                ))}
            </MapContainer>

            {/* Controls overlay */}
            <div style={{
                position: 'fixed',
                bottom: 'calc(var(--nav-height) + 16px)',
                right: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                zIndex: 800
            }}>
                {/* Location toggle */}
                <button
                    onClick={toggleSharing}
                    style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        border: `2px solid ${isSharing ? 'var(--green)' : 'var(--border)'}`,
                        background: isSharing ? 'rgba(34,212,123,0.15)' : 'rgba(18,18,26,0.9)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: isSharing ? 'var(--shadow-green)' : 'var(--shadow-md)',
                        transition: 'all 0.3s ease'
                    }}
                    title={isSharing ? 'Matikan Berbagi Lokasi' : 'Aktifkan Berbagi Lokasi'}
                >
                    {isSharing ? <Radio size={20} color='#fff' /> : <WifiOff size={20} color='#fff' />}
                </button>

                {/* Ghost mode toggle */}
                <button
                    onClick={() => setGhostMode(g => !g)}
                    style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        border: `2px solid ${ghostMode ? 'var(--orange)' : 'var(--border)'}`,
                        background: ghostMode ? 'rgba(219, 218, 217, 1)' : 'rgba(18,18,26,0.9)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'all 0.3s ease'
                    }}
                    title="Ghost Mode"
                >
                    <Ghost size={20} />
                </button>
            </div>

            {/* Status bar */}
            {!isSharing && profile && (
                <div style={{
                    position: 'fixed',
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(10,10,15,0.9)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 16px',
                    fontSize: '0.8125rem',
                    border: '1px solid rgba(255,87,87,0.3)',
                    color: '#ff9999',
                    zIndex: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <PauseCircle size={14} style={{ flexShrink: 0 }} /> Berbagi lokasi dimatikan
                </div>
            )}

            {ghostMode && (
                <div style={{
                    position: 'fixed',
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(10,10,15,0.9)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 16px',
                    fontSize: '0.8125rem',
                    border: '1px solid rgba(255,159,67,0.3)',
                    color: 'var(--orange)',
                    zIndex: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Ghost size={14} /> Ghost mode aktif—teman tidak bisa melihatmu
                </div>
            )}

            {/* Modals */}
            {pinCreatePos && (
                <PinCreateModal
                    latlng={pinCreatePos}
                    onClose={() => setPinCreatePos(null)}
                    onCreate={createPin}
                />
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
