"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteDialog } from "@/components/delete-dialog"
import Link from "next/link"
import { Pencil, Plus, ExternalLink, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiService } from "@/lib/api-service"
import $api from "@/lib/axios"
import { useRouter } from "next/navigation"
import Pagenation from "../pagenation/Pagenation"

// Define the SocialMedia type
type SocialMedia = {
    id: string
    platform: string
    url: string
    icon: string
    isActive: boolean
    createdAt: string
}

export default function SocialMediaPage({ pageCount }: { pageCount: string | string[] }) {
    const { t, language, setLanguage } = useLanguage()
    const { toast } = useToast()

    const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([])
    const [platformFilter, setPlatformFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<SocialMedia | null>(null)
    const [editFormData, setEditFormData] = useState({
        platform: "youtube",
        url: "",
        isActive: true,
    });
    const router = useRouter();
    const [pageInfo, setPageInfo] = useState<{
        dataPage: number;
        dataTotalPages: number;
    } | null>(null);

    useEffect(() => {
        if (pageInfo) {
            setPageInfo(prev => ({ dataTotalPages: prev!.dataTotalPages, dataPage: 1 }));
            router.push("/dashboard/social-media");
        }
    }, [platformFilter, statusFilter]);

    // Load data
    const loadData = async (pageCount: string | string[], search: {
        platformFilter: string;
        statusFilter: string;
    }) => {
        setIsLoading(true)
        setError(null);

        let searchStr = "";
        if (search.platformFilter && search.statusFilter) {
            searchStr = `&network=${search.platformFilter}&active=${search.statusFilter}`;
        } else if (search.platformFilter) {
            searchStr = `&network=${search.platformFilter}`;
        } else if (search.statusFilter) {
            searchStr = `&active=${search.statusFilter}`;
        }

        try {
            const data = await $api.get(`https://uzfk.uz/uz/api/social-networks/?page=${pageCount + searchStr}`);

            const socialMediaData = Array.isArray(data.data) ? data.data : data.data.results || []

            // Transform API data to match the expected format
            const formattedSocialMedia = socialMediaData.map((item: any) => ({
                id: item.id?.toString() || Math.random().toString(36).substring(2, 9),
                platform: item.network || "Unknown",
                url: item.url || "#",
                icon: item.icon || item.name?.toLowerCase() || "",
                isActive: item.active !== undefined ? item.active : true,
                createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown",
            }))

            setSocialMedia(formattedSocialMedia);
            setPageInfo({ dataPage: data.data.page, dataTotalPages: data.data.total_pages });
        } catch (error) {
            console.error("Error loading social media data:", error)
            setError("Failed to load social media data. Please try again later.")

            toast({
                title: t("error"),
                description: t("errorLoadingSocialMedia"),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData(pageCount, { platformFilter, statusFilter });
    }, [language, toast, t, pageCount, platformFilter, statusFilter]);

    const handleClearFilters = () => {
        setPlatformFilter("")
        setStatusFilter("")
    }

    const handleDelete = async (id: string) => {
        try {
            await $api.delete(`https://uzfk.uz/uz/api/social-networks/${id}/`);

            setSocialMedia((prev) => prev.filter((item) => item.id !== id))

            toast({
                title: "Success",
                description: "Social media deleted successfully",
            })
        } catch (error) {
            console.error("Error deleting social media:", error)
            toast({
                title: "Error",
                description: "Failed to delete social media",
                variant: "destructive",
            })
        }
    }

    const handleEdit = async (item: SocialMedia) => {
        setEditingItem(item)
        setEditFormData({
            platform: item.platform,
            url: item.url,
            isActive: item.isActive,
        })
        setEditDialogOpen(true)
    }

    const handleSaveEdit = async () => {
        if (!editingItem) return

        try {
            await $api.put(`https://uzfk.uz/uz/api/social-networks/${editingItem.id}/`, {
                network: editFormData.platform.toLowerCase(),
                url: editFormData.url,
                active: editFormData.isActive,
            })

            // Update the UI after successful update
            const updatedItem = {
                ...editingItem,
                platform: editFormData.platform,
                url: editFormData.url,
                isActive: editFormData.isActive,
            }

            setSocialMedia((prev) => prev.map((item) => (item.id === editingItem.id ? updatedItem : item)))

            setEditDialogOpen(false)
            toast({
                title: "Success",
                description: "Social media updated successfully",
            })
        } catch (error) {
            console.error("Error updating social media:", error)
            toast({
                title: "Error",
                description: "Failed to update social media",
                variant: "destructive",
            })
        }
    }

    return (
        <DashboardLayout>
            <div>
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{t("socialMedia")}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{t("language")}:</span>
                            <Select value={language} onValueChange={(value: "uz-cyrl" | "ru" | "uz") => setLanguage(value)}>
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

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="mb-6 rounded-md border filter-section-dark p-4">
                    <h3 className="mb-4 text-lg font-medium">{t("filters")}</h3>
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* <div>
                            <label htmlFor="platform" className="mb-1 block text-sm font-medium">
                                {t("platform")}
                            </label>
                            <Input
                                id="platform"
                                value={platformFilter}
                                onChange={(e) => setPlatformFilter(e.target.value)}
                                placeholder={t("platform")}
                                className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white placeholder:text-gray-400"
                            />
                        </div> */}
                        <div>
                            <label htmlFor="platform" className="mb-1 block text-sm font-medium">
                                {t("platform")}
                            </label>
                            <Select value={platformFilter} onValueChange={setPlatformFilter}>
                                <SelectTrigger className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white">
                                    <SelectValue placeholder={t("platform")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="twitter">Twitter</SelectItem>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="youTube">YouTube</SelectItem>
                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    <SelectItem value="tikTok">TikTok</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="status" className="mb-1 block text-sm font-medium">
                                {t("status")}
                            </label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white">
                                    <SelectValue placeholder={t("selectStatus")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">{t("active")}</SelectItem>
                                    <SelectItem value="false">{t("inactive")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleClearFilters}
                            variant="outline"
                        >
                            {t("clear")}
                        </Button>
                    </div>
                </div>

                <div className="mb-4 flex justify-between">
                    <h3 className="text-xl font-medium">{t("socialMedia")}</h3>
                    <Button className="button-primary" asChild>
                        <Link href="/dashboard/social-media/add">
                            <Plus className="mr-2 h-4 w-4" />
                            {t("add")}
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                    <Table>
                        <TableHeader className="table-header-dark">
                            <TableRow>
                                <TableHead className="dark:text-white">{t("platform")}</TableHead>
                                <TableHead className="dark:text-white">{t("url")}</TableHead>
                                <TableHead className="dark:text-white">{t("status")}</TableHead>
                                <TableHead className="dark:text-white">{t("created")}</TableHead>
                                <TableHead className="dark:text-white">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                            Loading...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : socialMedia.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No social media found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                socialMedia.map((item) => (
                                    <TableRow key={item.id} className="border-gray-200 dark:border-gray-700">
                                        <TableCell>{item.platform}</TableCell>
                                        <TableCell>
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-blue-600 hover:underline"
                                            >
                                                {item.url}
                                                <ExternalLink className="ml-1 h-3 w-3" />
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                            >
                                                {item.isActive ? t("active") : t("inactive")}
                                            </span>
                                        </TableCell>
                                        <TableCell>{item.createdAt}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Pencil className="h-4 w-4 text-amber-500" />
                                                </Button>
                                                <DeleteDialog itemName={item.platform} onDelete={() => handleDelete(item.id)} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {
                        pageInfo?.dataPage ? (
                            <Pagenation count={pageInfo.dataTotalPages} />
                        ) : ""
                    }
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t("editSocialMedia")}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t("platform")}</label>
                            <Select
                                value={editFormData.platform}
                                onValueChange={(value) => setEditFormData({ ...editFormData, platform: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("selectPlatform")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="twitter">Twitter</SelectItem>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="youTube">YouTube</SelectItem>
                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    <SelectItem value="tikTok">TikTok</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t("url")}</label>
                            <Input
                                value={editFormData.url}
                                onChange={(e) => setEditFormData({ ...editFormData, url: e.target.value })}
                                placeholder="https://example.com"
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is-active-edit"
                                checked={editFormData.isActive}
                                onCheckedChange={(checked) => setEditFormData({ ...editFormData, isActive: checked })}
                            />
                            <label htmlFor="is-active-edit" className="text-sm font-medium">
                                {t("active")}
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleSaveEdit} className="button-primary">
                            {t("save")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
