'use client';

import Section from '../section';
import Container from '../container';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useCallback, useEffect, useRef, useState } from 'react';
import Testimonialcard from './testimonial-card';
import DATA from '@/lib/data';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Testimonials = () => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayDelay = 5000;
  const progressTimerRef = useRef<number | null>(null);

  // Setup autoplay plugin
  const autoplayPlugin = useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    })
  );

  // Handle slide selection and tracking
  useEffect(() => {
    if (!api) return;

    // Set initial slide
    setCurrent(api.selectedScrollSnap());

    // Track slide changes
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Progress timer effect
  useEffect(() => {
    // Clear existing timer
    if (progressTimerRef.current !== null) {
      window.cancelAnimationFrame(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    if (!api || !isPlaying) return;

    let startTime: number | null = null;

    const updateProgress = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const newProgress = Math.min((elapsed / autoplayDelay) * 100, 100);

      if (newProgress < 100) {
        progressTimerRef.current = window.requestAnimationFrame(updateProgress);
      } else {
        // When progress reaches 100%, move to next slide
        startTime = null;

        // Small delay to show completed circle before transition
        setTimeout(() => {
          if (api) {
            api.scrollNext();
          }
        }, 50);
      }
    };

    progressTimerRef.current = window.requestAnimationFrame(updateProgress);

    return () => {
      if (progressTimerRef.current !== null) {
        window.cancelAnimationFrame(progressTimerRef.current);
      }
    };
  }, [api, current, isPlaying, autoplayDelay]);

  // Mouse event handlers
  const handleMouseEnter = useCallback(() => {
    setIsPlaying(false);
    autoplayPlugin.current.stop();
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPlaying(true);
    autoplayPlugin.current.play();
  }, []);

  return (
    <Section className="py-20">
      <Container className="w-full">
        <div className="w-full flex flex-col justify-center items-center gap-1 text-center">
          <span className="capitalize bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text w-fit text-2xl md:text-3xl font-bold">
            Reviews & Testimonials
          </span>
          <span className="font-medium text-sm md:text-base lg:text-lg">
            From Happy, Delighted Trips, Check out what they have to say
          </span>
        </div>
        <div className="w-full mt-10 lg:mt-14">
          <Carousel
            dir="ltr"
            className="w-full"
            plugins={[autoplayPlugin.current]}
            opts={{
              loop: true,
              align: 'start',
              containScroll: 'trimSnaps',
              skipSnaps: false,
              slidesToScroll: 1,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            setApi={setApi}
          >
            <CarouselContent className="pb-4 flex gap-1">
              {DATA.TestimonialData.map((review) => (
                <CarouselItem key={review.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/2">
                  <Testimonialcard
                    name={review.name}
                    review={review.review}
                    rating={review.rating}
                    image={review.image}
                    reviewDate={review.reviewDate}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={() => api?.scrollPrev()}
            disabled={!api}
            className="group relative p-2 sm:p-3 transition-all duration-300 bg-gradient-to-r from-purple-500/60 to-indigo-500/60 dark:from-purple-500/30 dark:to-indigo-500/30 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:from-purple-600/80 hover:to-indigo-600/80 dark:hover:from-purple-500/50 dark:hover:to-indigo-500/50 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FiChevronLeft size={24} strokeWidth={3} />
          </button>
          <button
            onClick={() => api?.scrollNext()}
            disabled={!api}
            className="group relative p-2 sm:p-3 transition-all duration-300 bg-gradient-to-r from-purple-500/60 to-indigo-500/60 dark:from-purple-500/30 dark:to-indigo-500/30 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:from-purple-600/80 hover:to-indigo-600/80 dark:hover:from-purple-500/50 dark:hover:to-indigo-500/50 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FiChevronRight size={24} strokeWidth={3} />
          </button>
        </div>
        <div className="mt-10 text-sm flex flex-col items-center">
          <span>
            <strong>Google</strong> rating score: <strong>4.9</strong> of 5,
          </span>
          <span>
            based on <strong>186 reviews</strong>
          </span>
        </div>
      </Container>
    </Section>
  );
};

export default Testimonials;
