import client from './client'

export const listBills = () => client.get('/bills/').then(r => r.data)
export const createBill = (data) => client.post('/bills/', data).then(r => r.data)
export const getBill = (id) => client.get(`/bills/${id}`).then(r => r.data)
export const markPaid = (id) => client.post(`/bills/${id}/pay`).then(r => r.data)
