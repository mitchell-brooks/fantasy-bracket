import Link from 'next/link';
import CreatePoolForm from '@components/create-pool-form/create-pool-form';
import { createClient } from '@utils/supabase-server';

const CreatePoolPage = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // console.log(':::user from server page', user);
  return (
    <>
      {/*TODO: add logic for selecting competition (and thereby competition_id)*/}
      <CreatePoolForm user_id={user?.id} competition_id={3} />
    </>
  );
};

export default CreatePoolPage;
