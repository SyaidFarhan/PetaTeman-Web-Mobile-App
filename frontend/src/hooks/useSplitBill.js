import { useState, useEffect, useCallback } from 'react'
import { listBills, createBill, getBill, markPaid } from '../api/splitBill.api'

export function useSplitBill() {
    const [bills, setBills] = useState([])
    const [loading, setLoading] = useState(false)

    const fetch = useCallback(async () => {
        setLoading(true)
        try {
            const data = await listBills()
            setBills(data || [])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetch() }, [fetch])

    const create = useCallback(async (billData) => {
        const bill = await createBill(billData)
        setBills(prev => [bill, ...prev])
        return bill
    }, [])

    const getDetail = useCallback((id) => getBill(id), [])

    const pay = useCallback(async (billId) => {
        await markPaid(billId)
        fetch()
    }, [fetch])

    return { bills, loading, create, getDetail, pay, refetch: fetch }
}
