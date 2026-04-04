import { createContext, useContext, useState, useEffect } from 'react'

const SessionContext = createContext(null)

const SESSION_KEY = 'cn_session'

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null)   // { id, name, email }
  const [loading, setLoading]  = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) setSession(JSON.parse(stored))
    } catch {
      localStorage.removeItem(SESSION_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveSession = (sessionData) => {
    setSession(sessionData)
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
  }

  const clearSession = () => {
    setSession(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <SessionContext.Provider value={{ session, loading, saveSession, clearSession }}>
      {!loading && children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
