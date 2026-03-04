import client from './client'

export const listActivePins = () => client.get('/pins/').then(r => r.data)
export const createPin = (data) => client.post('/pins/', data).then(r => r.data)
export const getPinDetail = (id) => client.get(`/pins/${id}`).then(r => r.data)
export const deletePin = (id) => client.delete(`/pins/${id}`).then(r => r.data)
export const addPinReview = (pinId, data) => client.post(`/pins/${pinId}/reviews`, data).then(r => r.data)
