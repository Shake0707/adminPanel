// Create the edit page for regional councils
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"
import $api from "@/lib/axios"

export default function EditRegionalCouncilPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { regionalCouncils, updateRegionalCouncil } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // language: "ru",
    name: "",
    region: "",
    head: "",
    phoneNumber: "",
    email: "",
    address: "",
  })

  useEffect(() => {
    const id = params.id as string

    async function fetch() {
      setIsLoading(true);

      try {
        const data: any = await $api.get(`https://uzfk.uz/uz/api/local-council/${id}/`);

        setFormData({
          // language: data.language,
          name: data.data.name,
          region: data.data.region,
          head: data.data.title,
          phoneNumber: data.data.phone,
          email: data.data.email,
          address: data.data.address,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Regional council not found",
          variant: "destructive",
        })
        router.push("/dashboard/regional-councils")
      } finally {
        setIsLoading(false);
      }
    }
    fetch();
  }, [params.id, regionalCouncils, router, toast])

  // Update the handleSubmit function to ensure proper language handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.region || !formData.head) {
      toast({
        title: "Error",
        description: "Name, region, and head are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const councilId = params.id as string

    try {
      await $api.put(`https://uzfk.uz/uz/api/local-council/${councilId}/`, {
        name: formData.name,
        region: formData.region,
        title: formData.head,
        phone: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
      });

      toast({
        title: "Success",
        description: "Regional council has been updated successfully",
      })

      // Navigate back to the regional councils page
      router.push("/dashboard/regional-councils")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update regional council",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  console.log(formData);


  return (
    <DashboardLayout>
      <div>
        <h2 className="mb-6 text-2xl font-bold">{t("editRegionalCouncil")}</h2>
        <Card>
          <CardHeader className="filter-section-dark">
            <CardTitle className="dark:text-white">{t("editRegionalCouncil")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("name")}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("name")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("region")}</label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder={t("region")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("head")}</label>
                <Input
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  placeholder={t("head")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("phoneNumber")}</label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("email")}</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("address")}</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t("address")}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/regional-councils")}>
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
