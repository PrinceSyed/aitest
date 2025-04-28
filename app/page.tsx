"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, Pencil, Trash2, Loader2 } from "lucide-react"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

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
  const [user, setUser] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchPosts = async () => {
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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Error logging in with Google:', error.message)
    }
  }

  const handleDelete = async (postId: string) => {
    setDeleteLoading(true)
    const { error } = await supabase.from("posts").delete().eq("id", postId)
    if (error) {
      toast.error("Failed to delete post")
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      toast.success("Post deleted")
    }
    setDeleteLoading(false)
    setShowDeleteModal(null)
  }

  const openEditModal = (post: Post) => {
    setEditTitle(post.title)
    setEditContent(post.content)
    setShowEditModal(post.id)
  }

  const handleEdit = async (postId: string) => {
    setEditLoading(true)
    const { error } = await supabase.from("posts").update({ title: editTitle, content: editContent }).eq("id", postId)
    if (error) {
      toast.error("Failed to update post")
    } else {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, title: editTitle, content: editContent } : p))
      toast.success("Post updated")
    }
    setEditLoading(false)
    setShowEditModal(null)
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between px-4 py-6 border-b border-border bg-background">
          <h1 className="text-2xl font-bold">All Posts</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleGoogleLogin} variant="outline">
                Sign in
              </Button>
            )}
          </div>
        </header>
        <main className="container mx-auto p-4">
          {user && (
            <div className="flex justify-end mb-6">
              <Link href="/create-post">
                <Button variant="default">Create Post</Button>
              </Link>
            </div>
          )}
          {loading ? (
            <div className="text-center text-muted-foreground">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground">No posts found.</div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => {
                const isOwner = user && post.user_id === user.id
                return (
                  <Card key={post.id}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle>{post.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={post.user_avatar} alt={post.user_name || post.user_id} />
                            <AvatarFallback>{(post.user_name || post.user_id || "?").charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm text-foreground">{post.user_name || post.user_id}</span>
                          <span className="text-xs text-muted-foreground">• {new Date(post.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      {isOwner && (
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEditModal(post)} aria-label="Edit post">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setShowDeleteModal(post.id)} aria-label="Delete post">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-base text-foreground whitespace-pre-line">{post.content}</p>
                    </CardContent>
                    {/* Delete Modal */}
                    {showDeleteModal === post.id && (
                      <Sheet open={true} onOpenChange={() => setShowDeleteModal(null)}>
                        <SheetContent side="top" className="max-w-md mx-auto">
                          <SheetHeader>
                            <SheetTitle>Delete Post</SheetTitle>
                          </SheetHeader>
                          <div className="py-4">Are you sure you want to delete this post?</div>
                          <SheetFooter>
                            <Button variant="outline" onClick={() => setShowDeleteModal(null)} disabled={deleteLoading}>Cancel</Button>
                            <Button variant="destructive" onClick={() => handleDelete(post.id)} disabled={deleteLoading}>
                              {deleteLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}Yes, Delete
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    )}
                    {/* Edit Modal */}
                    {showEditModal === post.id && (
                      <Sheet open={true} onOpenChange={() => setShowEditModal(null)}>
                        <SheetContent side="top" className="max-w-md mx-auto">
                          <SheetHeader>
                            <SheetTitle>Edit Post</SheetTitle>
                          </SheetHeader>
                          <div className="py-4 space-y-4">
                            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" />
                            <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} placeholder="Content" />
                          </div>
                          <SheetFooter>
                            <Button variant="outline" onClick={() => setShowEditModal(null)} disabled={editLoading}>Cancel</Button>
                            <Button variant="default" onClick={() => handleEdit(post.id)} disabled={editLoading}>
                              {editLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}Save
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}
