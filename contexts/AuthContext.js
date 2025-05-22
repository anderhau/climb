
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User } from '../types';
import { addUserToLocalStorage, getUsersFromLocalStorage, getFromLocalStorage, saveToLocalStorage } from '../utils/localStorageHelper';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { generateId } from '../utils/idGenerator';


interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (userId: string, password_do_not_use_in_prod: string) => Promise<boolean>;
  register: (userId: string, password_do_not_use_in_prod: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const storedUserId = getFromLocalStorage<string>(LOCAL_STORAGE_KEYS.LOGGED_IN_USER_ID);
    if (storedUserId) {
      const users = getUsersFromLocalStorage();
      const user = users.find(u => u.id === storedUserId);
      if (user) {
        // In a real app, you'd validate the session token here
        setCurrentUser(user);
      } else {
        // Clear invalid stored ID
        saveToLocalStorage(LOCAL_STORAGE_KEYS.LOGGED_IN_USER_ID, null);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (userIdInput: string, passwordInput: string): Promise<boolean> => {
    setLoading(true);
    const users = getUsersFromLocalStorage();
    // IMPORTANT: Password check is naive. In production, use bcrypt for hashing and comparison.
    const user = users.find(u => u.userId === userIdInput && u.password === passwordInput);
    if (user) {
      setCurrentUser(user);
      saveToLocalStorage(LOCAL_STORAGE_KEYS.LOGGED_IN_USER_ID, user.id);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  }, []);

  const register = useCallback(async (userIdInput: string, passwordInput: string): Promise<boolean> => {
    setLoading(true);
    const users = getUsersFromLocalStorage();
    if (users.some(u => u.userId === userIdInput)) {
      setLoading(false);
      return false; // User ID already exists
    }
    const newUser: User = { 
      id: generateId(), 
      userId: userIdInput, 
      // IMPORTANT: Store hashed password in production.
      password: passwordInput 
    };
    addUserToLocalStorage(newUser);
    setCurrentUser(newUser);
    saveToLocalStorage(LOCAL_STORAGE_KEYS.LOGGED_IN_USER_ID, newUser.id);
    setLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    saveToLocalStorage(LOCAL_STORAGE_KEYS.LOGGED_IN_USER_ID, null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};