BEGIN;

INSERT INTO events (id, description, location, date, time_start, time_end, title, team_id)
VALUES 
(1, 'Cater wedding. Need two bartenders to set up and run bar station; 10 servers to set up tables and accommodate guests as needed', '123 S. Boulevard', '2020-12-03', '17:00:00', '21:00:00', 'Johnson Family Wedding', 1),
(2,
'Spring clean 2 beachhouses on Saturday before renters move in',
'123 Beachway Road',
'2020-12-15',
'10:00:00',
'15:30:00',
'Beachhouse Spring Cleaning',
1
),
(3,
'Book models for Shop LLC photoshoot',
'123 Studio Road',
'2020-12-25',
'10:50:00',
'13:00:00',
'Live TV Product Showcase',
1
);

COMMIT;