import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const lastUpdated = "December 15, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-blue-100 mb-4">
              AI-Enhanced E-Learning Platform
            </p>
            <p className="text-blue-200">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Table of Contents */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <a href="#acceptance" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">1. Acceptance of Terms</a>
              <a href="#description" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">2. Service Description</a>
              <a href="#accounts" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">3. User Accounts</a>
              <a href="#conduct" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">4. User Conduct</a>
              <a href="#content" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">5. Content and Intellectual Property</a>
              <a href="#payment" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">6. Payment and Billing</a>
              <a href="#privacy" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">7. Privacy</a>
              <a href="#termination" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">8. Termination</a>
              <a href="#disclaimers" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">9. Disclaimers</a>
              <a href="#limitation" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">10. Limitation of Liability</a>
              <a href="#governing" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">11. Governing Law</a>
              <a href="#contact" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">12. Contact Information</a>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* Section 1 */}
            <section id="acceptance" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                By accessing and using the AI-Enhanced E-Learning Platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                These Terms of Service may be updated from time to time. We will notify users of any material changes via email or through the platform. Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            {/* Section 2 */}
            <section id="description" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Service Description</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our platform provides AI-powered educational services including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Online courses and learning materials</li>
                <li>Interactive quizzes and assessments</li>
                <li>AI-powered personalized learning recommendations</li>
                <li>Progress tracking and analytics</li>
                <li>Community forums and discussions</li>
                <li>Certification programs</li>
                <li>Mobile and offline learning capabilities</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice to users.
              </p>
            </section>

            {/* Section 3 */}
            <section id="accounts" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                To access certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                You must be at least 13 years old to create an account. Users under 18 must have parental consent.
              </p>
            </section>

            {/* Section 4 */}
            <section id="conduct" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. User Conduct</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Share account credentials with others</li>
                <li>Use automated tools to access the Service without permission</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="content" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Content and Intellectual Property</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                <strong>Our Content:</strong> All course materials, software, and content provided through the Service are owned by us or our licensors and are protected by intellectual property laws.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                <strong>Your Content:</strong> You retain ownership of content you submit but grant us a license to use, modify, and distribute it as necessary to provide the Service.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>License to Use:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use the Service for personal, educational purposes.
              </p>
            </section>

            {/* Section 6 */}
            <section id="payment" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Payment and Billing</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                <strong>Subscription Plans:</strong> Paid features require a valid subscription. Billing occurs automatically according to your chosen plan.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                <strong>Refunds:</strong> Refunds are available within 30 days of purchase for annual plans and 7 days for monthly plans, subject to our refund policy.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Price Changes:</strong> We may change subscription prices with 30 days' notice. Changes apply to subsequent billing cycles.
              </p>
            </section>

            {/* Section 7 */}
            <section id="privacy" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Privacy</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your privacy is important to us. Please review our{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 underline">
                  Privacy Policy
                </Link>
                {' '}to understand how we collect, use, and protect your information.
              </p>
            </section>

            {/* Section 8 */}
            <section id="termination" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Termination</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You may terminate your account at any time through your account settings. We may terminate or suspend your account for violations of these terms or for any other reason with reasonable notice.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Upon termination, your right to use the Service ceases immediately. We may retain certain information as required by law or for legitimate business purposes.
              </p>
            </section>

            {/* Section 9 */}
            <section id="disclaimers" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Disclaimers</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or meet your specific requirements.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                While we strive for accuracy, we do not warrant the completeness or accuracy of educational content. Users should verify information independently.
              </p>
            </section>

            {/* Section 10 */}
            <section id="limitation" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-600 dark:text-gray-400">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
              </p>
            </section>

            {/* Section 11 */}
            <section id="governing" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-400">
                These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved through binding arbitration or in the courts of [Your Jurisdiction].
              </p>
            </section>

            {/* Section 12 */}
            <section id="contact" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Email:</strong> legal@ai-elearning.com
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Address:</strong> AI E-Learning Inc., Silicon Valley, CA, United States
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Support:</strong> <Link to="/support" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 underline">Visit our Help Center</Link>
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdated}
              </div>
              <div className="flex space-x-4">
                <Link 
                  to="/privacy" 
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 underline"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/support" 
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 underline"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
