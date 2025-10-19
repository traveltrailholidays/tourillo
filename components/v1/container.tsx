import React from 'react';

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const Container = ({ children, className = '', ...rest }: ContainerProps) => {
  return (
    <div className={`max-w-[1550px] mx-auto px-4 md:px-10 ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Container;
