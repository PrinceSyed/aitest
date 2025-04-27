'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabase() {
  const [message, setMessage] = useState<string>('Testing connection...')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test authentication
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Test database connection
        const { data, error } = await supabase
          .from('Table1')
          .select('*')
          .limit(1)

        if (error) {
          setMessage(`Error: ${error.message}`)
        } else {
          setMessage('Successfully connected to Supabase!')
        }
      } catch (error) {
        setMessage(`Connection error: ${error}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="space-y-4">
        <p className="text-lg">{message}</p>
        {user ? (
          <div className="bg-green-100 p-4 rounded">
            <p>User authenticated: {user.email}</p>
          </div>
        ) : (
          <div className="bg-yellow-100 p-4 rounded">
            <p>No authenticated user</p>
          </div>
        )}
      </div>
    </div>
  )
} 