"use client"

import { useState, useEffect } from "react"
import { translations } from "@/lib/translations"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { User, FileText, School, Users, Star, AlertTriangle, MessageSquare, Calendar } from "lucide-react"

interface PeringatanSectionProps {
  language: string
  openWarningModal: (nis: string, name: string, kelas: string) => void
}

export default function PeringatanSection({ language, openWarningModal }: PeringatanSectionProps) {
  const [students, setStudents] = useState<any[]>([])
  const [warnings, setWarnings] = useState<any[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isLoadingWarnings, setIsLoadingWarnings] = useState(false)
  const [errorStudents, setErrorStudents] = useState("")
  const [errorWarnings, setErrorWarnings] = useState("")

  const t = translations[language as keyof typeof translations] || translations.id

  useEffect(() => {
    loadSiswaForWarning()
    loadWarnings()
  }, [])

  const loadSiswaForWarning = async () => {
    setIsLoadingStudents(true)
    setErrorStudents("")

    try {
      const response = await fetch("/api/siswa-i")
      if (!response.ok) throw new Error("Failed to fetch siswa")

      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Error loading siswa for warning:", error)
      setErrorStudents("Gagal memuat data siswa")
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const loadWarnings = async () => {
    setIsLoadingWarnings(true)
    setErrorWarnings("")

    try {
      const response = await fetch("/api/warnings")
      if (!response.ok) throw new Error("Failed to fetch warnings")

      const data = await response.json()
      setWarnings(data)
    } catch (error) {
      console.error("Error loading warnings:", error)
      setErrorWarnings("Gagal memuat peringatan")
    } finally {
      setIsLoadingWarnings(false)
    }
  }

  const studentColumns = [
    {
      key: "name",
      header: (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" /> Nama
        </div>
      ),
      cell: (student: any) => student.name || "-",
      sortable: true,
    },
    {
      key: "nis",
      header: (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" /> NIS
        </div>
      ),
      cell: (student: any) => student.nis || "-",
      sortable: true,
    },
    {
      key: "kelas",
      header: (
        <div className="flex items-center gap-2">
          <School className="h-4 w-4" /> Kelas
        </div>
      ),
      cell: (student: any) => student.kelas || "-",
      sortable: true,
    },
    {
      key: "jenisKelamin",
      header: (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" /> Jenis Kelamin
        </div>
      ),
      cell: (student: any) => student.jenisKelamin || "-",
    },
    {
      key: "score",
      header: (
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4" /> Score
        </div>
      ),
      cell: (student: any) => student.score || 0,
      sortable: true,
    },
    {
      key: "action",
      header: (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Aksi
        </div>
      ),
      cell: (student: any) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => openWarningModal(student.nis, student.name, student.kelas)}
          className="flex items-center gap-1"
        >
          <AlertTriangle className="h-4 w-4" />
          Beri Peringatan
        </Button>
      ),
    },
  ]

  const warningColumns = [
    {
      key: "nis",
      header: (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" /> NIS
        </div>
      ),
      cell: (warning: any) => warning.nis || "-",
      sortable: true,
    },
    {
      key: "name",
      header: (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" /> Nama
        </div>
      ),
      cell: (warning: any) => warning.name || "-",
      sortable: true,
    },
    {
      key: "kelas",
      header: (
        <div className="flex items-center gap-2">
          <School className="h-4 w-4" /> Kelas
        </div>
      ),
      cell: (warning: any) => warning.kelas || "-",
      sortable: true,
    },
    {
      key: "message",
      header: (
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Pesan Peringatan
        </div>
      ),
      cell: (warning: any) => (
        <div className="max-w-md truncate" title={warning.message || "-"}>
          {warning.message || "-"}
        </div>
      ),
    },
    {
      key: "timestamp",
      header: (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Tanggal
        </div>
      ),
      cell: (warning: any) => new Date(warning.timestamp).toLocaleString(),
      sortable: true,
    },
  ]

  return (
    <div id="peringatan" className="section">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center flex items-center justify-center">
        <i className="material-icons mr-2 text-orange-400">warning</i>
        {t["peringatan"]}
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <i className="material-icons mr-2 text-orange-400">people_alt</i>
          {t["daftar-siswa"]}
        </h3>

        {isLoadingStudents ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : errorStudents ? (
          <div className="p-4 text-red-500 flex items-center justify-center">
            <i className="material-icons mr-2 text-sm">error</i>
            {errorStudents}
          </div>
        ) : (
          <DataTable
            data={students}
            columns={studentColumns}
            searchable={true}
            searchKeys={["name", "nis", "kelas"]}
            emptyMessage="Tidak ada data siswa."
          />
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <i className="material-icons mr-2 text-orange-400">notifications</i>
          {t["daftar-peringatan"]}
        </h3>

        {isLoadingWarnings ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : errorWarnings ? (
          <div className="p-4 text-red-500 flex items-center justify-center">
            <i className="material-icons mr-2 text-sm">error</i>
            {errorWarnings}
          </div>
        ) : (
          <DataTable
            data={warnings}
            columns={warningColumns}
            searchable={true}
            searchKeys={["name", "nis", "kelas", "message"]}
            emptyMessage="Belum ada peringatan."
          />
        )}
      </div>
    </div>
  )
}
