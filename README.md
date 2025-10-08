# Overview

This is a simple API for tracking daily habits, built with a Model-View-Controller (MVC) architecture. It supports full CRUD (Create, Read, Update, Delete) functionality for habits and also handles nesting, allowing a main habit like "Morning Routine" to contain smaller sub-habits like "Brush teeth" and "Make coffee." For data storage, I used a JSON file to keep the focus on the backend logic rather than complex database management, acting as a lightweight data store.


I developed this API using TypeScript to demonstrate advanced features of the language. This included:

    * Using interfaces to define clear and robust data structures for habits and errors.
    * Implementing a custom ApiError class to ensure consistent, centralized error handling.
    * Leveraging async/await to manage reading and writing files for better performance.

[Building a CRUD API in TypeScript](http://youtube.link.goes.here)

# Development Environment

I put this project together using Visual Studio Code. The entire API is built with TypeScript, a typed version of JavaScript that helps find errors early and makes the code clearer.

Here's a list of the tools and libraries that made it happen:

* **Node.js:** The JavaScript runtime environment that executes the application.
* **Express:** The web framework for building the API endpoints.
* **pnpm:** The package manager for handling project dependencies.
* **nodemon:** A development tool that automatically restarts the server when code changes.
* **REST Client:** A VS Code extension for testing the API requests.

# Useful Websites

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [pnpm Documentation](https://pnpm.io/)
- [LogRocket Blog](https://blog.logrocket.com/express-typescript-node)

# Future Work

- **Build a Front-End Interface:** Develop a client-side interface to provide users with a visual way to manage their habits.
- **Database Integration:** Replace the JSON file with a real database to improve scalability, data integrity, and performance.
- **User Authentication and Authorization:** Implement a user authentication system to secure the API.