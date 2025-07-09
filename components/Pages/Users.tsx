"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteDialog } from "@/components/delete-dialog"
import { Pencil, Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"
import { apiService } from "@/lib/api-service"
import $api from "@/lib/axios"

export default function UsersPage() {
    const { t, language } = useLanguage()
    const { toast } = useToast()
    const [loginFilter, setLoginFilter] = useState("")
    const [idFilter, setIdFilter] = useState("")
    const [rowsPerPage, setRowsPerPage] = useState("10")
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedLanguage, setSelectedLanguage] = useState(language as string)
    const [availableLanguages, setAvailableLanguages] = useState(["uz", "ru", "en", "uz-cyrl"])
    // const store = useStore()

    // Ensure HTTPS is used for all API requests
    // const BASE_URL = "https://uzfk.uz"

    // Update the fetchUsers function to properly handle API responses and refresh data
    const fetchUsers = async (lang: string, search: {
        username: string | null;
        id: string | null;
    }) => {
        setIsLoading(true)
        setError(null)

        try {
            // Make a direct fetch request to the API
            const apiLanguage = lang === "ru" ? "uz" : lang;
            let searchStr = "";
            if (search.username && search.id) {
                searchStr = `?id=${search.id}&username=${search.username}`;
            } else if (search.id) {
                searchStr = `?id=${search.id}`;
            } else if (search.username) {
                searchStr = `?username=${search.username}`;
            }

            const response = await fetch(`https://uzfk.uz/${apiLanguage}/api/users/${searchStr}`);

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`)
            }

            const data = await response.json()
            console.log("API Response:", data)

            // Handle different response formats
            const userData = Array.isArray(data) ? data : data.results || []

            // Format the user data consistently
            const formattedUsers = userData.map((user: any) => ({
                id: user.id?.toString() || Math.random().toString(36).substring(2, 9),
                login: user.username || user.login || "",
                username: user.username || user.login || "",
                email: user.email || "",
                createdAt: user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "",
                role: user.role || user.groups?.[0]?.name || "User",
                isActive: user.is_active !== undefined ? user.is_active : true,
            }))

            // Update the local state
            setUsers(formattedUsers)
        } catch (error) {
            console.error(`Error fetching users for language ${lang}:`, error)
            setError("Failed to load users. Using mock data instead.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers(language, { username: loginFilter, id: idFilter });
    }, [selectedLanguage, toast, t, loginFilter, idFilter]);

    // Update the handleDeleteUser function to properly delete users and update UI immediately
    const handleDeleteUser = async (id: string) => {
        try {
            await $api.delete("https://uzfk.uz/uz/api/users/" + id);

            // Update the UI immediately by removing the deleted user
            setUsers(users.filter((user) => user.id !== id))

            toast({
                title: t("success"),
                description: t("userDeletedSuccessfully"),
            })
        } catch (error) {
            console.error("Error deleting user:", error)
            toast({
                title: t("error"),
                description: t("errorDeletingUser"),
                variant: "destructive",
            })
        }
    }

    const handleRefreshUsers = () => {
        fetchUsers(language, { username: loginFilter, id: idFilter });
    }

    const handleApplyFilters = () => {
        // Already filtered by the filteredUsers variable
    }

    const handleClearFilters = () => {
        setLoginFilter("")
        setIdFilter("")
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                <h2 className="mb-6 text-2xl font-bold">{t("users")}</h2>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="mb-6 rounded-md border filter-section-dark p-4">
                    <h3 className="mb-4 text-lg font-medium">{t("filters")}</h3>
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label htmlFor="login" className="mb-1 block text-sm font-medium">
                                {t("login")}
                            </label>
                            <Input
                                id="login"
                                value={loginFilter}
                                onChange={(e) => setLoginFilter(e.target.value)}
                                placeholder={t("login")}
                                className="dark:bg-[#3f4b5b] border-[#374151] dark:text-white placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="id" className="mb-1 block text-sm font-medium">
                                {t("id")}
                            </label>
                            <Input
                                id="id"
                                value={idFilter}
                                onChange={(e) => setIdFilter(e.target.value)}
                                placeholder="ID"
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
                    <h3 className="text-xl font-medium">{t("users")}</h3>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleRefreshUsers}
                            variant="outline"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t("refresh")}
                        </Button>
                        <Button className="button-primary" asChild>
                            <Link href="/dashboard/users/add">
                                <Plus className="mr-2 h-4 w-4" />
                                {t("add")}
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                    {isLoading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">{t("loading")}</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center">
                            <p>{t("noUsersFound")}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="table-header-dark">
                                <TableRow>
                                    <TableHead className="dark:text-white">{t("login")}</TableHead>
                                    <TableHead className="dark:text-white">{t("role")}</TableHead>
                                    <TableHead className="dark:text-white">{t("status")}</TableHead>
                                    <TableHead className="dark:text-white">{t("created")}</TableHead>
                                    <TableHead className="dark:text-white">{t("actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.slice(0, Number.parseInt(rowsPerPage)).map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.username || user.login}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                            >
                                                {user.isActive ? t("active") : t("inactive")}
                                            </span>
                                        </TableCell>
                                        <TableCell>{user.createdAt || new Date().toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/dashboard/users/${user.id}/edit`}>
                                                        <Pencil className="h-4 w-4 text-amber-500" />
                                                    </Link>
                                                </Button>
                                                <DeleteDialog
                                                    itemName={user.username || user.login}
                                                    onDelete={() => handleDeleteUser(user.id)}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            {t("noUsersMatchFilter")}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                    <div className="flex items-center justify-end p-4">

                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
