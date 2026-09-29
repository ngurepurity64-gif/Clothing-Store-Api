INSERT INTO Customers (name, phone)
VALUES ('Purity Ngure', '0712345678');

INSERT INTO Orders (customer_id, order_date)
VALUES (1, CURRENT_DATE);

INSERT INTO OrderItems (order_id, clothing_id, quantity, unit_price)
VALUES (1, 1, 2, 2500.00);