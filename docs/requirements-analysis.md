# Project Requirements Analysis

## Project Name

Project Management Dashboard


## Project Goal

The goal of this project is to build a project management dashboard
where users can create, manage, share, and collaborate on projects.

Users should be able to:
- Create projects
- Edit project information
- Upload and manage documents
- Share projects with other users
- Control access using roles and permissions

## User Types

The system has two types of users:

### Owner

The user who creates a project.

Responsibilities:
- Manage project information
- Delete projects
- Invite users
- Manage documents


### Participant

A user who receives access to a project.

Responsibilities:
- View project information
- Edit project information
- Access documents

## Main Features

### Authentication

Users can:
- Register
- Login
- Receive JWT token
- Access protected resources


### Project Management

Users can:
- Create projects
- View projects
- Update projects
- Delete projects


### Document Management

Users can:
- Upload documents
- Download documents
- Replace documents
- Delete documents


### Project Sharing

Owners can:
- Invite users
- Give access to projects

## Main Entities

The system contains the following main entities:

1. User
2. Project
3. Project Member
4. Document