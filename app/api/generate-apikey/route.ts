import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { ref, push } from "firebase/database";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const apikey = randomBytes(32).toString("hex");
    const apiKeysRef = ref(db, `admin-dashboard/admin/${userId}/apikeys`);
    await push(apiKeysRef, {
      key: apikey,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, apikey });
  } catch (error) {
    console.error("Error generating API key:", error);
    return NextResponse.json({ error: "Gagal menghasilkan API key" }, { status: 500 });
  }
}