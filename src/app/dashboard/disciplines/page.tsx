"use client";

import DisciplinesPage from "@/components/DisciplinesPage";
import { useState } from "react";

export default function DisciplinesRoute() {
  const [disciplines, setDisciplines] = useState([
    { id: 1, name: "Cálculo Avançado", color: "#1E40AF", icon: "functions" },
    { id: 2, name: "Química Orgânica", color: "#059669", icon: "science" },
  ]);

  const [workspaces, setWorkspaces] = useState([
    { id: 1, name: "1º Semestre" },
  ]);

  return <DisciplinesPage disciplines={disciplines} workspaces={workspaces} />;
}
