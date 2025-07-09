"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

export default function EditSocialMediaPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    platform: "",
    url: "",
    icon: "",
    isActive: true,
  })

  // Replace the useEffect that uses mock data with one that uses the API client
  useEffect(() => {
    const socialMediaId = params.id as string

    const fetchSocialMedia = async () => {
      try {
        // Use the API client to fetch the social media by ID
        const response = await api.socialNetworks.getById(socialMediaId)

        if (response) {
          const socialMedia = response
          setFormData({
            platform: socialMedia.name || socialMedia.platform || "",
            url: socialMedia.url || "",
            icon: socialMedia.icon || socialMedia.name?.toLowerCase() || "",
            isActive: socialMedia.is_active !== undefined ? socialMedia.is_active : true,
          })
        } else {
          toast({
            title: t("error"),
            description: t("socialMediaNotFound"),
            variant: "destructive",
          })
          router.push("/dashboard/social-media")
        }
      } catch (error) {
        console.error(`Error fetching social media ${socialMediaId}:`, error)
        toast({
          title: t("error"),
          description: t("errorLoadingSocialMedia"),
          variant: "destructive",
        })
        router.push("/dashboard/social-media")
      }
    }

    fetchSocialMedia()
  }, [params.id, router, toast, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.platform || !formData.url) {
      toast({
        title: "Error",
        description: "Platform and URL are required",
        variant: "destructive",
      })
      return
    }

    // Validate URL
    try {
      new URL(formData.url)
    } catch (error) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Social media link has been updated successfully",
      })

      // Navigate back to the social media page
      router.push("/dashboard/social-media")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update social media link",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div>
        <h2 className="mb-6 text-2xl font-bold">{t("editSocialMedia")}</h2>
        <Card>
          <CardHeader className="filter-section-dark">
            <CardTitle className="dark:text-white">{t("editSocialMedia")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("platform")}</label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      platform: value,
                      icon: value.toLowerCase(),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectPlatform")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Telegram">Telegram</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("url")}</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  required
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
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/social-media")}>
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
