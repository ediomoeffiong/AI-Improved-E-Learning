import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const lastUpdated = "December 15, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-green-100 mb-4">
              AI-Enhanced E-Learning Platform
            </p>
            <p className="text-green-200">
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
              <a href="#introduction" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">1. Introduction</a>
              <a href="#information-we-collect" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">2. Information We Collect</a>
              <a href="#how-we-use" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">3. How We Use Information</a>
              <a href="#sharing" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">4. Information Sharing</a>
              <a href="#ai-data" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">5. AI and Machine Learning</a>
              <a href="#data-security" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">6. Data Security</a>
              <a href="#your-rights" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">7. Your Rights</a>
              <a href="#cookies" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">8. Cookies and Tracking</a>
              <a href="#children" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">9. Children's Privacy</a>
              <a href="#international" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">10. International Transfers</a>
              <a href="#changes" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">11. Policy Changes</a>
              <a href="#contact" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">12. Contact Us</a>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* Section 1 */}
            <section id="introduction" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                At AI-Enhanced E-Learning Platform, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform and services.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                By using our Service, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            {/* Section 2 */}
            <section id="information-we-collect" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Username and password</li>
                <li>Profile information and preferences</li>
                <li>Payment and billing information</li>
                <li>Educational background and goals</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Learning Data</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Course progress and completion status</li>
                <li>Quiz and assessment results</li>
                <li>Learning patterns and behavior</li>
                <li>Time spent on different activities</li>
                <li>Discussion forum posts and interactions</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Technical Information</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Usage analytics and performance data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="how-we-use" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Provide and maintain our educational services</li>
                <li>Personalize your learning experience with AI recommendations</li>
                <li>Track your progress and provide feedback</li>
                <li>Process payments and manage subscriptions</li>
                <li>Communicate with you about courses and updates</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="sharing" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Information Sharing</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
                <li><strong>Aggregated Data:</strong> Anonymous, aggregated data for research and analytics</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="ai-data" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. AI and Machine Learning</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our platform uses artificial intelligence to enhance your learning experience:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li><strong>Personalization:</strong> AI analyzes your learning patterns to recommend content</li>
                <li><strong>Progress Tracking:</strong> Machine learning helps identify areas for improvement</li>
                <li><strong>Content Generation:</strong> AI may generate personalized quizzes and exercises</li>
                <li><strong>Data Protection:</strong> AI processing is done securely with privacy safeguards</li>
                <li><strong>Opt-out:</strong> You can disable AI features in your account settings</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="data-security" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We implement comprehensive security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication measures</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            {/* Section 7 */}
            <section id="your-rights" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Your Rights</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            {/* Section 8 */}
            <section id="cookies" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                You can control cookies through your browser settings. However, disabling cookies may affect platform functionality.
              </p>
            </section>

            {/* Section 9 */}
            <section id="children" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Children's Privacy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                For users between 13 and 18, we require parental consent before collecting personal information.
              </p>
            </section>

            {/* Section 10 */}
            <section id="international" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. International Data Transfers</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
              </p>
            </section>

            {/* Section 11 */}
            <section id="changes" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Policy Changes</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through the platform. Your continued use of the Service after such modifications constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Section 12 */}
            <section id="contact" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have questions about this Privacy Policy or want to exercise your rights, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Privacy Officer:</strong> privacy@ai-elearning.com
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <strong>General Contact:</strong> support@ai-elearning.com
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Address:</strong> AI E-Learning Inc., Silicon Valley, CA, United States
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Support Center:</strong> <Link to="/support" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 underline">Visit our Help Center</Link>
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
                  to="/terms" 
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 underline"
                >
                  Terms of Service
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

export default PrivacyPolicy;
