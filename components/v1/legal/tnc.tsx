import Section from "../section";
import Container from "../container";
import { Calendar } from "lucide-react";

const TermsCondition = () => {
  return (
    <Section className="py-10 sm:py-12 md:py-14 lg:py-16">
      <Container className="md:px-10 w-full">
        <div className="w-full flex justify-center items-center">
          <span className="capitalize bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text w-fit text-2xl md:text-3xl font-bold">
            Terms & Conditions
          </span>
        </div>

        {/* Header Info */}
        <div className="mt-10 sm:mt-12 md:mt-14 mb-12 p-6 bg-foreground rounded">
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
            When you book a trip with Tourillo, you&apos;re confirming that you&apos;ve carefully read, understood, and agreed to
            all the terms and conditions outlined below:
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-foreground rounded p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <h2 className="text-xl font-bold">YOUR FIXED TRAVEL ITINERARY</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your travel itinerary is set in advance and cannot be changed.</li>
              <li>
                Transportation will be provided strictly according to this itinerary – the vehicle is not for your
                personal use.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-foreground rounded p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <h2 className="text-xl font-bold">NO REFUNDS FOR CANCELLATIONS DUE TO NATURAL CALAMITIES OR WEATHER</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                If your trip is cancelled due to unforeseen circumstances like natural disasters (such as landslides,
                heavy rainfall, snowfall), severe weather, strikes, political unrest, or any other unavoidable reasons,
                Tourillo will not be obligated to issue any refunds.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-foreground rounded p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <h2 className="text-xl font-bold">TOURILLO&apos;S RIGHT TO MODIFY YOUR ITINERARY</h2>
            </div>
            <div className="space-y-2 ml-4">
              <p>
                Tourillo reserves the right to make changes to your travel itinerary at any point if we encounter
                situations such as:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Natural disasters, strikes, festivals, traffic jams</li>
                <li>Hotel or flight overbookings, flight cancellations/rerouting</li>
                <li>Venue closures, or government/administrative restrictions</li>
                <li>
                  While Tourillo will always do its best to arrange suitable alternatives, we cannot be held responsible
                  for any such changes, and no refunds or compensation will be offered in these situations.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-foreground rounded p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">4</span>
              </div>
              <h2 className="text-xl font-bold">TICKET MODIFICATIONS AND EXTENSIONS: YOUR RESPONSIBILITY</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Should you wish to extend your ticket&apos;s validity or make any changes to it, any associated costs will be
                your sole responsibility.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="bg-foreground rounded p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">5</span>
              </div>
              <h2 className="text-xl font-bold">OUR CANCELLATION AND REFUND POLICY</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>For all cancellations and refunds, our company&apos;s specific Cancellation Policy will apply.</li>
              <li>We strongly advise you to read this policy carefully before confirming your booking.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="bg-foreground rounded p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">6</span>
              </div>
              <h2 className="text-xl font-bold">ADDITIONAL POLICIES</h2>
            </div>
            <div className="space-y-4 ml-4">
              <div>
                <h3 className="font-semibold mb-2">6a. Legal Jurisdiction:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Any disputes arising will exclusively fall under the jurisdiction of the courts in New Delhi.</li>
                  <li>No other jurisdiction will be accepted.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">6b. Additional Costs During Emergencies or Crises:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Any extra expenses you might incur due to natural or political crises (like landslides, road
                    closures, or strikes) will need to be paid by you on the spot.
                  </li>
                  <li>Tourillo will not assume responsibility for these additional costs.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">6c. Our Child Policy:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Children up to 6 years of age travel free (without an extra bed).</li>
                  <li>For children aged 6 to 12 years, 50% of the total cost will be charged.</li>
                  <li>Children aged 12 years or older will be charged the full adult fare.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">6d. Our Final Decision:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    In any situation involving a dispute or misunderstanding, Tourillo&apos;s decision will be considered
                    final and binding on all parties involved.
                  </li>
                  <li>This decision cannot be challenged legally or otherwise.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Agreement Notice */}
          <div className="bg-foreground rounded p-6">
            <p className="font-semibold text-center">
              By using Tourillo&apos;s services, you agree to the terms and conditions outlined above.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}

export default TermsCondition
