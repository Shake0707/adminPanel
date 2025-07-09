"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import $api from "@/lib/axios"

export default function AddYouTubeVideoPage() {
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    language: language,
    title: "",
    videoId: "",
    category: "",
    isActive: true,
  })
  const [previewUrl, setPreviewUrl] = useState("")

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    const videoId = url

    if (videoId) {
      setFormData({ ...formData, videoId })
      setPreviewUrl(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`)
    } else {
      setFormData({ ...formData, videoId: url }) // Store as is if not a valid YouTube URL
      setPreviewUrl("")
    }
  }

  // Update the handleSubmit function to use the mock YouTube videos service
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.videoId) {
      toast({
        title: "Error",
        description: "Title and YouTube video ID/URL are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create the YouTube video using the mock service
      // await api.admin.youtube.create({
      //   language: formData.language as "en" | "ru" | "uz" | "uz-cyrl",
      //   title: formData.title,
      //   videoId: formData.videoId,
      //   category: formData.category,
      //   isActive: formData.isActive,
      // })

      await $api.post("https://uzfk.uz/uz/api/admin/youtube/", {
        title: formData.title,
        url: formData.videoId,
        category: formData.category,
        active: formData.isActive,
      })

      toast({
        title: "Success",
        description: "YouTube video has been added successfully",
      })

      // Navigate back to the YouTube videos page
      router.push("/dashboard/youtube-videos")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add YouTube video",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t("addYouTubeVideo")}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t("language")}:</span>
              <Select
                value={language}
                onValueChange={(value: "uz-cyrl" | "ru" | "uz") => {
                  setLanguage(value)
                  setFormData((prev) => ({ ...prev, language: value }))
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz-cyrl">Ўзбекча (Кирилл)</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="uz">O'zbekcha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="filter-section-dark">
            <CardTitle className="dark:text-white">{t("addYouTubeVideo")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("language")}</label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value as typeof language })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectLanguage")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский язык</SelectItem>
                    <SelectItem value="uz">O'zbek tili</SelectItem>
                    <SelectItem value="uz-cyrl">Ўзбекча (Кирилл)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("title")}</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("title")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("youtubeUrl")}</label>
                <Input onChange={handleVideoUrlChange} placeholder="https://www.youtube.com/watch?v=..." required />
                <p className="text-xs text-gray-500">{t("youtubeUrlHelp")}</p>
              </div>

              {previewUrl && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("preview")}</label>
                  <div className="relative h-32 w-56 overflow-hidden rounded border">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Video preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("category")}</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder={t("category")}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <label htmlFor="is-active" className="text-sm font-medium">
                  {t("active")}
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/youtube-videos")}>
                  {t("cancel")}
                </Button>
                <Button type="submit" className="button-primary" disabled={isLoading}>
                  {isLoading ? t("saving") : t("save")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
