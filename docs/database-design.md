# Database Design


## Database Overview

The application uses PostgreSQL as the primary relational database.

The database is responsible for storing:

- User information
- Project information
- Project membership and permissions
- Document metadata

Uploaded files themselves will not be stored directly in PostgreSQL.

Only file information and AWS S3 locations will be stored in the database.

The actual files will be stored in AWS S3 because object storage is more suitable for handling uploaded documents.


# Tables


## Users Table


### Purpose

Stores registered user accounts.


### Columns

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| email | String | Unique user email |
| password_hash | String | Encrypted password |
| created_at | Timestamp | Account creation date |
| updated_at | Timestamp | Last update date |


### Relationships

A user can:

- Own multiple projects
- Participate in multiple projects
- Upload documents



## Projects Table


### Purpose

Stores project information created by users.


### Columns

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| name | String | Project name |
| description | Text | Project description |
| owner_id | Integer | User who owns the project |
| created_at | Timestamp | Creation date |
| updated_at | Timestamp | Last update date |


### Relationships

A project:

- Has one owner
- Can have multiple members
- Can contain multiple documents



## Project Members Table


### Purpose

Stores the relationship between users and projects.

This table controls project access and user permissions.


### Columns

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| user_id | Integer | Related user |
| project_id | Integer | Related project |
| role | Enum | Owner or Participant |
| created_at | Timestamp | Access creation date |


### Roles

Possible project roles:

- Owner
- Participant


### Relationships

A user can belong to many projects.

A project can have many users.

This creates a many-to-many relationship between users and projects.



## Documents Table


### Purpose

Stores information about uploaded project documents.


### Columns

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| project_id | Integer | Related project |
| uploaded_by | Integer | User who uploaded the document |
| filename | String | Original filename |
| file_url | String | AWS S3 location |
| file_type | String | PDF or DOCX |
| created_at | Timestamp | Upload date |
| updated_at | Timestamp | Last update date |


### Relationships

A document:

- Belongs to one project
- Is uploaded by one user



# Database Relationships


## User → Project

One user can create many projects.

Relationship:


User 1 ---- N Project


The connection is created using:


projects.owner_id → users.id




## User ↔ Project

Users can participate in many projects.

Projects can have many users.

Relationship:


User N ---- N Project


Implemented using:


Project Members table




## Project → Document

One project can contain many documents.

Relationship:


Project 1 ---- N Document




# Foreign Key Summary


| Foreign Key | References |
|---|---|
| projects.owner_id | users.id |
| project_members.user_id | users.id |
| project_members.project_id | projects.id |
| documents.project_id | projects.id |
| documents.uploaded_by | users.id |



# Database Design Summary

The database consists of four main tables:

1. Users
2. Projects
3. Project Members
4. Documents


The design supports:

- User authentication
- Project ownership
- Project collaboration
- Role-based authorization
- Document management
- AWS S3 file storage