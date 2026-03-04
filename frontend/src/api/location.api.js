import client from './client'

export const updateLocation = (data) => client.post('/location/', data).then(r => r.data)
export const getFriendsLocations = () => client.get('/location/friends').then(r => r.data)
export const getMe = () => client.get('/me').then(r => r.data)
export const updateMe = (data) => client.patch('/me', data).then(r => r.data)
export const upsertProfile = (data) => client.post('/me/profile', data).then(r => r.data)
