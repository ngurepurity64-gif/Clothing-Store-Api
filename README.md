CLOTHING STORE API
README

1. Overview
Clothing Store API is a RESTful backend application developed with Python, FastAPI, PostgreSQL and SQLAlchemy. It provides CRUD operations for clothing items and endpoints for managing customers and orders. The API uses Pydantic for request validation and response models and is documented through FastAPI Swagger UI.
2. Technologies
•	Python 3
•	FastAPI
•	Uvicorn
•	PostgreSQL
•	SQLAlchemy
•	Pydantic
•	python-dotenv
•	Git/GitHub
3. Project Structure
Clothing-Store-API/
├── database.py
├── models.py
├── schemas.py
├── main.py
├── schema.sql
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
database.py manages the database engine, session and get\_db dependency. models.py contains SQLAlchemy models and relationships. schemas.py contains Pydantic request and response models. main.py contains the FastAPI endpoints.
4. Database
The application uses a PostgreSQL database named clothingstore with four related tables:
•	Clothes — stores clothing information, stock quantity and price.
•	Customers — stores customer information.
•	Orders — stores customer orders.
•	OrderItems — stores the clothing items belonging to each order.
Relationships:
•	Customers → Orders: one-to-many.
•	Orders → OrderItems: one-to-many.
•	Clothes → OrderItems: one-to-many.
5. Database Schema
CREATE TABLE Clothes (
clothing\_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
name VARCHAR(50) NOT NULL,
brand VARCHAR(50),
color VARCHAR(30),
size VARCHAR(10),
quantity INT NOT NULL,
price DECIMAL(10,2) NOT NULL
);

CREATE TABLE Customers (
customer\_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
name VARCHAR(100) NOT NULL,
phone VARCHAR(20)
);

CREATE TABLE Orders (
order\_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
customer\_id INT NOT NULL,
order\_date DATE NOT NULL,
FOREIGN KEY (customer\_id) REFERENCES Customers(customer\_id)
);

CREATE TABLE OrderItems (
order\_item\_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
order\_id INT NOT NULL,
clothing\_id INT NOT NULL,
quantity INT NOT NULL,
unit\_price DECIMAL(10,2) NOT NULL,
FOREIGN KEY (order\_id) REFERENCES Orders(order\_id),
FOREIGN KEY (clothing\_id) REFERENCES Clothes(clothing\_id)
);
6. API Endpoints
•	GET /health — API health check.
•	GET /clothes — retrieve all clothing items.
•	GET /clothes/{clothing\_id} — retrieve one clothing item.
•	POST /clothes — create a clothing item.
•	PUT /clothes/{clothing\_id} — update a clothing item.
•	DELETE /clothes/{clothing\_id} — delete a clothing item.
•	POST /customers — create a customer.
•	GET /customers — retrieve customers.
•	POST /orders — create an order.
•	GET /orders/{order\_id} — retrieve an order together with its items.
7. Validation and Error Handling
•	Clothing quantity is validated with Field(ge=0); negative quantities are rejected.
•	Price values use Decimal.
•	Response models are defined using Pydantic.
•	Missing clothing and order records return HTTP 404 responses using HTTPException.
•	Database sessions are provided through Depends(get\_db) and closed after use.
8. Environment Configuration
Database credentials are stored in .env and are not committed to Git.
DATABASE\_URL=postgresql+psycopg://postgres:YOUR\_PASSWORD@localhost:5432/clothingstore
The real password must be entered locally and must not be published.
9. Installation and Setup
Clone the repository:
git clone https://github.com/ngurepurity64-gif/Clothing-Store-API.git
cd Clothing-Store-API
Create and activate the virtual environment:
python -m venv .venv
.venv\\Scripts\\activate
Install dependencies:
pip install -r requirements.txt
Create the environment file:
copy .env.example .env
Configure DATABASE\_URL in .env, then open schema.sql in pgAdmin and execute it against the clothingstore database.
10. Run the API
uvicorn main:app --reload
Swagger documentation and interactive API testing are available at:
http://127.0.0.1:8000/docs
11. Verification
Confirm that the PostgreSQL tables exist with:
SELECT table\_name
FROM information\_schema.tables
WHERE table\_schema = 'public'
ORDER BY table\_name;
The expected tables are:
•	clothes
•	customers
•	orders
•	orderitems
12. Testing
The API endpoints were tested through Swagger UI. CRUD operations for clothing items, customer endpoints, order creation and order retrieval were tested, including 404 handling and request validation.
The project was also tested from a fresh clone. During the fresh-clone test, missing dependencies were identified and added to requirements.txt. The application subsequently started successfully and /docs opened successfully.
13. Security
•	.env is excluded through .gitignore.
•	.env.example contains only the required configuration format.
•	Database credentials are not stored in the source code or README.
14. Final Setup Checklist
•	Clone repository.
•	Create and activate .venv.
•	Run pip install -r requirements.txt.
•	Create and configure .env.
•	Run schema.sql in PostgreSQL.
•	Start with uvicorn main:app --reload.
•	Open /docs.
•	Test the endpoints.
•	Confirm git status is clean before final submission.
15. Repository
GitHub: https://github.com/ngurepurity64-gif/Clothing-Store-API

