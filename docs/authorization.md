# Authorization Rules

## Authentication vs Authorization

Authentication checks who the user is.

Authorization checks what the user is allowed to do.


## Roles

### Owner

The owner can:

- Create projects
- View projects
- Edit projects
- Delete projects
- Invite users
- Upload documents
- Download documents
- Replace documents
- Delete documents


### Participant

The participant can:

- View shared projects
- Edit project information
- Upload documents
- Download documents
- Replace documents

The participant cannot:

- Delete projects
- Invite users


## Permission Matrix

| Action | Owner | Participant |
|---|---|---|
| Create project | Yes | No |
| View project | Yes | Yes |
| Edit project | Yes | Yes |
| Delete project | Yes | No |
| Invite users | Yes | No |
| Upload document | Yes | Yes |
| Download document | Yes | Yes |
| Replace document | Yes | Yes |
| Delete document | Yes | No |


## Authorization Rules

- A user must be authenticated before accessing protected endpoints.
- A user can access only projects they own or participate in.
- Only the owner can delete a project.
- Only the owner can invite another user.
- Participants can view and edit shared projects.
- The backend must check permissions for every protected request.


## HTTP Responses

- `401 Unauthorized`: user is not logged in or token is invalid.
- `403 Forbidden`: user is logged in but lacks permission.
- `404 Not Found`: project or document does not exist.


## Summary

Authorization will use the `project_members` table and the user's role to decide whether an action is allowed.