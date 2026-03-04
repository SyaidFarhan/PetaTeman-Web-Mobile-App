import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { upsertProfile } from '../api/location.api'

export function useAuth() {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user)
            } else {
                setLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (supabaseUser) => {
        const fallback = {
            id: supabaseUser.id,
            username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
            email: supabaseUser.email,
            avatar_url: supabaseUser.user_metadata?.avatar_url || ''
        }
        try {
            const prof = await upsertProfile(fallback)
            setProfile(prof ?? fallback)
        } catch {
            // Backend tidak tersedia — pakai data Supabase langsung
            setProfile(fallback)
        } finally {
            setLoading(false)
        }
    }

    return { user, session, profile, loading }
}
