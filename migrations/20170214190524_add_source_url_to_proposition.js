exports.up = (knex) => knex.raw(`
ALTER TABLE propositions ADD COLUMN source_url TEXT;
`);

exports.down = (knex) => knex.raw(`
ALTER TABLE propositions DROP COLUMN source_url;
`);
