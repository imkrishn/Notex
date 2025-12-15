"use client";

import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import stringToColor from "@/lib/stringToColor";
import { toast } from "sonner";
import { databases } from "@/app/(root)/appwrite";
import { Query } from "appwrite";
import Image from "next/image";
import { BotIcon, Languages, StickyNote } from "lucide-react";
import { useRouter } from "next/navigation";
import Translate from "./Translate";
import AIChat from "./AIChat";

type Props = {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  edit: boolean;
};

interface ChildPagesType {
  $id: string;
  logoUrl?: string | null;
  title?: string;
}

const BlockNote = ({ doc, provider, edit }: Props) => {
  const { theme } = useTheme();
  const userInfo = useSelf((me) => me.info);

  const fragment = useMemo(() => doc.getXmlFragment("document-store"), [doc]);
  const collaboration = useMemo(() => {
    if (!provider || !fragment) return undefined;

    return {
      provider,
      fragment,
      user: {
        name: userInfo?.name ?? "Unknown",
        color: stringToColor(userInfo?.name ?? "Unknown"),
      },
    };
  }, [provider, fragment, userInfo?.name]);

  const editor: BlockNoteEditor | undefined = useCreateBlockNote({
    collaboration,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className=" pl-11 pt-5 relative min-w-full max-w-full">
      <BlockNoteView
        editable={edit}
        editor={editor}
        theme={theme === "dark" ? "dark" : "light"}
      />
    </div>
  );
};

export function Editor({ pageId, edit }: { pageId: string; edit: boolean }) {
  const room = useRoom();
  const router = useRouter();
  const [doc, setDoc] = useState<Y.Doc | undefined>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider | undefined>();
  const [childPages, setChildPages] = useState<ChildPagesType[]>([]);
  const [onTranslateClick, setOnTranslateClick] = useState(false);
  const [onChatAI, setOnChatAI] = useState(false);
  const initialized = useRef(false);

  async function getChildPages() {
    try {
      const response = await databases.listRows({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        queries: [Query.equal("parentId", pageId)],
      });

      const childPagesData = response.rows;

      if (childPagesData.length === 0) {
        return;
      }
      setChildPages(childPagesData);
    } catch (Err) {
      console.error("Error fetching child pages:", Err);
      toast.error("Failed to fetch child pages.");
    }
  }

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let mounted = true;
    (async () => {
      const yDoc = new Y.Doc();

      const yProvider = new LiveblocksYjsProvider(room, yDoc);

      if (!mounted) {
        yProvider.destroy();
        yDoc.destroy();
        return;
      }
      getChildPages();
      setDoc(yDoc);
      setProvider(yProvider);
    })();

    return () => {
      initialized.current = false;
      mounted = false;
    };
  }, [room]);

  if (!doc || !provider) {
    return null;
  }

  return (
    <div className="min-h-screen  w-full bg-(--background) ">
      {edit && (
        <div className="flex gap-2 items-center justify-end pr-9">
          <button
            onClick={() => setOnTranslateClick((prev) => !prev)}
            className="flex items-center border gap-1 px-3 py-1 text-sm font-medium rounded-md text-(--color-neutral-content) hover:bg-(--color-base-200) transition"
          >
            <Languages size={15} /> Translate
          </button>
          <button
            onClick={() => setOnChatAI((prev) => !prev)}
            className="flex items-center border gap-1 px-3 py-1 text-sm font-medium rounded-md text-(--color-neutral-content) hover:bg-(--color-base-200) transition"
          >
            <BotIcon size={15} /> Chat To AI
          </button>
          {/*  Translate modal */}
          {onTranslateClick && (
            <Translate setUI={setOnTranslateClick} doc={doc} />
          )}

          {onChatAI && <AIChat doc={doc} setUI={setOnChatAI} />}
        </div>
      )}
      <BlockNote doc={doc} provider={provider} edit={edit} />

      {childPages.length > 0 && (
        <div className="mt-4  pl-11 py-5 ">
          <div className="space-y-1">
            {childPages.map((child) => (
              <button
                key={child.$id}
                className="flex items-center gap-3 w-full px-2 py-2 rounded-lg
                     hover:bg-accent hover:text-accent-foreground transition"
                onClick={() => router.push(`/page/${child.$id}`)}
              >
                {child.logoUrl ? (
                  <Image
                    src={child.logoUrl}
                    alt="Page Image"
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <StickyNote color="#63A1C0" size={20} />
                )}

                <span className="text-sm font-medium truncate hover:text-(--color-base-content) cursor-pointer">
                  {child.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
