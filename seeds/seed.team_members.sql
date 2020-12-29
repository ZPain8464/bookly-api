BEGIN;

INSERT INTO team_members (team_id, user_id, invite_date, accepted)
VALUES
(1, 2, '2020-01-03T00:00:00.000Z', 'true');

COMMIT;
