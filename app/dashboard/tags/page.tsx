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

export default function TagsPage() {
  const { language, t } = useLanguage()
  const { tags, deleteTag } = useStore()
  const [nameFilter, setNameFilter] = useState("")
  const [idFilter, setIdFilter] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState("10")
  const [currentTags, setCurrentTags] = useState(tags[language] || [])

  useEffect(() => {
    // Make sure we're using the latest tags data
    setCurrentTags(tags[language] || [])
  }, [language, tags])

  const filteredTags = currentTags.filter((tag) => {
    const matchesName = tag.name.toLowerCase().includes(nameFilter.toLowerCase())
    const matchesId = idFilter === "" || tag.id === idFilter
    return matchesName && matchesId
  })

  const handleApplyFilters = () => {
    // Already filtered by the filteredTags variable
  }

  const handleClearFilters = () => {
    setNameFilter("")
    setIdFilter("")
  }

  return (
    <DashboardLayout>
      <div>
        <h2 className="mb-6 text-2xl font-bold">{t("tags")}</h2>

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
                className="bg-[#3f4b5b] border-[#374151] text-white placeholder:text-gray-400"
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
                className="bg-[#3f4b5b] border-[#374151] text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} className="button-secondary">
              {t("apply")}
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="border-[#374151] text-white hover:bg-[#3f4b5b]"
            >
              {t("clear")}
            </Button>
          </div>
        </div>

        <div className="mb-4 flex justify-between">
          <h3 className="text-xl font-medium">{t("tags")}</h3>
          <Button className="button-primary" asChild>
            <Link href="/dashboard/tags/add">
              <Plus className="mr-2 h-4 w-4" />
              {t("add")}
            </Link>
          </Button>
        </div>

        <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
          <Table>
            <TableHeader className="table-header-dark">
              <TableRow>
                <TableHead className="text-white">{t("language")}</TableHead>
                <TableHead className="text-white">{t("name")}</TableHead>
                <TableHead className="text-white">{t("alias")}</TableHead>
                <TableHead className="text-white">{t("created")}</TableHead>
                <TableHead className="text-white">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.slice(0, Number.parseInt(rowsPerPage)).map((tag) => (
                <TableRow key={tag.id} className="border-gray-200 dark:border-gray-700">
                  <TableCell className="uppercase">{tag.language}</TableCell>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell>{tag.alias}</TableCell>
                  <TableCell>{tag.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Link href={`/dashboard/tags/${tag.id}/edit`}>
                          <Pencil className="h-4 w-4 text-amber-500" />
                        </Link>
                      </Button>
                      <DeleteDialog itemName={tag.name} onDelete={() => deleteTag(tag.id, language)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTags.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No tags found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end p-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t("rowsPerPage")}</span>
              <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
