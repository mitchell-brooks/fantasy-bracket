import { CreateProfile } from '@components/create-profile/create-profile';

export default async function ProfileUserIdCreatePage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;
  // create a form with only one input for username and then submit the response to supabase as username on the userprofile table

  return <CreateProfile user_id={user_id} />;
}
