// API Client for making authenticated requests

const API_BASE = '/api';

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    // Build URL with query params
    let url = `${API_BASE}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        },
        credentials: 'include', // Include cookies for auth
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API Error: ${response.status}`);
    }

    return response.json();
}

// ============ Auth ============
export const authAPI = {
    login: (email: string, password: string) =>
        fetchAPI<{ message: string; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (name: string, email: string, password: string) =>
        fetchAPI<{ message: string; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        }),

    forgotPassword: (email: string) =>
        fetchAPI<{ message: string; resetId: string }>('/auth/forgotPassword', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
};

// ============ Workspaces ============
import type {
    Workspace, CreateWorkspaceRequest,
    Member, MembersResponse,
    Group, CreateGroupRequest,
    Task, CreateTaskRequest, TasksQueryParams,
    Event, CreateEventRequest,
    Discipline, CreateDisciplineRequest,
    CalendarResponse,
    Vote, CreateVoteRequest
} from '@/types/api-types';

export const workspacesAPI = {
    list: () =>
        fetchAPI<{ workspaces: Workspace[] }>('/workspaces'),

    get: (id: string) =>
        fetchAPI<{ workspace: Workspace }>(`/workspaces/${id}`),

    create: (data: CreateWorkspaceRequest) =>
        fetchAPI<{ workspace: Workspace }>('/workspaces', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<CreateWorkspaceRequest>) =>
        fetchAPI<{ workspace: Workspace }>(`/workspaces/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchAPI<{ message: string }>(`/workspaces/${id}`, { method: 'DELETE' }),
};

// ============ Members ============
export const membersAPI = {
    list: (workspaceId: string) =>
        fetchAPI<MembersResponse>(`/workspaces/${workspaceId}/members`),

    add: (workspaceId: string, email: string, role?: 'ADMIN' | 'USER') =>
        fetchAPI<{ member: Member }>(`/workspaces/${workspaceId}/members`, {
            method: 'POST',
            body: JSON.stringify({ email, role }),
        }),

    updateRole: (workspaceId: string, memberId: string, role: 'ADMIN' | 'USER') =>
        fetchAPI<{ member: Member }>(`/workspaces/${workspaceId}/members/${memberId}`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        }),

    remove: (workspaceId: string, memberId: string) =>
        fetchAPI<{ message: string }>(`/workspaces/${workspaceId}/members/${memberId}`, {
            method: 'DELETE',
        }),
};

// ============ Groups ============
export const groupsAPI = {
    list: (workspaceId: string) =>
        fetchAPI<{ groups: Group[] }>(`/workspaces/${workspaceId}/groups`),

    get: (workspaceId: string, groupId: string) =>
        fetchAPI<{ group: Group }>(`/workspaces/${workspaceId}/groups/${groupId}`),

    create: (workspaceId: string, data: CreateGroupRequest) =>
        fetchAPI<{ group: Group }>(`/workspaces/${workspaceId}/groups`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    autoGenerate: (workspaceId: string, groupCount: number, groupNamePrefix?: string) =>
        fetchAPI<{ groups: Group[] }>(`/workspaces/${workspaceId}/groups/auto`, {
            method: 'POST',
            body: JSON.stringify({ groupCount, groupNamePrefix }),
        }),

    update: (workspaceId: string, groupId: string, name: string) =>
        fetchAPI<{ group: Group }>(`/workspaces/${workspaceId}/groups/${groupId}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        }),

    delete: (workspaceId: string, groupId: string) =>
        fetchAPI<{ message: string }>(`/workspaces/${workspaceId}/groups/${groupId}`, {
            method: 'DELETE',
        }),

    addMember: (workspaceId: string, groupId: string, userId: string) =>
        fetchAPI<{ group: Group }>(`/workspaces/${workspaceId}/groups/${groupId}`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }),
};

