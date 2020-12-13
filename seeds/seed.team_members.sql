BEGIN;

INSERT INTO team_members (id, team_id, user_id, invite_date, accepted)
VALUES
(1, 1, 1, '2020-01-03T00:00:00.000Z', 'false');

COMMIT;
