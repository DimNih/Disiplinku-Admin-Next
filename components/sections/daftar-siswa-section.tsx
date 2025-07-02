"use client"

import { useState, useEffect } from "react"
import { translations } from "@/lib/translations"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { User, FileText, School, Users, Star, Calendar } from "lucide-react"

interface DaftarSiswaProps {
  language: string
}

export default function DaftarSiswaSection({ language }: DaftarSiswaProps) {
  const [classes, setClasses] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const t = translations[language as keyof typeof translations] || translations.id

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/siswa-i")
      if (!response.ok) throw new Error("Failed to fetch siswa")

      const siswaData = await response.json()

      if (siswaData && siswaData.length > 0) {
        const uniqueClasses = Array.from(
          new Set(siswaData.map((siswa: any) => siswa.kelas || "Tidak Diketahui")),
        ) as string[]

        setClasses(uniqueClasses)

        if (uniqueClasses.length > 0) {
          setSelectedClass(uniqueClasses[0])
          loadSiswaByClass(uniqueClasses[0], siswaData)
        }
      }
    } catch (error) {
      console.error("Error loading classes:", error)
      setError("Gagal memuat data")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSiswaByClass = (kelas: string, siswaData?: any[]) => {
    setSelectedClass(kelas)
    setIsLoading(true)
    setError("")

    try {
      let filteredStudents: any[] = []

      if (siswaData) {
        // If siswaData is provided, filter from it
        filteredStudents = siswaData.filter((siswa) => siswa.kelas === kelas)
      } else {
        // Otherwise fetch from API
        fetch("/api/siswa-i")
          .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch siswa")
            return response.json()
          })
          .then((data) => {
            const filtered = data.filter((siswa: any) => siswa.kelas === kelas)
            setStudents(filtered)
            setIsLoading(false)
          })
          .catch((error) => {
            console.error("Error loading students:", error)
            setError("Gagal memuat data siswa")
            setIsLoading(false)
          })

        return // Exit early as we're handling loading state in the fetch
      }

      setStudents(filteredStudents)
    } catch (error) {
      console.error("Error filtering students:", error)
      setError("Gagal memuat data siswa")
    } finally {
      if (siswaData) setIsLoading(false) // Only set loading to false if we're not fetching
    }
  }

  const columns = [
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
      key: "createdAt",
      header: (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Tanggal Dibuat
        </div>
      ),
      cell: (student: any) => new Date(student.createdAt || Date.now()).toLocaleDateString(),
      sortable: true,
    },
  ]

  return (
    <div id="siswa" className="section">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center flex items-center justify-center">
        <i className="material-icons mr-2 text-orange-400">people_alt</i>
        {t["daftar-siswa"]}
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

          {!isLoading && !error && classes.length === 0 && (
            <div className="p-3 text-muted-foreground flex items-center">
              <i className="material-icons mr-2 text-orange-400 text-sm">info</i>
              Tidak ada data kelas.
            </div>
          )}

          {!isLoading &&
            !error &&
            classes.map((kelas) => (
              <Button
                key={kelas}
                variant={selectedClass === kelas ? "default" : "outline"}
                onClick={() => loadSiswaByClass(kelas)}
                className="flex items-center gap-2"
              >
                <School className="h-4 w-4" />
                {kelas}
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
          searchKeys={["name", "nis", "kelas"]}
          emptyMessage="Tidak ada siswa di kelas ini."
        />
      )}
    </div>
  )
}
