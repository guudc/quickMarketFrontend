import type { SignUpFormData, SignInFormData, ForgotPasswordFormData, FormErrors } from "./auth-types"

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export const validateSignUpForm = (data: SignUpFormData): FormErrors => {
  const errors: FormErrors = {}

  if (!data.firstName.trim()) {
    errors.firstName = "First name is required"
  }

  if (!data.lastName.trim()) {
    errors.lastName = "Last name is required"
  }

  if (!data.email.trim()) {
    errors.email = "Email is required"
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address"
  }

  if (!data.password) {
    errors.password = "Password is required"
  } else if (!validatePassword(data.password)) {
    errors.password = "Password must be at least 8 characters with uppercase, lowercase, number and at least one of this special characters: @ $ ! % * ? &"
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password"
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  if (!data.agreeToTerms) {
    errors.agreeToTerms = "You must agree to the Terms of Service"
  }

  return errors
}

export const validateSignInForm = (data: SignInFormData): FormErrors => {
  const errors: FormErrors = {}

  if (!data.email.trim()) {
    errors.email = "Email is required"
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address"
  }

  if (!data.password) {
    errors.password = "Password is required"
  }

  return errors
}

export const validateForgotPasswordForm = (data: ForgotPasswordFormData): FormErrors => {
  const errors: FormErrors = {}

  if (!data.email.trim()) {
    errors.email = "Email is required"
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address"
  }

  return errors
}
