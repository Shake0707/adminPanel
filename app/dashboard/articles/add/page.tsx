"use client"

import type React from "react"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import FileUpload from "@/components/FileUpload/FileUpload"
import $api from "@/lib/axios"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function AddArticlePage() {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [translitContent, setTranslitContent] = useState("")
  const [category, setCategory] = useState("news")
  const [language, setLanguage] = useState<"en" | "ru" | "uz" | "uz-cyrl">("en")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast();
  const [files, setFiles] = useState<FileList | null>(null);

  const router = useRouter();

  const handleClick = async (e: FormEvent) => {
    e.preventDefault();

    if (!title || !content || !files) {
      toast({
        title: "Validation Error",
        description: "Title, content and image are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true);

    try {
      // Use the store's addArticle function instead of API client
      // addArticle({
      //   title,
      //   content,
      //   slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
      //   category: category || "uncategorized",
      //   language, // Use the selected language
      //   author: "Current User",
      //   tags: [],
      //   image: "",
      //   isPublished: true,
      // })

      await $api.post("https://uzfk.uz/uz/api/content/", {
        title,
        content,
        type: category,
        author: localStorage.getItem("currentUser"),
        image: files[0],
      }, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      toast({
        title: "Success",
        description: "Article created successfully",
      });

      // Reset form
      setTitle("")
      setSlug("")
      setContent("")
      setTranslitContent("")
      setCategory("")
      setFiles(null);
      router.push('/dashboard/articles');
    } catch (error) {
      if (axios.isAxiosError(error)) {

        console.error("Error creating article:", error.message);
        toast({
          title: "Error",
          description: "Failed to create article. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSlug = () => {
    if (!title) return;

    // Convert title to lowercase, replace spaces with hyphens, and remove special characters
    const generatedSlug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")

    setSlug(generatedSlug)
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Article</CardTitle>
          <CardDescription>Create a new article for the website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article Title" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">Slug</Label>
              <Button type="button" variant="outline" size="sm" onClick={generateSlug} disabled={!title}>
                Generate from Title
              </Button>
            </div>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="article-slug" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="News" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="post">Events</SelectItem>
                  <SelectItem value="ads">Announcements</SelectItem>
                  <SelectItem value="banner">Blog</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={(val) => setLanguage(val as "en" | "ru" | "uz" | "uz-cyrl")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                  <SelectItem value="uz">Uzbek (Latin)</SelectItem>
                  <SelectItem value="uz-cyrl">Uzbek (Cyrillic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <FileUpload setFiles={setFiles} files={files} />
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              showTransliteration={language === "uz" || language === "uz-cyrl"}
              initialContent={content}
              initialTranslitContent={translitContent}
              onChange={setContent}
              onTranslitChange={setTranslitContent}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full" onClick={handleClick}>
            {isSubmitting ? "Creating..." : "Create Article"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
