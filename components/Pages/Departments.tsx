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
import { apiService } from "@/lib/api-service"
import $api from "@/lib/axios"
import { useRouter } from "next/navigation"
import Pagenation from "../pagenation/Pagenation"
// Replace environment variable with hardcoded URL
const BASE_URL = "https://uzfk.uz"

export default function DepartmentsPage({ pageCount }: { pageCount: string | string[] }) {
    const { language, t } = useLanguage()
    const { departments, deleteDepartment } = useStore()
    const [nameFilter, setNameFilter] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [currentDepartments, setCurrentDepartments] = useState(departments[language] || [])
    const { toast } = useToast()
    const router = useRouter();
    const [pageInfo, setPageInfo] = useState<{
        dataPage: number;
        dataTotalPages: number;
    } | null>(null);

    useEffect(() => {
        if (pageInfo) {
            setPageInfo(prev => ({ dataTotalPages: prev!.dataTotalPages, dataPage: 1 }));
            router.push("/dashboard/departments")
        }
    }, [nameFilter, typeFilter]);

    // Update the loadDepartments function to properly fetch data from the API
    const loadDepartments = async (search: { nameFilter: string; typeFilter: string; }, pageCount: string | string[]) => {
        try {
            // Use the API service to fetch departments
            let searchStr = "";
            if (search.nameFilter && search.typeFilter) {
                searchStr = `&name=${search.nameFilter}&type=${search.typeFilter}`;
            } else if (search.nameFilter) {
                searchStr = `&name=${search.nameFilter}`;
            } else if (search.typeFilter) {
                searchStr = `&type=${search.typeFilter}`;
            }
            const data = await $api.get(`https://uzfk.uz/uz/api/sector-and-department/?page=${pageCount + searchStr}`);

            const departmentsData = Array.isArray(data.data) ? data.data : data.data.results || []

            // Transform API data to match the expected format
            const formattedDepartments = departmentsData.map((dept: any) => ({
                id: dept.id?.toString() || Math.random().toString(36).substring(2, 9),
                // language: dept.language || language,
                name: dept.name || "Unknown",
                type: dept.type || "department",
                head: dept.title || "Unknown",
                phoneNumber: dept.phone || "Unknown",
                email: dept.email || "Unknown",
            }));

            setCurrentDepartments(formattedDepartments);
            setPageInfo({ dataPage: data.data.page, dataTotalPages: data.data.total_pages });
        } catch (error) {
            console.error("Error loading departments data:", error)
            toast({
                title: t("error"),
                description: t("errorLoadingDepartments"),
                variant: "destructive",
            })
        }
    }

    const handleDeleteDepartment = async (id: string) => {
        try {
            await $api.delete(`https://uzfk.uz/uz/api/sector-and-department/${id}/`);

            // Update the UI immediately by removing the deleted department
            setCurrentDepartments((prev) => prev.filter((dept) => dept.id !== id))

            toast({
                title: t("success"),
                description: t("departmentDeletedSuccessfully"),
            })
        } catch (error) {
            console.error("Error deleting department:", error)
            toast({
                title: t("error"),
                description: t("errorDeletingDepartment"),
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        loadDepartments({ nameFilter, typeFilter }, pageCount);
    }, [language, toast, t, nameFilter, typeFilter, pageCount]);

    const handleApplyFilters = () => {
        // Already filtered by the filteredDepartments variable
    }

    const handleClearFilters = () => {
        setNameFilter("")
        setTypeFilter("")
    }

    return (
        <DashboardLayout>
            <div>
                <h2 className="mb-6 text-2xl font-bold">{t("departmentsAndSectors")}</h2>

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
                                <SelectTrigger className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white placeholder:text-gray-400">
                                    <SelectValue placeholder={t("selectType")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="department">{t("department")}</SelectItem>
                                    <SelectItem value="sector">{t("sector")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleApplyFilters} variant="secondary">
                            {t("apply")}
                        </Button>
                        <Button
                            onClick={handleClearFilters}
                            variant="outline"
                        // className="border-[#374151] text-white hover:bg-[#3f4b5b]"
                        >
                            {t("clear")}
                        </Button>
                    </div>
                </div>

                <div className="mb-4 flex justify-between">
                    <h3 className="text-xl font-medium">{t("departmentsAndSectors")}</h3>
                    <Button className="button-primary" asChild>
                        <Link href="/dashboard/departments/add">
                            <Plus className="mr-2 h-4 w-4" />
                            {t("add")}
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                    <Table>
                        <TableHeader className="table-header-dark">
                            <TableRow>
                                <TableHead className="dark:text-white">{t("name")}</TableHead>
                                <TableHead className="dark:text-white">{t("type")}</TableHead>
                                <TableHead className="dark:text-white">{t("head")}</TableHead>
                                <TableHead className="dark:text-white">{t("phoneNumber")}</TableHead>
                                <TableHead className="dark:text-white">{t("email")}</TableHead>
                                <TableHead className="dark:text-white">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentDepartments.map((department) => (
                                <TableRow key={department.id} className="border-gray-200 dark:border-gray-700">
                                    {/* <TableCell className="uppercase">{department.language}</TableCell> */}
                                    <TableCell>{department.name}</TableCell>
                                    <TableCell>{t(department.type)}</TableCell>
                                    <TableCell>{department.head}</TableCell>
                                    <TableCell>{department.phoneNumber}</TableCell>
                                    <TableCell>{department.email}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <Link href={`/dashboard/departments/${department.id}/edit`}>
                                                    <Pencil className="h-4 w-4 text-amber-500" />
                                                </Link>
                                            </Button>
                                            <DeleteDialog itemName={department.name} onDelete={() => handleDeleteDepartment(department.id)} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {currentDepartments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No departments or sectors found.
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
