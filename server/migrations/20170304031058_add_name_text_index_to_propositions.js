exports.up = (knex) => knex.raw(`
CREATE INDEX propositions_idx ON propositions
  USING GIN (to_tsvector('english', name || ' ' || text));
`)

exports.down = (knex) => knex.raw(`
DROP INDEX propositions_idx;
`)
