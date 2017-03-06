exports.up = (knex) => knex.raw(`
CREATE TABLE votes (
  user_id INT NOT NULL REFERENCES users ON DELETE CASCADE,
  proposition_id INT NOT NULL REFERENCES propositions ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, proposition_id)
);
ALTER TABLE propositions DROP COLUMN votes;
`);

exports.down = (knex) => knex.raw(`
DROP TABLE votes;
ALTER TABLE propositions ADD COLUMN votes INT NOT NULL DEFAULT 0;
`);
