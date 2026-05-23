import { showToast } from './utils'
import { PERMISSION_LABELS } from './constants/departments'

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function checkPermission(permissions: string[], required: string): boolean {
  if (permissions.includes(required)) return true
  
  showToast.error(`You don't have permission to ${PERMISSION_LABELS[required] ?? required}.`)
  return false
}

// add to lib/utils.ts

export function getSuspensionEndDate(days: number | null | undefined): string | null {
  if (!days) return null

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)

  return formatDate(endDate.toISOString())
}

export const PASSWORD_RULES = [
  { key: 'length',  label: 'At least 6 characters',        test: (p: string) => p.length >= 6 },
  { key: 'upper',   label: 'At least 1 uppercase letter',   test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower',   label: 'At least 1 lowercase letter',   test: (p: string) => /[a-z]/.test(p) },
  { key: 'number',  label: 'At least 1 number',             test: (p: string) => /[0-9]/.test(p) },
  { key: 'special', label: 'At least 1 special character',  test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export function validatePassword(password: string) {
  return PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }))
}

export function isPasswordValid(password: string) {
  return PASSWORD_RULES.every((rule) => rule.test(password))
}

export function getPasswordErrors(password: string): string[] {
  return PASSWORD_RULES
    .filter((rule) => !rule.test(password))
    .map((rule) => rule.label)
}