Clothing Store API

1. Overview
   Clothing Store API is a RESTful backend application built with Python,
   FastAPI, PostgreSQL, and SQLAlchemy. It manages clothing inventory,
   customers, orders, and order items. It also supports user registration
   and login using password hashing and JSON Web Tokens (JWT).

The API uses Pydantic for request validation and response models.
FastAPI provides interactive API documentation through Swagger UI.

The project also includes PURE STYLE, a clothing store frontend
built with HTML, CSS, and JavaScript. The webpage features a welcome
section, featured clothing, an inventory table, a clothing item form,
store information, and contact details.

JavaScript connects the frontend to the backend using the Fetch API to
retrieve clothing items from the /clothes endpoint. The webpage
displays clothing records returned by the API, and the form is designed
to submit new clothing items to the backend. Adding an item requires
valid data and authentication where required.

The backend uses PostgreSQL to store application data, while the
frontend provides the user interface for viewing and interacting with
the clothing inventory. 2. Technologies Used

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
- JavaScript
- Git and GitHub

3. Project Structure
   Clothing-Store-API/
   ├── routers/
   │ ├── **init**.py
   │ ├── auth.py
   │ ├── clothes.py
   │ ├── customers.py
   │ └── orders.py
   ├── SQL/
   │ ├── schema.sql
   │ ├── clothes_table_rows.sql
   │ ├── create_database_clothingstore.sql
   │ ├── insert_customers.sql
   │ ├── join_queries.sql
   │ └── rows_displayed.sql
   ├── tests/
   │ └── test_main.py
   ├── frontend/
   │ ├── index.html
   │ ├── style.css
   │ ├── script.js
   │ └── images/
   ├── .env.example
   ├── .gitignore
   ├── database.py
   ├── main.py
   ├── models.py
   ├── schemas.py
   ├── requirements.txt
   └── README.md
   The structure above shows the intended layout. Keep the SQL filenames
   consistent with the files that actually exist in the SQL folder. The
   frontend/ folder contains the webpage files; update the structure if
   your actual filenames or folders differ.

The real .env file is intentionally not listed because it contains
private configuration values and must remain excluded from Git.

Main files and folders:

- main.py creates the FastAPI application and registers the routers.
- database.py configures the database connection, sessions, and
  get_db dependency.
- models.py defines the SQLAlchemy database models and
  relationships.
- schemas.py defines Pydantic request and response schemas.
- routers/auth.py handles user registration and login.
- routers/clothes.py handles clothing endpoints.
- routers/customers.py handles customer endpoints.
- routers/orders.py handles order and order-item operations.
- SQL/schema.sql creates the database tables.
- tests/test_main.py contains automated API tests.
- .env.example provides a template for local environment
  configuration.
- requirements.txt lists the Python dependencies.
- frontend/index.html contains the semantic HTML structure of the
  PURE STYLE webpage.
- frontend/style.css controls the webpage's colours, layout,
  spacing, hover effects, and responsive design.
- frontend/script.js handles frontend interactions and communication
  with the API.

4. Database Design
   The application uses PostgreSQL. The database schema contains five main
   tables.
   Table Purpose
   clothes Stores clothing names, brands,
   colours, sizes, quantities, and
   prices.

customers Stores customer information.

orders Stores customer orders and order
dates.

order_items Stores clothing items, quantities,
and unit prices associated with
orders.
users Stores registered email addresses
and hashed passwords.
Relationships

- One customer can have many orders.
- One order can contain many order items.
- One clothing item can appear in many order items.
  Foreign keys maintain the relationships between the related tables.

5. Database Schema Setup
   The database structure is defined in SQL/schema.sql.

The file creates the following tables:

- clothes
- customers
- orders
- order_items
- users
  The schema includes the users table for authentication and the
  corrected order_items table name.

Run the complete SQL/schema.sql file against the intended PostgreSQL
database using pgAdmin or another PostgreSQL client.

The schema should create all five tables without requiring manually
created tables from a previous database setup.
Verify the tables
Run this SQL query in PostgreSQL:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
The expected application tables are:
clothes
customers
order_items
orders
users
Other tables may appear if your PostgreSQL database contains additional
objects.

For schema testing, use a separate test database so that the original
working database and its data are not accidentally deleted. 6. API Endpoints
The following tables describe the main API operations. Confirm the exact
paths and methods in the running Swagger documentation at /docs,
because the routers define the final registered endpoints.
General
Method Endpoint Purpose
POST /orders Create a new order for an existing customer.
GET /orders Retrieve all orders.
GET /orders/{order_id} Retrieve a specific order and its items.
POST /orders/{order_id}/items Add a clothing item to an existing order.
Authentication
Method Endpoint Purpose
POST /register Register a new user.
POST /login Authenticate a user and obtain an access token. 7. Validation and Error Handling

- Clothing quantity uses Field(ge=0) to reject negative quantities.
- Order-item quantity uses Field(gt=0) to require a positive
  quantity.
