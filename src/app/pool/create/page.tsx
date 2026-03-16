// ABOUTME: Create pool page that renders the pool creation form
// ABOUTME: Fetches authenticated user and active competitions, passes both to the form component
import CreatePoolForm from '@components/create-pool-form/create-pool-form';
import { createClient } from '@utils/supabase-server';

export type CompetitionRound = {
  round_num: number;
  round_name: string;
};

export type ActiveCompetition = {
  competition_id: number;
  display_name: string;
  season: string | null;
  identifier: string | null;
  rounds: CompetitionRound[];
};

const CreatePoolPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date().toISOString().split('T')[0];
  const { data: competitions } = await supabase
    .from('competition')
    .select('competition_id, season, identifier, daterange, competition_unique, competitionmeta(display_name)')
    .order('competition_id', { ascending: false });

  const activeCompetitionIds = (competitions ?? [])
    .filter((c: any) => {
      // daterange format: "[2026-03-17,2026-04-07)"
      const match = c.daterange?.match(/,(\d{4}-\d{2}-\d{2})\)/);
      if (!match) return true;
      return match[1] >= today;
    });

  const { data: rounds } = await supabase
    .from('competitionround')
    .select('competition_id, round_num, round_name')
    .in('competition_id', activeCompetitionIds.map((c: any) => c.competition_id))
    .order('round_num');

  const roundsByCompetition = new Map<number, CompetitionRound[]>();
  for (const r of rounds ?? []) {
    const list = roundsByCompetition.get(r.competition_id) ?? [];
    list.push({ round_num: r.round_num, round_name: r.round_name });
    roundsByCompetition.set(r.competition_id, list);
  }

  const activeCompetitions: ActiveCompetition[] = activeCompetitionIds.map((c: any) => ({
    competition_id: c.competition_id,
    display_name: c.competitionmeta?.display_name ?? c.competition_unique,
    season: c.season,
    identifier: c.identifier,
    rounds: roundsByCompetition.get(c.competition_id) ?? [],
  }));

  return (
    <CreatePoolForm user_id={user?.id} competitions={activeCompetitions} />
  );
};

export default CreatePoolPage;
