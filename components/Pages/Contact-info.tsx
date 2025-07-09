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
import { Pencil, Plus, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiService } from "@/lib/api-service"
import { useRouter } from "next/navigation"
import $api from "@/lib/axios"
import Pagenation from "../pagenation/Pagenation"

// Define the ContactInfo type
type ContactInfo = {
    id: string
    language: "en" | "ru" | "uz" | "uz-cyrl"
    type: "reception" | "trustPhone" | "email" | "address"
    value: string
    description?: string
    createdAt: string
}

export default function ContactInfoPage({ pageCount }: { pageCount: string | string[] }) {
    const { language, t, setLanguage } = useLanguage()
    const { toast } = useToast()

    const [contactInfoByLanguage, setContactInfoByLanguage] = useState<Record<string, ContactInfo[]>>({})
    const [typeFilter, setTypeFilter] = useState("")
    const [valueFilter, setValueFilter] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const [pageInfo, setPageInfo] = useState<{
        dataPage: number;
        dataTotalPages: number;
    } | null>(null);

    useEffect(() => {
        if (pageInfo) {
            setPageInfo(prev => ({ dataTotalPages: prev!.dataTotalPages, dataPage: 1 }));
            router.push("/dashboard/contact-info");
        }
    }, [typeFilter, valueFilter]);

    const currentContactInfo = contactInfoByLanguage[language] || []


    const handleClearFilters = () => {
        setTypeFilter("")
        setValueFilter("")
    }

    const handleDelete = async (id: string) => {
        try {
            await apiService.contact.delete(id, language)

            setContactInfoByLanguage((prev) => {
                const newState = { ...prev }
                newState[language] = newState[language].filter((item) => item.id !== id)
                return newState
            })

            toast({
                title: "Success",
                description: "Contact information deleted successfully",
            })
        } catch (error) {
            console.error("Error deleting contact info:", error)
            toast({
                title: "Error",
                description: "Failed to delete contact information",
                variant: "destructive",
            })
        }
    }

    // Helper function to format date
    const formatDate = (dateString: string): string => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}.${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date
                .getMinutes()
                .toString()
                .padStart(2, "0")}`
    }

    const fetchContactInfo = async (pageCount: string | string[], search: {
        valueFilter: string;
        typeFilter: string;
    }) => {
        setIsLoading(true)
        setError(null)

        let searchStr = "";
        if (search.valueFilter && search.typeFilter) {
            searchStr = `&value=${search.valueFilter}&contact_type=${search.typeFilter}`;
        } else if (search.valueFilter) {
            searchStr = `&value=${search.valueFilter}`;
        } else if (search.typeFilter) {
            searchStr = `&contact_type=${search.typeFilter}`;
        }

        try {
            const data = await $api.get(`https://uzfk.uz/uz/api/contact/?page=${pageCount + searchStr}`);

            const contactData = Array.isArray(data.data) ? data.data : data.data.results || [];

            const formattedContactInfo = contactData.map((item: any) => ({
                id: item.id?.toString() || Math.random().toString(36).substring(2, 9),
                language: item.language || language,
                type: item.contact_type || "",
                value: item.value || item.contact_info || "",
                description: item.info || "",
                createdAt: item.created_at ? formatDate(item.created_at) : new Date().toLocaleString(),
            }))

            setContactInfoByLanguage((prev) => ({
                ...prev,
                [language]: formattedContactInfo,
            }));
            setPageInfo({ dataPage: data.data.page, dataTotalPages: data.data.total_pages });
        } catch (error) {
            console.error("Error fetching contact info:", error);
            setError("Failed to load contact information. Please try again later.");

            toast({
                title: t("error"),
                description: t("errorFetchingContactInfo"),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchContactInfo(pageCount, { typeFilter, valueFilter });
    }, [language, toast, t, pageCount, valueFilter, typeFilter]);

    return (
        <DashboardLayout>
            <div>
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{t("contactInfo")}</h2>
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
                            <label htmlFor="type" className="mb-1 block text-sm font-medium">
                                {t("type")}
                            </label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white">
                                    <SelectValue placeholder={t("selectType")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reception">{t("reception")}</SelectItem>
                                    <SelectItem value="hotline">{t("hotline")}</SelectItem>
                                    <SelectItem value="email">{t("email")}</SelectItem>
                                    <SelectItem value="address">{t("address")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="value" className="mb-1 block text-sm font-medium">
                                {t("value")}
                            </label>
                            <Input
                                id="value"
                                value={valueFilter}
                                onChange={(e) => setValueFilter(e.target.value)}
                                placeholder={t("value")}
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
                    <h3 className="text-xl font-medium">{t("contactInfo")}</h3>
                    <Button className="button-primary" asChild>
                        <Link href="/dashboard/contact-info/add">
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
                                <TableHead className="dark:text-white">{t("type")}</TableHead>
                                <TableHead className="dark:text-white">{t("value")}</TableHead>
                                <TableHead className="dark:text-white">{t("description")}</TableHead>
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
                            ) : (
                                currentContactInfo.map((info) => (
                                    <TableRow key={info.id} className="border-gray-200 dark:border-gray-700">
                                        <TableCell className="uppercase">{info.language}</TableCell>
                                        <TableCell>{info.type}</TableCell>
                                        <TableCell>{info.value}</TableCell>
                                        <TableCell>{info.description}</TableCell>
                                        <TableCell>{info.createdAt}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <Link href={`/dashboard/contact-info/${info.id}/edit`}>
                                                        <Pencil className="h-4 w-4 text-amber-500" />
                                                    </Link>
                                                </Button>
                                                <DeleteDialog itemName={info.value} onDelete={() => handleDelete(info.id)} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {currentContactInfo.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No contact information found.
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
                {

                }
            </div>
        </DashboardLayout>
    )
}
