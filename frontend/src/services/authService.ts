import { apiJson } from './api'
import type {
  LoginResponse,
  UserLogin,
  UserRegister,
  UserResponse,
} from '../types/user'

export async function register(
  payload: UserRegister,
): Promise<UserResponse> {
  return apiJson<UserResponse>('/auth', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function login(
  payload: UserLogin,
): Promise<LoginResponse> {
  return apiJson<LoginResponse>('/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}