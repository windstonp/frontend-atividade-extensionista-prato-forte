"use client";

import { useParams } from "next/navigation";
import { ChatTela } from "@/features/nutri/components/ChatTela";

export default function Chat() {
  const { conversa } = useParams<{ conversa: string }>();
  return <ChatTela id={Number(conversa)} />;
}
