exports.up = (knex) => knex.raw(`
CREATE TABLE votes (
  user_id INT NOT NULL REFERENCES users ON DELETE CASCADE,
  proposition_id INT NOT NULL REFERENCES propositions ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, proposition_id)
);

ALTER TABLE propositions
  DROP COLUMN votes,
  ADD COLUMN votes_count INT NOT NULL DEFAULT 0;

CREATE FUNCTION refresh_propositions_votes_count() RETURNS TRIGGER AS $vote_stamp$
  BEGIN
    UPDATE propositions
    SET votes_count = votes_count + CASE TG_OP WHEN 'INSERT' THEN 1 ELSE -1 END
    WHERE id = (CASE TG_OP WHEN 'INSERT' THEN NEW ELSE OLD END).proposition_id; 
    RETURN NULL;
  END;
$vote_stamp$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_propositions_votes_count AFTER INSERT OR DELETE ON votes
  FOR EACH ROW
  EXECUTE PROCEDURE refresh_propositions_votes_count();
`);

exports.down = (knex) => knex.raw(`
DROP TRIGGER refresh_propositions_votes_count ON votes;

DROP FUNCTION refresh_propositions_votes_count();

DROP TABLE votes;

ALTER TABLE propositions
  DROP COLUMN votes_count,
  ADD COLUMN votes INT NOT NULL DEFAULT 0;
`);
