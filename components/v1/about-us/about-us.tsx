'use client';

import { Award, Compass, Globe, Leaf, Target, Users } from 'lucide-react';
import PageHero from '../page-hero';
import Section from '../section';
import Container from '../container';
import { motion, Variants } from 'framer-motion';

const AboutUs = () => {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start min-w-screen overflow-x-hidden bg-background">
      <PageHero imageUrl="/images/about-us/about.webp" headingText="About Us" />

      {/* Introduction Section */}
      <Section className="py-20 px-4">
        <Container className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center px-4 py-2 mb-6 text-lg font-medium text-transparent bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text border-2 border-transparent rounded-full relative"
          >
            <span className="relative z-10 bg-border text-theme-text px-4 py-2 rounded-full">Welcome To</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-8"
          >
            <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Tourillo Pvt Ltd.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="leading-relaxed text-lg max-w-6xl"
          >
            At Tourillo Pvt Ltd., our mission is to design journeys that leave an indelible mark on travelers, unveiling
            the captivating essence of India&apos;s culture, heritage, and natural splendor. As a leading travel company
            specializing in bespoke India tour packages, we are committed to curating experiences that surpass
            expectations and forge enduring memories.
          </motion.p>
        </Container>
      </Section>

      {/* Mission & Vision Section */}
      <Section className="py-20 bg-foreground">
        <Container>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-12"
          >
            {/* Mission Card */}
            <motion.div
              variants={cardVariants}
              className="bg-background rounded shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="text-center pb-6 pt-8 px-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6"
                >
                  <Target className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold">Our Mission</h3>
              </div>
              <div className="text-center px-6 pb-8">
                <p className="leading-relaxed">
                  We&apos;re dedicated to inspiring travelers to explore India&apos;s enchanting allure through
                  meticulously planned tours, expert guidance, and unparalleled hospitality. Our mission is to foster
                  deeper connections between travelers and India&apos;s heritage, creating meaningful experiences that
                  leave a lasting impact.
                </p>
              </div>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              variants={cardVariants}
              className="bg-background rounded shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="text-center pb-6 pt-8 px-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6"
                >
                  <Globe className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold">Our Vision</h3>
              </div>
              <div className="text-center px-6 pb-8">
                <p className="leading-relaxed">
                  Capturing the essence of India&apos;s varied landscapes, profound history, and cultural richness, our
                  aim is to become the foremost provider of personalized and immersive travel experiences in the
                  country. We are dedicated to crafting journeys that not only showcase India&apos;s diversity but also
                  ensure unparalleled service and utmost customer satisfaction.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* What Sets Us Apart Section */}
      <Section className="py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What Sets Us Apart</h2>
            <p className="text-lg max-w-6xl mx-auto leading-relaxed">
              At Travel Trail Holidays, we craft journeys that go beyond the ordinary. With customized itineraries,
              seasoned experts, dedicated service, and a commitment to responsible tourism.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Tailored Experiences Card */}
            <motion.div
              variants={cardVariants}
              className="text-center bg-foreground rounded shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className="pb-4 pt-8 px-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, type: 'spring', stiffness: 180 }}
                  className="mx-auto w-16 h-16 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4"
                >
                  <Users className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold">Tailored Experiences</h3>
              </div>
              <div className="px-6 pb-8">
                <p className="leading-relaxed">
                  Understanding the diversity of travelers, we specialize in crafting personalized tour packages
                  tailored to individual preferences, interests, and budgets. Our goal is to ensure a customized and
                  unforgettable experience for each traveler exploring the enchanting allure of India.
                </p>
              </div>
            </motion.div>

            {/* Expert Guidance Card */}
            <motion.div
              variants={cardVariants}
              className="text-center bg-foreground rounded shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className="pb-4 pt-8 px-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1, type: 'spring', stiffness: 180 }}
                  className="mx-auto w-16 h-16 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4"
                >
                  <Compass className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold">Expert Guidance</h3>
              </div>
              <div className="px-6 pb-8">
                <p className="leading-relaxed">
                  Backed by seasoned travel experts, we delve deep into India&apos;s iconic destinations and hidden
                  gems. From must-see landmarks to off-the-beaten-path wonders, every detail of your journey is
                  meticulously curated. Trust us to craft an expertly tailored experience.
                </p>
              </div>
            </motion.div>

            {/* Unparalleled Service Card */}
            <motion.div
              variants={cardVariants}
              className="text-center bg-foreground rounded shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className="pb-4 pt-8 px-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 180 }}
                  className="mx-auto w-16 h-16 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4"
                >
                  <Award className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold">Unparalleled Service</h3>
              </div>
              <div className="px-6 pb-8">
                <p className="leading-relaxed">
                  At the heart of our service lies unwavering dedication to customer satisfaction. From your initial
                  inquiry to the conclusion of your journey, our devoted team ensures personalized assistance and
                  support, guaranteeing a seamless and memorable experience.
                </p>
              </div>
            </motion.div>

            {/* Responsible Tourism Card */}
            <motion.div
              variants={cardVariants}
              className="text-center bg-foreground rounded shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className="pb-4 pt-8 px-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3, type: 'spring', stiffness: 180 }}
                  className="mx-auto w-16 h-16 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4"
                >
                  <Leaf className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold">Responsible Tourism</h3>
              </div>
              <div className="px-6 pb-8">
                <p className="leading-relaxed">
                  Committed to sustainable tourism, we prioritize practices that minimize environmental impact and
                  uplift local communities. Through responsible tourism initiatives, we strive to preserve natural
                  resources and promote cultural integrity.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </main>
  );
};

export default AboutUs;
