# StockFlow - Product Management System
### 6. Open the app
Visit 👉 **https://product-flow-enxb351fg-tharun17.vercel.app/**


A full-stack **Product Inventory Management** web app built with **FastAPI** backend and a modern HTML/CSS/JS frontend connected to a **PostgreSQL** database.

## 🚀 Features

- ✅ Add, Edit, Delete products
- 📦 Real-time inventory dashboard (Total Products, Total Value, Out of Stock)
- 🔍 Live search/filter
- 🎨 Modern dark-mode UI
- 🔗 REST API powered by FastAPI
- 🗄️ PostgreSQL database with SQLAlchemy ORM

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Database | PostgreSQL + SQLAlchemy |
| Frontend | HTML, CSS, Vanilla JS |
| Server | Uvicorn |

## 📁 Project Structure

```
fastapiproject/
├── main.py           # FastAPI app & API routes
├── database.py       # DB connection (reads from .env)
├── databasemodel.py  # SQLAlchemy ORM model
├── model.py          # Pydantic schema
├── .env.example      # Environment variable template
└── forentend/
    ├── index.html    # Dashboard UI
    ├── style.css     # Styling
    └── script.js     # Frontend logic
```

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/Kannaiahgaritharun/product-flow.git
cd product-flow
```

### 2. Create a virtual environment
```bash
python -m venv venv
venv\Scripts\activate   # Windows
```

### 3. Install dependencies
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
```

### 4. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in your PostgreSQL credentials:
```
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/your_db
```

### 5. Run the server
```bash
python -m uvicorn main:app --reload
```


## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| POST | `/product` | Add a new product |
| PUT | `/product?id={id}` | Update a product |
| DELETE | `/product?id={id}` | Delete a product |

## 📸 Preview

> A sleek dark-mode product management dashboard connected to a FastAPI + PostgreSQL backend.

---
Made with ❤️ by [Tharun](https://github.com/Kannaiahgaritharun)
