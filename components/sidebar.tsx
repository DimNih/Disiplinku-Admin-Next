"use client"

import type React from "react"

import { useState } from "react"
import { translations } from "@/lib/translations"

interface SidebarProps {
  visible: boolean
  activeSection: string
  setActiveSection: (section: string) => void
  toggleSidebar: () => void
  language: string
}

export default function Sidebar({ visible, activeSection, setActiveSection, toggleSidebar, language }: SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSectionClick = (section: string) => {
    setActiveSection(section)
    if (window.innerWidth <= 768) {
      toggleSidebar()
    }
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDropdownOpen(!dropdownOpen)
  }

  const t = translations[language as keyof typeof translations] || translations.id

  return (
    <div className={`sidebar ${visible ? "" : "hidden"} ${window.innerWidth <= 768 ? (visible ? "visible" : "") : ""}`}>
      <div className="logo mb-8 flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <i className="material-icons text-orange-400 text-3xl animate-spin-slow">school</i>
          <h2 className="text-2xl font-bold tracking-wide text-white">Disiplinku</h2>
        </div>
        <button className="text-white hover:text-orange-400 transition-colors" onClick={toggleSidebar}>
          <i className="material-icons">close</i>
        </button>
      </div>

      <ul className="space-y-3 px-6">
        <li
          className={`flex items-center p-3 rounded-xl hover:bg-blue-600 cursor-pointer transition-all duration-200 transform hover:scale-105 ${activeSection === "home" ? "bg-blue-600" : ""}`}
          onClick={() => handleSectionClick("home")}
        >
          <i className="material-icons mr-3 text-orange-400">home</i>
          <span className="font-medium text-white">{t["home"]}</span>
        </li>

        <li
          className={`flex items-center p-3 rounded-xl hover:bg-blue-600 cursor-pointer transition-all duration-200 transform hover:scale-105 ${activeSection === "details" ? "bg-blue-600" : ""}`}
          onClick={() => handleSectionClick("details")}
        >
          <i className="material-icons mr-3 text-orange-400">list_alt</i>
          <span className="font-medium text-white">{t["detail-pelanggar"]}</span>
        </li>

        <li
          className={`flex items-center p-3 rounded-xl hover:bg-blue-600 cursor-pointer transition-all duration-200 transform hover:scale-105 ${activeSection === "siswa" ? "bg-blue-600" : ""}`}
          onClick={() => handleSectionClick("siswa")}
        >
          <i className="material-icons mr-3 text-orange-400">people_alt</i>
          <span className="font-medium text-white">{t["daftar-siswa"]}</span>
        </li>

        <li
          className={`flex items-center p-3 rounded-xl hover:bg-blue-600 cursor-pointer transition-all duration-200 transform hover:scale-105 ${activeSection === "osis" ? "bg-blue-600" : ""}`}
          onClick={() => handleSectionClick("osis")}
        >
          <i className="material-icons mr-3 text-orange-400">group_work</i>
          <span className="font-medium text-white">{t["list-osis"]}</span>
        </li>

        <li
          className={`flex items-center p-3 rounded-xl hover:bg-blue-600 cursor-pointer transition-all duration-200 transform hover:scale-105 ${activeSection === "images" ? "bg-blue-600" : ""}`}
          onClick={() => handleSectionClick("images")}
        >
          <i className="material-icons mr-3 text-orange-400">image</i>
          <span className="font-medium text-white">{t["image-post"]}</span>
        </li>

        <li
          className={`flex items-center p-3 rounded-xl hover:bg-blue-600 cursor-pointer transition-all duration-200 transform hover:scale-105 ${activeSection === "upload-image" ? "bg-blue-600" : ""}`}
          onClick={() => handleSectionClick("upload-image")}
        >
          <i className="material-icons mr-3 text-orange-400">cloud_upload</i>
          <span className="font-medium text-white">{t["upload-image"]}</span>
        </li>

        <li className="dropdown">
          <div
            className="dropdown-toggle flex items-center p-3 rounded-xl hover:bg-blue-600 cursor-pointer transition-all duration-200 transform hover:scale-105"
            onClick={toggleDropdown}
          >
            <i className="material-icons mr-3 text-orange-400">storage</i>
            <span className="font-medium text-white">{t["data-center"]}</span>
          </div>

          <ul className={`dropdown-menu ml-8 mt-2 space-y-2 text-sm ${dropdownOpen ? "" : "hidden"}`}>
            <li
              className="p-2 hover:bg-blue-600 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 text-white"
              onClick={() => handleSectionClick("list-kelas")}
            >
              {t["list-kelas"]}
            </li>

            <li
              className="p-2 hover:bg-blue-600 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 text-white"
              onClick={() => handleSectionClick("peringatan")}
            >
              {t["peringatan"]}
            </li>

            <li
              className="p-2 hover:bg-blue-600 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 text-white"
              onClick={() => handleSectionClick("apikey")}
            >
              {t["api-key"]}
            </li>
          </ul>
        </li>

        <li
          className={`flex items-center p-3 rounded-xl hover:bg-blue-600 cursor-pointer transition-all duration-200 transform hover:scale-105 ${activeSection === "settings" ? "bg-blue-600" : ""}`}
          onClick={() => handleSectionClick("settings")}
        >
          <i className="material-icons mr-3 text-orange-400">settings</i>
          <span className="font-medium text-white">{t["settings"]}</span>
        </li>
      </ul>
    </div>
  )
}
