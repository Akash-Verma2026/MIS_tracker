# Tsuyo R&D MIS Tracker

## Overview

The **Tsuyo R&D MIS Tracker** is a web-based dashboard designed to manage and monitor project information for the R&D team.
It allows users to view, update, and manage project details through an interactive interface while maintaining role-based access control.

The system helps track project status, leadership, potential business value, and other key details in a structured and accessible way.

---

## Features

### 1. Role-Based Access Control

The system supports three user roles:

**Admin**

* Add new projects
* Edit existing projects
* Delete projects
* View dashboard
* Generate Excel reports

**User**

* View dashboard
* Edit project details
* Generate Excel reports

**Viewer**

* View dashboard only
* Generate Excel reports
* Cannot add, edit, or delete projects

---

### 2. Project Dashboard

The dashboard displays project information including:

* Project Type
* Project Name
* Project Leader
* Potential Value
* Status
* Other relevant fields

Users can filter and search projects easily.

---

### 3. Excel Export

Users can export the current project data to an Excel file for reporting and analysis.

---

### 4. Secure Login

Authentication is handled using **Supabase Authentication**, ensuring only authorized users can access the system.

---

## Technology Stack

Frontend:

* HTML
* CSS
* JavaScript

Backend / Database:

* Supabase

Other Tools:

* Git
* GitHub
* Visual Studio Code

---

## Project Structure

```
tsuyo_tracker/
│
├── assets/
│   └── tsuyo-logo.jpeg
│
├── css/
│   └── style.css
│
├── js/
│   ├── auth.js
│   ├── config.js
│   └── dashboard.js
│
├── dashboard.html
├── index.html
└── README.md
```

---

## How to Run the Project

1. Clone the repository

```
git clone <repository-url>
```

2. Open the project in Visual Studio Code

3. Run using Live Server

4. Open in browser

```
http://127.0.0.1:5500
```

---

## Future Improvements

* Advanced project analytics
* Graphical dashboards
* Email notifications
* Role management panel
* Deployment to a cloud server

---

## Author

Developer: Abira Mandal
This project was developed for the Tsuyo R&D Department to manage and monitor internal project tracking through a role-based MIS dashboard.

Project maintained using GitHub.
