# Database Design

This project uses three main tables:

1. `users`
   Stores login credentials and role information.
2. `students`
   Stores student profile data and links each student to one user account.
3. `teachers`
   Stores teacher profile data and links each teacher to one user account.
4. `login_logs`
   Stores successful login history for audit/reporting.

## Relationship

- `students.user_id -> users.id`
- `teachers.user_id -> users.id`
- One `users` row can map to one `students` row for student accounts.
- One `users` row can map to one `teachers` row for teacher accounts.
- Admin users exist only in `users`.

## Files

- `schema-h2.sql`: schema matching the default local H2 setup used by the app.
- `schema-mysql.sql`: schema for MySQL deployment.
- `seed-mysql.sql`: optional admin seed data for MySQL.

## Current App Behavior

- Student signup writes to `users` and `students`.
- Teacher signup writes to `users` and `teachers`.
- Login writes to `login_logs`.
- Admin delete removes the student and linked user account.
- Admin can also remove teacher accounts and their linked user rows.
- The app currently runs by default on H2 file storage at `data/student-management-system`.

## MySQL Setup

1. Create the schema using `database/schema-mysql.sql`.
2. Optionally seed the admin user using `database/seed-mysql.sql`.
3. Update the password in [application-mysql.properties](/C:/Users/Acer/IdeaProjects/student-management-system/src/main/resources/application-mysql.properties:1).
4. Run the app with the MySQL profile values, or copy those properties into `application.properties`.
