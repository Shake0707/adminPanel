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

export default function YouTubeVideosPage({ pageCount }: { pageCount: string | string[] }) {
    const { t, language, setLanguage } = useLanguage()
    const { toast } = useToast()

    const [nameFilter, setNameFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any | null>(null)
    const [editFormData, setEditFormData] = useState({
        title: "",
        video_id: "",
        is_active: true,
    })

    const [videos, setVideos] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();
    const [pageInfo, setPageInfo] = useState<{
        dataPage: number;
        dataTotalPages: number;
    } | null>(null);

    useEffect(() => {
        if (pageInfo) {
            setPageInfo(prev => ({ dataTotalPages: prev!.dataTotalPages, dataPage: 1 }));
            router.push("/dashboard/youtube-videos");
        }
    }, [nameFilter, statusFilter]);

    const fetchVideos = async (pageCount: string | string[], search: {
        nameFilter: string;
        statusFilter: string;
    }) => {
        setIsLoading(true)
        setError(null)

        let searchStr = "";
        if (search.nameFilter && search.statusFilter) {
            searchStr = `&title=${search.nameFilter}&active=${search.statusFilter}`;
        } else if (search.nameFilter) {
            searchStr = `&title=${search.nameFilter}`;
        } else if (search.statusFilter) {
            searchStr = `&active=${search.statusFilter}`;
        }

        try {
            const data = await $api.get(`https://uzfk.uz/uz/api/admin/youtube/?page=${pageCount + searchStr}`);

            const videosData = Array.isArray(data.data) ? data.data : data.data.results || []

            const formattedVideos = videosData.map((video: any) => ({
                id: video.id.toString(),
                title: video.title || "Unknown",
                video_id: video.url || "",
                is_active: video.active !== undefined ? video.active : true,
                created_at: video.created_at || new Date().toISOString(),
            }))

            setVideos(formattedVideos);
            setPageInfo({ dataPage: data.data.page, dataTotalPages: data.data.total_pages });
        } catch (err) {
            console.error("Error fetching YouTube videos:", err)
            setError("Failed to load YouTube videos. Please try again later.")
            setVideos([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchVideos(pageCount, { nameFilter, statusFilter });
    }, [language, pageCount, nameFilter, statusFilter]);

    const handleClearFilters = () => {
        setNameFilter("")
        setStatusFilter("")
    }

    const handleDelete = async (id: string) => {
        try {
            await $api.delete(`https://uzfk.uz/uz/api/admin/youtube/${id}/`);

            setVideos((prev) => prev.filter((video) => video.id !== id))

            toast({
                title: t("success"),
                description: t("videoDeletedSuccessfully"),
            })
        } catch (error) {
            console.error("Error deleting video:", error)
            toast({
                title: t("error"),
                description: t("errorDeletingVideo"),
                variant: "destructive",
            })
        }
    }

    const handleEdit = async (item: any) => {
        setEditingItem(item)
        setEditFormData({
            title: item.title,
            video_id: item.video_id,
            is_active: item.is_active,
        })
        setEditDialogOpen(true)
    }

    const handleSaveEdit = async () => {
        if (!editingItem) return

        try {
            await $api.put(`https://uzfk.uz/uz/api/admin/youtube/${editingItem.id}/`, {
                title: editFormData.title,
                url: editFormData.video_id,
                active: editFormData.is_active
            })

            // Update the videos list after edit
            setVideos((prev) =>
                prev.map((video) =>
                    video.id === editingItem.id
                        ? {
                            ...video,
                            title: editFormData.title,
                            video_id: editFormData.video_id,
                            is_active: editFormData.is_active,
                        }
                        : video,
                ),
            )

            setEditDialogOpen(false)
            toast({
                title: t("success"),
                description: t("videoUpdatedSuccessfully"),
            })
        } catch (error) {
            console.error("Error updating video:", error)
            toast({
                title: t("error"),
                description: t("errorUpdatingVideo"),
                variant: "destructive",
            })
        }
    }

    return (
        <DashboardLayout>
            <div>
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{t("youtubeVideos")}</h2>
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
                        <div>
                            <label htmlFor="title" className="mb-1 block text-sm font-medium">
                                {t("title")}
                            </label>
                            <Input
                                id="title"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                placeholder={t("title")}
                                className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white placeholder:text-gray-400"
                            />
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
                    <h3 className="text-xl font-medium">{t("youtubeVideos")}</h3>
                    <Button className="button-primary" asChild>
                        <Link href="/dashboard/youtube-videos/add">
                            <Plus className="mr-2 h-4 w-4" />
                            {t("add")}
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                    <Table>
                        <TableHeader className="table-header-dark">
                            <TableRow>
                                <TableHead className="dark:text-white">{t("title")}</TableHead>
                                <TableHead className="dark:text-white">{t("videoId")}</TableHead>
                                <TableHead className="dark:text-white">{t("preview")}</TableHead>
                                <TableHead className="dark:text-white">{t("status")}</TableHead>
                                <TableHead className="dark:text-white">{t("created")}</TableHead>
                                <TableHead className="dark:text-white">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                            Loading...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        {t("noVideosFound")}
                                    </TableCell>
                                </TableRow>
                            ) : videos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        {t("noVideosFound")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                videos.map((video) => (
                                    <TableRow key={video.id} className="border-gray-200 dark:border-gray-700">
                                        <TableCell>{video.title}</TableCell>
                                        <TableCell>{video.video_id}</TableCell>
                                        <TableCell>
                                            <div className="relative h-16 w-28 overflow-hidden rounded border bg-gray-100 flex items-center justify-center group">
                                                <img
                                                    src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                                                    alt={video.title}
                                                    className="object-cover w-full h-full"
                                                />
                                                <a
                                                    href={`https://www.youtube.com/watch?v=${video.video_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all"
                                                >
                                                    <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${video.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                            >
                                                {video.is_active ? t("active") : t("inactive")}
                                            </span>
                                        </TableCell>
                                        <TableCell>{new Date(video.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={() => handleEdit(video)}
                                                >
                                                    <Pencil className="h-4 w-4 text-amber-500" />
                                                </Button>
                                                <DeleteDialog itemName={video.title} onDelete={() => handleDelete(video.id)} />
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
                        <DialogTitle>{t("editYouTubeVideo")}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t("title")}</label>
                            <Input
                                value={editFormData.title}
                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                placeholder={t("title")}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            {/* <label className="text-sm font-medium">{t("youtubeVideoId")}</label> */}
                            <label className="text-sm font-medium">Url</label>
                            <Input
                                value={editFormData.video_id}
                                onChange={(e) => setEditFormData({ ...editFormData, video_id: e.target.value })}
                                // placeholder="dQw4w9WgXcQ"
                                required
                            />
                            {/* <p className="text-xs text-gray-500">{t("youtubeVideoIdHelp")}</p> */}
                            <p className="text-xs text-gray-500">Url ni kiriting</p>
                        </div>

                        {editFormData.video_id && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t("preview")}</label>
                                <div className="relative h-32 w-56 overflow-hidden rounded border">
                                    <img
                                        src={`https://img.youtube.com/vi/${editFormData.video_id}/mqdefault.jpg`}
                                        alt="Video preview"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is-active-edit"
                                checked={editFormData.is_active}
                                onCheckedChange={(checked) => setEditFormData({ ...editFormData, is_active: checked })}
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
