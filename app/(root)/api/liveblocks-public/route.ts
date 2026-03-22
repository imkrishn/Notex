import { tables } from "@/lib/appwriteServer";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";
import stringToColor from "@/lib/stringToColor";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCK_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const pageId = req.nextUrl.searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json(
        { success: false, error: "Missing pageId" },
        { status: 400 }
      );
    }

    const page = await tables.getRow({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
      rowId: pageId,
    });

    // Check public visibility
    if (!page || page.isPublished !== true) {
      return NextResponse.json(
        { success: false, error: "Page is not published" },
        { status: 403 }
      );
    }

    const session = liveblocks.prepareSession(`notex-${pageId}`, {
      userInfo: {
        name: "Guest",
        color: stringToColor("Guest"),
      },
    });

    const roomId = `notex-${pageId}`;

    // READ ONLY access
    session.allow(roomId, session.READ_ACCESS);

    const { status, body } = await session.authorize();

    return new NextResponse(body, {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Public Liveblocks auth error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
