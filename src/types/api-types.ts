// API Types based on API.md documentation

// ============ Auth ============
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    token: string;
}

// ============ User ============
export interface User {
    id: string;
    name: string;
    email: string;
}

// ============ Workspace ============
export type WorkspaceType = "CLASS" | "PERSONAL";

export interface Workspace {
    id: string;
    name: string;
    description: string | null;
    type: WorkspaceType;
    votingEnabled: boolean;
    owner: User;
    _count: {
        members: number;
        tasks: number;
        events: number;
    };
}

export interface CreateWorkspaceRequest {
    name: string;
    description?: string;
    type?: WorkspaceType;
    votingEnabled?: boolean;
}

// ============ Member ============
export type MemberRole = "ADMIN" | "USER";

export interface Member {
    id: string;
    role: MemberRole;
    joinedAt: string;
    user: User;
}

export interface MembersResponse {
    members: Member[];
    ownerId: string;
}

// ============ Group ============
export interface Group {
    id: string;
    name: string;
    members: Member[];
    _count?: {
        members: number;
    };
}

export interface CreateGroupRequest {
    name: string;
    memberIds?: string[];
}

// ============ Task ============
export type TaskType = "TRABALHO" | "TESTE" | "PROJETO" | "TAREFA";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    type: TaskType;
    dueDate: string;
    disciplineId: string | null;
    discipline?: Discipline;
    isCompleted: boolean;
    completedAt: string | null;
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
    type: TaskType;
    dueDate: string;
    disciplineId?: string;
}

export interface TasksQueryParams {
    type?: TaskType;
    disciplineId?: string;
    dueFrom?: string;
    dueTo?: string;
    completed?: boolean;
}

// ============ Event ============
export interface Event {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    location: string | null;
    createdBy: User;
}

export interface CreateEventRequest {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    location?: string;
}

// ============ Discipline ============
export interface Discipline {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
}

export interface CreateDisciplineRequest {
    name: string;
    description?: string;
    color?: string;
}

// ============ Calendar ============
export type CalendarItemType = "event" | "task";

export interface CalendarItem {
    id: string;
    type: CalendarItemType;
    title: string;
    date: string;
    description?: string;
    location?: string;
    taskType?: TaskType;
    discipline?: Discipline;
}

export interface CalendarResponse {
    items: CalendarItem[];
    eventCount: number;
    taskCount: number;
}

// ============ Notification ============
export interface Notification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    unreadCount: number;
}

// ============ Attendance ============
export type AttendanceStatus = "PENDING" | "PRESENT" | "ABSENT" | "EXCUSED";

export interface Attendance {
    id: string;
    status: AttendanceStatus;
    user: User;
}

export interface AttendanceSummary {
    total: number;
    present: number;
    absent: number;
    excused: number;
    pending: number;
}

// ============ Vote ============
export interface VoteOption {
    id: string;
    text: string;
    _count: { responses: number };
    responses: { user: User }[];
}

export interface Vote {
    id: string;
    title: string;
    description: string | null;
    expiresAt: string | null;
    options: VoteOption[];
}

export interface CreateVoteRequest {
    title: string;
    description?: string;
    options: string[];
    expiresAt?: string;
}

// ============ API Error ============
export interface ApiError {
    error: string;
    details?: string;
}
