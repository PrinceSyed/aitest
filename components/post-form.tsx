"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function PostForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`)
      }
      
      if (!user) {
        throw new Error("User not authenticated")
      }

      const userName = user.user_metadata?.name || user.email || "Unknown"
      const userAvatar = user.user_metadata?.avatar_url || ""

      console.log("Submitting post with data:", {
        title,
        content,
        user_id: user.id,
        user_name: userName,
        user_avatar: userAvatar,
        created_at: new Date().toISOString(),
      })

      // Insert post
      const { error: insertError } = await supabase
        .from("posts")
        .insert([
          {
            title,
            content,
            user_id: user.id,
            user_name: userName,
            user_avatar: userAvatar,
            created_at: new Date().toISOString(),
          },
        ])

      if (insertError) {
        console.error("Supabase insert error:", insertError)
        throw new Error(`Database error: ${insertError.message}`)
      }

      // Reset form and refresh the page
      setTitle("")
      setContent("")
      toast.success("Post created successfully!")
      router.refresh()
    } catch (error) {
      console.error("Error submitting post:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Textarea
          placeholder="Write your post content here..."
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          required
          className="min-h-[200px] w-full"
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Post"}
      </Button>
    </form>
  )
} 