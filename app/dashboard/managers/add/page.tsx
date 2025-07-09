"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"
import { Paperclip } from "lucide-react"
import $api from "@/lib/axios"
import axios from "axios"

export default function AddManagerPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    language: language,
    fullName: "",
    position: "",
    phoneNumber: "",
    email: "", // Add this line
    bio: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName || !formData.position || !formData.phoneNumber || !formData.email) {
      toast({
        title: "Error",
        description: "Full name, position, phone number, and email are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await $api.post("https://uzfk.uz/uz/api/leadership/", {
        f_name: formData.fullName,
        position_text: formData.position,
        phone: formData.phoneNumber,
        email: formData.email,
        biography_text: formData.bio,
      }, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      toast({
        title: "Success",
        description: "Manager has been added successfully",
      })

      router.push("/dashboard/managers")
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error("Error creating article:", e.message);
        toast({
          title: "Error",
          description: "Failed to create user. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div>
        <h2 className="mb-6 text-2xl font-bold">{t("addManager")}</h2>
        <Card>
          <CardHeader className="filter-section-dark">
            <CardTitle className="dark:text-white">{t("addManager")}</CardTitle>
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
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("fullName")}</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t("fullName")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("position")}</label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder={t("position")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("phoneNumber")}</label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("email")}</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("bio")}</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t("bio")}
                  rows={4}
                />
              </div>
              <div className="flex justify-end">
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
