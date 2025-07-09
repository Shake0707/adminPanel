"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import FileUpload from "../FileUpload/FileUpload"
import $api from "@/lib/axios"

interface ArticleData {
    id: string
    title: string
    category: string
    content: string
    language: string
    images?: string[]
}

interface IData {
    id: string;
    title: string;
    type: string;
    content?: string;
    image?: File;
}

export default function ArticleEdit({ id, type }: { id: string; type: string; }) {
    const { t, language } = useLanguage()
    const router = useRouter()
    const { toast } = useToast()

    const [files, setFiles] = useState<FileList | null>(null);

    const [article, setArticle] = useState<ArticleData>({
        id: "",
        title: "",
        category: "",
        content: type,
        language: language,
        images: [],
    })

    // useEffect(() => {
    //     setArticle(prev => ({ ...prev, category: type }));
    // }, [type]);

    console.log(article.category);
    

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)

    // Base API URL
    const API_BASE_URL = "https://uzfk.uz"

    useEffect(() => {
        const fetchArticleData = async () => {
            setIsLoading(true)
            setApiError(null)

            try {
                // Use the content/{id} endpoint to fetch a specific article
                const apiUrl = `${API_BASE_URL}/${language}/api/content?type=${type}&id=${id}`;

                const response = await fetch(apiUrl, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    // If the response is 404, it means the article is not found
                    if (response.status === 404) {
                        toast({
                            title: t("error"),
                            description: t("articleNotFound"),
                            variant: "destructive",
                        })
                        // router.push("/dashboard/articles")
                        return
                    }
                    throw new Error(`API request failed with status ${response.status}`)
                }

                const data = await response.json()
                console.log("Article data received:", data)

                setArticle({
                    id: data.id?.toString() || id,
                    title: data.title || "",
                    category: type,
                    content: data.body || data.content || "",
                    language: language,
                    images: data.image ? [`${API_BASE_URL}${data.image}`] : [],
                })
            } catch (error) {
                console.error("Error fetching article:", error)
                setApiError(error instanceof Error ? error.message : "Unknown error")

                toast({
                    title: t("error"),
                    description: t("errorLoadingArticle"),
                    variant: "destructive",
                })

                // Redirect back to articles list on error
                router.push("/dashboard/articles")
            } finally {
                setIsLoading(false)
            }
        }

        fetchArticleData()
    }, [id, language, router, toast, t])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setArticle((prev) => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (value: string) => {
        setArticle((prev) => ({ ...prev, category: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setApiError(null)

        try {
            const updateData: IData = {
                id: article.id,
                title: article.title,
                type: article.category,
            }
            // Prepare the data for API update
            if (files) {
                updateData.image = files[0];
            }
            if (article.content) {
                updateData.content = article.content;
            }

            // Use the PUT endpoint to update the article
            const apiUrl = `${API_BASE_URL}/${language}/api/content/`

            await $api.put(apiUrl, updateData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log("API update successful:")

            toast({
                title: t("success"),
                description: t("articleUpdatedSuccessfully"),
            })

            router.push("/dashboard/articles")
        } catch (error) {
            console.error("Error updating article:", error)
            setApiError(error instanceof Error ? error.message : "Unknown error")

            toast({
                title: t("error"),
                description: t("errorUpdatingArticle"),
                variant: "destructive",
            })
            router.push("/dashboard/articles")

        } finally {
            setIsSaving(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={() => router.push("/dashboard/articles")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("back")}
                    </Button>
                    <h1 className="text-2xl font-bold ml-4">{t("editArticle")}</h1>
                </div>

                {apiError && (
                    <Card className="mb-6 border-red-500">
                        <CardContent className="p-4">
                            <div className="flex items-center text-red-500">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                <p>API Error: {apiError}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <p>{t("loading")}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>{t("articleDetails")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">{t("title")}</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={article.title}
                                        onChange={handleChange}
                                        placeholder={t("enterTitle")}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">{t("category")}</Label>
                                    <Select value={article.category} onValueChange={handleCategoryChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("selectCategory")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="article">Article</SelectItem>
                                            <SelectItem value="news">News</SelectItem>
                                            <SelectItem value="ads">Announcements</SelectItem>
                                            <SelectItem value="banner">Blog</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <FileUpload setFiles={setFiles} files={files} />

                                <div>
                                    <Label htmlFor="content">{t("content")}</Label>
                                    <Textarea
                                        id="content"
                                        name="content"
                                        value={article.content}
                                        onChange={handleChange}
                                        placeholder={t("enterContent")}
                                        rows={10}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? t("saving") : t("save")}
                                {!isSaving && <Save className="ml-2 h-4 w-4" />}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    )
}
