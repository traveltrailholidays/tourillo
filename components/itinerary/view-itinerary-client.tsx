'use client';

import React, { useCallback, useState, useMemo } from 'react';
import { Noto_Sans } from 'next/font/google';
import { FaPhoneAlt, FaRegArrowAltCircleRight, FaCheck, FaHotel, FaSuitcase, FaEnvelope } from 'react-icons/fa';
import { RxCrossCircled } from 'react-icons/rx';
import { MdRateReview } from 'react-icons/md';
import { AiFillThunderbolt } from 'react-icons/ai';
import { BadgeCheck, FileCheck2, Info, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ItineraryData } from '@/lib/actions/itinerary-actions';
import { getCompanyConfig } from '@/lib/config/company-config';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

interface BulletPointsProps {
  icon: React.ComponentType<{ color?: string; size?: number; className?: string }>;
  text: string;
  color?: string;
  size?: number;
}

const BulletPoints: React.FC<BulletPointsProps> = ({ icon: Icon, text, size, color }) => {
  return (
    <div className="mt-2 ml-7 flex gap-2 print-avoid-break">
      <div className="mt-1 shrink-0">
        <Icon color={color || '#334155'} size={size || 14} />
      </div>
      <span className="text-sm leading-relaxed text-gray-700">{text}</span>
    </div>
  );
};

interface ViewItineraryClientProps {
  itinerary: ItineraryData;
}