- Price and unit-price values use Decimal.
- User email addresses are validated using Pydantic's EmailStr.
- User registration requires a password of at least eight characters
  using Field(min_length=8).
- Passwords are hashed before they are stored in the database.
- Missing clothing and order records return appropriate HTTP error
  responses.
- Database sessions are provided through FastAPI's Depends(get_db)
  dependency.
- Pydantic v2 schemas use ConfigDict where required to read
  SQLAlchemy model attributes.

8. Environment Configuration and Security
   The application uses environment variables for database configuration
   and authentication secrets.

The local .env file contains the actual database connection string and
a securely generated secret key.

Example .env format:
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/clothingstore
SECRET_KEY=YOUR_GENERATED_SECRET_KEY
Replace the example values with your actual local configuration. The
values above are placeholders, not working credentials.

The .env.example file should contain placeholders only:
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/clothingstore
SECRET_KEY=YOUR_SECRET_KEY_HERE
Security practices

- .env must be excluded from Git using .gitignore.
- Never commit real database passwords or secret keys.
- Use a strong, randomly generated SECRET_KEY.
- Store hashed passwords instead of plain-text passwords.
- Keep the example configuration free of real credentials.

9. Installation and Setup
   Step 1: Clone the repository
   git clone https://github.com/ngurepurity64-gif/Clothing-Store-API.git
   cd Clothing-Store-API
   Step 2: Create and activate a virtual environment
   On Windows:
   python -m venv .venv
   .venv\Scripts\activate
   Step 3: Install dependencies
   python -m pip install -r requirements.txt
   Step 4: Create the environment file
   copy .env.example .env
   Edit .env and configure your PostgreSQL connection and real secret
   key. Do not replace your working credentials with the example
   placeholders.
   Step 5: Create the database schema
   Create the intended PostgreSQL database if it does not already exist.
   Then execute SQL/schema.sql against that database.

Ensure that DATABASE_URL in .env points to the same database where
you created the tables.

For testing schema recreation, use a separate test database rather than
dropping your working database. 10. Running the API
Start the development server from the project root:
uvicorn main:app --reload
The API will normally be available at:

- Base URL: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health
  The health check should return:
  {
  "status": "ok"
  }
  Use Swagger UI to inspect the available endpoints and submit test
  requests.

11. Testing
    The project includes automated tests in tests/test_main.py.

Run the tests from the project root:
python -m pytest -q
The test suite should pass before changes are committed. Test results
depend on the current code, configuration, and test environment.

Authentication and order-item operations should also be tested through
Swagger UI where applicable:

1. Register a user.
2. Log in using the registered email in the login form's username
   field and the corresponding password.
3. Confirm that a successful login returns an access token.
4. Create an order and add an order item using valid records.
5. Verify the response and resulting database records.
6. Frontend Development --- PURE STYLE
   Frontend functionality
   The PURE STYLE frontend uses HTML for its structure, CSS for styling,
   and JavaScript for interactive functionality.

JavaScript selects HTML elements using document.querySelector(),
stores clothing data in arrays and objects, and uses event listeners to
respond to form submissions.

The Fetch API retrieves clothing records from the deployed API endpoint:

https://pure-style-api.onrender.com/clothes

During local development, the frontend can use the local API endpoint:

http://127.0.0.1:8000/clothes

The returned data is displayed in the inventory table. The application
may display a fallback message or sample data if the API request fails,
depending on the current frontend code.

The clothing form collects item details and submits a POST request to
the backend. Where authentication is required, the request includes a
Bearer access token. The frontend displays status or error messages and
reloads the inventory after a successful addition.

The CSS provides the navy and purple theme, responsive layouts, hover
effects, gradients, and other visual styling.

The frontend and backend run as separate applications during
development. The frontend must be served through a local web server, and
the backend must be running for local API integration to work.
Cross-Origin Resource Sharing (CORS) must be configured appropriately on
the backend.
HTML structure
The webpage uses semantic HTML elements to organize the content:

- <header> contains the store branding and navigation links.
- <main> contains the main webpage content.
- <section> separates the welcome, collection, item form, about, and
  contact areas.
- <table> displays the clothing inventory.
- <form> contains fields for entering clothing information.
- <footer> contains additional store information and navigation
    links.
  The webpage includes a featured clothing section and an inventory area.
  The live collection displays the clothing records returned by the API.
  The item form includes fields for the item name, brand, colour, size,
  quantity, and price.
  CSS styling and layout
  The external style.css file controls the appearance of the webpage.

The design uses a midnight navy, purple, and lavender colour theme, with
readable typography and consistent spacing.

The styling includes:

- Flexbox for navigation and flexible alignment.
- CSS Grid for form fields, value cards, and footer columns.
- A styled clothing table with alternating row colours and hover
  effects.
- Styled form fields, labels, and buttons.
- Rounded content cards, gradients, and subtle shadows.
- Hover transitions on navigation links, cards, buttons, and table
  rows.
