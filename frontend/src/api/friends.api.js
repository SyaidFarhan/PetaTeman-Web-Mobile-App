import client from './client'

export const searchUsers = (q) => client.get('/friends/search', { params: { q } }).then(r => r.data)
export const listFriends = () => client.get('/friends/').then(r => r.data)
export const listPending = () => client.get('/friends/pending').then(r => r.data)
export const sendFriendRequest = (receiverUsername) => client.post('/friends/request', { receiver_username: receiverUsername }).then(r => r.data)
export const respondToRequest = (friendshipId, accept) => client.post('/friends/respond', { friendship_id: friendshipId, accept }).then(r => r.data)
export const removeFriend = (friendshipId) => client.delete(`/friends/${friendshipId}`).then(r => r.data)
