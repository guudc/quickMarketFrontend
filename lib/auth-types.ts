export interface SignUpFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

export interface SignInFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface ForgotPasswordFormData {
  email: string
}

export interface FormErrors {
  [key: string]: string
}

export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  error?: string
  data?: T
  details?: any[]
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

export interface VerifyRequest {
  email: string
  token: string
}

export interface VerifyResponse {
  message: string
  success: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  isVerified: boolean
}

declare module "next-auth" {
  interface User {
    firstName?: string
    lastName?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      firstName?: string
      lastName?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firstName?: string
    lastName?: string
  }
}
