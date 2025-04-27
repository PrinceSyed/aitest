"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Post {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
  user_name?: string
  user_avatar?: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
      if (!error && data) {
        setPosts(data)
      }
      setLoading(false)
    }
    fetchPosts()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-6 border-b border-border bg-background">
        <h1 className="text-2xl font-bold">All Posts</h1>
        <Link href="/create-post">
          <Button variant="default">Create Post</Button>
        </Link>
      </header>
      <main className="container mx-auto p-4">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted-foreground">No posts found.</div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={post.user_avatar} alt={post.user_name || post.user_id} />
                      <AvatarFallback>{(post.user_name || post.user_id || "?").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-foreground">{post.user_name || post.user_id}</span>
                    <span className="text-xs text-muted-foreground">• {new Date(post.created_at).toLocaleString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-foreground whitespace-pre-line">{post.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