// ============ Tasks ============
export const tasksAPI = {
    list: (workspaceId: string, params?: TasksQueryParams) =>
        fetchAPI<{ tasks: Task[] }>(`/workspaces/${workspaceId}/tasks`, {
            params: params as unknown as Record<string, string | number | boolean | undefined>
        }),

    get: (workspaceId: string, taskId: string) =>
        fetchAPI<{ task: Task }>(`/workspaces/${workspaceId}/tasks/${taskId}`),

    create: (workspaceId: string, data: CreateTaskRequest) =>
        fetchAPI<{ task: Task }>(`/workspaces/${workspaceId}/tasks`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (workspaceId: string, taskId: string, data: Partial<CreateTaskRequest>) =>
        fetchAPI<{ task: Task }>(`/workspaces/${workspaceId}/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (workspaceId: string, taskId: string) =>
        fetchAPI<{ message: string }>(`/workspaces/${workspaceId}/tasks/${taskId}`, {
            method: 'DELETE',
        }),

    toggleComplete: (workspaceId: string, taskId: string) =>
        fetchAPI<{ message: string; completed: boolean; completedAt: string | null }>(
            `/workspaces/${workspaceId}/tasks/${taskId}/complete`,
            { method: 'POST' }
        ),
};

// ============ Events ============
export const eventsAPI = {
    list: (workspaceId: string, params?: { startFrom?: string; startTo?: string }) =>
        fetchAPI<{ events: Event[] }>(`/workspaces/${workspaceId}/events`, { params }),

    get: (workspaceId: string, eventId: string) =>
        fetchAPI<{ event: Event }>(`/workspaces/${workspaceId}/events/${eventId}`),

    create: (workspaceId: string, data: CreateEventRequest) =>
        fetchAPI<{ event: Event }>(`/workspaces/${workspaceId}/events`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (workspaceId: string, eventId: string, data: Partial<CreateEventRequest>) =>
        fetchAPI<{ event: Event }>(`/workspaces/${workspaceId}/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (workspaceId: string, eventId: string) =>
        fetchAPI<{ message: string }>(`/workspaces/${workspaceId}/events/${eventId}`, {
            method: 'DELETE',
        }),
};

// ============ Disciplines ============
export const disciplinesAPI = {
    list: (workspaceId: string) =>
        fetchAPI<{ disciplines: Discipline[] }>(`/workspaces/${workspaceId}/disciplines`),

    get: (workspaceId: string, disciplineId: string) =>
        fetchAPI<{ discipline: Discipline }>(`/workspaces/${workspaceId}/disciplines/${disciplineId}`),

    create: (workspaceId: string, data: CreateDisciplineRequest) =>
        fetchAPI<{ discipline: Discipline }>(`/workspaces/${workspaceId}/disciplines`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (workspaceId: string, disciplineId: string, data: Partial<CreateDisciplineRequest>) =>
        fetchAPI<{ discipline: Discipline }>(`/workspaces/${workspaceId}/disciplines/${disciplineId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (workspaceId: string, disciplineId: string) =>
        fetchAPI<{ message: string }>(`/workspaces/${workspaceId}/disciplines/${disciplineId}`, {
            method: 'DELETE',
        }),
};

// ============ Calendar ============
export const calendarAPI = {
    getItems: (workspaceId: string, params?: { startDate?: string; endDate?: string }) =>
        fetchAPI<CalendarResponse>(`/workspaces/${workspaceId}/calendar`, { params }),
};

// ============ Notifications ============
import type { NotificationsResponse } from '@/types/api-types';

export const notificationsAPI = {
    list: (params?: { unreadOnly?: boolean; limit?: number }) =>
        fetchAPI<NotificationsResponse>('/notifications', { params }),

    markAllRead: () =>
        fetchAPI<{ message: string }>('/notifications', { method: 'POST' }),

    markRead: (id: string) =>
        fetchAPI<{ message: string }>(`/notifications/${id}`, { method: 'PUT' }),

    delete: (id: string) =>
        fetchAPI<{ message: string }>(`/notifications/${id}`, { method: 'DELETE' }),
};

// ============ Votes ============
export const votesAPI = {
    list: (workspaceId: string) =>
        fetchAPI<{ votes: Vote[] }>(`/workspaces/${workspaceId}/votes`),

    get: (workspaceId: string, voteId: string) =>
        fetchAPI<{ vote: Vote; userVotedOptionId: string | null }>(
            `/workspaces/${workspaceId}/votes/${voteId}`
        ),

    create: (workspaceId: string, data: CreateVoteRequest) =>
        fetchAPI<{ vote: Vote }>(`/workspaces/${workspaceId}/votes`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    respond: (workspaceId: string, voteId: string, optionId: string) =>
        fetchAPI<{ message: string }>(`/workspaces/${workspaceId}/votes/${voteId}/respond`, {
            method: 'POST',
            body: JSON.stringify({ optionId }),
        }),

    delete: (workspaceId: string, voteId: string) =>
        fetchAPI<{ message: string }>(`/workspaces/${workspaceId}/votes/${voteId}`, {
            method: 'DELETE',
        }),
};
