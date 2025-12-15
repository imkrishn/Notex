"use client";

import Create from "@/components/Create";
import { LiveblocksProvider } from "@liveblocks/react";
import { usePathname } from "next/navigation";
import React from "react";

const Main = () => {
  const pathname = usePathname();
  const params = pathname.split("/");
  const pageId = params[2];
  return (
    <div>
      <LiveblocksProvider
        throttle={16}
        authEndpoint={`/api/liveblocks-public?pageId=${pageId}`}
      >
        <Create pageId={pageId} edit={false} />
      </LiveblocksProvider>
    </div>
  );
};

export default Main;
