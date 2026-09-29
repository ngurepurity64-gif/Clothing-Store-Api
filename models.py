from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

# Create the base class for SQLAlchemy models
Base = declarative_base()


# SQLAlchemy model for the clothes table
class Clothes(Base):
    __tablename__ = "clothes"

    clothing_id = Column(Integer, primary_key=True)
    name = Column(String)
    size = Column(String)
    quantity = Column(Integer)
    price = Column(Numeric)

    # Relationship with order items
    order_items = relationship("OrderItems", back_populates="clothing")


# SQLAlchemy model for customers
class Customers(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True)
    name = Column(String)
    phone = Column(String)

    # One customer can have many orders
    orders = relationship("Orders", back_populates="customer")


# SQLAlchemy model for orders
class Orders(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"))
    order_date = Column(Date)

    # Relationship with customer
    customer = relationship("Customers", back_populates="orders")

    # One order can have many order items
    items = relationship("OrderItems", back_populates="order")


# SQLAlchemy model for order items
class OrderItems(Base):
    __tablename__ = "orderitems"

    order_item_id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"))
    clothing_id = Column(Integer, ForeignKey("clothes.clothing_id"))
    quantity = Column(Integer)
    unit_price = Column(Numeric)

    # Relationship with order
    order = relationship("Orders", back_populates="items")

    # Relationship with clothing
    clothing = relationship("Clothes", back_populates="order_items")