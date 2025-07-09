"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import $api from "@/lib/axios"

export default function EditContactInfoPage() {
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    language: "ru",
    type: "reception",
    value: "",
    description: "",
  })

  // Replace the useEffect that uses mock data with one that uses the API client
  useEffect(() => {
    const infoId = params.id as string

    const fetchContactInfo = async () => {
      try {
        const response = await $api.get(`https://uzfk.uz/uz/api/contact/${infoId}`);

        if (response) {
          const info = response.data;
          setFormData({
            language: info.language || language,
            type: info.contact_type || "reception",
            value: info.value || "",
            description: info.info || "",
          })

          // Set the language in the language provider to match the item's language
          if (info.language) {
            setLanguage(info.language as "uz-cyrl" | "ru" | "uz")
          }
        } else {
          toast({
            title: t("error"),
            description: t("contactInfoNotFound"),
            variant: "destructive",
          })
          router.push("/dashboard/contact-info")
        }
      } catch (error) {
        console.error(`Error fetching contact info ${infoId}:`, error)
        toast({
          title: t("error"),
          description: t("errorLoadingContactInfo"),
          variant: "destructive",
        })
        router.push("/dashboard/contact-info")
      }
    }

    fetchContactInfo()
  }, [params.id, router, toast, setLanguage, language, t])

  const handleSubmit = async (e: React.FormEvent) => {
    const infoId = params.id as string;
    e.preventDefault()

    if (!formData.value) {
      toast({
        title: "Error",
        description: "Value is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await $api.put(`https://uzfk.uz/uz/api/contact/${infoId}/`, {
        contact_type: formData.type,
        value: formData.value,
        info: formData.description
      })

      toast({
        title: "Success",
        description: "Contact information has been updated successfully",
      })

      // Navigate back to the contact info page
      router.push("/dashboard/contact-info")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact information",
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
          <h2 className="text-2xl font-bold">{t("editContactInfo")}</h2>
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
            <CardTitle className="dark:text-white">{t("editContactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("language")}</label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
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
                <label className="text-sm font-medium">{t("type")}</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reception">{t("reception")}</SelectItem>
                    <SelectItem value="trustPhone">{t("hotline")}</SelectItem>
                    <SelectItem value="email">{t("email")}</SelectItem>
                    <SelectItem value="address">{t("address")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("value")}</label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={t("value")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("description")}</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("description")}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/contact-info")}>
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
