"use client"

import { useState } from "react"
import { translations } from "@/lib/translations"
import { useToast } from "@/contexts/toast-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Settings, Moon, Globe, LogOut, Key, Eye, EyeOff, RefreshCw } from "lucide-react"

interface SettingsSectionProps {
  language: string
  theme: string
  changeLanguage: (lang: string) => void
  changeTheme: (theme: string) => void
  handleLogout: () => void
}

export default function SettingsSection({
  language,
  theme,
  changeLanguage,
  changeTheme,
  handleLogout,
}: SettingsSectionProps) {
  const { showToast } = useToast()
  const t = translations[language as keyof typeof translations] || translations.id

  // Account settings
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const [isSavingSecurity, setIsSavingSecurity] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(t["validation-error"], t["pesan-kosong"], "error")
      return
    }

    if (newPassword !== confirmPassword) {
      showToast(t["validation-error"], t["password-mismatch"], "error")
      return
    }

    if (newPassword.length < 8) {
      showToast(t["validation-error"], t["password-min"], "error")
      return
    }

    setIsChangingPassword(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      showToast(t["success"], t["password-updated"], "success")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      showToast(t["error"], t["peringatan-gagal"], "error")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSaveSecurity = async () => {
    setIsSavingSecurity(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      showToast(t["success"], t["security-updated"], "success")
    } catch (error) {
      showToast(t["error"], t["peringatan-gagal"], "error")
    } finally {
      setIsSavingSecurity(false)
    }
  }

  return (
    <div id="settings" className="section">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center flex items-center justify-center">
        <Settings className="mr-2 text-orange-400 h-6 w-6" />
        {t["settings"]}
      </h2>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t["appearance-settings"]}</CardTitle>
            <CardDescription>{t["customize"]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className="h-5 w-5 text-orange-500" />
                  <Label htmlFor="theme">{t["theme"]}</Label>
                </div>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => {
                    changeTheme(e.target.value)
                    showToast(
                      t["theme-updated"].replace(
                        "{0}",
                        e.target.value === "light" ? t["normal-theme"] : t["dark-theme"],
                      ),
                      "",
                      "success",
                    )
                  }}
                  className="border p-2 rounded-lg bg-background text-foreground focus:ring-2 focus:ring-orange-400"
                >
                  <option value="light">{t["normal-theme"]}</option>
                  <option value="dark">{t["dark-theme"]}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-orange-500" />
                  <Label htmlFor="language">{t["language"]}</Label>
                </div>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => {
                    changeLanguage(e.target.value)
                    const languageNames = {
                      id: "Bahasa Indonesia",
                      en: "English",
                      de: "Deutsch",
                      ms: "Bahasa Malaysia",
                      th: "ภาษาไทย",
                    }
                    showToast(
                      t["language-changed"].replace(
                        "{0}",
                        languageNames[e.target.value as keyof typeof languageNames] || e.target.value,
                      ),
                      "",
                      "success",
                    )
                  }}
                  className="border p-2 rounded-lg bg-background text-foreground focus:ring-2 focus:ring-orange-400"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="ms">Bahasa Malaysia</option>
                  <option value="th">ภาษาไทย</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t["security-settings"]}</CardTitle>
            <CardDescription>{t["security-description"]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Key className="h-5 w-5 mr-2 text-orange-500" />
                {t["change-password"]}
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">{t["current-password"]}</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">{t["new-password"]}</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">{t["confirm-password"]}</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {t["updating"]}
                    </>
                  ) : (
                    t["update-password-btn"]
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">{t["session-timeout"]}</Label>
              <Input
                id="session-timeout"
                type="number"
                min="5"
                max="120"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">{t["timeout-description"]}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSecurity} disabled={isSavingSecurity}>
              {isSavingSecurity ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t["saving"]}
                </>
              ) : (
                t["save-settings"]
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Logout Section */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <LogOut className="mr-2 h-5 w-5" />
              {t["logout-section"]}
            </CardTitle>
            <CardDescription>{t["logout-description"]}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={() => {
                showToast(t["logging-out"], t["logout-confirm"], "info")
                setTimeout(handleLogout, 1500)
              }}
              className="w-full sm:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t["logout-btn"]}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
