'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from './types'
import { getCurrentUser, setCurrentUser } from './storage'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login - in a real app this would call an API
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
    }
    setCurrentUser(newUser)
    setUser(newUser)
  }

  const signup = async (email: string, password: string, name?: string) => {
    // Mock signup - in a real app this would call an API
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: name || email.split('@')[0],
    }
    setCurrentUser(newUser)
    setUser(newUser)
  }

  const logout = () => {
    setCurrentUser(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
