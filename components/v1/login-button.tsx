import Link from 'next/link';

const LoginButton = () => {
  return (
    <Link
      href=""
      className="bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 px-3 py-[7px] text-sm rounded-xs cursor-pointer font-semibold text-white lg:flex items-center justify-center gap-2 hidden"
    >
      Login
    </Link>
  );
};

export default LoginButton;
