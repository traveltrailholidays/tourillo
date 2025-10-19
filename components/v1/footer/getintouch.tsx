import React from 'react';
import ActiveLink from '../active-link';
import { MdKeyboardArrowRight } from 'react-icons/md';

const GetInTouchFooter = () => {
  return (
    <div className="">
      <h1 className="text-xl font-semibold">Get In Touch</h1>
      <div className="mt-4 ml-5 flex flex-col gap-2 font-medium">
        <div className="flex gap-1">
          <div className="mt-[2px]">
            <MdKeyboardArrowRight size={20} />
          </div>
          <ActiveLink href="tel:+919953276022" text="+91 9953276022" />
        </div>
        <div className="flex gap-1">
          <div className="mt-[2px]">
            <MdKeyboardArrowRight size={20} />
          </div>
          <ActiveLink href="tel:+919625992025" text="+91 9625992025" />
        </div>
        <div className="flex gap-1">
          <div className="mt-[2px]">
            <MdKeyboardArrowRight size={20} />
          </div>
          <div className="hidden sm:flex">
            <ActiveLink href="mailto:support@tourillo.com" text="support@tourillo.com" />
          </div>
          <div className="sm:hidden">
            <ActiveLink href="mailto:support@tourillo.com" text="support @tourillo .com" />
          </div>
        </div>
        <div className="flex gap-1">
          <div className="mt-[2px]">
            <MdKeyboardArrowRight size={20} />
          </div>
          <ActiveLink
            href="https://www.google.com/maps/place/Travel+Trail+Holidays/@28.499434,77.311883,18z/data=!4m6!3m5!1s0x233345ea4f02dbf5:0x55345f187277ecd2!8m2!3d28.4994338!4d77.3118827!16s%2Fg%2F11y3rzvw5z?hl=en&entry=ttu"
            text="Office No - 35, Gali No. 03, Block B, Molarband Extn, Badarpur, New Delhi - 110044"
          />
        </div>
      </div>
    </div>
  );
};

export default GetInTouchFooter;
