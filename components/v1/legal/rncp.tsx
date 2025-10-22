'use client';

import Section from '../section';
import Container from '../container';
import { Calendar } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const Rncp = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <Section className="py-10 sm:py-12 md:py-14 lg:py-16">
      <Container className="md:px-10 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full flex justify-center items-center"
        >
          <span className="capitalize bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text w-fit text-2xl md:text-3xl font-bold">
            Refund & Cancellation Policy
          </span>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header Info */}
          <motion.div variants={itemVariants} className="mt-10 sm:mt-12 md:mt-14 mb-12 p-6 bg-foreground rounded">
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  <strong>Effective Date:</strong> [DD/MM/YYYY]
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  <strong>Last Updated:</strong> [DD/MM/YYYY]
                </span>
              </div>
            </div>
            <p className="mt-4 leading-relaxed">
              By booking a trip with Tourillo, you acknowledge that you have read, understood, and agreed to the following
              policies. These terms are designed to maintain a fair balance between the customer and the company.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Section 1 - Payment Policy */}
            <motion.div variants={itemVariants} className="bg-foreground rounded p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <h2 className="text-xl font-bold">PAYMENT POLICY</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>An advance payment of 30% of the total package cost is required to confirm the booking.</li>
                <li>The remaining 70% payment must be completed before the journey begins by the specified due date.</li>
                <li>
                  Failure to make the full payment on time may result in cancellation of the booking by Tourillo without
                  any refund.
                </li>
              </ul>
            </motion.div>

            {/* Section 2 - Cancellation & Refund Policy */}
            <motion.div variants={itemVariants} className="bg-foreground rounded p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <h2 className="text-xl font-bold">CANCELLATION & REFUND POLICY</h2>
              </div>
              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold mb-2">2a. Eligibility for 100% Refund:</h3>
                  <p className="mb-2">A full refund (100%) will be applicable only if:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>There are more than 7 days left before the trip starts, and</li>
                    <li>Cancellation is made within 24 hours of payment.</li>
                  </ul>
                  <p className="mt-2 text-sm">
                    * Any applicable bank/transaction charges may be deducted. Refunds will be processed within 7-10
                    working days.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2b. No Cash Refund Will Be Provided If:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Less than 7 days remaining before the trip</li>
                    <li>Cancellation after 24 hours of payment</li>
                    <li>Passenger is a &quot;No Show&quot; on the travel date</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2c. Trips Cancelled Due to External/Unforeseen Reasons:</h3>
                  <p className="mb-2">If the trip is cancelled due to external or unavoidable reasons such as:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Government order, lockdown, pandemic</li>
                    <li>Natural calamity, strike, civil unrest</li>
                    <li>Traffic disruption, etc.</li>
                  </ul>
                  <p className="mt-2">
                    In such cases, Tourillo will not be liable to provide any refund, as these events are beyond the
                    company&apos;s control.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Important Note */}
            <motion.div variants={itemVariants} className="bg-foreground rounded p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">!</span>
                </div>
                <h2 className="text-xl font-bold">IMPORTANT NOTE</h2>
              </div>
              <p className="ml-4">Tourillo reserves the right to amend this policy at any time without prior notice.</p>
            </motion.div>

            {/* Agreement Notice */}
            <motion.div variants={itemVariants} className="bg-foreground rounded p-6">
              <p className="font-semibold text-center">
                By booking with Tourillo, you acknowledge and agree to the payment, cancellation, and refund policies
                outlined above.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default Rncp;
