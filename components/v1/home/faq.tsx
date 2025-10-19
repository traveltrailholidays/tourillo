import Section from '../section';
import Container from '../container';
import SectionHeading from '../section-heading';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Faqs = () => {
  return (
    <Section className="py-20 bg-foreground">
      <Container className="w-full flex flex-col gap-10">
        <SectionHeading mainHeading="FAQ" subHeading="Most frequently asked questions" isSmallS />
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="hover:no-underline md:text-lg font-medium text-start cursor-pointer">
              What makes Tourillo special among other travel companies ?
            </AccordionTrigger>
            <AccordionContent className="text-xs md:text-sm lg:text-base  text-neutral-700 dark:text-neutral-300">
              At Tourillo, we ensure complete transparency and reliability by managing every aspect of your trip
              ourselves. Our dedicated in-house operations team meticulously crafts each journey, setting us apart.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="hover:no-underline md:text-lg font-medium text-start cursor-pointer">
              How do I book a package from Tourillo?
            </AccordionTrigger>
            <AccordionContent className="text-xs md:text-sm lg:text-base  text-neutral-700 dark:text-neutral-300">
              Booking a travel package with us is effortless! Simply visit our website to submit a travel inquiry or DM
              us on social media. Our dedicated team will quickly provide you with all the information and guidance you
              need.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="hover:no-underline md:text-lg font-medium text-start cursor-pointer">
              Is Tourillo safe for solo female travelers?
            </AccordionTrigger>
            <AccordionContent className="text-xs md:text-sm lg:text-base  text-neutral-700 dark:text-neutral-300">
              At Tourillo, safety is our top priority. We take extra measures to ensure the comfort and security of solo
              female travelers. Our Team Captains receive specialized training to provide a seamless and secure
              experience, with a strong focus on women&apos;s safety.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Container>
    </Section>
  );
};

export default Faqs;
