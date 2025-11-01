// This file contains constant values used throughout the application

export const UserRolesEnum = {
ADMIN: "admin",
PROJECT_ADMIN: "project_admin",
MEMBER : "member"
}

export const AvailableUserRole = Object.values(UserRolesEnum); // ["admin", "project_admin", "member"] Trough this line we can get all the values of the enum as an array

export const TaskStatusEnum = {
TODO: "todo",
IN_PROGRESS: "in_progress",
DONE: "done"
}

export const AvailableTaskStatues = Object.values(TaskStatusEnum); // ["todo", "in_progress", "done"] Trough this line we can get all the values of the enum as an array 