# Backend Architecture

## Overview

The backend will be built using Python and FastAPI.

The backend is responsible for:

- User registration and login
- JWT authentication
- Role-based authorization
- Project management
- Document management
- Project sharing
- PostgreSQL database access
- AWS S3 integration
- Error handling
- Logging
- API validation

The backend will follow a modular structure so that each responsibility is separated into its own folder.


# Planned Folder Structure

```text
backend/
│
├── app/
│   ├── auth/
│   │   ├── dependencies.py
│   │   ├── jwt.py
│   │   └── password.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── logging.py
│   │
│   ├── database/
│   │   ├── base.py
│   │   └── session.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── project_member.py
│   │   └── document.py
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── projects.py
│   │   └── documents.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── project.py
│   │   └── document.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── project_service.py
│   │   ├── document_service.py
│   │   └── permission_service.py
│   │
│   ├── utils/
│   │   └── file_validation.py
│   │
│   └── main.py
│
├── alembic/
├── tests/
├── .env.example
├── Dockerfile
└── requirements.txt
```
# Folder Responsibilities

## app/auth

Contains authentication-related logic.

Responsibilities:

- Password hashing
- Password verification
- JWT token creation
- JWT token validation
- Authentication dependencies

Authentication answers:

> Who is the current user?


## app/core

Contains application-wide configuration.

Responsibilities:

- Environment variable loading
- Database settings
- JWT settings
- AWS settings
- Logging configuration

Sensitive values should be loaded from environment variables instead of being written directly in the source code.


## app/database

Contains PostgreSQL and SQLAlchemy setup.

Responsibilities:

- Create the database engine
- Create database sessions
- Define the SQLAlchemy base model
- Provide the database dependency for FastAPI routes


## app/models

Contains SQLAlchemy database models.

Planned models:

- User
- Project
- ProjectMember
- Document

These models represent the PostgreSQL tables defined in the database design document.


## app/schemas

Contains Pydantic request and response models.

Examples:

- User registration request
- Login request
- Project creation request
- Project response
- Document response

Schemas validate data entering and leaving the API.


## app/routers

Contains FastAPI API endpoints.

Planned routers:

- Authentication routes
- Project routes
- Document routes

Routers should receive HTTP requests and pass business logic to services.


## app/services

Contains application business logic.

Responsibilities:

- Creating and updating projects
- Checking permissions
- Inviting users
- Managing documents
- Communicating with AWS S3

Keeping business logic in services prevents route files from becoming too large.


## app/utils

Contains small reusable helper functions.

Examples:

- File extension validation
- File type validation
- Filename sanitization

Utilities should not contain major business logic.


## tests

Contains automated tests.

Planned test areas:

- Authentication
- Authorization
- Project CRUD
- Document operations
- Project sharing


## alembic

Contains database migration files.

Alembic will be used to:

- Create database tables
- Apply schema changes
- Track database versions


# Request Flow

A typical backend request will follow this flow:

```text
Frontend
   |
   v
FastAPI Router
   |
   v
Authentication and Permission Check
   |
   v
Service Layer
   |
   v
SQLAlchemy
   |
   v
PostgreSQL

# For document operations:
Frontend
   |
   v
Document Router
   |
   v
Document Service
   |
   +----> PostgreSQL
   |
   +----> AWS S3