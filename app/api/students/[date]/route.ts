import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string, nama: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
    }

    const { date } = await params;

    if (!date) {
      return NextResponse.json({ error: "Parameter tanggal diperlukan" }, { status: 400 });
    }

    const pelanggaranRef = ref(db, `pelanggaran/${date}`);
    const snapshot = await get(pelanggaranRef);
    const data = snapshot.val() || {};
    const students = Object.values(data);

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error mengambil data siswa:", error);
    return NextResponse.json({ error: "Gagal memuat data siswa" }, { status: 500 });
  }
}



