import { useState, useEffect, useCallback } from 'react'
import { listFriends, listPending, searchUsers, sendFriendRequest, respondToRequest, removeFriend } from '../api/friends.api'

export function useFriends() {
    const [friends, setFriends] = useState([])
    const [pending, setPending] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchAll = useCallback(async () => {
        setLoading(true)
        try {
            const [f, p] = await Promise.all([listFriends(), listPending()])
            setFriends(f || [])
            setPending(p || [])
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchAll() }, [fetchAll])

    const search = useCallback((q) => searchUsers(q), [])

    const sendRequest = useCallback(async (username) => {
        await sendFriendRequest(username)
        fetchAll()
    }, [fetchAll])

    const respond = useCallback(async (friendshipId, accept) => {
        await respondToRequest(friendshipId, accept)
        fetchAll()
    }, [fetchAll])

    const remove = useCallback(async (friendshipId) => {
        await removeFriend(friendshipId)
        fetchAll()
    }, [fetchAll])

    return { friends, pending, loading, error, search, sendRequest, respond, remove, refetch: fetchAll }
}
