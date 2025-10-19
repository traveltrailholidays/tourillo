import ActiveLink from '../active-link';

const Navlinks = () => {
  return (
    <div className="hidden lg:flex gap-6 font-semibold text-sm">
      <ActiveLink href="/" text="Home" />
      <ActiveLink href="/packages" text="Packages" />
      <ActiveLink href="/about-us" text="About" />
      <ActiveLink href="/blogs" text="Blogs" />
      <ActiveLink href="/payments" text="Payments" />
    </div>
  );
};

export default Navlinks;
