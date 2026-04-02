-- RPC: get_quiz_questions
-- Returns p_limit random questions with breadcrumb (topic / unit / component)

create or replace function get_quiz_questions(
  p_topic_id   uuid    default null,
  p_bloom_max  int     default 4,
  p_difficulty text    default null,
  p_limit      int     default 10
)
returns setof json
language sql
stable
security definer
as $$
  select row_to_json(r)
  from (
    select
      q.id,
      q.stem,
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d,
      q.correct_answer,
      q.bloom_level,
      q.bloom_label,
      q.difficulty,
      q.marks,
      q.explanation,
      -- breadcrumb
      t.name  as topic_name,
      u.name  as unit_name,
      u.code  as unit_code,
      c.name  as component_name,
      c.code  as component_code
    from questions q
    join topics     t on t.id = q.topic_id
    join units      u on u.id = t.unit_id
    join components c on c.id = u.component_id
    where
      (p_topic_id   is null or q.topic_id   = p_topic_id)
      and q.bloom_level <= p_bloom_max
      and (p_difficulty is null or q.difficulty = p_difficulty)
    order by random()
    limit p_limit
  ) r;
$$;

-- Allow authenticated users to call this function
grant execute on function get_quiz_questions(uuid, int, text, int) to authenticated;
