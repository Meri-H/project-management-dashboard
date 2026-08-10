import { apiJson } from './api'
import type { UserLogin, UserRegister, UserResponse } from '../types/user'

export async function register(payload: UserRegister): Promise<UserResponse> {
  return apiJson<UserResponse>('/auth', {
    method: 'POST',
    body: payload,
  })
}

export async function login(payload: UserLogin): Promise<UserResponse> {
  return apiJson<UserResponse>('/login', {
    method: 'POST',
    body: payload,
  })
}
