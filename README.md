# SciSubmit Project

SciSubmit is a project management system for conference submissions and reviews. It allows users to submit papers, manage conferences, assign reviews, and much more. Built using **Vue.js**, **Node.js (Express)**, and **MongoDB**, this project leverages Docker for containerization.

## Table of Contents
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [Environment Setup](#environment-setup)
- [Branches](#branches)
- [Contributing](#contributing)

## Project Overview
SciSubmit is a web application designed to streamline the process of submitting papers to academic conferences and managing the review process. Admins can create conferences, assign reviewers, and manage paper submissions, while students can submit their work for review.

## Technologies Used
- **Frontend**: Vue.js (with TypeScript)
- **Backend**: Express.js (Node.js) with TypeScript
- **Database**: MongoDB (Mongoose ORM)
- **Containerization**: Docker
- **Version Control**: Git and GitHub
- **Other Tools**: Docker Compose, ESLint, Prettier

## Installation
To get a local copy up and running, follow these steps:

### Prerequisites
- **Node.js** (v14.x or higher)
- **Docker** (with Docker Compose)

### Clone the Repository
```bash
git clone https://github.com/your-organization/SciSubmit.git
cd SciSubmit
 ```
### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd ../frontend
npm install
```

### Start Docker Containers
```bash
cd ..
docker-compose up --build
```

## Development Workflow
We are following the Git Flow methodology, so contributions should be made in feature branches and merged into develop via pull requests.

### Branches
- **main**: The main branch contains the production-ready code.
- **develop**: The development branch contains the latest changes and is the default branch for active development.

## Environment Setup
- **Backend**: Copy the .env.example file to .env and set the necessary environment variables.
- **Frontend**: Copy the .env.example file in the frontend folder to .env and configure it.

```bash
#backend .env file
MONGO_URI=mongodb://mongo:27017/scisubmit
PORT=3000
```

```bash
#frontend .env file
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=SciSubmit
```

## Contributing
1. Fork the repository.
2. Create your feature branch: git checkout -b feature/YourFeatureName.
3. Commit your changes: git commit -m 'Add some feature'.
4. Push to the branch: git push origin feature/YourFeatureName.
5. Open a pull request to develop.