- A moving announcement bar.
- A responsive layout that adapts to smaller screens.
- A reduced-motion setting for users who prefer fewer animations.
  Frontend and backend connection
  The frontend is deployed on Netlify and communicates with the deployed
  FastAPI backend on Render. JavaScript uses the Fetch API to retrieve
  clothing records from the backend. The backend communicates with the
  hosted Neon PostgreSQL database and returns the records for display on
  the website.

The live PURE STYLE collection was tested and all nine clothing records
appeared successfully. The frontend also supports submitting clothing
items through the API, subject to the required validation and
authentication. 13. Git and GitHub
Before committing changes, inspect the repository:
git status
git diff --check
Stage only the intended project files, review the staged changes, and
commit them with a descriptive message.

Ensure .env and other secret files are not included in the commit.

Push the completed changes to GitHub after verifying the code and
reviewing the commit. 14. Final Setup and Progress Checklist
Backend and database

- Clone the repository.
- Create and activate .venv.
- Install dependencies from requirements.txt.
- Configure .env with a valid database URL and generated secret key.
- Confirm .env is excluded from Git.
- Run SQL/schema.sql against the intended database.
- Verify the five application tables.
- Start the API using Uvicorn.
- Open Swagger UI at /docs.
- Test registration, login, and order-item operations.
- Run the automated tests.
  Frontend
- Create the semantic HTML structure.
- Display clothing items in a table.
- Add a clothing item form.
- Apply the navy and purple CSS theme.
- Add layout, spacing, hover effects, and visual styling.
- Add responsive styling for phone-width screens.
- Add JavaScript variables, functions, arrays, objects, and event
  listeners.
- Render clothing items using JavaScript.
- Connect the webpage to the API using the Fetch API.
- Verify CORS configuration for frontend-to-backend requests.
- Display clothing records returned by the API.
- Verify successful item creation and error handling.
  Hosted PostgreSQL Database (Neon)
  The PURE STYLE Clothing Store API uses a hosted PostgreSQL database
  provided by Neon.
  Database Setup

1. Created a free PostgreSQL database instance on Neon.
2. Executed the SQL/schema.sql file against the hosted database.
3. Imported the existing clothing records into the hosted database.
4. Updated the local .env file with the Neon database connection URL.
   Environment Configuration
   The application reads its database connection details from environment
   variables.
   DATABASE_URL=your_neon_database_connection_string
   SECRET_KEY=your_secret_key
   Security: The .env file is excluded from Git using .gitignore.
   The actual database credentials and secret key should never be committed
   to GitHub. The .env.example file provides placeholder values.
   Verification
   The application was tested locally using the hosted Neon database. The
   API successfully connected to the database and retrieved all nine
   clothing records without requiring changes to the existing application
   functionality.
   API Deployment on Render
   The PURE STYLE Clothing Store API was deployed to Render using the free
   web service plan.
   Deployment Configuration

- Hosting platform: Render
- Service name: pure-style-api
- Repository: Clothing-Store-API
- Branch: main
- Build command: pip install -r requirements.txt
- Start command:
  uvicorn main:app --host 0.0.0.0 --port $PORT
  Environment Variables on Render
  The following environment variables were configured in the Render
  dashboard:
- DATABASE_URL -- Neon PostgreSQL connection string.
- SECRET_KEY -- Secret key used for authentication.
  These values are configured securely in the hosting dashboard rather
  than being hardcoded in the application.
  Live API
  Public API URL: https://pure-style-api.onrender.com

Swagger documentation: https://pure-style-api.onrender.com/docs

Clothing records endpoint:
https://pure-style-api.onrender.com/clothes
Deployment Verification
The deployed API was tested successfully:

- Swagger documentation opened successfully.
- The /clothes endpoint returned all nine clothing records.
- The deployed backend successfully retrieved records from the hosted
  Neon database.
  Frontend Deployment on Netlify
  The PURE STYLE frontend is hosted on Netlify.

Live Website: https://pure-style-clothing-store.netlify.app/

The frontend communicates with the deployed FastAPI backend hosted on
Render.
Frontend Integration with the Deployed API
The frontend JavaScript is configured to communicate with the deployed
Render API instead of the local development server when the website is
deployed.
const API_URL = "https://pure-style-api.onrender.com/clothes";
The frontend retrieves clothing data by sending HTTP requests to the
FastAPI backend. The backend communicates with the Neon PostgreSQL
database and returns the records for display on the website.

The frontend was tested using Live Server, and all nine clothing records
displayed successfully. The live Netlify website is also deployed and
uses the Render API.
Final version control steps

- Review the intended changes.
- Commit the completed work.
- Push the changes to GitHub.

15. Repository
    GitHub: https://github.com/ngurepurity64-gif/Clothing-Store-API
16. Live Project Links

- PURE STYLE Website:
  https://pure-style-clothing-store.netlify.app/
- Live API: https://pure-style-api.onrender.com
- Swagger API Documentation:
  https://pure-style-api.onrender.com/docs
- Clothing Records: https://pure-style-api.onrender.com/clothes
- GitHub Repository:
  https://github.com/ngurepurity64-gif/Clothing-Store-API
