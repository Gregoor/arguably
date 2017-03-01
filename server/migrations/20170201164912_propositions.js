exports.up = (knex) => knex.raw(`
CREATE TYPE proposition_type AS ENUM ('pro', 'contra');

CREATE TABLE propositions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  parent_id INT REFERENCES propositions ON DELETE CASCADE,
  votes INT NOT NULL DEFAULT 0,
  type proposition_type
);
`);

exports.down = (knex) => knex.raw(`
DROP TABLE propositions;
DROP TYPE proposition_type;
`);
