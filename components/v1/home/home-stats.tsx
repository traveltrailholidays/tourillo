'use client';

import Section from '../section';
import Container from '../container';
import { useEffect, useRef, useState, useCallback } from 'react';

interface NumberCounterProps {
  end: number;
  duration: number;
  isAnimating: boolean;
}

interface CounterData {
  title: string;
  value: number;
}

const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const NumberCounter: React.FC<NumberCounterProps> = ({ end, duration, isAnimating }) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!isAnimating) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easedPercentage = easeInOutQuad(percentage);
      const currentCount = Math.floor(end * easedPercentage);

      setCount(currentCount);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isAnimating]);

  return (
    <div className="relative text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text select-none">
      {count.toLocaleString()}
      <span className="text-4xl absolute top-0 -right-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
        +
      </span>
    </div>
  );
};

const HomeStats = () => {
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
      }
    },
    [hasAnimated]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.1 });
    const currentRef = componentRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleIntersection]);

  const data: CounterData[] = [
    { title: 'Total Destinations', value: 100 },
    { title: 'Travel Packages', value: 50 },
    { title: 'Total Travelers', value: 2000 },
    { title: 'Positive Reviews', value: 1500 },
  ];

  return (
    <Section className="py-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <Container className="w-full">
        <div ref={componentRef} className="flex flex-wrap justify-around gap-6">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex flex-col justify-center items-center gap-2 py-2 h-[130px] bg-gray-100 hover:bg-gray-200 hover:scale-105 md:hover:scale-110 lg:hover:scale-125 transition rounded cursor-pointer transform-gpu duration-500 w-full max-w-[300px]"
            >
              <NumberCounter end={item.value} duration={2000} isAnimating={hasAnimated} />
              <div className="flex flex-col items-center">
                <span className="font-medium text-lg text-gray-600">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default HomeStats;
