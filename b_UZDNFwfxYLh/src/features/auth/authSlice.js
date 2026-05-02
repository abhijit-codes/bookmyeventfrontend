import { createSlice } from "@reduxjs/toolkit"

const storedAuth = JSON.parse(localStorage.getItem("bookMyEventAuth") || "null")

const initialState = {
  account: storedAuth?.account ?? null,
  accessToken: storedAuth?.accessToken ?? null,
  refreshToken: storedAuth?.refreshToken ?? null,
}

const persist = (state) => {
  localStorage.setItem(
    "bookMyEventAuth",
    JSON.stringify({
      account: state.account,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    }),
  )
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.account = action.payload.account
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken
      persist(state)
    },
    logout: (state) => {
      state.account = null
      state.accessToken = null
      state.refreshToken = null
      localStorage.removeItem("bookMyEventAuth")
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
