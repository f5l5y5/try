import axios from 'axios'

// axios.defaults.baseURL = 'http://localhost:3000'

export const addUser = data => axios.post('/api/user', data).then(res => res.data)

export const getList = data => axios.get('/api/user', { params: data }).then(res => res.data)

export const delUser = data => axios.delete(`/api/user/${data.id}`).then(res => res.data)

export const updateUser = data => axios.patch(`/api/user/${data.id}`, data).then(res => res.data)

//添加tag
export const addTags = (data) => axios.post(`/api/user/add/tags`,data).then(res => res.data)