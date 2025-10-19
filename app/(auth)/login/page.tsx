import { Metadata } from 'next';
import { signIn, auth } from '@/auth';
import { redirect } from 'next/navigation';

import Link from 'next/link';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import Section from '@/components/v1/section';
import Container from '@/components/v1/container';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to Tourillo account',
};

const page = async () => {
  const session = await auth();

  if (session) {
    redirect('/');
  }

  return (
    <Section className='h-screen items-start bg-foreground'>
      <Container className="w-full relative flex h-[60vh] items-center">
        <Link href="/" className="absolute left-10 top-4 cursor-pointer hover:scale-125 transition text-custom-clp">
          <FaArrowLeftLong size={20} />
        </Link>
        <div className="w-full flex flex-col text-center items-center gap-3">
          {/* <LogoFull className='mt-20 md:mt-0' /> */}
          <h1 className="heading mt-2 font-medium text-gray-800 dark:text-gray-50">Login to Tourillo account</h1>
          <div className="max-w-[450px] flex flex-col gap-5">
            <h1 className="text-gray-800 dark:text-gray-50">
              Unlock a world of travel with one account across Tourillo
            </h1>
            <div className="flex flex-col gap-4 mt-3 items-center">
              <form
                action={async () => {
                  'use server';
                  await signIn('google');
                }}
              >
                <button
                  type="submit"
                  className="flex items-center justify-center gap-3 border-2 py-3 px-6 rounded cursor-pointer"
                >
                  <FcGoogle />
                  Continue with Google
                </button>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default page;
