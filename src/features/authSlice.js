import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('janawaaz_token') || null,
  user: null, // We'll hydrate this after login or fetching profile
  isAuthenticated: !!localStorage.getItem('janawaaz_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('janawaaz_token', action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('janawaaz_token');
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
