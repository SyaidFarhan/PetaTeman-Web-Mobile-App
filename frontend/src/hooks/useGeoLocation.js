import { useState, useEffect, useRef, useCallback } from 'react'
import { updateLocation } from '../api/location.api'

export function useGeoLocation() {
    const [position, setPosition] = useState(() => {
        // Restore cached position for instant availability on remount
        try {
            const cached = sessionStorage.getItem('geo-position')
            return cached ? JSON.parse(cached) : null
        } catch { return null }
    })
    const [error, setError] = useState(null)
    const [isSharing, setIsSharing] = useState(false)
    const watchId = useRef(null)

    const updatePositionState = useCallback((coords) => {
        setPosition(coords)
        try { sessionStorage.setItem('geo-position', JSON.stringify(coords)) } catch {}
    }, [])

    const startSharing = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation tidak didukung perangkat ini')
            return
        }
        setIsSharing(true)
        watchId.current = navigator.geolocation.watchPosition(
            (pos) => {
                const coords = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    is_realtime_active: true
                }
                updatePositionState(coords)
                updateLocation(coords).catch(() => { })
            },
            (err) => setError(err.message),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        )
    }, [updatePositionState])

    const stopSharing = useCallback(() => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current)
            watchId.current = null
        }
        setIsSharing(false)
        if (position) {
            updateLocation({ ...position, is_realtime_active: false }).catch(() => { })
        }
    }, [position])

    const toggleSharing = useCallback(() => {
        if (isSharing) stopSharing()
        else startSharing()
    }, [isSharing, startSharing, stopSharing])

    // Ambil posisi awal sekali saat mount (tanpa kirim ke backend)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => updatePositionState({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    is_realtime_active: false
                }),
                () => { },
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }
        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current)
            }
        }
    }, [])

    return { position, error, isSharing, startSharing, stopSharing, toggleSharing }
}