export default function ViewItineraryClient({ itinerary }: ViewItineraryClientProps) {
  const [showButtons, setShowButtons] = useState(true);

  // Get company configuration based on itinerary company
  const companyConfig = useMemo(() => getCompanyConfig(itinerary.company), [itinerary.company]);
  const CompanyLogo = companyConfig.LogoComponent;

  // ✅ Check if hotels exist
  const hasHotels = itinerary.hotels && itinerary.hotels.length > 0;

  const handlePrint = useCallback(() => {
    setShowButtons(false);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowButtons(true), 100);
    }, 100);
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 10mm 12mm 10mm;
          }

          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .print-hide {
            display: none !important;
          }

          .print-avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-after: auto;
            break-after: auto;
          }

          .print-section {
            page-break-inside: avoid;
            break-inside: avoid;
            orphans: 3;
            widows: 3;
          }

          .print-allow-break-before {
            page-break-before: auto;
            break-before: auto;
          }

          .print-force-break-before {
            page-break-before: always;
            break-before: page;
          }

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            page-break-after: avoid;
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
            orphans: 4;
            widows: 4;
          }

          p,
          div,
          li {
            orphans: 3;
            widows: 3;
          }

          img {
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-before: auto;
            break-before: auto;
            page-break-after: auto;
            break-after: auto;
          }

          .print-compact {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            margin-top: 0 !important;
            margin-bottom: 8px !important;
          }

          .print-compact-gap {
            gap: 8px !important;
          }

          .print-small-text {
            font-size: 10px !important;
            line-height: 1.35 !important;
          }

          .print-small-text h2,
          .print-small-text h3 {
            font-size: 14px !important;
            margin-bottom: 4px !important;
          }

          .print-keep-with-next {
            page-break-after: avoid;
            break-after: avoid;
          }

          .print-smart-section {
            page-break-inside: auto;
            break-inside: auto;
            orphans: 2;
            widows: 2;
          }
        }
      `}</style>

      <div className={`w-full flex justify-center items-center ${notoSans.className} bg-white text-black`}>
        <div className="max-w-[894px] w-full">
          <div id="itinerary-content" className="bg-white">
            {/* Header + Itinerary ID - Keep together */}
            <div className="print-avoid-break">
              {/* Header */}
              <header className="bg-slate-800 text-white w-full flex p-4 justify-between items-center border-b-4 border-slate-600">
                <CompanyLogo />
                <div className="flex items-center gap-3">
                  <div className="bg-slate-700 rounded-lg w-10 h-10 flex justify-center items-center text-white">
                    <FaPhoneAlt size={16} />
                  </div>
                  <div>
                    <div>
                      <span className="font-semibold text-xs text-gray-300">Call Us</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm">{companyConfig.contactPhone}</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Itinerary ID & Date Section */}
              <div className="px-5 py-3 bg-gray-50 border-b-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-start gap-2">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Itinerary ID</span>
                      <p className="font-mono font-bold text-slate-700 text-lg">{itinerary.travelId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Generated On</span>
                    <p className="font-semibold text-slate-700">{formatDate(itinerary.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col">
              {/* Introduction Section */}
              <div className="print-section">
                <div className="px-5 py-4 flex flex-col gap-2 w-full border-b border-gray-200">
                  <span className="text-base text-gray-800">
                    Dear <span className="font-semibold capitalize text-slate-800">{itinerary.clientName}</span>,
                  </span>
                  <span className="text-gray-700">Greetings from {companyConfig.shortName}!</span>
                  <span className="text-gray-700">
                    We&apos;re pleased to present you with a carefully curated holiday package tailored to your
                    preferences by {companyConfig.shortName}, your trusted travel partner.
                  </span>

                  {/* Client Contact Information */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 print-avoid-break">
                    <h3 className="font-semibold text-base mb-3 text-slate-800 print-keep-with-next">
                      Client Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <FaPhoneAlt className="text-slate-600" size={14} />
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Contact Number</span>
                          <p className="font-semibold text-slate-800 text-sm">{itinerary.clientPhone}</p>
                        </div>
                      </div>
                      {itinerary.clientEmail && (
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-slate-600" size={14} />
                          <div>
                            <span className="text-xs text-gray-500 uppercase">Email Address</span>
                            <p className="font-semibold text-slate-800 text-sm">{itinerary.clientEmail}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-8 items-center mt-4 print-avoid-break text-gray-600">
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <ShieldCheck size={14} className="text-slate-600" />
                      Zero-Stress Guarantee Trips
                    </div>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <FileCheck2 size={14} className="text-slate-600" />
                      No Hidden Cost Guarantee
                    </div>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <BadgeCheck size={14} className="text-slate-600" />
                      Surprise Appreciation for Our Guests
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-1 print-avoid-break">
                    <span className="font-bold text-2xl text-slate-800">{itinerary.packageTitle}</span>
                    <span className="font-medium text-base text-gray-600">
                      {itinerary.numberOfDays} Days / {itinerary.numberOfNights} Nights
                    </span>
                  </div>

                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 print-avoid-break">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Total Package Price</span>
                        <p className="text-xl font-bold text-slate-800">{formatPrice(itinerary.quotePrice)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Price Per Person</span>
                        <p className="text-xl font-bold text-slate-800">{formatPrice(itinerary.pricePerPerson)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ FIXED: Hotel Summary - Only show if hotels exist */}
              {hasHotels ? (
                <div className="px-5 py-4 print-compact print-allow-break-before border-b border-gray-200">
                  <h2 className="text-xl font-bold text-slate-800 print-keep-with-next mb-4">
                    Hotel Summary ({itinerary.hotels.length} {itinerary.hotels.length === 1 ? 'Hotel' : 'Hotels'})
                  </h2>
                  <div className="flex flex-col gap-4 print-compact-gap">
                    {itinerary.hotels.map((hotel, index) => (
                      <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition print-avoid-break bg-white"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base font-bold text-slate-800">{hotel.placeName}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{hotel.placeDescription}</span>
                        </div>
                        <div className="flex gap-4 items-start">
                          <div className="shrink-0">
                            <FaHotel size={40} className="text-gray-400" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="font-semibold text-base text-slate-800">{hotel.hotelName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500">Room Type:</span>
                              <span className="text-xs font-semibold text-slate-700 bg-gray-100 px-3 py-1 rounded border border-gray-300">
                                {hotel.roomType}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs leading-relaxed">{hotel.hotelDescription}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 print-compact print-allow-break-before border-b border-gray-200">
                  <h2 className="text-xl font-bold text-slate-800 print-keep-with-next mb-4">Accommodation</h2>
                  <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                    <div className="flex items-start gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                          <FaHotel className="h-4 w-4" />
                          No Hotel Accommodations Included
                        </h3>
                        <p className="text-sm text-slate-700">
                          This package does not include hotel accommodations. Guests are responsible for arranging their
                          own lodging. This package focuses on transportation and tour services.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Flights */}
              <div className="px-5 py-4 print-compact print-avoid-break border-b border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 print-keep-with-next mb-4">Flight Details</h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <span className="text-sm text-gray-700 whitespace-pre-line">{itinerary.flights}</span>
                </div>
              </div>

              {/* Cabs */}
              <div className="px-5 py-4 print-compact print-avoid-break border-b border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 print-keep-with-next mb-4">Transportation</h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <span className="text-sm text-gray-700 whitespace-pre-line">{itinerary.cabs}</span>
                </div>
              </div>

              {/* Itinerary */}
              <div className="px-5 py-4 print-compact print-allow-break-before border-b border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 print-keep-with-next mb-4">Detailed Itinerary</h2>
                <div className="flex flex-col gap-4 print-compact-gap">
                  {itinerary.days.map((day, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition print-avoid-break bg-white"
                    >
                      <div className="flex gap-3 items-start mb-3">
                        <div className="bg-slate-700 text-white font-bold text-sm px-4 py-1.5 rounded shrink-0">
                          Day {day.dayNumber}
                        </div>
                        <span className="text-base font-semibold text-slate-800 mt-0.5">{day.summary}</span>
                      </div>
                      {day.imageSrc && (
                        <div className="relative w-full h-48 mt-3 rounded-lg overflow-hidden border border-gray-300 print-avoid-break">
                          <Image
                            src={day.imageSrc}
                            alt={`Day ${day.dayNumber}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            unoptimized
                          />
                        </div>
                      )}
                      <p className="mt-3 text-xs leading-relaxed text-gray-700 whitespace-pre-line">
                        {day.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="px-5 py-4 flex gap-8 print-compact print-allow-break-before print-smart-section border-b border-gray-200">
                <div className="w-1/2">
                  <h2 className="text-lg font-bold text-slate-800 print-keep-with-next mb-4">What's Included</h2>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                    {itinerary.inclusions.map((inclusion, index) => (
                      <BulletPoints key={index} icon={FaCheck} size={12} color="#475569" text={inclusion} />
                    ))}
                  </div>
                </div>
                <div className="w-1/2">
                  <h2 className="text-lg font-bold text-slate-800 print-keep-with-next mb-4">What's Excluded</h2>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                    {itinerary.exclusions.map((exclusion, index) => (
                      <BulletPoints key={index} icon={RxCrossCircled} size={12} color="#64748b" text={exclusion} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Process */}
              <div className="px-5 py-4 print-compact print-allow-break-before border-b border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 print-keep-with-next mb-4">Payment Information</h2>
                <div className="text-sm mb-4 font-medium text-gray-700">Available payment methods:</div>
                <div className="w-full flex gap-6 justify-between print-compact-gap">
                  <div className="w-1/2 bg-gray-50 p-4 rounded-lg border border-gray-300 print-avoid-break">
                    <span className="text-base font-bold text-slate-800">1. Bank Transfer</span>
                    <div className="ml-4 flex flex-col gap-1.5 mt-3 text-xs text-gray-700">
                      <div>
                        <span className="font-semibold">Bank:</span> {companyConfig.bankDetails.bankName}
                      </div>
                      <div>
                        <span className="font-semibold">Account:</span> {companyConfig.bankDetails.accountName}
                      </div>
                      <div>
                        <span className="font-semibold">Number:</span> {companyConfig.bankDetails.accountNumber}
                      </div>
                      <div>
                        <span className="font-semibold">IFSC:</span> {companyConfig.bankDetails.ifsc}
                      </div>
                      <div>
                        <span className="font-semibold">Type:</span> {companyConfig.bankDetails.accountType}
                      </div>
                    </div>
                  </div>
                  <div className="w-1/2 bg-gray-50 p-4 rounded-lg border border-gray-300 print-avoid-break">
                    <span className="text-base font-bold text-slate-800">2. UPI Payment</span>
                    <div className="ml-4 flex flex-col gap-1.5 mt-3 text-xs text-gray-700">
                      <div>
                        <span className="font-semibold">Merchant:</span> {companyConfig.upiDetails.merchantName}
                      </div>
                      <div>
                        <span className="font-semibold">UPI ID:</span> {companyConfig.upiDetails.upiId}
                      </div>
                      {/* <div>
                        <span className="font-semibold">Number:</span> {companyConfig.upiDetails.phoneNumber}
                      </div> */}
                      <div className="relative w-[120px] h-[120px] mt-2 border border-gray-300 rounded overflow-hidden print-avoid-break">
                        <Image src={companyConfig.upiDetails.qrCodePath} alt="UPI QR" fill className="object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="px-5 py-4 print-compact print-avoid-break border-b border-gray-200">
                <div className="px-4 py-4 bg-gray-50 rounded-lg border border-gray-300">
                  <div className="flex flex-col gap-3 font-medium text-xs text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-700 text-white p-1.5 rounded mt-0.5 shrink-0">
                        <FaPhoneAlt size={11} />
                      </div>
                      <p>
                        For support, contact{' '}
                        <span className="font-bold text-slate-800">+91 {itinerary.tripAdvisorNumber}</span>. Your
                        dedicated Trip Advisor is{' '}
                        <span className="font-bold text-slate-800">{itinerary.tripAdvisorName}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policies Section */}
              <div className="px-5 py-4 print-compact print-force-break-before">
                <div className="px-4 py-5 bg-gray-50 print-small-text rounded-lg border border-gray-300">
                  {/* Payment Policy */}
                  <div className="print-avoid-break">
                    <h3 className="text-base font-bold text-slate-800 print-keep-with-next">Payment Policy</h3>
                    <div className="h-0.5 w-full bg-gray-300 mt-1 mb-2"></div>
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="50% payment required at the time of booking"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Remaining balance due 7 days before check-in"
                    />
                  </div>

                  {/* Cancellation Policy */}
                  <div className="mt-5 print-smart-section">
                    <h3 className="text-base font-bold text-slate-800 print-keep-with-next">Cancellation Policy</h3>
                    <div className="h-0.5 w-full bg-gray-300 mt-1 mb-2"></div>
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="30+ days before commencement: 35% cancellation charges"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="15-30 days before commencement: 50% cancellation charges"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Less than 15 days: 75% cancellation charges"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Less than 14 days or no-show: 100% cancellation charges"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Same-day cancellation: 10% + GST charges applicable"
                    />
                  </div>

                  {/* Child Policy */}
                  <div className="mt-5 print-smart-section">
                    <h3 className="text-base font-bold text-slate-800 print-keep-with-next">Child Policy</h3>
                    <div className="h-0.5 w-full bg-gray-300 mt-1 mb-2"></div>
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Children 12+ years: Charged as adults (ID proof required)"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Group travel infants: 50% of adult transport cost"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="0-5 years: Free (no extra bed); 6-12 years: 50% adult cost; 12+ years: Full charges"
                    />
                  </div>

                  {/* Terms & Conditions */}
                  <div className="mt-5 print-smart-section">
                    <h3 className="text-base font-bold text-slate-800 print-keep-with-next">Terms & Conditions</h3>
                    <div className="h-0.5 w-full bg-gray-300 mt-1 mb-2"></div>
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Alternative accommodation of similar standard will be arranged if listed hotels are unavailable."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Itinerary is fixed and executed per route. Transportation provided as per schedule."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Maximum refund will be attempted for natural calamity cancellations, subject to vendor agreements."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text={`${companyConfig.shortName} reserves the right to modify itineraries due to force majeure, weather, strikes, or other uncontrollable circumstances.`}
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Some sightseeing locations may require special permits or vehicles. Additional costs borne by traveler."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Weather-related evacuation costs and ticket deviation charges not included."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Disputes subject to exclusive jurisdiction of courts in New Delhi."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Costs from natural/political strikes or calamities borne by client. Flight booking changes cannot be amended."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Travelers must carry personal first aid kits with basic medical supplies."
                    />
                  </div>

                  {/* Transport Terms */}
                  <div className="mt-5 print-smart-section">
                    <h3 className="text-base font-bold text-slate-800 print-keep-with-next">Transport Terms</h3>
                    <div className="h-0.5 w-full bg-gray-300 mt-1 mb-2"></div>
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Replacement vehicle provided within 5 hours for mechanical issues. Additional costs borne by user."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="AC may not function in hilly areas. Night charges apply for arrivals after 10 PM."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Sightseeing hours: 10 AM - 5 PM. Extensions: ₹300/hour."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Additional sightseeing available at extra cost. Discuss with Trip Advisor."
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text={`${companyConfig.shortName} reserves the right to terminate trips for payment delays.`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showButtons && (
            <div className="my-20 flex gap-4 justify-center print-hide">
              <button
                onClick={handlePrint}
                className="py-3 px-8 bg-slate-800 rounded-lg font-semibold text-white hover:bg-slate-700 transition-colors shadow-lg"
              >
                Print / Save as PDF
              </button>

              <Link href={`/admin/itinerary/edit-itinerary/${itinerary.travelId}`}>
                <button className="py-3 px-8 bg-slate-600 rounded-lg font-semibold text-white hover:bg-slate-500 transition-colors shadow-lg">
                  Edit Itinerary
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
