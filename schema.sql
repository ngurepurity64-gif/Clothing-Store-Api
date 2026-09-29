CREATE TABLE Clothes (
    clothing_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    brand VARCHAR(50),
    color VARCHAR(30),
    size VARCHAR(10),
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE Customers (
    customer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20)
);

CREATE TABLE Orders (
    order_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,

    FOREIGN KEY (customer_id)
        REFERENCES Customers(customer_id)
);

CREATE TABLE OrderItems (
    order_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INT NOT NULL,
    clothing_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id)
        REFERENCES Orders(order_id),

    FOREIGN KEY (clothing_id)
        REFERENCES Clothes(clothing_id)
);

-- Database Schema Description
-- Clothes stores clothing inventory.
-- Customers stores customer information.
-- Orders stores customer orders.
-- OrderItems stores the clothes included in each order.
--
-- Relationships:
-- Customers 1 ---- many Orders
-- Orders 1 ---- many OrderItems
-- Clothes 1 ---- many OrderItems