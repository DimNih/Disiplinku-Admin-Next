"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useToast } from "@/contexts/toast-context";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import HomeSection from "@/components/sections/home-section";
import DetailPelanggarSection from "@/components/sections/detail-pelanggar-section";
import DaftarSiswaSection from "@/components/sections/daftar-siswa-section";
import OsisSection from "@/components/sections/osis-section";
import ImagesSection from "@/components/sections/images-section";
import UploadImageSection from "@/components/sections/upload-image-section";
import ListKelasSection from "@/components/sections/list-kelas-section";
import PeringatanSection from "@/components/sections/peringatan-section";
import ApiKeySection from "@/components/sections/apikey-section";
import SettingsSection from "@/components/sections/settings-section";
import ImagePopup from "@/components/image-popup";
import WarningModal from "@/components/warning-modal";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { translations } from "@/lib/translations";

type User = {
  id: string;
  username: string;
};

export default function Dashboard({ user }: { user: User }) {
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [language, setLanguage] = useState("id");
  const [imagePopupSrc, setImagePopupSrc] = useState("");
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningStudent, setWarningStudent] = useState({ nis: "", name: "", kelas: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const t = translations[language as keyof typeof translations] || translations.id;

  useEffect(() => {
    // Load user preferences from localStorage
    const savedLang = localStorage.getItem("language") || "id";
    setLanguage(savedLang);

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarVisible(false);
      }
    };

    checkIfMobile();

    window.addEventListener("resize", checkIfMobile);

    const timer = setTimeout(() => {
      setIsLoading(false);
      showToast(
        t["welcome-back"],
        `${t["hello"]}, ${user.username}! ${t["welcome-dashboard"]}`,
        "success"
      );
    }, 1000);

    // Set session timeout (30 minutes)
    const sessionTimeout = setTimeout(
      () => {
        showToast(t["warning"], t["session-timeout-warning"], "warning");
      },
      25 * 60 * 1000 // 25 minutes warning
    );

    return () => {
      clearTimeout(timer);
      clearTimeout(sessionTimeout);
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [user.username, showToast, t]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);

    const languageNames = {
      id: "Bahasa Indonesia",
      en: "English",
      de: "Deutsch",
      ms: "Bahasa Malaysia",
      th: "ภาษาไทย",
    };

    const t = translations[lang as keyof typeof translations] || translations.id;
    showToast(
      t["language-changed"].replace("{0}", languageNames[lang as keyof typeof languageNames] || lang),
      "",
      "info"
    );
  };

  const openWarningModal = (nis: string, name: string, kelas: string) => {
    setWarningStudent({ nis, name, kelas });
    setWarningModalOpen(true);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 relative mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t-4 border-blue-500"
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🏫</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">DISIPLINKU</h2>
          <p className="text-gray-600 dark:text-gray-300 flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t["loading-dashboard"]}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        visible={sidebarVisible}
        activeSection={activeSection}
        setActiveSection={(section) => {
          setActiveSection(section);
          if (isMobile) {
            setSidebarVisible(false);
          }
        }}
        toggleSidebar={toggleSidebar}
        language={language}
      />

      <div className={`main-content ${!sidebarVisible ? "full" : ""}`}>
        <Header toggleSidebar={toggleSidebar} username={user.username} language={language} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === "home" && <HomeSection language={language} />}
            {activeSection === "details" && (
              <DetailPelanggarSection language={language} setImagePopupSrc={setImagePopupSrc} />
            )}
            {activeSection === "siswa" && <DaftarSiswaSection language={language} />}
            {activeSection === "osis" && (
              <OsisSection language={language} setImagePopupSrc={setImagePopupSrc} />
            )}
            {activeSection === "images" && (
              <ImagesSection language={language} setImagePopupSrc={setImagePopupSrc} />
            )}
            {activeSection === "upload-image" && <UploadImageSection language={language} />}
            {activeSection === "list-kelas" && <ListKelasSection language={language} />}
            {activeSection === "peringatan" && (
              <PeringatanSection language={language} openWarningModal={openWarningModal} />
            )}
            {activeSection === "apikey" && <ApiKeySection language={language} />}
            {activeSection === "settings" && (
              <SettingsSection
                language={language}
                theme={theme || "light"}
                changeLanguage={changeLanguage}
                changeTheme={setTheme}
                handleLogout={handleLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ImagePopup
        src={imagePopupSrc || "/placeholder.svg"}
        isOpen={!!imagePopupSrc}
        onClose={() => setImagePopupSrc("")}
        language={language}
      />

      <WarningModal
        isOpen={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        student={warningStudent}
        language={language}
      />
    </div>
  );
}