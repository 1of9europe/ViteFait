import { authSlice, initialState } from '../src/store/authSlice';

describe('Auth Slice', () => {
  it('should return the initial state', () => {
    expect(authSlice.reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle login pending', () => {
    const action = { type: 'auth/login/pending' };
    const state = authSlice.reducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle login fulfilled', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'CLIENT' as const,
    };
    
    const action = {
      type: 'auth/login/fulfilled',
      payload: { user: mockUser, token: 'mock-token' },
    };
    
    const state = authSlice.reducer(initialState, action);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('mock-token');
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('should handle login rejected', () => {
    const action = {
      type: 'auth/login/rejected',
      payload: 'Invalid credentials',
    };
    
    const state = authSlice.reducer(initialState, action);
    expect(state.error).toBe('Invalid credentials');
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle logout', () => {
    const loggedInState = {
      ...initialState,
      user: { id: '1', email: 'test@example.com' },
      token: 'mock-token',
      isAuthenticated: true,
    };
    
    const action = { type: 'auth/logout' };
    const state = authSlice.reducer(loggedInState, action);
    
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe(null);
  });
}); 