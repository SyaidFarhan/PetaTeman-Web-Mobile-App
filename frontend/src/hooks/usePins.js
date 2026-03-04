import { useState, useEffect, useCallback } from 'react'
import { listActivePins, createPin, deletePin, addPinReview, getPinDetail } from '../api/pins.api'

export function usePins() {
    const [pins, setPins] = useState([])
    const [loading, setLoading] = useState(false)

    const fetch = useCallback(async () => {
        setLoading(true)
        try {
            const data = await listActivePins()
            setPins(data || [])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetch() }, [fetch])

    const create = useCallback(async (pinData) => {
        const pin = await createPin(pinData)
        setPins(prev => [pin, ...prev])
        return pin
    }, [])

    const remove = useCallback(async (pinId) => {
        await deletePin(pinId)
        setPins(prev => prev.filter(p => p.id !== pinId))
    }, [])

    const addReview = useCallback((pinId, reviewData) => addPinReview(pinId, reviewData), [])
    const getDetail = useCallback((pinId) => getPinDetail(pinId), [])

    return { pins, loading, create, remove, addReview, getDetail, refetch: fetch }
}
