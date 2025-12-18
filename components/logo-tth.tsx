import Image from 'next/image';
import Link from 'next/link';

const LogoTTH = () => {
  return (
    <Link href={'/'} className="flex items-center text-lg gap-3 font-bold">
      <Image
        src="/images/logo/tth-logo.png"
        alt="logo"
        width={1000000000}
        height={1000000000}
        quality={100}
        className="w-auto h-9"
      />
    </Link>
  );
};

export default LogoTTH;
