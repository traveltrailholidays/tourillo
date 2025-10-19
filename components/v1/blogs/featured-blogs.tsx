import Section from '../section';
import Container from '../container';
import SectionHeading from '../section-heading';

const FeaturedBlogs = () => {
  return (
    <Section className="py-10 sm:py-12 md:py-16 lg:py-20">
      <Container className="w-full">
        <div className="">
          <SectionHeading mainHeading="Featured Blogs" subHeading="Curated blogs to fuel your travels" />
        </div>
      </Container>
    </Section>
  );
};

export default FeaturedBlogs;
