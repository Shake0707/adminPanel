"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
import Image from "next/image"
import { BASE_URL } from "@/lib/constants"
import $api from "@/lib/axios"

export default function EditManagerPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { leaders, updateLeader } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    language: "ru",
    fullName: "",
    position: "",
    phoneNumber: "",
    email: "",
    bio: "",
  })

  useEffect(() => {
    const leaderId = params.id as string

    // Set loading state
    setIsLoading(true)

    const fetchLeaderData = async () => {
      try {
        // Try to fetch data from the API first
        const response = await fetch(`${BASE_URL}/${language}/api/leadership/${leaderId}/`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const leaderData = await response.json()

          setFormData({
            language: leaderData.language || language,
            fullName: leaderData.f_name || leaderData.full_name || "",
            position: leaderData.position_text || leaderData.position || leaderData.title || "",
            phoneNumber: leaderData.phone || leaderData.phone_number || "",
            email: leaderData.email || "",
            bio: leaderData.biography_text || leaderData.description || leaderData.bio || "",
          })

          setIsLoading(false)
          return
        }

        // Fall back to store if API fails
        throw new Error("API request failed")
      } catch (error) {
        console.error("Error fetching from API, falling back to store data")

        // Get leader from store
        const foundLeader = leaders[language]?.find((leader) => leader.id === leaderId)

        if (foundLeader) {
          setFormData({
            language: foundLeader.language,
            fullName: foundLeader.fullName,
            position: foundLeader.position,
            phoneNumber: foundLeader.phoneNumber,
            email: foundLeader.email,
            bio: foundLeader.bio || "",
          })
        } else {
          toast({
            title: "Error",
            description: "Manager not found",
            variant: "destructive",
          })
          router.push("/dashboard/managers")
        }

        setIsLoading(false)
      }
    }

    fetchLeaderData()
  }, [params.id, language, leaders, router, toast])

  // Update the handleSubmit function to ensure proper data handling
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

    setIsLoading(true)

    const leaderId = params.id as string

    try {
      // Add a slight delay to prevent data reversion
      // await new $api.post(BASE_URL+ "/uz/api/")

      // Update leader in store with the specific language
      // await updateLeader(leaderId, formData.language as "en" | "ru" | "uz", {
      //   fullName: formData.fullName,
      //   position: formData.position,
      //   phoneNumber: formData.phoneNumber,
      //   email: formData.email,
      //   bio: formData.bio,
      //   language: formData.language as "en" | "ru" | "uz", // Ensure language is updated
      //   // In a real app, we would handle photo upload here
      // })

      await $api.put(`${BASE_URL}/uz/api/leadership/${leaderId}/`, {
        f_name: formData.fullName,
        position_text: formData.position,
        phone: formData.phoneNumber,
        email: formData.email,
        biography_text: formData.bio,
      })

      // Another small delay before showing success message

      toast({
        title: "Success",
        description: "Manager has been updated successfully",
      })

      // Add delay before navigation to ensure state updates have been applied
      setTimeout(() => {
        setIsLoading(false)
        router.push("/dashboard/managers")
      }, 500)
    } catch (error) {
      console.error("Failed to update manager:", error)
      toast({
        title: "Error",
        description: "Failed to update manager",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // console.log(formData.photo);
  

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files
  //   if (file) {
  //     setFormData({ ...formData, photo: file[0] })
  //   }
  // }

  return (
    <DashboardLayout>
      <div>
        <h2 className="mb-6 text-2xl font-bold">{t("editManager")}</h2>
        <Card>
          <CardHeader className="filter-section-dark">
            <CardTitle className="text-white">{t("editManager")}</CardTitle>
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
