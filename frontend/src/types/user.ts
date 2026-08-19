export interface UserResponse {
  id: number
  email: string
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserRegister {
  login: string
  password: string
  repeat_password: string
}

export interface UserLogin {
  login: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: UserResponse
}