import React from 'react';
import { MdKeyboardArrowRight } from 'react-icons/md';
import ActiveLink from '../active-link';

const LegalFooter = () => {
  return (
    <div className="">
      <h1 className="text-xl font-semibold">Legal</h1>
      <div className="mt-4 ml-5 flex flex-col gap-2 font-medium">
        <div className="flex gap-1">
          <div className="mt-[2px]">
            <MdKeyboardArrowRight size={20} />
          </div>
          <ActiveLink href="/legal/privacy-policy" text="Privacy Policy" />
        </div>
        <div className="flex gap-1">
          <div className="mt-[2px]">
            <MdKeyboardArrowRight size={20} />
          </div>
          <ActiveLink href="/legal/term-condition" text="Terms & Condition" />
        </div>
        <div className="flex gap-1">
          <div className="mt-[2px]">
            <MdKeyboardArrowRight size={20} />
          </div>
          <ActiveLink href="/legal/refund-cancellation-policy" text="Refund & Cancellation Policy" />
        </div>
      </div>
    </div>
  );
};

export default LegalFooter;
