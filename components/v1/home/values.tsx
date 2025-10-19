import DATA from '@/lib/data';
import Container from '../container';
import Section from '../section';
import SectionHeading from '../section-heading';
import GradientIcon from '../gradient-icon';

const Values = () => {
  return (
    <Section className="bg-background py-20">
      <Container className="w-full">
        <SectionHeading mainHeading="What We Serve" subHeading="Top Values For You !" />
        <div className="mt-10 flex flex-wrap md:flex-nowrap gap-5 justify-center items-stretch">
          {' '}
          {/* Added items-stretch here */}
          {DATA.homeValues.map((value, index) => (
            <div key={index} className="flex flex-col pt-10 relative w-full md:w-4/12">
              <div className="w-20 h-20 absolute top-0 bg-background left-6 flex justify-center items-center rounded-full">
                <GradientIcon icon={value.icon} size={48} />
              </div>
              <div className="bg-purple-500/[0.05] dark:bg-purple-500/[0.2] pt-16 px-6 pb-6 flex flex-col w-full gap-4 rounded rounded-tl-none flex-grow">
                {' '}
                {/* Added flex-grow here */}
                <h5 className="text-3xl font-medium">{value.title}</h5>
                <p className="text-lg">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Values;
