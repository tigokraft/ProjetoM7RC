"use client";

import { useState, useEffect, useCallback } from 'react';
import { workspacesAPI, tasksAPI, eventsAPI, disciplinesAPI, groupsAPI, calendarAPI } from '@/lib/api';
import type { Workspace, Task, Event, Discipline, Group, CalendarItem, TaskType } from '@/types/api-types';

// ============ useWorkspaces ============
export function useWorkspaces() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkspaces = useCallback(async () => {
        try {
            setLoading(true);
            const data = await workspacesAPI.list();
            setWorkspaces(data.workspaces);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar workspaces');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    return { workspaces, loading, error, refetch: fetchWorkspaces };
}

// ============ useTasks ============
export function useTasks(workspaceId: string | null, filters?: { type?: TaskType; completed?: boolean }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        if (!workspaceId) {
            setTasks([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await tasksAPI.list(workspaceId, filters);
            setTasks(data.tasks);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
        } finally {
            setLoading(false);
        }
    }, [workspaceId, filters?.type, filters?.completed]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const toggleTask = async (taskId: string) => {
        if (!workspaceId) return;
        try {
            await tasksAPI.toggleComplete(workspaceId, taskId);
            await fetchTasks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
        }
    };

    return { tasks, loading, error, refetch: fetchTasks, toggleTask };
}

// ============ useEvents ============
export function useEvents(workspaceId: string | null) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!workspaceId) {
            setEvents([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await eventsAPI.list(workspaceId);
            setEvents(data.events);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, loading, error, refetch: fetchEvents };
}

// ============ useDisciplines ============
export function useDisciplines(workspaceId: string | null) {
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDisciplines = useCallback(async () => {
        if (!workspaceId) {
            setDisciplines([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await disciplinesAPI.list(workspaceId);
            setDisciplines(data.disciplines);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar disciplinas');
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchDisciplines();
    }, [fetchDisciplines]);

    return { disciplines, loading, error, refetch: fetchDisciplines };
}

// ============ useGroups ============
export function useGroups(workspaceId: string | null) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = useCallback(async () => {
        if (!workspaceId) {
            setGroups([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await groupsAPI.list(workspaceId);
            setGroups(data.groups);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar grupos');
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    return { groups, loading, error, refetch: fetchGroups };
}

// ============ useCalendar ============
export function useCalendar(workspaceId: string | null, startDate?: string, endDate?: string) {
    const [items, setItems] = useState<CalendarItem[]>([]);
    const [eventCount, setEventCount] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCalendar = useCallback(async () => {
        if (!workspaceId) {
            setItems([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await calendarAPI.getItems(workspaceId, { startDate, endDate });
            setItems(data.items);
            setEventCount(data.eventCount);
            setTaskCount(data.taskCount);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar calendário');
        } finally {
            setLoading(false);
        }
    }, [workspaceId, startDate, endDate]);

    useEffect(() => {
        fetchCalendar();
    }, [fetchCalendar]);

    return { items, eventCount, taskCount, loading, error, refetch: fetchCalendar };
}
