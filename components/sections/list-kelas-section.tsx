"use client"

import { useState, useEffect } from "react"
import { translations } from "@/lib/translations"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { School } from "lucide-react"

interface ListKelasProps {
  language: string
}

export default function ListKelasSection({ language }: ListKelasProps) {
  const [classList, setClassList] = useState<any[]>([])
  const [grade, setGrade] = useState("")
  const [major, setMajor] = useState("")
  const [classNumber, setClassNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const t = translations[language as keyof typeof translations] || translations.id

  useEffect(() => {
    loadClassList()
  }, [])

  const loadClassList = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/kelas-list")
      if (!response.ok) throw new Error("Failed to fetch class list")

      const data = await response.json()
      setClassList(data)
    } catch (error) {
      console.error("Error loading class list:", error)
      setError("Gagal memuat data")
    } finally {
      setIsLoading(false)
    }
  }

  const addClass = async () => {
    if (!grade || !major || !classNumber || Number.parseInt(classNumber) < 1 || Number.parseInt(classNumber) > 5) {
      alert("Pilih grade, jurusan, dan nomor kelas yang valid (1-5).")
      return
    }

    const className = `${grade} ${major} ${classNumber}`
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/kelas-list/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, major, className }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add class")
      }

      const data = await response.json()
      if (data.success) {
        alert("Kelas berhasil ditambahkan!")
        setClassNumber("")
        loadClassList()
      } else {
        throw new Error(data.error || "Gagal menambah kelas")
      }
    } catch (error) {
      console.error("Error adding class:", error)
      alert(`Gagal menambah kelas: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    {
      key: "className",
      header: (
        <div className="flex items-center gap-2">
          <School className="h-4 w-4" /> Kelas
        </div>
      ),
      cell: (classData: any) => `${classData.grade} ${classData.major} ${classData.className.split(" ").pop()}`,
      sortable: true,
    },
  ]

  return (
    <div id="list-kelas" className="section">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center flex items-center justify-center">
        <i className="material-icons mr-2 text-orange-400">class</i>
        {t["list-kelas"]}
      </h2>

      <div className="bg-card p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-4">{t["tambah-kelas"]}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="gradeSelect" className="block mb-2 text-sm font-medium text-foreground">
              <i className="material-icons mr-2 text-orange-400 text-sm align-text-bottom">grade</i>
              {t["grade"]}
            </label>
            <select
              id="gradeSelect"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2 rounded-md border border-input bg-background text-foreground"
            >
              <option value="">{t["pilih-grade"]}</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>

          <div>
            <label htmlFor="majorSelect" className="block mb-2 text-sm font-medium text-foreground">
              <i className="material-icons mr-2 text-orange-400 text-sm align-text-bottom">school</i>
              {t["jurusan"]}
            </label>
            <select
              id="majorSelect"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full p-2 rounded-md border border-input bg-background text-foreground"
            >
              <option value="">{t["pilih-jurusan"]}</option>
              <option value="TMI">TMI</option>
              <option value="SIJA">SIJA</option>
              <option value="PBS">PBS</option>
              <option value="MENLOG">MENLOG</option>
            </select>
          </div>

          <div>
            <label htmlFor="classNumber" className="block mb-2 text-sm font-medium text-foreground">
              <i className="material-icons mr-2 text-orange-400 text-sm align-text-bottom">format_list_numbered</i>
              {t["nomor-kelas"]}
            </label>
            <Input
              type="number"
              id="classNumber"
              min="1"
              max="5"
              placeholder="1-5"
              value={classNumber}
              onChange={(e) => setClassNumber(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={addClass} disabled={isLoading} className="w-full">
              <i className="material-icons mr-2">add</i>
              {isLoading ? "..." : t["tambah-kelas"]}
            </Button>
          </div>
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
          data={classList}
          columns={columns}
          searchable={true}
          searchKeys={["grade", "major", "className"]}
          emptyMessage="Tambah kelas baru untuk memulai."
        />
      )}
    </div>
  )
}
