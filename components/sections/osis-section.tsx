"use client"

import { useState, useEffect } from "react"
import { translations } from "@/lib/translations"
import { DataTable } from "@/components/ui/data-table"
import { User, FileText, CheckCircle, XCircle, Bell } from "lucide-react"

interface OsisSectionProps {
  language: string
  setImagePopupSrc: (src: string) => void
}

export default function OsisSection({ language, setImagePopupSrc }: OsisSectionProps) {
  const [osisMembers, setOsisMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const t = translations[language as keyof typeof translations] || translations.id

  useEffect(() => {
    loadOsisList()
  }, [])

  const loadOsisList = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/osis")
      if (!response.ok) throw new Error("Failed to fetch OSIS")

      const data = await response.json()
      setOsisMembers(data)
    } catch (error) {
      console.error("Error loading OSIS list:", error)
      setError("Gagal memuat data")
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    {
      key: "photo",
      header: (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" /> Foto
        </div>
      ),
      cell: (member: any) => (
        <img
          src={member.photoUrl || "https://via.placeholder.com/100"}
          alt={member.name || "No Image"}
          className="w-10 h-10 object-cover rounded-full cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={() => setImagePopupSrc(member.photoUrl || "https://via.placeholder.com/100")}
        />
      ),
    },
    {
      key: "name",
      header: (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" /> Nama
        </div>
      ),
      cell: (member: any) => member.name || "-",
      sortable: true,
    },
    {
      key: "bio",
      header: (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" /> Bio
        </div>
      ),
      cell: (member: any) => member.bio || "-",
    },
    {
      key: "isOnline",
      header: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> Status Online
        </div>
      ),
      cell: (member: any) =>
        member.isOnline ? (
          <span className="text-green-500 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Online
          </span>
        ) : (
          <span className="text-red-500 flex items-center">
            <XCircle className="h-4 w-4 mr-1" />
            Offline
          </span>
        ),
      sortable: true,
    },
    {
      key: "oneSignalPlayerId",
      header: (
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" /> OneSignal ID
        </div>
      ),
      cell: (member: any) => (
        <div className="max-w-[200px] truncate" title={member.oneSignalPlayerId || "-"}>
          {member.oneSignalPlayerId || "-"}
        </div>
      ),
    },
  ]

  return (
    <div id="osis" className="section">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center flex items-center justify-center">
        <i className="material-icons mr-2 text-orange-400">group_work</i>
        {t["list-osis"]}
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500 flex items-center justify-center">
          <i className="material-icons mr-2 text-sm">error</i>
          {error}
        </div>
      ) : (
        <DataTable
          data={osisMembers}
          columns={columns}
          searchable={true}
          searchKeys={["name", "bio"]}
          emptyMessage="Tidak ada data anggota OSIS."
        />
      )}
    </div>
  )
}
