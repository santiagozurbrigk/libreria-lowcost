-- Agregar campos de cliente a la tabla orders
ALTER TABLE orders 
ADD COLUMN customer_name VARCHAR(120),
ADD COLUMN customer_email VARCHAR(120),
ADD COLUMN customer_phone VARCHAR(20);
