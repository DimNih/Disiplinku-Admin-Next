"use client"

import { useState, useEffect } from "react"
import { translations } from "@/lib/translations"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Calendar, User, School, Users, FileText, CalendarIcon } from "lucide-react"

interface DetailPelanggarProps {
  language: string
  setImagePopupSrc: (src: string) => void
}

export default function DetailPelanggarSection({ language, setImagePopupSrc }: DetailPelanggarProps) {
  const [dates, setDates] = useState<string[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const t = translations[language as keyof typeof translations] || translations.id

  useEffect(() => {
    loadDates()
  }, [])

  const loadDates = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/dates")
      if (!response.ok) throw new Error("Failed to fetch dates")

      const data = await response.json()
      setDates(data)

      if (data.length > 0) {
        setSelectedDate(data[0])
        loadStudents(data[0])
      }
    } catch (error) {
      console.error("Error loading dates:", error)
      setError("Gagal memuat data")
    } finally {
      setIsLoading(false)
    }
  }

  const loadStudents = async (date: string) => {
    setIsLoading(true)
    setError("")
    setSelectedDate(date)

    try {
      const response = await fetch(`/api/students/${date}`)
      if (!response.ok) throw new Error("Failed to fetch students")

      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Error loading students:", error)
      setError("Gagal memuat data siswa")
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    {
      key: "photo",
      header: (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Foto
        </div>
      ),
      cell: (student: any) => (
        <img
          src={student.fotoUrl || "https://via.placeholder.com/100"}
          alt={student.nama || "No Image"}
          className="w-10 h-10 object-cover rounded-full cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={() => setImagePopupSrc(student.fotoUrl || "https://via.placeholder.com/100")}
        />
      ),
    },
    {
      key: "nama",
      header: (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" /> Nama
        </div>
      ),
      cell: (student: any) => student.nama || "-",
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
      key: "jenisPelanggaran",
      header: (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" /> Jenis Pelanggaran
        </div>
      ),
      cell: (student: any) => student.jenisPelanggaran || "-",
      sortable: true,
    },
    {
      key: "tanggalPelanggaran",
      header: (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" /> Tanggal
        </div>
      ),
      cell: (student: any) => student.tanggalPelanggaran || selectedDate,
    },
  ]

  return (
    <div id="details" className="section">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center flex items-center justify-center">
        <i className="material-icons mr-2 text-orange-400">list_alt</i>
        {t["detail-pelanggar"]}
      </h2>

      <div className="form-container w-full mb-6">
        <div className="flex flex-wrap gap-2 p-4 bg-card rounded-lg shadow-inner">
          {isLoading && (
            <div className="p-3 text-muted-foreground flex items-center">
              <i className="material-icons mr-2 animate-spin">hourglass_empty</i>Loading...
            </div>
          )}

          {!isLoading && error && (
            <div className="p-3 text-red-500 flex items-center">
              <i className="material-icons mr-2 text-sm">error</i>
              {error}
            </div>
          )}

          {!isLoading && !error && dates.length === 0 && (
            <div className="p-3 text-muted-foreground flex items-center">
              <i className="material-icons mr-2 text-orange-400 text-sm">info</i>
              Tidak ada data pelanggaran.
            </div>
          )}

          {!isLoading &&
            !error &&
            dates.map((date) => (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                onClick={() => loadStudents(date)}
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                {date}
              </Button>
            ))}
        </div>
      </div>

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
          data={students}
          columns={columns}
          searchable={true}
          searchKeys={["nama", "nis", "kelas", "jenisPelanggaran"]}
          emptyMessage="Tidak ada siswa untuk tanggal ini."
        />
      )}
    </div>
  )
}
