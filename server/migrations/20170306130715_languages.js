exports.up = (knex) => knex.raw(`
CREATE TABLE languages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE user_languages (
  user_id INT NOT NULL REFERENCES users,
  language_id INT NOT NULL REFERENCES languages
);

INSERT INTO languages VALUES (1, 'English'), (2, 'German');

ALTER TABLE propositions ADD COLUMN language_id INT NOT NULL REFERENCES languages DEFAULT 1; 
`)

exports.down = (knex) => knex.raw(`
ALTER TABLE propositions DROP COLUMN language_id;

DROP TABLE languages;
`)
