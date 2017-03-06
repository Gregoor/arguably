exports.up = (knex) => knex.raw(`
ALTER TABLE propositions ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
`)

exports.down = (knex) => knex.raw(`
ALTER TABLE propositions DROP COLUMN created_at;
`)
