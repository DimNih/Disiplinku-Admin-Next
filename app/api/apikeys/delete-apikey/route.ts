import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { ref, remove } from "firebase/database";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
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

    const { keyId } = await request.json();
    if (!keyId) {
      return NextResponse.json({ error: "Invalid key ID" }, { status: 400 });
    }

    const apiKeyRef = ref(db, `admin-dashboard/admin/${userId}/apikeys/${keyId}`);
    await remove(apiKeyRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json({ error: "Gagal menghapus API key" }, { status: 500 });
  }
}