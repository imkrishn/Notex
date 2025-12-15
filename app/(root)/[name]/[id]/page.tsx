"use client";

import Create from "@/components/Create";
import Home from "@/components/Home";
import SharedWithMe from "@/components/SharedWithMe";
import { LiveblocksProvider } from "@liveblocks/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-ui/styles/dark/media-query.css";
import { usePathname } from "next/navigation";
import React from "react";

const Page = () => {
  const pathname = usePathname();
  const params = pathname.split("/");
  const pageId = params[2];
  const pageName = params[1];

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-clip">
      {pageName === "home" && <Home />}
      {pageName === "page" && (
        <LiveblocksProvider
          throttle={16}
          authEndpoint={`/api/liveblocks-auth?pageId=${pageId}`}
        >
          <Create pageId={pageId} edit={true} />
        </LiveblocksProvider>
      )}

      {pageName === "shared" && <SharedWithMe />}
    </div>
  );
};

export default Page;
