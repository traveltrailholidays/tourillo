import React from 'react';

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
};

const Section = ({ children, className = '', ...rest }: SectionProps) => {
  return (
    <section className={`w-full flex justify-center items-center ${className}`} {...rest}>
      {children}
    </section>
  );
};

export default Section;
