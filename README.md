# InvoicePro: Comprehensive System & Architectural Documentation

---

## 📌 Executive Overview

**InvoicePro** is an enterprise-grade, full-stack invoice management platform engineered specifically for the modern commercial landscape in Ethiopia. It serves as an all-in-one financial operational hub that bridges the gap between client billing, real-time data visualization, localized regulatory compliance, and multi-currency record management. 

Instead of preparing invoices manually using error-prone spreadsheets or physical paper ledgers, InvoicePro delivers an automated end-to-end billing workflow—from raw data entry and automatic Value Added Tax (VAT) calculations to instant browser-side PDF compilation, persistent database storage, real-time payment tracking, and aggregated financial analytics.

> **In One Sentence:** The primary purpose of InvoicePro is to automate and simplify the entire invoicing lifecycle—from client itemization and tax calculation to PDF generation, payment tracking, and financial reporting.

---

## 🎯 Purpose & Core Capabilities

The foundational mission of InvoicePro is to eliminate operational friction and human error in billing:

* 🧾 **Fast Document Creation:** Rapidly compile invoices by inputting client details and line-item product or service breakdowns.
* 🧮 **Automated Financial Computations:** Automatically computes line-item subtotals, standard 15% Value Added Tax (VAT), and final grand totals in real time to prevent calculation mistakes.
* 🇪🇹 **Native Localization (ETB):** Configured natively for Ethiopian commerce by utilizing **Ethiopian Birr (ETB)** as the standard currency across all metrics, forms, reports, and exported files.
* 🌐 **Bilingual Interface (English & Amharic):** Built-in internationalization (i18n) allows users to switch the entire application interface—including form fields, action buttons, status tags, and system toasts—between **English** and **Amharic (አማርኛ)** with a single click.
* 📄 **Client-Side PDF Generation:** Dynamically generates styled, professional PDF invoices directly within the browser for immediate downloading, printing, or sharing without backend rendering delays.
* 💰 **Payment Lifecycle Tracking:** Tracks and updates payment progression across structured states (`Pending`, `Paid`, `Overdue`), keeping financial ledgers accurate.
* 📊 **Financial Dashboard Analytics:** Visualizes vital performance indicators—such as total cumulative revenue, invoice counts, and average invoice values—at a glance.
* 📥 **Audit-Ready CSV Data Export:** Provides one-click CSV exporting to seamlessly migrate database records into spreadsheet tools (Excel, Google Sheets) or external accounting packages for taxation and auditing.

---

## 👥 Comprehensive Target Audience Analysis

InvoicePro caters to distinct market segments across the private, commercial, and technical sectors:

### 1. Independent Contractors & Freelancers
* **Examples:** Software developers, graphic designers, digital marketers, photographers, consultants.
* **Operational Needs:** Rapid document preparation, professional client branding, and minimal administrative overhead.
* **Value Delivered:** Freelancers handling multiple clients can generate professional PDF receipts on demand, compute exact billing amounts, and track whether clients have settled their invoices without paying for complex accounting suites.

### 2. Small & Medium Enterprises (SMEs)
* **Examples:** Retail suppliers, consulting firms, local service centers, small shops, agency teams.
* **Operational Needs:** Local compliance, regional currency handling, tax calculation, and multi-language support for staff.
* **Value Delivered:** SMEs gain an easy-to-use localized tool operating in Ethiopian Birr (ETB) and configured for 15% VAT. Staff can navigate the system in Amharic while delivering professional bilingual invoices to both local and international clients.

### 3. Agencies & Service Providers
* **Examples:** High-volume service agencies managing dozens or hundreds of active client accounts.
* **Operational Needs:** Efficient client record management, fast filtering/searching, and revenue auditing.
* **Value Delivered:** Agencies benefit from instant live text searching across invoice reference numbers or client names, direct inline payment status editing, and export capabilities for bulk data handling.

### 4. Business Managers & Administrators
* **Operational Needs:** High-level visibility into corporate financial health without inspecting individual records manually.
* **Value Delivered:** Dashboard cards provide real-time metrics summarizing business metrics (e.g., Total Revenue = 250,000 ETB, Total Invoices = 47, Average Value = 5,319 ETB), enabling data-driven management decisions.

### 5. Technical Developers & System Auditors
* **Operational Needs:** Clean layered architecture, relational schema integrity, and easy environment setup.
* **Value Delivered:** Software engineers and system administrators can deploy, audit, or extend the codebase easily due to its decoupled Spring Boot REST API, Hibernate/JPA entity mappings, and PostgreSQL persistence layer.

---

## 🏗 System Architecture & Technical Design

InvoicePro is built on a standard **3-Tier Full-Stack Architecture**:

+-------------------------------------------------------------------+
|                        CLIENT LAYER (React.js)                    |
| - State Management (Hooks)        - Real-time Calculations       |
| - Bilingual Context Switcher      - Client-Side PDF Generation    |
+---------------------------------+---------------------------------+
|
| REST API Calls (JSON / HTTP)
v
+-------------------------------------------------------------------+
|                      APPLICATION LAYER (Spring Boot)              |
| - REST Controllers                - Business Logic Service Layer  |
| - JPA Repositories / Hibernate    - CORS / Request Handlers       |
+---------------------------------+---------------------------------+
|
| JDBC Connection
v
+-------------------------------------------------------------------+
|                       DATA LAYER (PostgreSQL)                     |
| - Relational invoices Table     - Relational invoice_items Table|
| - Foreign Key Constraints         - Indexing on Invoice Numbers   |
+-------------------------------------------------------------------+


### Key Technical Subsystems

* **Frontend Layer (React.js):** Handles user interaction, dynamic input fields, real-time tax calculation, bilingual state management, and direct HTML-to-PDF compilation via client-side libraries. Includes toast notifications for instant operational feedback.
* **Backend Layer (Spring Boot):** Exposes RESTful API endpoints handling full CRUD operations (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). Utilizes Spring Data JPA for Object-Relational Mapping (ORM) and manages transactional operations to maintain strict data consistency.
* **Database Layer (PostgreSQL):** Maintains relational data integrity using primary/foreign key relationships between parent invoice entities and child line-item entries. Ensures accurate floating-point storage for monetary values.

---

## 🗄 Database Schema Design

The system utilizes a relational **One-to-Many Relationship**: One parent `invoices` record contains one or more child `invoice_items` records.

### 1. `invoices` Table

| Field Name | Data Type | Key Type | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | Primary Key | Unique auto-incrementing invoice identifier |
| `invoice_number` | `VARCHAR(255)` | Unique / Index | Human-readable tracking ID (e.g., `INV-4889`) |
| `client_name` | `VARCHAR(255)` | - | Name of the recipient or client company |
| `client_email` | `VARCHAR(255)` | - | Contact email address for billing |
| `issue_date` | `DATE` | - | Date when the invoice was created |
| `due_date` | `DATE` | - | Payment deadline date |
| `status` | `VARCHAR(50)` | - | Payment state (`Pending`, `Paid`, `Overdue`) |
| `grand_total` | `DOUBLE PRECISION`| - | Total invoice amount including tax in ETB |

### 2. `invoice_items` Table

| Field Name | Data Type | Key Type | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | Primary Key | Unique line item identifier |
| `description` | `VARCHAR(255)` | - | Service or product description |
| `quantity` | `INTEGER` | - | Number of units or hours billed |
| `price` | `DOUBLE PRECISION`| - | Unit price per item/hour in ETB |
| `invoice_id` | `BIGINT` | Foreign Key | References parent `invoices(id)` with cascading