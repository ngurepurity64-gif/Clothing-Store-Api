# Clothing Store API
## 1. Overview

Clothing Store API is a RESTful backend application built with Python, FastAPI, PostgreSQL, and SQLAlchemy. It manages clothing inventory, customers, orders, and order items. It also supports user registration and login using password hashing and JSON Web Tokens (JWT).

The API uses Pydantic for request validation and response models. FastAPI provides interactive API documentation through Swagger UI.

The project also includes **PURE STYLE**, a clothing store frontend built with HTML, CSS, and JavaScript. The webpage features a welcome section, featured clothing, an inventory table, a clothing item form, store information, and contact details.

JavaScript connects the frontend to the backend using the Fetch API to retrieve clothing items from the `/clothes` endpoint. The webpage can display clothing records returned by the API, and the form is designed to submit new clothing items to the backend. Adding an item requires valid data and authentication where required.

The backend uses PostgreSQL to store application data, while the frontend provides the user interface for viewing and interacting with the clothing inventory.
## 2. Technologies Used

- Python 3
- FastAPI
- Uvicorn
- PostgreSQL
- SQLAlchemy
- Pydantic
- python-dotenv
- Passlib
- Python-JOSE
- pytest
- HTML5
- CSS3
- Git and GitHub

## 3. Project Structure

```text
Clothing-Store-API/
├── routers/
│   ├── __init__.py
│   ├── auth.py
│   ├── clothes.py
│   ├── customers.py
│   └── orders.py
├── SQL/
│   ├── schema.sql
│   ├── clothes_table_rows.sql
│   ├── create_database_clothingstore.sql
│   ├── insert_customers.sql
│   ├── join_queries.sql
│   └── rows_displayed.sql
├── tests/
│   └── test_main.py
frontend/
├── index.html
├── style.css
└── script.js
├── .env
├── .env.example
├── .gitignore
├── database.py
├── main.py
├── models.py
├── schemas.py
├── requirements.txt
└── README.md
```

The structure above shows the intended layout. Keep the SQL filenames consistent with the files that actually exist in the `SQL` folder. The `frontend/` folder is the suggested location for the webpage files; update the structure if your actual HTML and CSS files are stored elsewhere.

**Main files and folders:**

- `main.py` creates the FastAPI application and registers the routers.
- `database.py` configures the database connection, sessions, and `get_db` dependency.
- `models.py` defines the SQLAlchemy database models and relationships.
- `schemas.py` defines Pydantic request and response schemas.
- `routers/auth.py` handles user registration and login.
- `routers/clothes.py` handles clothing endpoints.
- `routers/customers.py` handles customer endpoints.
- `routers/orders.py` handles order and order-item operations.
- `SQL/schema.sql` creates the database tables.
- `tests/test_main.py` contains automated API tests.
- `.env.example` provides a template for local environment configuration.
- `requirements.txt` lists the Python dependencies.
- `frontend/index.html` contains the semantic HTML structure of the PURE STYLE webpage.
- `frontend/style.css` controls the webpage's colours, layout, spacing, hover effects, and responsive design.

## 4. Database Design

The application uses PostgreSQL. The database schema contains five main tables.

| Table | Purpose |
|---|---|
| `clothes` | Stores clothing names, brands, colours, sizes, quantities, and prices. |
| `customers` | Stores customer information. |
| `orders` | Stores customer orders and order dates. |
| `order_items` | Stores clothing items, quantities, and unit prices associated with orders. |
| `users` | Stores registered email addresses and hashed passwords. |

### Relationships

- One customer can have many orders.
- One order can contain many order items.
- One clothing item can appear in many order items.

Foreign keys maintain the relationships between the related tables.

## 5. Database Schema Setup

The database structure is defined in `SQL/schema.sql`.

The file creates the following tables:

- `clothes`
- `customers`
- `orders`
- `order_items`
- `users`

The schema includes the `users` table for authentication and the corrected `order_items` table name.

Run the complete `SQL/schema.sql` file against the intended PostgreSQL database using pgAdmin or another PostgreSQL client.

The schema should create all five tables without requiring manually created tables from a previous database setup.

### Verify the tables

Run this SQL query in PostgreSQL:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

The expected application tables are:

```text
clothes
customers
order_items
orders
users
```

Other tables may appear if your PostgreSQL database contains additional objects.

For schema testing, use a separate test database so that the original working database and its data are not accidentally deleted.

