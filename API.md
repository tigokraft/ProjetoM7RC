# API Documentation

Complete REST API reference for the Class Management System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints (except auth) require a valid JWT token in the `auth_token` cookie.

---

## Auth Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Min 5 characters |
| email | string | ✅ | Valid email |
| password | string | ✅ | Min 8 characters |

**Response:** `201 Created`
```json
{
  "message": "User created",
  "token": "jwt_token_here"
}
```

---

### Login
```http
POST /api/auth/login
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| email | string | ✅ |
| password | string | ✅ |

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "jwt_token_here"
}
```

---

### Forgot Password
```http
POST /api/auth/forgotPassword
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| email | string | ✅ |

**Response:** `200 OK`
```json
{
  "message": "Password reset request created",
  "resetId": "reset_id_here"
}
```

---

### Reset Password
```http
POST /api/auth/forgotPassword/{id}
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| password | string | ✅ |
| confirmPassword | string | ✅ |

---

## Workspaces

### List Workspaces
```http
GET /api/workspaces
```

**Response:**
```json
{
  "workspaces": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null",
      "type": "CLASS | PERSONAL",
      "votingEnabled": "boolean",
      "owner": { "id": "string", "name": "string", "email": "string" },
      "_count": { "members": 0, "tasks": 0, "events": 0 }
    }
  ]
}
```

---

### Create Workspace
```http
POST /api/workspaces
```

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | string | ✅ | - | 1-100 chars |
| description | string | ❌ | null | Max 500 chars |
| type | enum | ❌ | CLASS | `CLASS` or `PERSONAL` |
| votingEnabled | boolean | ❌ | false | Enable voting feature |

**Response:** `201 Created`

---

### Get Workspace
```http
GET /api/workspaces/{id}
```

**Response:** Full workspace with members and counts.

---

### Update Workspace
```http
PUT /api/workspaces/{id}
```

**Permissions:** Admin only

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| name | string | ❌ |
| description | string | ❌ |
| votingEnabled | boolean | ❌ |

---

### Delete Workspace
```http
DELETE /api/workspaces/{id}
```

**Permissions:** Owner only

---

## Members

### List Members
```http
GET /api/workspaces/{id}/members
```

**Response:**
```json
{
  "members": [
    {
      "id": "string",
      "role": "ADMIN | USER",
      "joinedAt": "datetime",
      "user": { "id": "string", "name": "string", "email": "string" }
    }
  ],
  "ownerId": "string"
}
```

---

### Add Member
```http
POST /api/workspaces/{id}/members
```

**Permissions:** Admin only

**Request Body:**
| Field | Type | Required | Default |
|-------|------|----------|---------|
| email | string | ✅ | - |
| role | enum | ❌ | USER |

---

### Update Member Role
```http
PUT /api/workspaces/{id}/members/{memberId}
```

**Permissions:** Admin only

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| role | enum | ✅ | `ADMIN` or `USER` |

---

### Remove Member
```http
DELETE /api/workspaces/{id}/members/{memberId}
```

**Permissions:** Admin or self-removal

---

## Groups

### List Groups
```http
GET /api/workspaces/{id}/groups
```

---

### Create Group
```http
POST /api/workspaces/{id}/groups
```

**Permissions:** Admin only

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | 1-100 chars |
| memberIds | string[] | ❌ | Initial member IDs |

---

### Auto-Generate Groups
```http
POST /api/workspaces/{id}/groups/auto
```

**Permissions:** Admin only

Randomly distributes workspace members into groups.

**Request Body:**
| Field | Type | Required | Default |
|-------|------|----------|---------|
| groupCount | number | ✅ | - | 2-50 |
| groupNamePrefix | string | ❌ | "Grupo" |

---

### Get Group
```http
GET /api/workspaces/{id}/groups/{groupId}
```

---

### Update Group
```http
PUT /api/workspaces/{id}/groups/{groupId}
```

**Request Body:**
| Field | Type |
|-------|------|
| name | string |

---

### Delete Group
```http
DELETE /api/workspaces/{id}/groups/{groupId}
```

---

### Add Member to Group
```http
POST /api/workspaces/{id}/groups/{groupId}
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| userId | string | ✅ |

---

## Voting

### List Votes
```http
GET /api/workspaces/{id}/votes
```

**Note:** Requires `votingEnabled: true` on workspace.

---

### Create Vote
```http
POST /api/workspaces/{id}/votes
```

**Permissions:** Admin only

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✅ | 1-200 chars |
| description | string | ❌ | Max 1000 chars |
| options | string[] | ✅ | 2-10 options |
| expiresAt | datetime | ❌ | ISO 8601 format |

---

### Get Vote Results
```http
GET /api/workspaces/{id}/votes/{voteId}
```

**Response:**
```json
{
  "vote": {
    "id": "string",
    "title": "string",
    "options": [
      {
        "id": "string",
        "text": "string",
        "_count": { "responses": 5 },
        "responses": [{ "user": { "id": "string", "name": "string" } }]
      }
    ]
  },
  "userVotedOptionId": "string | null"
}
```

---

### Submit Vote Response
```http
POST /api/workspaces/{id}/votes/{voteId}/respond
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| optionId | string | ✅ |

**Note:** Users can change their vote by calling again.

---

### Delete Vote
```http
DELETE /api/workspaces/{id}/votes/{voteId}
```

