import Section from '../section';
import Container from '../container';
import { Calendar } from 'lucide-react';

const Privacy = () => {
  return (
    <Section className="py-10 sm:py-12 md:py-14 lg:py-16">
      <Container className="md:px-10 w-full">
        <div className="w-full flex justify-center items-center">
          <span className="capitalize bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text w-fit text-2xl md:text-3xl font-bold">
            Privacy Policy
          </span>
        </div>

        {/* Header Info */}
        <div className="mt-10 sm:mt-12 md:mt-14 mb-12 p-6 bg-foreground rounded  ">
          <div className="flex flex-col sm:flex-row gap-4 text-sm ">
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
          <p className="mt-4  leading-relaxed">
            Tourillo respects your privacy. This policy explains how we collect, use, share, and protect your personal
            information in relation to our travel services.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-foreground rounded p-6  ">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <h2 className="text-xl font-bold ">INFORMATION WE COLLECT</h2>
            </div>

            <div className="space-y-4 ml-4">
              <div>
                <h3 className="font-semibold mb-2">1a. Information You Provide:</h3>
                <ul className="list-disc list-inside space-y-1  ml-4">
                  <li>Name, phone number, and email ID</li>
                  <li>Passport or government-issued identification</li>
                  <li>Full address and travel preferences</li>
                  <li>Food and health-related details</li>
                  <li>Emergency contact details</li>
                  <li>Payment and billing information</li>
                  <li>Any other information required for providing services</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">1b. Information Collected Automatically:</h3>
                <ul className="list-disc list-inside space-y-1  ml-4">
                  <li>IP address, browser and device details</li>
                  <li>Website usage and browsing data</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-foreground rounded p-6  ">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <h2 className="text-xl font-bold ">HOW WE USE YOUR INFORMATION</h2>
            </div>
            <ul className="list-disc list-inside space-y-2  ml-4">
              <li>To confirm bookings and prepare documents</li>
              <li>For coordination with hotels, transport, and travel partners</li>
              <li>To improve customer service and fulfill legal obligations</li>
              <li>To personalize and enhance your website experience</li>
              <li>For necessary marketing communication (you can opt out)</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-foreground rounded p-6  ">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <h2 className="text-xl font-bold ">DATA SHARING</h2>
            </div>
            <ul className="list-disc list-inside space-y-2  ml-4">
              <li>
                Your information is shared only with essential third-party providers (e.g., hotels, flights, etc.)
                necessary for your travel.
              </li>
              <li>We never sell or rent your data for non-essential or marketing purposes.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-foreground rounded p-6  ">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">4</span>
              </div>
              <h2 className="text-xl font-bold ">SECURITY MEASURES</h2>
            </div>
            <ul className="list-disc list-inside space-y-2  ml-4">
              <li>SSL encryption, secure servers, and limited data access</li>
              <li>Regular system audits and security updates</li>
              <li>Ensuring the confidentiality and protection of your information</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="bg-foreground rounded p-6  ">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">5</span>
              </div>
              <h2 className="text-xl font-bold ">YOUR RIGHTS</h2>
            </div>
            <ul className="list-disc list-inside space-y-2  ml-4">
              <li>You have the right to view and update your personal information.</li>
              <li>Only you can update your details.</li>
              <li>You may contact us in case of any issues or concerns.</li>
            </ul>
          </div>

          {/* Section 6 - Merged */}
          <div className="bg-foreground rounded p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">6</span>
              </div>
              <h2 className="text-xl font-bold ">ADDITIONAL INFORMATION</h2>
            </div>
            <div className="space-y-4 ml-4">
              <div>
                <h3 className="font-semibold mb-2">6a. Cookies and Tracking:</h3>
                <ul className="list-disc list-inside space-y-2  ml-4">
                  <li>We use cookies to enhance your website experience.</li>
                  <li>You can manage cookies through your browser settings.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">6b. International Data Transfer:</h3>
                <ul className="list-disc list-inside space-y-2  ml-4">
                  <li>
                    If you are located outside India, your data will be transferred securely in compliance with
                    international data protection standards.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">6c. Policy Updates:</h3>
                <ul className="list-disc list-inside space-y-2  ml-4">
                  <li>Tourillo may update this privacy policy from time to time.</li>
                  <li>Changes will be posted on our website.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Agreement Notice */}
          <div className="bg-foreground rounded p-6 ">
            <p className="font-semibold text-center">
              By using Tourillo&apos;s services, you agree to the terms of this privacy policy.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Privacy;
