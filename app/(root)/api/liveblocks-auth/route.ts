import { tables } from "@/lib/appwriteServer";
import stringToColor from "@/lib/stringToColor";
import { Liveblocks } from "@liveblocks/node";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCK_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("notex_session")?.value;
    const pageId = req.nextUrl.searchParams.get("pageId");

    if (!pageId || !token) {
      return NextResponse.json(
        { success: false, error: "Missing credentials" },
        { status: 400 }
      );
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const userId = payload.sub as string;

    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    //  Fetch user
    const user = await tables.getRow({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
      rowId: userId,
    });

    if (!user) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const page = await tables.getRow({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
      rowId: pageId,
    });

    if (!page) {
      return NextResponse.json({ success: false }, { status: 404 });
    }
    // Fetch shared pages
    const sharedPages = await tables.listRows({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_PAGES_ID!,
      queries: [
        Query.equal("sharedUserId", userId),
        Query.equal("pageId", pageId),
      ],
    });

    if (sharedPages.total === 0) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    //  Prepare Liveblocks session
    const session = liveblocks.prepareSession(user.email, {
      userInfo: {
        name: user.fullName,
        avatar: user.imgUrl,
        color: stringToColor(user.fullName),
      },
    });

    // Allow rooms
    const roomId = `notex-${pageId}`;

    if (sharedPages.rows[0].permission === "FULL_ACCESS") {
      session.allow(roomId, session.FULL_ACCESS);
    } else {
      session.allow(roomId, session.READ_ACCESS);
    }

    // Authorize
    const { status, body } = await session.authorize();

    return new NextResponse(body, {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
