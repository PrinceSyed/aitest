'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function TestDB() {
  const [message, setMessage] = useState<string>('Testing database connection...')
  const [user, setUser] = useState<any>(null)
  const [tableInfo, setTableInfo] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      const supabase = createClientComponentClient()
      
      try {
        // Test authentication
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Test posts table
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .limit(1)

        if (postsError) {
          setMessage(`Error with posts table: ${postsError.message}`)
          return
        }

        // Get table structure
        const { data: tableData, error: tableError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })

        if (tableError) {
          setMessage(`Error getting table info: ${tableError.message}`)
          return
        }

        setTableInfo({
          count: tableData.length,
          columns: Object.keys(tableData[0] || {}),
        })

        setMessage('Successfully connected to database!')
      } catch (error) {
        setMessage(`Connection error: ${error}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
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
        {tableInfo && (
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Posts Table Info:</h2>
            <p>Number of records: {tableInfo.count}</p>
            <p>Columns: {tableInfo.columns.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  )
} 