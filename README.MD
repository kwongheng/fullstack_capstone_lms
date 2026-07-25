# Library Management System (LMS)
This is the capstone project for my full-stack web developer course. The codes are working and so I am sharing this if you happen to need something like this for reference. Use this for your academic exercise. 

The application is a full-stack Library Management System built with Java Spring Boot (backend) and React (frontend). This application allows users to manage books, members, borrowing, returns, and reservations in a library setting. The application is developer on Windows 11, so some commands are Windows specific.

## Folder Structure:
- docs
  - all related documents for my project submissions
- lms-react
  - react front-end
- springboot
  - springboot backend

## Features

- Book Management: Add, view, update, and delete books (title, author, category, publisher, year, ISBN, etc.).
- Member Management: Register and manage library members.
- Borrowing & Returns: Borrow books, track due dates, mark returns, and handle overdue status.
- Reservations: Reserve books that are currently unavailable or borrowed.
- Search & Filtering: Search books by title, author, category, publisher, year range, etc.
- Responsive UI: Clean, user-friendly interface built with React.
- RESTful API: Secure and efficient backend APIs powered by Spring Boot.
- Database Persistence: MySQL database with Hibernate/JPA for ORM.

- READ the README.MD for each application for further details

## Tech Stack
### Backend

- Java 21+
- Spring Boot 3.x
- Spring Data JPA (Hibernate)
- MySQL 8.0+
- Maven
- Lombok (for reducing boilerplate)
- JUnit 5 (testing)
- Docker Desktop (for vault integration)

### Frontend

- React 20x (specific version)
- Axios (API calls)
- React Router (navigation)
- Bootstrap / Custom CSS (styling)

## Project Structure

```bash
lms-project/
├── backend/
│   ├── src/main/java/        # Controllers, Services, Entities, Repositories
│   ├── src/main/resources/   # application.yml, static data
│   └── pom.xml
├── frontend/
│   ├── src/                  # Components, pages, services
│   ├── public/
│   └── package.json
└── README.md                 # This file
```

## Prerequisites

- Java 21
- Node.js 20x (with npm/yarn)
- MySQL 8.0+
- Maven (part of springboot/vsc extension)

### Sample API Endpoints

- GET /api/books – List all books
- POST /api/books – Add a book
- PUT /api/books/{id} – Update a book
- DELETE /api/books/{id} – Delete a book
- POST /api/borrow – Borrow a book
- POST /api/return – Return a book

Check REST API document in docs folder.

### TO DOs
- Create a backup copy of MySQL database and upload here
- Create SQL script to create the MySQL tables used in this project

### Future Enhancements

- Time limit role based dynamic user access to MySQL databse using vault [DONE]
-- Read [VAULT_SETUP.MD](./springboot/VAULT_SETUP.MD)
- Authentication & Authorization (Spring Security + JWT)
- Pagination & advanced filtering
- Role-based access (Admin vs Member)
- Docker -> microservice -> cloud (planned evolution)
- add swagger

## Contributing
Fork the repository, create a feature branch, commit your changes, and open a pull request. Issues and suggestions are welcome!

## License
MIT License – free to use, modify, and distribute for personal or educational purposes.
Thank you for using the Library Management System! Feel free to report bugs or request new features. 😊
