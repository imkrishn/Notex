import { ReactNode } from "react";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import Spinner from "./Spinner";
import LiveCursorPointer from "./LiveCursorPointer";
import { LiveList } from "@liveblocks/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function Room({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}) {
  return (
    <div className="w-full h-full">
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
        }}
        initialStorage={{
          document: new LiveList<any>([]),
        }}
      >
        <ClientSideSuspense
          fallback={
            <div className="flex items-center justify-center mt-7 w-full">
              <Spinner size={40} color="#4e91df" />
            </div>
          }
        >
          <LiveCursorPointer>{children}</LiveCursorPointer>
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );
}
