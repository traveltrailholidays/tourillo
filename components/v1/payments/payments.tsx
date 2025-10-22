'use client';

import PageHero from '../page-hero';
import Container from '../container';
import { FaPhoneAlt } from 'react-icons/fa';
import PaymentsAccordion from './payments-accordion';
import { motion } from 'framer-motion';

const Payments = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start min-w-screen overflow-x-hidden bg-background">
      <PageHero imageUrl="/images/payment/payments.webp" headingText="Payments" />
      <Container className="px-3 md:px-5 w-[99%] mt-10 lg:mt-16">
        <div className="flex justify-between flex-col md:flex-row gap-10">
          {/* Left Section - Payment Options */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
            className="w-full"
          >
            <div>
              <span className="font-semibold text-lg">Select the desired payment option</span>
            </div>
            <div className="mt-5 flex flex-col gap-5">
              <PaymentsAccordion />
            </div>
          </motion.div>

          {/* Right Section - Help Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' as const }}
            className="rounded bg-foreground p-10 max-w-[450px] w-full h-auto md:h-[310px]"
          >
            <div>
              <div className="text-violet-600 dark:text-violet-400 font-semibold text-xl">
                <span>Get Help</span>
              </div>
              <div className="font-semibold text-3xl mt-3">
                <span>Have Any Query ?</span>
              </div>
              <div className="text-[15px] mt-5">
                <div>Need help with any payment related issue? Please feel free to contact us!</div>
              </div>
              <div className="text-[15px] mt-5">
                <div className="flex items-center gap-5 flex-wrap">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 200 }}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full w-16 h-16 flex justify-center items-center text-custom-txd"
                  >
                    <FaPhoneAlt size={24} />
                  </motion.div>
                  <div>
                    <div>
                      <span className="font-semibold text-base">Call Us</span>
                    </div>
                    <div>
                      <span className="font-semibold text-lg">+91 9625992025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-violet-600 dark:text-violet-400 w-full flex justify-center py-20 px-2 text-center"
        >
          <div>
            Please kindly provide a screenshot confirming your successful payment. Your cooperation is greatly
            appreciated.
          </div>
        </motion.div>
      </Container>
    </main>
  );
};

export default Payments;
