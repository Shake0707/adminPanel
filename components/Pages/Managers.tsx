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
import Image from "next/image"
import { AlertCircle, Pencil, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import $api from "@/lib/axios"
import Pagenation from "../pagenation/Pagenation"
import { useRouter } from "next/navigation"

export default function ManagersPage({ pageCount }: { pageCount: string | string[] }) {
    const { language, t } = useLanguage()
    const [nameFilter, setNameFilter] = useState("")
    const [currentLeaders, setCurrentLeaders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUsingMockData, setIsUsingMockData] = useState(false)
    const { toast } = useToast()
    const [selectedLanguage, setSelectedLanguage] = useState(language)
    const [availableLanguages, setAvailableLanguages] = useState(["uz", "ru", "en", "uz-cyrl"]);
    const router = useRouter();
    const [pageInfo, setPageInfo] = useState<{
        dataPage: number;
        dataTotalPages: number;
    } | null>(null);

    useEffect(() => {
        if (pageInfo) {
            setPageInfo(prev => ({ dataTotalPages: prev!.dataTotalPages, dataPage: 1 }));
            router.push("/dashboard/managers");
        }
    }, [nameFilter]);

    const BASE_URL = "https://uzfk.uz"

    const loadLeadership = async (lang: string,
        search: {
            nameFilter: string;
            pageCount: string | string[];
        }
    ) => {
        setIsLoading(true)
        let searchStr = "";
        if (search.nameFilter) {
            searchStr = `&f_name=${search.nameFilter}`;
        }
        try {
            // Make a direct fetch request to the API
            const response = await fetch(`${BASE_URL}/${lang}/api/leadership/?page=${pageCount + searchStr}`, {
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
            console.log(`API Response (Leadership - ${lang}):`, data)

            // Get the results array from the response
            const leadershipData = Array.isArray(data) ? data : data.results || []
            setIsUsingMockData(false)

            // Transform API data to match the expected format with better field mapping
            const formattedLeadership = leadershipData.map((leader: any) => ({
                id: leader.id?.toString() || Math.random().toString(36).substring(2, 9),
                language: leader.language || lang,
                fullName: leader.f_name || leader.full_name || leader.fullName || leader.title || "Leader " + (leader.id || ""),
                position: leader.position_text || leader.position || leader.title || "Position",
                phoneNumber: leader.phone || leader.phone_number || "+998 XX XXX XX XX",
                email: leader.email || "email@example.com",
                bio: leader.biography_text || leader.description || leader.bio || "No biography available",
                photo: leader.image || leader.photo || "/placeholder.svg?height=100&width=100",
            }))

            setCurrentLeaders(formattedLeadership)
            setPageInfo({ dataPage: data.page, dataTotalPages: data.total_pages });
        } catch (error) {
            console.error(`Error loading leadership data for language ${lang}:`, error)
            toast({
                title: t("error"),
                description: t("errorLoadingLeadership"),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadLeadership(selectedLanguage, { nameFilter, pageCount });
    }, [selectedLanguage, toast, t, nameFilter, pageCount])

    const handleDeleteLeader = async (id: string) => {
        try {
            await $api.delete(`${BASE_URL}/${selectedLanguage}/api/leadership/${id}/`);

            // Update the local state after deletion
            setCurrentLeaders((prev) => prev.filter((leader) => leader.id !== id))

            toast({
                title: t("success"),
                description: t("leaderDeleted"),
            })
        } catch (error) {
            console.error("Error deleting leader:", error)
            toast({
                title: t("error"),
                description: t("errorDeletingLeader"),
                variant: "destructive",
            })
        }
    }

    const handleClearFilters = () => {
        setNameFilter("")
    }

    return (
        <DashboardLayout>
            <div>
                <h2 className="mb-6 text-2xl font-bold">{t("managers")}</h2>

                {isUsingMockData && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t("mockDataTitle")}</AlertTitle>
                        <AlertDescription>{t("mockDataDescription")}</AlertDescription>
                    </Alert>
                )}

                <div className="mb-6 rounded-md border filter-section-dark p-4">
                    <h3 className="mb-4 text-lg font-medium">{t("filters")}</h3>
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="mb-1 block text-sm font-medium">
                                {t("fullName")}
                            </label>
                            <Input
                                id="name"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                placeholder={t("fullName")}
                                className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="language" className="mb-1 block text-sm font-medium">
                                {t("language")}
                            </label>
                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                <SelectTrigger className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white placeholder:text-gray-400">
                                    <SelectValue placeholder={t("selectLanguage")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableLanguages.map((lang) => (
                                        <SelectItem key={lang} value={lang}>
                                            {lang.toUpperCase()}
                                        </SelectItem>
                                    ))}
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
                    <h3 className="text-xl font-medium">{t("managers")}</h3>
                    <Button className="button-primary" asChild>
                        <Link href="/dashboard/managers/add">
                            <Plus className="mr-2 h-4 w-4" />
                            {t("add")}
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                    <Table>
                        <TableHeader className="table-header-dark">
                            <TableRow>
                                <TableHead className="dark:text-white">{t("language")}</TableHead>
                                <TableHead className="dark:text-white">{t("image")}</TableHead>
                                <TableHead className="dark:text-white">{t("fullName")}</TableHead>
                                <TableHead className="dark:text-white">{t("position")}</TableHead>
                                <TableHead className="dark:text-white">{t("phoneNumber")}</TableHead>
                                <TableHead className="dark:text-white">{t("email")}</TableHead>
                                <TableHead className="dark:text-white">{t("bio")}</TableHead>
                                <TableHead className="dark:text-white">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                            <span className="ml-2">{t("loading")}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : currentLeaders.length > 0 ? (
                                currentLeaders
                                    // .slice(0, Number.parseInt(rowsPerPage))
                                    .map((leader) => (
                                        <TableRow key={leader.id} className="border-gray-200 dark:border-gray-700">
                                            <TableCell className="uppercase">{leader.language}</TableCell>
                                            <TableCell>
                                                <Image
                                                    src={leader.photo || "/placeholder.svg?height=100&width=100"}
                                                    alt={leader.fullName}
                                                    width={60}
                                                    height={60}
                                                    className="rounded-full border"
                                                />
                                            </TableCell>
                                            <TableCell>{leader.fullName}</TableCell>
                                            <TableCell>{leader.position}</TableCell>
                                            <TableCell className="whitespace-nowrap">{leader.phoneNumber}</TableCell>
                                            <TableCell>{leader.email}</TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                <div className="tooltip" title={leader.bio}>
                                                    {leader.bio}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <Link href={`/dashboard/managers/${leader.id}/edit`}>
                                                            <Pencil className="h-4 w-4 text-amber-500" />
                                                        </Link>
                                                    </Button>
                                                    <DeleteDialog itemName={leader.fullName} onDelete={() => handleDeleteLeader(leader.id)} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        {t("noManagersFound")}
                                    </TableCell>
                                </TableRow>
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
        </DashboardLayout>
    )
}
