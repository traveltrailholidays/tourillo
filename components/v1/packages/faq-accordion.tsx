'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FaqPackageAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <div className={`flex flex-col gap-5`}>
        <AccordionItem value="item-1" className={`border-none`}>
          <AccordionTrigger className={`hover:no-underline bg-foreground px-5 rounded-md`}>
            <div className="text-left">Why should i use a Travel Agent to book a vacation?</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 border-[0.125rem] rounded-md border-border p-12">
              A travel agent takes all of the headache out of planning a trip and handles virtually all aspects of your
              travel, at absolutely no cost to you. The combined experience of the team and the feedback from our
              thousands of travelers provides an invaluable resource to the traveler planning an important trip.
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className={`border-none`}>
          <AccordionTrigger className={`hover:no-underline bg-foreground px-5 rounded-md`}>
            <div className="text-left">Does it cost money to get a quote?</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 border-[0.125rem] rounded-md border-border p-12">
              No, there is no fee for our vacation planning services.
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3" className={`border-none`}>
          <AccordionTrigger className={`hover:no-underline bg-foreground px-5 rounded-md`}>
            <div className="text-left">Can you work within a certain budget?</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 border-[0.125rem] rounded-md border-border p-12">
              Yes, we work within any and all realistic budgets, and an honest sharing of ideas and goals helps us
              immensely when making recommendations and suggested edits to travel plans.
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4" className={`border-none`}>
          <AccordionTrigger className={`hover:no-underline bg-foreground px-5 rounded-md`}>
            <div className="text-left">How come your flight prices are cheaper than other OTA websites?</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 border-[0.125rem] rounded-md border-border p-12">
              This is simply because we do not charge any markups or fee for using our services.
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5" className={`border-none`}>
          <AccordionTrigger className={`hover:no-underline bg-foreground px-5 rounded-md`}>
            <div className="text-left">What if I face any issues during the Tour?</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 border-[0.125rem] rounded-md border-border p-12">
              There would be a dedicated Travel Counselor assigned exclusively to you, who would be in touch with you
              from the time when the query was initiated till the time the tour ends, In case of any issues faced by
              you, a solution would be immediately offered.
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-6" className={`border-none`}>
          <AccordionTrigger className={`hover:no-underline bg-foreground px-5 rounded-md`}>
            <div className="text-left">How can i get in touch with Tourillo?</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 border-[0.125rem] rounded-md border-border p-12">
              You can write to us at support@traveltrailholidays.com or give us a call at +91 9625992025, +91 9953276022
              at Any time.
            </div>
          </AccordionContent>
        </AccordionItem>
      </div>
    </Accordion>
  );
}
