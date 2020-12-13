BEGIN;

INSERT INTO users (id, email, first_name, last_name, password, date_created, profile_image, phone_number)
VALUES 
(1, 'user1@demo.com', 'Zach', 'Painter', 'password1', '2020-01-03T00:00:00.000Z', 'https://i.imgur.com/0za9KMO.jpg', '1234567890');

COMMIT;