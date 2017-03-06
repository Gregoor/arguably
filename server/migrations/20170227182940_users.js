exports.up = (knex) => knex.raw(`
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  password_hash TEXT,
  can_vote BOOL NOT NULL DEFAULT FALSE,
  can_publish BOOL NOT NULL DEFAULT FALSE
);

ALTER TABLE propositions
  ADD COLUMN user_id INT REFERENCES users,
  ADD COLUMN published BOOL NOT NULL DEFAULT FALSE ;

WITH users AS (
  INSERT INTO users (name) VALUES ('Arguman') RETURNING id
)
UPDATE propositions SET user_id = users.id FROM users;
COMMIT;

BEGIN;
ALTER TABLE propositions ALTER COLUMN user_id SET NOT NULL;
`)

exports.down = (knex) => knex.raw(`
ALTER TABLE propositions
  DROP COLUMN user_id,
  DROP COLUMN published;
  
DROP TABLE users;
`)
