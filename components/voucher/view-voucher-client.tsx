'use client';

import React, { useCallback, useState } from 'react';
import { Noto_Sans } from 'next/font/google';
import {
  FaPhoneAlt,
  FaRegArrowAltCircleRight,
  FaHotel,
  FaSuitcase,
  FaEnvelope,
  FaCar,
  FaCalendar,
} from 'react-icons/fa';
import { MdRateReview, MdPeople } from 'react-icons/md';
import { AiFillThunderbolt } from 'react-icons/ai';
import Link from 'next/link';
import type { VoucherData } from '@/lib/actions/voucher-actions';
import LogoFull from '../logo-full';

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

interface ViewVoucherClientProps {
  voucher: VoucherData;
  itinerary?: {
    packageTitle?: string;
    clientPhone?: string;
    clientEmail?: string | null;
    tripAdvisorName?: string;
    tripAdvisorNumber?: string;
  };
}

export default function ViewVoucherClient({ voucher, itinerary }: ViewVoucherClientProps) {
  const [showButtons, setShowButtons] = useState(true);

  const handlePrint = useCallback(() => {
    setShowButtons(false);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowButtons(true), 100);
    }, 100);
  }, []);

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
          <div id="voucher-content" className="bg-white">
            {/* Header + Travel ID - Keep together */}
            <div className="print-avoid-break">
              {/* Header */}
              <header className="bg-slate-800 text-white w-full flex p-4 justify-between items-center border-b-4 border-slate-600">
                <LogoFull />
                <div className="flex items-center gap-3">
                  <div className="bg-slate-700 rounded-lg w-10 h-10 flex justify-center items-center text-white">
                    <FaPhoneAlt size={16} />
                  </div>
                  <div>
                    <div>
                      <span className="font-semibold text-xs text-gray-300">Call Us</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm">+91 9625992025</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Travel Voucher ID & Date Section */}
              <div className="px-5 py-3 bg-gray-50 border-b-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-start gap-2">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Travel Voucher ID</span>
                      <p className="font-mono font-bold text-slate-700 text-lg">{voucher.travelId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Generated On</span>
                    <p className="font-semibold text-slate-700">{formatDate(voucher.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col">
              {/* Introduction Section */}
              <div className="print-section">
                <div className="px-5 py-4 flex flex-col gap-2 w-full border-b border-gray-200">
                  <span className="text-base text-gray-800">
                    Dear <span className="font-semibold capitalize text-slate-800">{voucher.clientName}</span>,
                  </span>
                  <span className="text-gray-700">Greetings from Tourillo!</span>
                  <span className="text-gray-700">
                    Please find below your travel voucher details. This document confirms your booking and serves as
                    your official travel confirmation.
                  </span>

                  {/* Client Contact Information */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 print-avoid-break">
                    <h3 className="font-semibold text-base mb-3 text-slate-800 print-keep-with-next">
                      Client Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <MdPeople className="text-slate-600" size={14} />
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Number of Guests</span>
                          <p className="font-semibold text-slate-800 text-sm">
                            {voucher.adultNo} Adult{voucher.adultNo !== 1 ? 's' : ''}
                            {voucher.childrenNo > 0 &&
                              ` + ${voucher.childrenNo} Child${voucher.childrenNo !== 1 ? 'ren' : ''}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-slate-600" size={14} />
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Total Duration</span>
                          <p className="font-semibold text-slate-800 text-sm">
                            {voucher.totalNights} Night{voucher.totalNights !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {itinerary?.clientPhone && (
                        <div className="flex items-center gap-2">
                          <FaPhoneAlt className="text-slate-600" size={14} />
                          <div>
                            <span className="text-xs text-gray-500 uppercase">Contact Number</span>
                            <p className="font-semibold text-slate-800 text-sm">{itinerary.clientPhone}</p>
                          </div>
                        </div>
                      )}
                      {itinerary?.clientEmail && (
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
                      <FaSuitcase size={14} className="text-slate-600" />
                      500+ Trips
                    </div>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <MdRateReview size={14} className="text-slate-600" />
                      350+ Reviews
                    </div>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <AiFillThunderbolt size={14} className="text-slate-600" />
                      100% Satisfaction
                    </div>
                  </div>

                  {itinerary?.packageTitle && (
                    <div className="mt-6 flex flex-col gap-1 print-avoid-break">
                      <span className="font-bold text-2xl text-slate-800">{itinerary.packageTitle}</span>
                      <span className="font-medium text-base text-gray-600">
                        Travel Voucher for {voucher.totalNights} Night{voucher.totalNights !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hotel Accommodations */}
              <div className="px-5 py-4 print-compact print-allow-break-before border-b border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 print-keep-with-next mb-4">Hotel Accommodations</h2>
                <div className="flex flex-col gap-4 print-compact-gap">
                  {voucher.hotelStays.map((hotel, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition print-avoid-break bg-white"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="shrink-0">
                          <FaHotel size={40} className="text-gray-400" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                          <span className="font-bold text-base text-slate-800">{hotel.hotelName}</span>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Number of Nights</span>
                              <p className="font-semibold text-slate-700 text-sm">
                                {hotel.nights} Night{hotel.nights !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                Check-in / Check-out
                              </span>
                              <p className="font-semibold text-slate-700 text-sm">
                                {formatDate(hotel.fromDate)} - {formatDate(hotel.toDate)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Hotel Details</span>
                            <p className="text-gray-600 text-xs leading-relaxed mt-1">{hotel.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transportation */}
              <div className="px-5 py-4 print-compact print-avoid-break border-b border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 print-keep-with-next mb-4 flex items-center gap-2">
                  <FaCar className="text-slate-600" />
                  Transportation Details
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <span className="text-sm text-gray-700 whitespace-pre-line">{voucher.cabDetails}</span>
                </div>
              </div>

              {/* Important Instructions */}
              <div className="px-5 py-4 print-compact print-avoid-break border-b border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 print-keep-with-next mb-4">Important Instructions</h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <div className="print-small-text space-y-2">
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Please carry a valid government-issued ID proof for hotel check-in (Aadhaar Card, Passport, Driving License, or Voter ID)"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Standard check-in time is 2:00 PM and check-out time is 11:00 AM (subject to hotel policy)"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Early check-in or late check-out is subject to availability and may incur additional charges"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="This voucher must be presented at the time of check-in (print or digital copy)"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Please verify all booking details before your travel date"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="px-5 py-4 print-compact print-avoid-break border-b border-gray-200">
                <div className="px-4 py-4 bg-gray-50 rounded-lg border border-gray-300">
                  <div className="flex flex-col gap-3 font-medium text-xs text-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-700 text-white p-1.5 rounded mt-0.5 shrink-0">
                        <FaPhoneAlt size={11} />
                      </div>
                      <p>
                        For any queries, modifications, or assistance during your trip, please contact us at{' '}
                        <span className="font-bold text-slate-800">+91 9625992025</span>
                        {itinerary?.clientEmail && (
                          <>
                            {' '}
                            or email <span className="font-bold text-slate-800">{itinerary.clientEmail}</span>
                          </>
                        )}
                        .
                      </p>
                    </div>
                    {itinerary?.tripAdvisorName && itinerary?.tripAdvisorNumber && (
                      <div className="flex items-start gap-3">
                        <div className="bg-slate-700 text-white p-1.5 rounded mt-0.5 shrink-0">
                          <FaEnvelope size={11} />
                        </div>
                        <p>
                          Your dedicated Trip Advisor is{' '}
                          <span className="font-bold text-slate-800">{itinerary.tripAdvisorName}</span>. Contact:{' '}
                          <span className="font-bold text-slate-800">+91 {itinerary.tripAdvisorNumber}</span>.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="px-5 py-4 print-compact print-force-break-before">
                <div className="px-4 py-5 bg-gray-50 print-small-text rounded-lg border border-gray-300">
                  {/* Voucher Terms */}
                  <div className="print-avoid-break">
                    <h3 className="text-base font-bold text-slate-800 print-keep-with-next">Voucher Terms</h3>
                    <div className="h-0.5 w-full bg-gray-300 mt-1 mb-2"></div>
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="This voucher is valid only for the dates and services mentioned above"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Any changes to the itinerary must be approved by Tourillo in advance"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Room allocation is subject to availability at the time of check-in"
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
                      text="Less than 7 days or no-show: 100% cancellation charges"
                    />
                  </div>

                  {/* General Terms */}
                  <div className="mt-5 print-smart-section">
                    <h3 className="text-base font-bold text-slate-800 print-keep-with-next">General Terms</h3>
                    <div className="h-0.5 w-full bg-gray-300 mt-1 mb-2"></div>
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Tourillo is not responsible for any loss, damage, or theft of personal belongings during the trip"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="All services are subject to the terms and conditions of the respective service providers"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Any additional services availed at hotels or during travel will be billed separately"
                    />
                    <BulletPoints
                      icon={FaRegArrowAltCircleRight}
                      size={11}
                      color="#475569"
                      text="Tourillo reserves the right to modify arrangements due to unforeseen circumstances, ensuring comparable alternatives"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="px-5 py-4 bg-slate-800 text-white text-center print-compact">
                <p className="text-sm font-medium">Thank you for choosing Tourillo. Have a wonderful trip!</p>
                <p className="text-xs mt-1 text-gray-300">
                  For 24/7 support, call +91 9625992025 | Email: support@tourillo.com
                </p>
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

              <Link href={`/admin/voucher/edit-voucher/${voucher.travelId}`}>
                <button className="py-3 px-8 bg-slate-600 rounded-lg font-semibold text-white hover:bg-slate-500 transition-colors shadow-lg">
                  Edit Voucher
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
