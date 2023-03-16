import { useCallback } from 'react';
import { createClient } from '@utils/supabase-server';
import { CreateProfile } from '@components/create-profile/create-profile';

export default function ProfileUserIdCreatePage({
  params: { user_id },
}: {
  params: { user_id: string };
}) {
  // create a form with only one input for username and then submit the response to supabase as username on the userprofile table

  return <CreateProfile user_id={user_id} />;
}