## 6. API Endpoints

### General

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check API health. |

### Clothing

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/clothes` | Retrieve clothing items. |
| GET | `/clothes/{clothing_id}` | Retrieve one clothing item. |
| POST | `/clothes` | Create a clothing item. |
| PUT | `/clothes/{clothing_id}` | Update a clothing item. |
| DELETE | `/clothes/{clothing_id}` | Delete a clothing item. |

### Customers

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/customers` | Create a customer. |
| GET | `/customers` | Retrieve customers. |

### Orders and Order Items

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/orders` | Create an order. |
| GET | `/orders` | Retrieve orders, if implemented in the current router. |
| GET | `/orders/{order_id}` | Retrieve an order and its items. |
| POST | `/orders/{order_id}/items` | Add an item to an order, if implemented at this route. |

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/register` | Register a new user. |
| POST | `/login` | Authenticate a user and obtain an access token. |

Confirm the exact order endpoints in `routers/orders.py` before submitting this README. The endpoint paths shown in Swagger UI at `/docs` are the authoritative list for your running application.

## 7. Validation and Error Handling

- Clothing quantity uses `Field(ge=0)` to reject negative quantities.
- Order-item quantity uses `Field(gt=0)` to require a positive quantity.
- Price and unit-price values use `Decimal`.
- User email addresses are validated using Pydantic's `EmailStr`.
- User registration requires a password of at least eight characters using `Field(min_length=8)`.
- Passwords are hashed before they are stored in the database.
- Missing clothing and order records return appropriate HTTP error responses.
- Database sessions are provided through FastAPI's `Depends(get_db)` dependency.
- Pydantic v2 schemas use `ConfigDict` where required to read SQLAlchemy model attributes.

## 8. Environment Configuration and Security

The application uses environment variables for database configuration and authentication secrets.

The local `.env` file contains the actual database connection string and a securely generated secret key.

Example `.env` format:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/clothingstore
SECRET_KEY=YOUR_GENERATED_SECRET_KEY
```

Replace the example values with your actual local configuration. The values above are placeholders, not working credentials.

The `.env.example` file should contain placeholders only:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/clothingstore
SECRET_KEY=YOUR_SECRET_KEY_HERE
```

### Security practices

- `.env` must be excluded from Git using `.gitignore`.
- Never commit real database passwords or secret keys.
- Use a strong, randomly generated `SECRET_KEY`.
- Store hashed passwords instead of plain-text passwords.
- Keep the example configuration free of real credentials.

## 9. Installation and Setup

### Step 1: Clone the repository

```powershell
git clone https://github.com/ngurepurity64-gif/Clothing-Store-API.git
cd Clothing-Store-API
```

### Step 2: Create and activate a virtual environment

On Windows:

```powershell
python -m venv .venv
.venv\Scripts\activate
```

### Step 3: Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### Step 4: Create the environment file

```powershell
copy .env.example .env
```

Edit `.env` and configure your PostgreSQL connection and real secret key. Do not replace your working credentials with the example placeholders.

### Step 5: Create the database schema

Create the intended PostgreSQL database if it does not already exist. Then execute `SQL/schema.sql` against that database.

Ensure that `DATABASE_URL` in `.env` points to the same database where you created the tables.

For testing schema recreation, use a separate test database rather than dropping your working database.

## 10. Running the API

Start the development server from the project root:

```powershell
uvicorn main:app --reload
```

The API will normally be available at:

- Base URL: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

The health check should return:

```json
{
  "status": "ok"
}
```

Use Swagger UI to inspect the available endpoints and submit test requests.

## 11. Testing

The project includes automated tests in `tests/test_main.py`.

Run the tests from the project root:

```powershell
python -m pytest -q
```

The test suite should pass before changes are committed. Test results depend on the current code, configuration, and test environment.

Authentication and order-item operations should also be tested through Swagger UI where applicable:

1. Register a user.
2. Log in using the registered email in the login form's `username` field and the corresponding password.
3. Confirm that a successful login returns an access token.
4. Create an order and add an order item using valid records.
5. Verify the response and resulting database records.

## 12. Frontend Development — PURE STYLE

### Frontend functionality

The PURE STYLE frontend uses HTML for its structure, CSS for styling, and JavaScript for interactive functionality.

JavaScript selects HTML elements using `document.querySelector()`, stores clothing data in arrays and objects, and uses event listeners to respond to form submissions.

