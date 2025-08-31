"use client"

import { useState, useEffect } from "react"
import { redirect, useParams, usePathname, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import $api from "@/lib/axios"
import Pagenation from "@/components/pagenation/Pagenation"

interface Article {
    id: string
    title: string
    category: string
    date: string
    language: string
    content: string
    images?: string[]
}

export default function ArticlesPage({ pageCount }: { pageCount: string | string[] }) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const { toast } = useToast();

    const [searchTitle, setSearchTitle] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedLanguage, setSelectedLanguage] = useState(language)
    const [articleItems, setArticleItems] = useState<Article[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [apiError, setApiError] = useState<string | null>(null);
    const [pageInfo, setPageInfo] = useState<{
        dataPage: number;
        dataTotalPages: number;
    }>({
        dataPage: 1,
        dataTotalPages: 1
    });

    useEffect(() => {
        if (pageInfo) {
            setPageInfo(prev => ({ dataTotalPages: prev!.dataTotalPages, dataPage: 1 }));
            router.push("/dashboard/articles");
        }
    }, [searchTitle, selectedCategory]);

    const API_BASE_URL = "https://uzfk.uz"

    // Load articles from API
    useEffect(() => {
        const fetchArticles = async (filter: {
            search: string | null;
            selectedCategory: string | null;
        }) => {
            setIsLoading(true);
            setApiError(null);

            let searchStr = '';
            if (filter.search && filter.selectedCategory) {
                searchStr = `&type=${filter.selectedCategory}&search=${filter.search}`;
            } else if (filter.selectedCategory) {
                searchStr = `&type=${filter.selectedCategory}`;
            } else if (filter.search) {
                searchStr = `&search=${filter.search}`;
            }

            try {
                // Construct the API URL
                const apiUrl = `https://uzfk.uz/uz/api/content?page=${pageCount + searchStr}`;

                const response = await fetch(apiUrl, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`)
                }

                const data = await response.json()
                console.log("API response received:", data)

                const articlesData = Array.isArray(data) ? data : data.results || []

                if (articlesData.length === 0) {
                    console.warn("API returned empty results array")
                    setApiError("API returned empty results")
                }

                // Transform API data to match the expected format
                const formattedArticles = articlesData.map((item: any) => ({
                    id: item.id?.toString() || Math.random().toString(36).substring(2, 9),
                    title: item.title || "Unknown",
                    category: item.type || "general",
                    date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown",
                    language: language,
                    content: item.body || item.content || "",
                    images: item.image ? [`${API_BASE_URL}${item.image}`] : [],
                }))

                setArticleItems(formattedArticles)
                setPageInfo({ dataPage: data.page, dataTotalPages: data.total_pages });
            } catch (error) {
                console.error("Error fetching articles:", error)

                // Provide more specific error message
                let errorMessage = t("errorFetchingArticles")
                if (error instanceof Error) {
                    errorMessage += `: ${error.message}`
                }
                setApiError(errorMessage)

                toast({
                    title: t("error"),
                    description: errorMessage,
                    variant: "destructive",
                })

                // Set empty array to avoid showing loading indefinitely
                setArticleItems([])
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchArticles({ search: searchTitle, selectedCategory: selectedCategory });
    }, [language, pageCount, searchTitle, selectedCategory]);

    const handleEdit = (id: string, type: string) => {
        router.push(`/dashboard/articles/${id}/${type}/edit`);
    }

    const handleDelete = async (id: string, type: string) => {
        try {
            // Use the DELETE endpoint to delete the article 
            console.log(id);

            const apiUrl = `${API_BASE_URL}/${language}/api/content/?type=${type}&id=${id.trim()}`;

            await $api.delete(apiUrl);

            // Remove the deleted article from the state
            setArticleItems((prev) => prev.filter((item) => item.id !== id))

            toast({
                title: t("success"),
                description: t("articleDeletedSuccessfully"),
            })
        } catch (error) {
            console.error("Error deleting article:", error)
            toast({
                title: t("error"),
                description: t("errorDeletingArticle"),
                variant: "destructive",
            })
        }
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{t("articles")}</h1>
                    <Button onClick={() => router.push("/dashboard/articles/add")}>
                        <Plus className="mr-2 h-4 w-4" /> {t("add")}
                    </Button>
                </div>

                {apiError && (
                    <Card className="mb-6 border-red-500">
                        <CardContent className="p-4">
                            <div className="flex items-center text-red-500">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                <p>{apiError}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{t("filters")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t("title")}</label>
                                <Input
                                    placeholder={t("searchByTitle")}
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t("category")}</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("allCategories")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="article">Articles</SelectItem>
                                        <SelectItem value="news">News</SelectItem>
                                        <SelectItem value="ads">Ads</SelectItem>
                                        <SelectItem value="banner">Banner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t("language")}</label>
                                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("allLanguages")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("allLanguages")}</SelectItem>
                                        <SelectItem value="uz_latn">O'zbekcha (Lotin)</SelectItem>
                                        <SelectItem value="uz_cyrl">Ўзбекча (Кирилл)</SelectItem>
                                        <SelectItem value="ru">Русский</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <p>{t("loading")}</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("title")}</TableHead>
                                        <TableHead>{t("category")}</TableHead>
                                        <TableHead>{t("date")}</TableHead>
                                        <TableHead>{t("language")}</TableHead>
                                        <TableHead className="text-right">{t("actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {articleItems.length > 0 ? (
                                        articleItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.title}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>{item.date}</TableCell>
                                                <TableCell>
                                                    {item.language === "uz_latn" && "O'zbekcha (Lotin)"}
                                                    {item.language === "uz_cyrl" && "Ўзбекча (Кирилл)"}
                                                    {item.language === "ru" && "Русский"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item.id, item.category)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.category)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                {t("noArticlesFound")}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                    {
                        pageInfo?.dataPage ? (
                            <Pagenation count={pageInfo.dataTotalPages} activePage={pageInfo.dataPage} />
                        ) : ""
                    }
                </Card>
            </div>
        </DashboardLayout>
    )
}
