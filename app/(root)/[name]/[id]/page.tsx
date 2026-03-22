"use client";

import { usePathname } from "next/navigation";
import React from "react";

const Page = () => {
  const pathname = usePathname();
  const params = pathname.split("/");
  const pageId = params[2];
  const pageName = params[1];

  return <div className="h-full w-full overflow-y-auto overflow-x-clip"></div>;
};

export default Page;
