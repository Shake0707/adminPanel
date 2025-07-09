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

export default function SubordinateOrganizationsPage({ pageCount }: { pageCount: string | string[] }) {
    const { language, t } = useLanguage()
    const { subordinateOrganizations, deleteSubordinateOrganization } = useStore()
    const [nameFilter, setNameFilter] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [currentOrganizations, setCurrentOrganizations] = useState(subordinateOrganizations[language] || [])
    const { toast } = useToast()
    const router = useRouter();
    const [pageInfo, setPageInfo] = useState<{
        dataPage: number;
        dataTotalPages: number;
    } | null>(null);

    useEffect(() => {
        if (pageInfo) {
            setPageInfo(prev => ({ dataTotalPages: prev!.dataTotalPages, dataPage: 1 }));
            router.push("/dashboard/subordinate-organizations");
        }
    }, [nameFilter, typeFilter]);

    // Update the loadOrganizations function
    const loadOrganizations = async (pageCount: string | string[], search: { nameFilter: string; typeFilter: string; }) => {
        try {
            let searchStr = '';
            if (search.nameFilter && search.typeFilter) {
                searchStr = `&name=${search.nameFilter}&type=${search.typeFilter}`;
            } else if (search.nameFilter) {
                searchStr = `&name=${search.nameFilter}`;
            } else if (search.typeFilter) {
                searchStr = `&type=${search.typeFilter}`;
            }

            // Use the API service to fetch organizations
            const data = await $api.get(`https://uzfk.uz/uz/api/organization/?page=${pageCount + searchStr}`);

            const organizationsData = Array.isArray(data.data) ? data.data : data.data.results || [];

            // Transform API data to match the expected format
            const formattedOrganizations = organizationsData.map((org: any) => ({
                id: org.id?.toString() || Math.random().toString(36).substring(2, 9),
                language: org.language || language,
                name: org.name || "Unknown",
                type: org.type || "organization",
                head: org.title || "Unknown",
                phoneNumber: org.phone || "Unknown",
                email: org.email || "Unknown",
                address: org.address || "Unknown",
            }))

            setCurrentOrganizations(formattedOrganizations);
            setPageInfo({ dataPage: data.data.page, dataTotalPages: data.data.total_pages });
        } catch (error) {
            console.error("Error loading organizations data:", error)
            toast({
                title: t("error"),
                description: t("errorLoadingOrganizations"),
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        loadOrganizations(pageCount, { nameFilter, typeFilter });
    }, [language, toast, t, nameFilter, typeFilter, pageCount]);

    const handleClearFilters = () => {
        setNameFilter("");
        setTypeFilter("");
    }

    const handleDeleteOrganization = async (id: string) => {
        try {
            await $api.delete(`https://uzfk.uz/uz/api/organization/${id}/`);

            // Update the organizations list after deletion
            setCurrentOrganizations((prev) => prev.filter((org) => org.id !== id))

            toast({
                title: t("success"),
                description: t("organizationDeletedSuccessfully"),
            })
        } catch (error) {
            console.error("Error deleting organization:", error)
            toast({
                title: t("error"),
                description: t("errorDeletingOrganization"),
                variant: "destructive",
            })
        }
    }

    return (
        <DashboardLayout>
            <div>
                <h2 className="mb-6 text-2xl font-bold">{t("subordinateOrganizations")}</h2>

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
                            <label htmlFor="type" className="mb-1 block text-sm font-medium">
                                {t("type")}
                            </label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white">
                                    <SelectValue placeholder={t("selectType")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="organization">{t("organization")}</SelectItem>
                                    <SelectItem value="institution">{t("institution")}</SelectItem>
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
                    <h3 className="text-xl font-medium">{t("subordinateOrganizations")}</h3>
                    <Button className="button-primary" asChild>
                        <Link href="/dashboard/subordinate-organizations/add">
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
                                <TableHead className="dark:text-white">{t("type")}</TableHead>
                                <TableHead className="dark:text-white">{t("head")}</TableHead>
                                <TableHead className="dark:text-white">{t("phoneNumber")}</TableHead>
                                <TableHead className="dark:text-white">{t("email")}</TableHead>
                                <TableHead className="dark:text-white">{t("address")}</TableHead>
                                <TableHead className="dark:text-white">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentOrganizations.map((org) => (
                                <TableRow key={org.id} className="border-gray-200 dark:border-gray-700">
                                    <TableCell className="uppercase">{org.language}</TableCell>
                                    <TableCell>{org.name}</TableCell>
                                    <TableCell>{t(org.type)}</TableCell>
                                    <TableCell>{org.head}</TableCell>
                                    <TableCell>{org.phoneNumber}</TableCell>
                                    <TableCell>{org.email}</TableCell>
                                    <TableCell>{org.address}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <Link href={`/dashboard/subordinate-organizations/${org.id}/${org.type}/edit`}>
                                                    <Pencil className="h-4 w-4 text-amber-500" />
                                                </Link>
                                            </Button>
                                            <DeleteDialog itemName={org.name} onDelete={() => handleDeleteOrganization(org.id)} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {currentOrganizations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No subordinate organizations found.
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
