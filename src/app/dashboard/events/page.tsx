"use client";

import EventsPage from "@/components/EventsPage";
import { useState, useEffect } from "react";

export default function EventsRoute() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem("activeWorkspaceId");
    setWorkspaceId(savedWorkspaceId);
  }, []);

  return <EventsPage workspaceId={workspaceId} />;
}