The Fetch API retrieves clothing records from the backend endpoint `http://127.0.0.1:8000/clothes`. The returned data is displayed in the inventory table. Sample clothing data can also be used as a fallback when the API request fails.

The clothing form collects item details and submits a POST request to the backend. Where authentication is required, the request includes a Bearer access token. The frontend displays status or error messages and reloads the inventory after a successful addition.

The CSS provides the navy and purple theme, responsive layouts, hover effects, gradients, and other visual styling.

The frontend and backend run as separate applications during development. The frontend must be served through a local web server, and the backend must be running for API integration to work. Cross-Origin Resource Sharing (CORS) must be configured appropriately on the backend.

### HTML structure

The webpage uses semantic HTML elements to organize the content:

- `<header>` contains the store branding and navigation links.
- `<main>` contains the main webpage content.
- `<section>` separates the welcome, collection, item form, about, and contact areas.
- `<table>` displays the clothing inventory.
- `<form>` contains fields for entering clothing information.
- `<footer>` contains additional store information and navigation links.

The collection displays three hard-coded clothing items in the HTML. The item form includes fields for the item name, brand, colour, size, quantity, and price.

### CSS styling and layout

The external `style.css` file controls the appearance of the webpage.

The design uses a midnight navy, purple, and lavender colour theme, with readable typography and consistent spacing.

The styling includes:

- Flexbox for navigation and flexible alignment.
- CSS Grid for form fields, value cards, and footer columns.
- A styled clothing table with alternating row colours and hover effects.
- Styled form fields, labels, and buttons.
- Rounded content cards, gradients, and subtle shadows.
- Hover transitions on navigation links, cards, buttons, and table rows.
- A moving announcement bar.
- A responsive layout that adapts to smaller screens.
- A reduced-motion setting for users who prefer fewer animations.

The webpage is currently a static frontend. Its form and clothing table are not yet connected to the backend API.

## 13. Git and GitHub

Before committing changes, inspect the repository:

```powershell
git status
git diff --check
```

Stage only the intended project files, review the staged changes, and commit them with a descriptive message.

Ensure `.env` and other secret files are not included in the commit.

Push the completed changes to GitHub after verifying the code and reviewing the commit.

## 14. Final Setup and Progress Checklist

### Backend and database

-  Clone the repository.
-  Create and activate `.venv`.
-  Install dependencies from `requirements.txt`.
-  Configure `.env` with a valid database URL and generated secret key.
-  Confirm `.env` is excluded from Git.
-  Run `SQL/schema.sql` against the intended database.
-  Verify the five application tables.
-  Start the API using Uvicorn.
-  Open Swagger UI at `/docs`.
-  Test registration, login, and order-item operations.
-  Run the automated tests.

### Frontend

-  Create the semantic HTML structure.
-  Display clothing items in a table.
-  Add a clothing item form.
-  Apply the navy and purple CSS theme.
-  Add layout, spacing, hover effects, and visual styling.
-  Add responsive styling for phone-width screens.
-  Add JavaScript variables, functions, arrays, objects, and event listeners.
-  Render clothing items using JavaScript.
-  Connect the webpage to the API using the Fetch API.
-  Verify CORS configuration for frontend-to-backend requests.
-  Display clothing records returned by the API.
-  Verify successful item creation and error handling.

## Hosted PostgreSQL Database (Neon)

The application was successfully connected to a hosted PostgreSQL database using Neon.

### Configuration and Setup
- Created a PostgreSQL database instance on Neon.
- Executed `SQL/schema.sql` in the Neon SQL Editor to create the database tables.
- Imported the existing clothing records into the hosted `clothes` table.
- Configured the `DATABASE_URL` environment variable in the local `.env` file to connect the application to Neon.
- Kept database credentials outside the source code to protect sensitive information.

### Testing and Verification
- Started the FastAPI application locally using Uvicorn.
- Accessed the API documentation through `/docs`.
- Tested the `/clothes` endpoint and confirmed that the application could retrieve clothing records from the hosted database.
- Opened the PURE STYLE frontend and confirmed that it displayed the clothing records.

The application works with the hosted database without requiring changes to its existing application code.
### Final version control steps

-  Review the intended changes.
-  Commit the completed work.
-  Push the changes to GitHub.

## 15. Repository

GitHub: https://github.com/ngurepurity64-gif/Clothing-Store-API