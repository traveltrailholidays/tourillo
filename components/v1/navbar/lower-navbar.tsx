import Section from '../section';
import LogoFull from '../logo-full';
import Container from '../container';
import Navlinks from './navlinks';
import Menu from './menu';
import NavSearch from './nav-search';

const LowerNavbar = () => {
  return (
    <Section id="lower-navbar" className="py-2 shadow dark:shadow-gray-500/10 bg-foreground">
      <Container className="w-full flex items-center justify-between gap-10">
        <LogoFull />
        <Navlinks />
        <div className="flex items-center gap-3">
          <NavSearch />
          <Menu />
        </div>
      </Container>
    </Section>
  );
};

export default LowerNavbar;
