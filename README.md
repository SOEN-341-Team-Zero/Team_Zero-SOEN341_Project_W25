# ChatHaven - SOEN 341 Team Zero

## Problem

People lack an efficient group messaging app that allows users to form chat groups and subgroups but also lets them communicate in private one-on-one conversation.

## Solution

ChatHaven is a seamless communication platform designed for efficient and intuitive interaction through text channels and direct messaging. Whether for team collaboration, community engagement, or private conversations, ChatHaven provides an organized space to stay connected.

### Key Features

- **Text Channels for Group Communication**: Users can join predefined channels (e.g., "General," "Project Help," "Social") and send messages visible to all channel participants.
- **Direct Messaging (DM)**: Users can engage in private one-on-one conversations.
- **Role-Based User Permissions**:
  - Admins can create and delete channels and teams, moderate messages, and assign users to channels and teams.
  - Members can send and view messages within assigned channels.
- **User Authentication & Management**: Secure login and registration process.

As the project progresses, additional features will be implemented based on team discussions and innovation efforts.

## Team Members Role & Background

| Name                     | GitHub Name | Student ID | Role                 | Role Description       | Background Description |
| -------------------------| ----------- | ---------- | -------------------- | ---------------------- | -----------------------|
| Achal Patel              | @ac-pate |40227663   | DevOps & CI/CD       | Responsible for setting up and maintaining the CI/CD pipeline, ensuring smooth deployment processes, and automating infrastructure to support development and production environments. | I am a 3rd-year Computer Engineering Co-op student with strong programming skills developed through personal projects and my role as VP Projects for IEEE Concordia. My internship experience has given me hands-on exposure to large codebases, version control and CI/CD pipelines, essential for streamlining project development and deployment. |
| Duc Vinh (Steven) Lam             | @eplxy |40282959   | Frontend Developer   | Focused on designing and implementing user interfaces, ensuring responsive and intuitive designs, and collaborating with the backend team to integrate APIs and services. |2nd year Software Engineering Co-op student. Took SOEN 287 (Web Programming) and gained experience in HTML CSS JS + Node. Currently working at Genetec as a front-end software developer: I have experience using React and Typescript, with MaterialUI as a component library.  |
| Andrei Jianu             | @meloniouss |40275653   | Full-Stack & Database Developer | Integrating the front-end with the back-end, along with some front-end and back-end development. Ensures seamless communication between the two layers and contributes to both UI/UX and server-side logic. Manages the database. | I am a second year Software Engineering student with extensive experience using Typescript, React, Spring Boot, and PostgreSQL.| 
| Laith Qasem              | @LaithQs |40200060   | Frontend Developer   | Develops and maintains the client-side of the application, ensuring high performance and usability across devices. Works closely with designers and backend developers to deliver a cohesive user experience. | I am a 3rd Computer Engineering student with experience in multiple team and personal projects. I am quit interested in the frontend of the project. In general, I love robotics and I found it very interesting especially the science behind it. I am ready to learn from this experience. |
| Michael Pouget           | @Mikachupichu |40246798   | Backend Developer    | Handles server-side logic, database management, and API development. Ensures data integrity, security, and optimal performance of the backend systems. | Software Engineering Co-op student. Thanks to my internship as a Programming and Applications Developer, I learned to work on the frontend, backend and database of web applications. I am proficient using JavaScript, HTML, CSS, C#, SQL, Vue.js, AJAX, Node.js, ASP.NET Core MVC, and ASP.NET Razor. |
| Jovan Gavranovic         | @jGavranovic |40282175   | Full-Stack Developer | Works on both frontend and backend development, ensuring end-to-end functionality. Collaborates with team members to design, develop, and deploy features while maintaining code quality and scalability. | Second year software engineering student. Internship experience as a C++ developer. Experience with JavaScript, CSS, SQL, Node.js, and OOP. Always willing to learn new technologies.  |

## Repository Structure
This is a generalized visualization of our repository structure.

```
TEAM_ZERO-SOEN341_PROJECT_W25/
│── app/
│   ├── backend/ 
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── ChatHaven.sln
│   │   ├── ChatHaven.csproj
│   ├── frontend/
│   │   ├── src/
|   |   |   ├── components/
|   |   |   ├── utils/
|   |   |   ├── pages/
|   |   |   ├── stores/
│   │   ├── tests/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│── Sprint-1/
│── Sprint-2/
│── Sprint-3/
│── Sprint-4/
│── .gitignore
│── README.md

```

## Tools and Technologies

### Languages

- **TypeScript**
  - Primary frontend language
  - Used for client-side logic and interactions

- **C#**
  - Backend language
  - Powers the ASP.NET Core server

- **PostgreSQL (Supabase)**
  - Database queries and management
  - Data persistence layer

### Technologies & Frameworks

#### Backend

- **ASP.NET**
  - Web API development
  - RESTful service architecture
  - Server-side business logic

- **Supabase**
  - Supabase is an open source Firebase alternative.
  - Postgres database
  - Storage for files

#### Frontend

- **Vite**
  - Build tool and development server
  - Hot module replacement
  - Optimized production builds

- **React**
  - Library to build user interfaces
  - Updates and renders UI changes
  - Component-based architecture and virtual DOM

### Development Tools

- **Git**
  - Version control
  - Collaboration
  - Code management

- **GitHub**
  - CI/CD using GitHub Actions
  - Managing Issues & User Stories
  - Project Management 

- **Visual Studio Code**
  - Primary IDE
  - Development environment
  - Extensions for enhanced productivity

- **ESLint & Prettier**
  - Code quality enforcement
  - Style consistency
  - Automated formatting

- **npm**
  - Dependency management
  - Package installation
  - Script automation

## Contribution Guidelines

1. Follow Agile Scrum methodology.
2. Use GitHub issues for user stories and task tracking.
3. Commit via PRs to main with meaningful commit messages.
4. Document all contributions and maintain sprint logs.
5. Attend and contribute to team meetings; minutes must be logged.

[Link to planning spreadsheet and contribution logs](https://docs.google.com/spreadsheets/d/1EVMj0qLC4FfQwUP4bqrUDxbO8MK4ofPaWDHyWVDGPiU/edit?usp=sharing)

---

This repository will be used for tracking progress, documentation, and code contributions throughout the semester.

For any issues or contributions, refer to the **Issues** tab and discuss with the team.