**Permissions:** Admin only

---

## Events

### List Events
```http
GET /api/workspaces/{id}/events
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| startFrom | datetime | Filter events starting after |
| startTo | datetime | Filter events starting before |

---

### Create Event
```http
POST /api/workspaces/{id}/events
```

**Permissions:** Admin only

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✅ | 1-200 chars |
| description | string | ❌ | Max 2000 chars |
| startDate | datetime | ✅ | ISO 8601 |
| endDate | datetime | ❌ | Must be after startDate |
| location | string | ❌ | Max 500 chars |

---

### Get Event
```http
GET /api/workspaces/{id}/events/{eventId}
```

---

### Update Event
```http
PUT /api/workspaces/{id}/events/{eventId}
```

---

### Delete Event
```http
DELETE /api/workspaces/{id}/events/{eventId}
```

---

## Attendance

### Get Attendance List
```http
GET /api/workspaces/{id}/events/{eventId}/attendance
```

**Response:**
```json
{
  "attendances": [...],
  "summary": {
    "total": 30,
    "present": 25,
    "absent": 3,
    "excused": 2,
    "pending": 0
  },
  "eventTitle": "string"
}
```

---

### Mark Attendance
```http
POST /api/workspaces/{id}/events/{eventId}/attendance
```

**Single (self):**
| Field | Type | Required |
|-------|------|----------|
| status | enum | ✅ | `PENDING`, `PRESENT`, `ABSENT`, `EXCUSED` |

**Bulk (admin only):**
```json
{
  "attendances": [
    { "userId": "string", "status": "PRESENT" }
  ]
}
```

---

## Disciplines

### List Disciplines
```http
GET /api/workspaces/{id}/disciplines
```

---

### Create Discipline
```http
POST /api/workspaces/{id}/disciplines
```

**Permissions:** Admin only

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | 1-100 chars |
| description | string | ❌ | Max 500 chars |
| color | string | ❌ | Hex color (e.g., `#FF5733`) |

---

### Get Discipline
```http
GET /api/workspaces/{id}/disciplines/{disciplineId}
```

---

### Update Discipline
```http
PUT /api/workspaces/{id}/disciplines/{disciplineId}
```

---

### Delete Discipline
```http
DELETE /api/workspaces/{id}/disciplines/{disciplineId}
```

---

## Tasks

### List Tasks
```http
GET /api/workspaces/{id}/tasks
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| type | enum | `TRABALHO`, `TESTE`, `PROJETO`, `TAREFA` |
| disciplineId | string | Filter by discipline |
| dueFrom | datetime | Due date from |
| dueTo | datetime | Due date to |
| completed | boolean | `true` or `false` |

**Response includes:** `isCompleted` and `completedAt` for current user.

---

### Create Task
```http
POST /api/workspaces/{id}/tasks
```

**Permissions:** Admin only

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✅ | 1-200 chars |
| description | string | ❌ | Max 2000 chars |
| type | enum | ✅ | `TRABALHO`, `TESTE`, `PROJETO`, `TAREFA` |
| dueDate | datetime | ✅ | ISO 8601 |
| disciplineId | string | ❌ | Link to discipline |

---

### Get Task
```http
GET /api/workspaces/{id}/tasks/{taskId}
```

---

### Update Task
```http
PUT /api/workspaces/{id}/tasks/{taskId}
```

---

### Delete Task
```http
DELETE /api/workspaces/{id}/tasks/{taskId}
```

---

### Toggle Completion
```http
POST /api/workspaces/{id}/tasks/{taskId}/complete
```

Toggles the current user's completion status.

**Response:**
```json
{
  "message": "Task marked as complete",
  "completed": true,
  "completedAt": "datetime"
}
```

---

## Calendar

### Get Calendar Items
```http
GET /api/workspaces/{id}/calendar
```

Returns combined events and tasks.

**Query Parameters:**
| Param | Type |
|-------|------|
| startDate | datetime |
| endDate | datetime |

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "type": "event | task",
      "title": "string",
      "date": "datetime",
      ...
    }
  ],
  "eventCount": 5,
  "taskCount": 10
}
```

---

## Notifications

### List Notifications
```http
GET /api/notifications
```

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| unreadOnly | boolean | false |
| limit | number | 50 |

**Response:**
```json
{
  "notifications": [...],
  "unreadCount": 3
}
```

---

### Mark All as Read
```http
POST /api/notifications
```

---

### Mark Single as Read
```http
PUT /api/notifications/{id}
```

---

### Delete Notification
```http
DELETE /api/notifications/{id}
```

---

## User Settings

### Get Notification Preferences
```http
GET /api/user/settings
```

**Response:**
```json
{
  "preferences": {
    "emailEnabled": true,
    "smsEnabled": false,
    "pushEnabled": true,
    "reminderDaysBefore": 1,
    "reminderOnDay": true
  }
}
```

---

### Update Notification Preferences
```http
PUT /api/user/settings
```

**Request Body:**
| Field | Type | Default |
|-------|------|---------|
| emailEnabled | boolean | true |
| smsEnabled | boolean | false |
| pushEnabled | boolean | true |
| reminderDaysBefore | number | 1 | (0-30) |
| reminderOnDay | boolean | true |

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Optional details"
}
```

**Common Status Codes:**
| Code | Meaning |
|------|---------|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 500 | Internal Server Error |
