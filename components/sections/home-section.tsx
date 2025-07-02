"use client";

import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { useToast } from "@/contexts/toast-context";
import { translations } from "@/lib/translations";

// Register Chart.js components
Chart.register(...registerables);

interface HomeProps {
  language: string;
}

export default function HomeSection({ language }: HomeProps) {
  const [stats, setStats] = useState({
    osisOnline: 0,
    totalPelanggar: 0,
    totalSiswa: 0,
  });
  const [violationData, setViolationData] = useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  });
  const [classData, setClassData] = useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const violationChartRef = useRef<Chart | null>(null);
  const studentChartRef = useRef<Chart | null>(null);

  const t = translations[language as keyof typeof translations] || translations.id;
  const { showToast } = useToast();

  useEffect(() => {
    // Load dashboard data
    loadDashboard();

    // Cleanup charts on unmount
    return () => {
      if (violationChartRef.current) {
        violationChartRef.current.destroy();
      }
      if (studentChartRef.current) {
        studentChartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    // Reinitialize charts when language or data changes
    if (!isLoading) {
      initCharts();
    }
  }, [language, violationData, classData, isLoading]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      // Fetch OSIS data
      let osisOnlineCount = 0;
      try {
        const osisResponse = await fetch("/api/osis", { credentials: "include" });
        if (osisResponse.ok) {
          const osisData = await osisResponse.json();
          osisOnlineCount = osisData.filter((user: any) => user.isOnline).length;
          console.log(`OSIS Online: ${osisOnlineCount}`);
        } else {
          console.warn("Failed to fetch OSIS data: ", osisResponse.status);
        }
      } catch (err) {
        console.warn("Endpoint /api/osis not available, using default 0");
      }

      // Fetch all dates from /api/dates
      const datesResponse = await fetch("/api/dates", { credentials: "include" });
      if (!datesResponse.ok) {
        throw new Error(t["error-mengambil-tanggal"] || "Failed to fetch dates");
      }
      const dates = await datesResponse.json();
      console.log(`Dates from /api/dates: ${JSON.stringify(dates)}`);

      // Fetch violation data for all dates
      let allPelanggaran: any[] = [];
      for (const date of dates) {
        try {
          const pelanggaranResponse = await fetch(`/api/students/${date}`, {
            credentials: "include",
          });
          if (pelanggaranResponse.ok) {
            const pelanggaranList = await pelanggaranResponse.json();
            console.log(`Violations for ${date}: ${JSON.stringify(pelanggaranList)}`);
            allPelanggaran = [...allPelanggaran, ...pelanggaranList];
          } else {
            console.warn(`Failed to fetch violations for ${date}: ${pelanggaranResponse.status}`);
          }
        } catch (err) {
          console.warn(`Error fetching violations for ${date}:`, err);
        }
      }

      const totalPelanggar = allPelanggaran.length;

      // Aggregate violations by type
      const violationsByType: Record<string, number> = {};
      allPelanggaran.forEach((p: any) => {
        const jenis = p.jenisPelanggaran || t["unknown-violation"];
        violationsByType[jenis] = (violationsByType[jenis] || 0) + 1;
      });

      setViolationData({
        labels: Object.keys(violationsByType),
        data: Object.values(violationsByType),
      });

      // Fetch student data from /api/siswa
      const siswaResponse = await fetch("/api/siswa", { credentials: "include" });
      if (!siswaResponse.ok) {
        const errorData = await siswaResponse.json();
        throw new Error(errorData.error || t["error-mengambil-siswa"] || "Failed to fetch student data");
      }
      const siswaList = await siswaResponse.json();
      console.log(`Students from /api/siswa: ${JSON.stringify(siswaList)}`);

      // Count students per class
      const classCounts: Record<string, number> = {};
      siswaList.forEach((s: any) => {
        const kelas = s.kelas || t["unknown-class"];
        classCounts[kelas] = (classCounts[kelas] || 0) + 1;
      });

      setClassData({
        labels: Object.keys(classCounts),
        data: Object.values(classCounts),
      });

      setStats({
        osisOnline: osisOnlineCount,
        totalPelanggar,
        totalSiswa: siswaList.length,
      });

      if (siswaList.length === 0) {
        showToast(t["info"], t["tidak-ada-siswa"] || "No student data found", "info");
      }
      if (allPelanggaran.length === 0) {
        showToast(t["info"], t["tidak-ada-pelanggaran"] || "No violation data found", "info");
      }
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      showToast(t["error"], error.message || t["error-mengambil-data"] || "Failed to load dashboard data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const initCharts = () => {
    // Violation chart
    const violationCtx = document.getElementById("violationChart") as HTMLCanvasElement;
    if (violationCtx && violationData.labels.length > 0) {
      if (violationChartRef.current) {
        violationChartRef.current.destroy();
      }

      violationChartRef.current = new Chart(violationCtx, {
        type: "bar",
        data: {
          labels: violationData.labels,
          datasets: [
            {
              label: t["jumlah-pelanggaran"] || "Number of Violations",
              data: violationData.data,
              backgroundColor: "rgba(37, 99, 235, 0.6)",
              borderColor: "rgba(37, 99, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: { y: { beginAtZero: true } },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    // Student chart
    const studentCtx = document.getElementById("studentChart") as HTMLCanvasElement;
    if (studentCtx && classData.labels.length > 0) {
      if (studentChartRef.current) {
        studentChartRef.current.destroy();
      }

      const backgroundColors = classData.labels.map((_, index) => {
        const colors = [
          "rgba(249, 115, 22, 0.6)",
          "rgba(37, 99, 235, 0.6)",
          "rgba(107, 114, 128, 0.6)",
          "rgba(16, 185, 129, 0.6)",
          "rgba(236, 72, 153, 0.6)",
        ];
        return colors[index % colors.length];
      });

      const borderColors = classData.labels.map((_, index) => {
        const colors = [
          "rgba(249, 115, 22, 1)",
          "rgba(37, 99, 235, 1)",
          "rgba(107, 114, 128, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(236, 72, 153, 1)",
        ];
        return colors[index % colors.length];
      });

      studentChartRef.current = new Chart(studentCtx, {
        type: "pie",
        data: {
          labels: classData.labels,
          datasets: [
            {
              label: t["jumlah-siswa"] || "Number of Students",
              data: classData.data,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  };

  return (
    <div id="home" className="section p-6">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center flex items-center justify-center">
        <i className="material-icons mr-2 text-orange-400">dashboard</i>
        {t["dashboard"]}
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="stats-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="flex items-center mb-2 text-foreground">{t["osis-online"]}</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.osisOnline}</p>
                </div>
                <i className="material-icons text-orange-400">group_work</i>
              </div>
            </div>

            <div className="stats-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="flex items-center mb-2 text-foreground">{t["total-pelanggar"]}</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPelanggar}</p>
                </div>
                <i className="material-icons text-orange-400">report</i>
              </div>
            </div>

            <div className="stats-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="flex items-center mb-2 text-foreground">{t["jumlah-siswa"]}</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalSiswa}</p>
                </div>
                <i className="material-icons text-orange-400">people_alt</i>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <i className="material-icons mr-2 text-orange-400">bar_chart</i>
                {t["statistik-pelanggaran"]}
              </h3>
              <div className="h-64 flex items-center justify-center">
                {violationData.labels.length > 0 ? (
                  <canvas id="violationChart"></canvas>
                ) : (
                  <p className="text-foreground text-center">{t["tidak-ada-data"] || "No data available"}</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <i className="material-icons mr-2 text-orange-400">pie_chart</i>
                {t["jumlah-siswa-per-kelas"]}
              </h3>
              <div className="h-64 flex items-center justify-center">
                {classData.labels.length > 0 ? (
                  <canvas id="studentChart"></canvas>
                ) : (
                  <p className="text-foreground text-center">{t["tidak-ada-data"] || "No data available"}</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}