export const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    if (mins < 1) return 'Baru saja'
    if (mins < 60) return `${mins} menit lalu`
    if (hours < 24) return `${hours} jam lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export const formatClock = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export const getInitials = (name = '') => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export const calcDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

export const formatDistance = (meters) => {
    if (meters < 1000) return `${meters} m`
    return `${(meters / 1000).toFixed(1)} km`
}

export const PIN_CATEGORIES = [
    { value: 'food', label: 'Makanan' },
    { value: 'weather', label: 'Cuaca' },
    { value: 'traffic', label: 'Lalu Lintas' },
    { value: 'event', label: 'Acara' },
    { value: 'warning', label: 'Peringatan' },
    { value: 'other', label: 'Lainnya' }
]

export const DURATION_OPTIONS = [
    { label: '1 Jam', hours: 1 },
    { label: '6 Jam', hours: 6 },
    { label: '24 Jam', hours: 24 },
    { label: '7 Hari', hours: 168 },
    { label: 'Permanen', hours: null }
]

export const getExpiresAt = (hours) => {
    if (!hours) return null
    const d = new Date()
    d.setHours(d.getHours() + hours)
    return d.toISOString()
}
