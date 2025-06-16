import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, WorkSession } from '../types';
import { initialUsers } from '../data/initialData';

interface AuthState {
  currentUser: User | null;
  users: User[];
  workSessions: WorkSession[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'ADD_USER'; user: Omit<User, 'id'> }
  | { type: 'UPDATE_USER'; userId: number; updates: Partial<User> }
  | { type: 'DELETE_USER'; userId: number }
  | { type: 'START_WORK_SESSION'; waiterId: number }
  | { type: 'END_WORK_SESSION'; waiterId: number }
  | { type: 'LOAD_AUTH_DATA'; data: AuthState };

const initialState: AuthState = {
  currentUser: null,
  users: initialUsers,
  workSessions: [],
  isAuthenticated: false,
  isLoading: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };

    case 'LOGIN_SUCCESS':
      const updatedUsers = state.users.map(user =>
        user.id === action.user.id
          ? { ...user, lastLogin: new Date() }
          : user
      );
      
      return {
        ...state,
        currentUser: { ...action.user, lastLogin: new Date() },
        users: updatedUsers,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
      };

    case 'LOGOUT':
      // End active work session if exists
      const activeSession = state.workSessions.find(
        session => session.waiterId === state.currentUser?.id && session.isActive
      );
      
      const updatedSessions = activeSession
        ? state.workSessions.map(session =>
            session.id === activeSession.id
              ? { ...session, endTime: new Date(), isActive: false }
              : session
          )
        : state.workSessions;

      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
        workSessions: updatedSessions,
      };

    case 'ADD_USER':
      const newUserId = Math.max(...state.users.map(u => u.id), 0) + 1;
      return {
        ...state,
        users: [...state.users, { ...action.user, id: newUserId }],
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.userId
            ? { ...user, ...action.updates }
            : user
        ),
        currentUser: state.currentUser?.id === action.userId
          ? { ...state.currentUser, ...action.updates }
          : state.currentUser,
      };

    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.userId),
      };

    case 'START_WORK_SESSION':
      const newSessionId = Math.max(...state.workSessions.map(s => s.id), 0) + 1;
      const newSession: WorkSession = {
        id: newSessionId,
        waiterId: action.waiterId,
        startTime: new Date(),
        totalOrders: 0,
        totalRevenue: 0,
        isActive: true,
      };
      
      return {
        ...state,
        workSessions: [...state.workSessions, newSession],
      };

    case 'END_WORK_SESSION':
      return {
        ...state,
        workSessions: state.workSessions.map(session =>
          session.waiterId === action.waiterId && session.isActive
            ? { ...session, endTime: new Date(), isActive: false }
            : session
        ),
      };

    case 'LOAD_AUTH_DATA':
      return {
        ...action.data,
        // Ensure dates are properly restored
        users: action.data.users.map(user => ({
          ...user,
          createdAt: new Date(user.createdAt),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
        })),
        workSessions: action.data.workSessions.map(session => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
        })),
      };

    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  startWorkSession: () => void;
  endWorkSession: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const savedAuthData = localStorage.getItem('restaurant-auth-data');
    if (savedAuthData) {
      try {
        const parsedData = JSON.parse(savedAuthData);
        dispatch({ type: 'LOAD_AUTH_DATA', data: parsedData });
      } catch (error) {
        console.error('Error loading auth data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('restaurant-auth-data', JSON.stringify(state));
  }, [state]);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = state.users.find(
        u => u.username === username && u.password === password && u.isActive
      );
      
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', user });
        
        // Auto-start work session for waiters
        if (user.role === 'waiter') {
          const activeSession = state.workSessions.find(
            session => session.waiterId === user.id && session.isActive
          );
          
          if (!activeSession) {
            dispatch({ type: 'START_WORK_SESSION', waiterId: user.id });
          }
        }
        
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const startWorkSession = () => {
    if (state.currentUser && state.currentUser.role === 'waiter') {
      dispatch({ type: 'START_WORK_SESSION', waiterId: state.currentUser.id });
    }
  };

  const endWorkSession = () => {
    if (state.currentUser && state.currentUser.role === 'waiter') {
      dispatch({ type: 'END_WORK_SESSION', waiterId: state.currentUser.id });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      dispatch, 
      login, 
      logout, 
      startWorkSession, 
      endWorkSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}