import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { ref, get, push, set } from "firebase/database"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password diperlukan" }, { status: 400 })
    }

    // Check if username already exists
    const adminRef = ref(db, "admin-dashboard/admin")
    const snapshot = await get(adminRef)
    const admins = snapshot.val() || {}

    for (const id in admins) {
      if (admins[id].username === username) {
        return NextResponse.json({ error: "Username sudah terdaftar" }, { status: 400 })
      }
    }

    // Hash password and create new admin
    const hashedPassword = await bcrypt.hash(password, 10)
    const newAdminRef = push(adminRef)

    await set(newAdminRef, {
      username,
      password: hashedPassword,
      created_at: Date.now(),
    })

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil, silakan login",
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
