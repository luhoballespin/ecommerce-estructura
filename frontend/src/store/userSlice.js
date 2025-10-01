import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import clearCart from '../helpers/clearCart'

// Async thunk para login
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al iniciar sesión');
      }

      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

// Async thunk para logout
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      // Limpiar carrito antes del logout
      try {
        await clearCart();
        console.log('Cart cleared successfully');
      } catch (cartError) {
        console.warn('Error clearing cart during logout:', cartError);
      }

      // Intentar logout en el servidor, pero no fallar si no funciona
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/userLogout`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('Server logout successful');
        } else {
          console.warn('Server logout failed, but continuing with local cleanup');
        }
      } catch (serverError) {
        console.warn('Server logout error, but continuing with local cleanup:', serverError);
      }

      // SIEMPRE limpiar el estado local, independientemente del resultado del servidor
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Local storage cleared');

      return null;
    } catch (error) {
      console.error('Unexpected error during logout:', error);

      // En caso de error inesperado, aún así limpiar el estado local
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Intentar limpiar carrito localmente
      try {
        await clearCart();
      } catch (cartError) {
        console.warn('Error clearing cart during logout cleanup:', cartError);
      }

      return null;
    }
  }
);

// Async thunk para verificar autenticación
export const checkAuthStatus = createAsyncThunk(
  'user/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return rejectWithValue('No hay token');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        return rejectWithValue('Token inválido');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue('Error de conexión');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  isAuthenticated: false,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;

      // Guardar en localStorage para persistencia
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Limpiar carrito localmente
      try {
        clearCart();
      } catch (error) {
        console.warn('Error clearing cart in clearUser:', error);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;

        // Guardar en localStorage para persistencia
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
})

// Action creators are generated for each case reducer function
export const { setUserDetails, setUser, clearUser, clearError } = userSlice.actions

export default userSlice.reducer