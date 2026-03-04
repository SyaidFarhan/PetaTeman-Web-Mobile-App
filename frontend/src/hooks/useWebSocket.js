import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export function useWebSocket(onMessage) {
    const wsRef = useRef(null)
    const onMessageRef = useRef(onMessage)
    onMessageRef.current = onMessage

    const connect = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return

        const wsUrl = API_BASE.replace(/^http/, 'ws') + '/api/ws'
        const ws = new WebSocket(`${wsUrl}?token=${session.access_token}`)

        ws.onopen = () => console.log('[WS] Connected')
        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data)
                onMessageRef.current(data)
            } catch { }
        }
        ws.onclose = () => {
            console.log('[WS] Disconnected — reconnecting in 3s...')
            setTimeout(connect, 3000)
        }
        ws.onerror = (err) => console.error('[WS] Error:', err)
        wsRef.current = ws
    }, [])

    const send = useCallback((data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data))
        }
    }, [])

    const disconnect = useCallback(() => {
        wsRef.current?.close()
    }, [])

    useEffect(() => {
        connect()
        return () => disconnect()
    }, [connect, disconnect])

    return { send, disconnect }
}
