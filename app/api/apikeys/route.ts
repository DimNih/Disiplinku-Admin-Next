import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.error("Missing Firebase API key");
      return NextResponse.json({ error: "Firebase configuration missing" }, { status: 500 });
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId || typeof userId !== "string") {
      console.error("Invalid userId:", userId);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    console.log("Fetching apikeys for userId:", userId);
    const apiKeysRef = ref(db, `admin-dashboard/admin/${userId}/apikeys`);
    const snapshot = await get(apiKeysRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ success: true, apikeys: [] });
    }

    const apikeys = snapshot.val() || {};
    const apikeyList = Object.entries(apikeys).map(([keyId, keyData]) => ({
      id: keyId,
      key: keyData.key,
      createdAt: keyData.createdAt,
      active: keyData.active !== undefined ? keyData.active : true, // Default ke true
    }));

    return NextResponse.json({ success: true, apikeys: apikeyList });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json({ error: "Gagal memuat API keys" }, { status: 500 });
  }
}