"use client";

import TasksPage from "@/components/TasksPage";
import { useState } from "react";

export default function TasksRoute() {
  const [tasks, setTasks] = useState([
    { id: 1, name: "Resolver exercícios", subject: "Cálculo", dueDate: "24 Dez", completed: false },
    { id: 2, name: "Preparar apresentação", subject: "Programação", dueDate: "28 Dez", completed: true },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return <TasksPage tasks={tasks} onToggleTask={toggleTask} />;
}
