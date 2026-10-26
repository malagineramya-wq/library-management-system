# 📚 Athena - Library Management System (MERN Stack)

A modern full-stack academic web application for managing library books, patron memberships, and circulation loan transactions.

Developed as a mandatory student submission project for **InspireLeap** (Due: **5th November**, submission to `hr@inspireleap.in`).

---

## 🌟 Technology Stack

- **Frontend**: [React.js](https://react.dev/) (Vite), Vanilla CSS (Custom Design System, Glassmorphic UI), [Lucide React](https://lucide.dev/) Icons, [Axios](https://axios-http.com/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [CORS](https://github.com/expressjs/cors), [Dotenv](https://github.com/motdotla/dotenv)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) OR built-in zero-config persistent local engine
- **Version Control**: Git & GitHub

---

## 📂 Project Architecture

Conforms strictly to the required project specification:

```text
library-management-system/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modal.jsx        # Reusable accessible dialog
│   │   │   ├── Navbar.jsx       # Header bar with quick actions
│   │   │   ├── Sidebar.jsx      # Navigation sidebar with status badge
│   │   │   └── Toast.jsx        # Floating notifications
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Real-time metrics and circulation summary
│   │   │   ├── Books.jsx        # Books catalog, add/edit/delete, search & filter
│   │   │   ├── Members.jsx      # Patron directory, add/edit/delete, search
│   │   │   ├── IssueBook.jsx    # Book loan checkout with availability checking
│   │   │   └── Transactions.jsx # Check-in returns, history logs, status badges
│   │   ├── services/
│   │   │   └── api.js           # Central Axios HTTP service layer
│   │   ├── App.jsx              # Main React application controller
│   │   ├── index.css            # Custom CSS design system
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── server/
│   ├── config/
│   │   ├── db.js                # MongoDB connection handler
│   │   ├── localStore.js        # Seamless offline/evaluation data store
│   │   └── seeder.js            # Sample library data seeder
│   ├── controllers/
│   │   ├── bookController.js        # Book CRUD & inventory logic
│   │   ├── memberController.js      # Member CRUD & verification
│   │   ├── transactionController.js # Loan issuance and return check-in
│   │   └── dashboardController.js   # Analytics aggregation
│   ├── models/
│   │   ├── Book.js              # Mongoose Book Schema
│   │   ├── Member.js            # Mongoose Member Schema
│   │   └── Transaction.js       # Mongoose Transaction Schema
│   ├── routes/
│   │   ├── bookRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── dashboardRoutes.js
│   ├── data/
│   │   └── db.json              # Local persistent evaluation store
│   ├── server.js                # Express REST API entry point
│   ├── .env                     # Server environment configuration
│   └── package.json
└── README.md
```

---

## 📋 System Modules & Features

### 1. 📊 Central Dashboard
- **Total Books**: Displays count of distinct book titles and physical copies.
- **Total Members**: Displays number of registered patrons.
- **Issued Books**: Live counter of copies currently checked out.
- **Returned Books**: Counter of completed return check-ins.
- **Category Distribution**: Visual progress breakdown of books across genres (Computer Science, Fiction, History, Self-Help, etc.).
- **Recent Circulation**: Latest 5 loan transactions.

### 2. 📖 Book Management
- **Add Book**: Record title, author, category, unique ISBN, and total quantity.
- **Edit Book**: Update book details or modify total stock quantity safely.
- **Delete Book**: Guarded deletion (cannot delete books while active loans are outstanding).
- **Search & Filter**: Real-time search by title, author, or ISBN, plus category filtering.
- **Stock Tracking**: Live indicator showing available copies vs. total copies.

### 3. 👥 Member Management
- **Register Member**: Capture name, unique email address, and phone number.
- **Edit Member**: Update member details.
- **Delete Member**: Safe deletion (cannot delete members who currently have checked-out books).
- **Search Members**: Search patrons by name, email, or telephone.

### 4. 🔖 Book Issuance (Loans)
- Choose a book from available inventory and an active registered member.
- **Stock Validation**: Automatically prevents issuing if `availableQuantity <= 0`.
- **Duplicate Prevention**: Prevents issuing duplicate copies of the same book to the same member.
- Decrements available stock and generates an active transaction with status `"Issued"`.

### 5. 🔄 Transactions & Return Records
- Search loans by title or member name.
- Filter by: `All Loans`, `Currently Issued`, `Returned`.
- **One-Click Return**: Check-in returned books, recording `returnDate` and automatically incrementing `availableQuantity` back to the shelves.

---

## 🗄️ Database Schema Design

### Books Collection (`books`)
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId / String | Unique identifier |
| `title` | String (Required) | Book title |
| `author` | String (Required) | Author(s) |
| `category` | String (Required) | Subject or genre |
| `isbn` | String (Required, Unique) | ISBN code |
| `quantity` | Number (Required, Min 0) | Total physical copies |
| `availableQuantity` | Number (Required, Min 0) | Available copies on shelf |
| `createdAt` / `updatedAt` | Date | Timestamps |

### Members Collection (`members`)
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId / String | Unique identifier |
| `name` | String (Required) | Patron full name |
| `email` | String (Required, Unique) | Contact email |
| `phone` | String (Required) | Phone number |
| `membershipDate` | Date (Default: Now) | Registration date |
| `createdAt` / `updatedAt` | Date | Timestamps |

### Transactions Collection (`transactions`)
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId / String | Unique identifier |
| `bookId` | ObjectId / Ref: Book | Reference to issued book |
| `memberId` | ObjectId / Ref: Member | Reference to borrower |
| `issueDate` | Date (Default: Now) | Date book was checked out |
| `returnDate` | Date (Optional) | Date book was checked back in |
| `status` | String (Enum: `['Issued', 'Returned']`) | Current loan status |
| `createdAt` / `updatedAt` | Date | Timestamps |

---

## 🔌 RESTful API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api` | API Health & status check |
| `GET` | `/api/dashboard/stats` | Aggregated analytics & recent activity |
| `GET` | `/api/books` | Get all books (supports `?search=` and `?category=`) |
| `GET` | `/api/books/:id` | Get single book by ID |
| `POST` | `/api/books` | Add a new book to catalog |
| `PUT` | `/api/books/:id` | Update book details / stock |
| `DELETE` | `/api/books/:id` | Delete book record |
| `GET` | `/api/members` | Get all members (supports `?search=`) |
| `GET` | `/api/members/:id` | Get single member by ID |
| `POST` | `/api/members` | Register new member |
| `PUT` | `/api/members/:id` | Update member details |
| `DELETE` | `/api/members/:id` | Delete member |
| `GET` | `/api/transactions` | Get transactions (supports `?status=`) |
| `POST` | `/api/transactions/issue` | Issue a book loan |
| `PUT` | `/api/transactions/:id/return` | Return an issued book |

---

## 🚀 Installation and Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Optional: works seamlessly with local daemon, MongoDB Atlas, OR automatic built-in storage)

---

### Step 1: Start the Backend Server

1. Open a terminal and navigate to `server/`:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (optional):
   - Check `.env` file:
     ```env
     PORT=5000
     MONGO_URI=mongodb://127.0.0.1:27017/library_management_system
     CLIENT_URL=http://localhost:5173
     ```
   - *Note: If a MongoDB daemon is not running on port 27017, the server will automatically switch to the local persistent database engine so you can evaluate the project immediately.*
4. Start the server:
   ```bash
   npm start
   # Or for auto-reload during development:
   npm run dev
   ```
   Backend will run at: **`http://localhost:5000`**

---

### Step 2: Start the React Frontend

1. Open a second terminal and navigate to `client/`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   **`http://localhost:5173/`**

---

## 🧪 Testing Verification

The project includes pre-seeded demonstration data:
- **Books**: 8 realistic volumes across Computer Science, Fiction, History, and Self-Help.
- **Members**: 4 active library members.
- **Circulation Records**: Pre-existing active and returned loans.

You can verify all operations:
1. View the **Dashboard** metrics.
2. Navigate to **Books Catalog** and click **Add New Book**.
3. Navigate to **Members** and click **Add New Member**.
4. Go to **Issue Book**, select the newly created book and member, and confirm the loan.
5. Go to **Transactions & Returns** and click **Return Book** to verify the stock restores to the shelf.

---

## 📩 Submission Information
- **Project Name**: Library Management System (MERN Stack)
- **Submission Email**: `hr@inspireleap.in`
- **Due Date**: 5th November
