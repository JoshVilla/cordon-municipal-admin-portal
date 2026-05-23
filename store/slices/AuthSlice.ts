import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface StaffUser {
  id: string
  name: string
  email: string
  employee_id: string
  department: string
  role: string
  status: string
  profile_picture?: string
}

interface AuthState {
  user: StaffUser | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<StaffUser>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer