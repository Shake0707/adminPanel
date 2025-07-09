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
import { Pencil, Plus } from "lucide-react"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import $api from "@/lib/axios"
import { useRouter } from "next/navigation"
import Pagenation from "../pagenation/Pagenation"

export default function RegionalCouncilsPage({ pageCount }: { pageCount: string | string[] }) {
    const { language, t } = useLanguage()
    const { regionalCouncils, deleteRegionalCouncil } = useStore()
    const [nameFilter, setNameFilter] = useState("")
    const [regionFilter, setRegionFilter] = useState("")
    const [currentCouncils, setCurrentCouncils] = useState(regionalCouncils[language] || [])
    const { toast } = useToast()
    const router = useRouter();
    const [pageInfo, setPageInfo] = useState<{
        dataPage: number;
        dataTotalPages: number;
    } | null>(null);

    useEffect(() => {
        if (pageInfo) {
            setPageInfo(prev => ({ dataTotalPages: prev!.dataTotalPages, dataPage: 1 }));
            router.push("/dashboard/regional-councils");
        }
    }, [nameFilter, regionFilter]);

    const loadCouncils = async (pageCount: string | string[], search: {
        nameFilter: string;
        regionFilter: string;
    }) => {
        let searchStr = "";
        if (search.nameFilter && search.regionFilter) {
            searchStr = `&name=${search.nameFilter}&region=${search.regionFilter}`;
        } else if (search.nameFilter) {
            searchStr = `&name=${search.nameFilter}`;
        } else if (search.regionFilter) {
            searchStr = `&region=${search.regionFilter}`;
        }

        try {
            const data = await $api.get(`https://uzfk.uz/uz/api/local-council/?page=${pageCount + searchStr}`);

            const councilsData = Array.isArray(data.data) ? data.data : data.data.results || []

            const formattedCouncils = councilsData.map((council: any) => ({
                id: council.id?.toString() || Math.random().toString(36).substring(2, 9),
                language: council.language || language,
                name: council.name || "Unknown",
                region: council.region || "Unknown",
                head: council.title || "Unknown",
                phoneNumber: council.phone || "Unknown",
                email: council.email || "Unknown",
                address: council.address || "Unknown",
            }))

            setCurrentCouncils(formattedCouncils);
            setPageInfo({ dataPage: data.data.page, dataTotalPages: data.data.total_pages });
        } catch (error) {
            console.error("Error loading councils data:", error)
            toast({
                title: t("error"),
                description: t("errorLoadingCouncils"),
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        loadCouncils(pageCount, { nameFilter, regionFilter });
    }, [language, toast, t, pageCount, nameFilter, regionFilter]);

    const handleDeleteCouncil = async (id: string) => {
        try {
            await $api.delete(`https://uzfk.uz/uz/api/local-council/${id}/`);

            // Update the councils list after deletion
            setCurrentCouncils((prev) => prev.filter((council) => council.id !== id))

            toast({
                title: t("success"),
                description: t("councilDeletedSuccessfully"),
            })
        } catch (error) {
            console.error("Error deleting council:", error)
            toast({
                title: t("error"),
                description: t("errorDeletingCouncil"),
                variant: "destructive",
            })
        }
    }

    const handleClearFilters = () => {
        setNameFilter("")
        setRegionFilter("")
    }

    return (
        <DashboardLayout>
            <div>
                <h2 className="mb-6 text-2xl font-bold">{t("regionalCouncils")}</h2>
                <div className="mb-6 rounded-md border filter-section-dark p-4">
                    <h3 className="mb-4 text-lg font-medium">{t("filters")}</h3>
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="mb-1 block text-sm font-medium">
                                {t("name")}
                            </label>
                            <Input
                                id="name"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                placeholder={t("name")}
                                className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="region" className="mb-1 block text-sm font-medium">
                                {t("region")}
                            </label>
                            <Input
                                id="region"
                                value={regionFilter}
                                onChange={(e) => setRegionFilter(e.target.value)}
                                placeholder={t("region")}
                                className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white placeholder:text-gray-400"
                            />
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
                    <h3 className="text-xl font-medium">{t("regionalCouncils")}</h3>
                    <Button className="button-primary" asChild>
                        <Link href="/dashboard/regional-councils/add">
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
                                <TableHead className="dark:text-white">{t("name")}</TableHead>
                                <TableHead className="dark:text-white">{t("region")}</TableHead>
                                <TableHead className="dark:text-white">{t("head")}</TableHead>
                                <TableHead className="dark:text-white">{t("phoneNumber")}</TableHead>
                                <TableHead className="dark:text-white">{t("email")}</TableHead>
                                <TableHead className="dark:text-white">{t("address")}</TableHead>
                                <TableHead className="dark:text-white">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentCouncils.map((council) => (
                                <TableRow key={council.id} className="border-gray-200 dark:border-gray-700">
                                    <TableCell className="uppercase">{council.language}</TableCell>
                                    <TableCell>{council.name}</TableCell>
                                    <TableCell>{council.region}</TableCell>
                                    <TableCell>{council.head}</TableCell>
                                    <TableCell>{council.phoneNumber}</TableCell>
                                    <TableCell>{council.email}</TableCell>
                                    <TableCell>{council.address}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <Link href={`/dashboard/regional-councils/${council.id}/edit`}>
                                                    <Pencil className="h-4 w-4 text-amber-500" />
                                                </Link>
                                            </Button>
                                            <DeleteDialog itemName={council.name} onDelete={() => handleDeleteCouncil(council.id)} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {currentCouncils.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No regional councils found.
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
