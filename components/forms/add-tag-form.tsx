"use client"

import type React from "react"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function AddTagForm() {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    language: "ru",
    name: "",
    nameTranslit: "",
    alias: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Tag has been created successfully",
      })
      setIsLoading(false)
      setFormData({
        language: "ru",
        name: "",
        nameTranslit: "",
        alias: "",
      })
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("addTag")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("language")}</label>
            <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
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
            <label className="text-sm font-medium">{t("name")}</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("name")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("nameTranslit")}</label>
            <Input
              value={formData.nameTranslit}
              onChange={(e) => setFormData({ ...formData, nameTranslit: e.target.value })}
              placeholder={t("nameTranslit")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("alias")}</label>
            <Input
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              placeholder={t("alias")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("saving") : t("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
