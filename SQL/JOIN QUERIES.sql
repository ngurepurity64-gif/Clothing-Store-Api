SELECT Orders.order_id,
       Orders.order_date,
       OrderItems.quantity,
       OrderItems.unit_price
FROM Orders
JOIN OrderItems
    ON Orders.order_id = OrderItems.order_id;

 SELECT Orders.order_id,
       Orders.order_date,
       OrderItems.quantity
FROM Orders
JOIN OrderItems
    ON Orders.order_id = OrderItems.order_id;

    SELECT Orders.order_id,
       Orders.order_date,
       OrderItems.unit_price
FROM Orders
JOIN OrderItems
    ON Orders.order_id = OrderItems.order_id;

    -- INNER JOIN between Orders and OrderItems; returns orders with matching order items