import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export async function GET(request: Request) {
  try {
    // Cek sesi autentikasi
    const session = await getServerSession(authOptions);
    if (!session) {
      console.warn("Permintaan ke /api/siswa ditolak: Tidak ada sesi aktif");
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
    }

    const siswaRef = ref(db, "siswa-i");
    const snapshot = await get(siswaRef);
    const data = snapshot.val() || {};
    const siswa = Object.values(data);

    console.log(`Data siswa dari Firebase (siswa-i): ${JSON.stringify(siswa)}`);

    return NextResponse.json(siswa, { status: 200 });
  } catch (error) {
    console.error("Error mengambil data siswa:", error);
    return NextResponse.json({ error: "Gagal memuat data siswa" }, { status: 500 });
  }
}