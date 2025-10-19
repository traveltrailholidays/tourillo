import Image from 'next/image';
import Link from 'next/link';

const LogoFull = () => {
  return (
    <Link href={'/'} className="flex items-center text-lg gap-3 font-bold">
      <Image
        src="/images/logo/icon.webp"
        alt="logo"
        width={1000000000}
        height={1000000000}
        quality={100}
        className="w-9 h-9"
      />
      <span>Tourillo</span>
    </Link>
  );
};

export default LogoFull;
