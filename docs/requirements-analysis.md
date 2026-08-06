# Project Requirements Analysis

## Project Name

Project Management Dashboard


## Project Goal

The goal of this project is to develop a web-based project management dashboard that enables users to create, manage, and collaborate on projects.

The application provides secure authentication, role-based authorization, document management, and project sharing in a production-style environment.

Users should be able to:

- Create projects
- Edit project information
- Upload and manage documents
- Share projects with other users
- Control access using roles and permissions


## Planned Technology Stack

### Backend

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Infrastructure

- Docker
- AWS S3
- AWS Lambda
- GitHub Actions / GitLab CI


# User Types

The system has two types of users:

## Owner

The owner is the user who creates a project.

Responsibilities:

- Manage project information
- Edit project details
- Delete projects
- Invite users to projects
- Manage project documents


## Participant

A participant is a user who receives access to a project from an owner.

Responsibilities:

- View project information
- Edit project information
- Access project documents
- Upload documents

Restrictions:

- Cannot delete projects
- Cannot invite users


# Functional Requirements


## Authentication

Users should be able to:

- Register a new account
- Login using their credentials
- Receive a JWT authentication token
- Access protected resources
- Use token expiration for security


## Authorization

The system should implement role-based authorization.

Permissions:

### Owner

- Full access to owned projects
- Delete projects
- Invite users
- Manage documents


### Participant

- View projects
- Edit projects
- Access documents
- Upload documents

Participants cannot:

- Delete projects
- Invite users


## Project Management

Users should be able to:

- Create projects
- View projects
- View project details
- Update project information
- Delete projects


Project information includes:

- Project name
- Project description


## Document Management

Users should be able to:

- Upload documents
- Download documents
- Replace documents
- Delete documents


Supported file types:

- PDF
- DOCX


Uploaded documents should be stored using AWS S3.


## Project Sharing

Owners should be able to:

- Invite registered users
- Give users access to projects
- Manage project collaboration


# Non-Functional Requirements

The application should:

- Use JWT authentication.
- Implement role-based authorization.
- Return JSON responses.
- Use proper HTTP status codes.
- Validate requests using Pydantic.
- Use PostgreSQL as the relational database.
- Use Docker for containerization.
- Store uploaded files using AWS S3.
- Provide clean backend architecture.
- Include error handling and logging.
- Support automated testing.
- Be deployable to AWS.


# Main Entities

The system contains the following main entities:


## User

Represents a registered user of the application.

A user can:

- Create projects
- Participate in shared projects
- Upload documents


## Project

Represents a project created by a user.

A project contains:

- Name
- Description
- Owner
- Members
- Documents


## Project Member

Represents the relationship between users and projects.

It stores:

- Which user has access to a project
- The user's role inside the project


Possible roles:

- Owner
- Participant


## Document

Represents a file uploaded to a project.

A document contains:

- File name
- File location
- Upload information
- Related project


# System Relationships

The main relationships are:

- A user can create multiple projects.
- A project belongs to one owner.
- A project can have multiple members.
- A user can participate in multiple projects.
- A project can contain multiple documents.
- A document belongs to one project.


# Summary

This document defines the functional requirements, technical requirements, users, and main components of the Project Management Dashboard.

It will serve as the foundation for:

- Database design
- Backend architecture
- API development
- Frontend implementation
- Deployment planning