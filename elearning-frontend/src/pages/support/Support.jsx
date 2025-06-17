import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Support = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      description: 'New to our platform? Start here!'
    },
    {
      id: 'account',
      title: 'Account & Billing',
      icon: '👤',
      description: 'Manage your account and subscription'
    },
    {
      id: 'courses',
      title: 'Courses & Learning',
      icon: '📚',
      description: 'Course access, progress, and certificates'
    },
    {
      id: 'technical',
      title: 'Technical Issues',
      icon: '🔧',
      description: 'Troubleshoot technical problems'
    },
    {
      id: 'mobile',
      title: 'Mobile App',
      icon: '📱',
      description: 'Mobile app support and features'
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      icon: '🤖',
      description: 'AI-powered learning tools and features'
    }
  ];

  const faqs = {
    'getting-started': [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button in the top right corner, fill in your details, and verify your email address. You can also sign up using your Google or social media accounts.'
      },
      {
        question: 'What learning paths are available?',
        answer: 'We offer comprehensive learning paths in Web Development, Data Science, AI/Machine Learning, Mobile Development, and more. Each path is designed to take you from beginner to advanced level.'
      },
      {
        question: 'How does the AI-powered learning work?',
        answer: 'Our AI analyzes your learning patterns, strengths, and areas for improvement to create personalized study plans, recommend relevant content, and adapt the difficulty level to match your pace.'
      },
      {
        question: 'Can I access courses offline?',
        answer: 'Yes! Our mobile app allows you to download course materials and videos for offline viewing. Your progress will sync when you reconnect to the internet.'
      }
    ],
    'account': [
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions in the reset email. Make sure to check your spam folder if you don\'t see it.'
      },
      {
        question: 'How do I update my profile information?',
        answer: 'Go to Settings > Profile to update your name, email, profile picture, and other personal information. Changes are saved automatically.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment system.'
      },
      {
        question: 'How do I cancel my subscription?',
        answer: 'You can cancel your subscription anytime from Settings > Billing. Your access will continue until the end of your current billing period.'
      }
    ],
    'courses': [
      {
        question: 'How do I enroll in a course?',
        answer: 'Browse our course catalog, click on a course you\'re interested in, and click "Enroll Now". Free courses are instantly accessible, while premium courses require a subscription.'
      },
      {
        question: 'How do I track my progress?',
        answer: 'Your progress is automatically tracked and displayed on your dashboard. You can see completion percentages, time spent, and upcoming deadlines for all your enrolled courses.'
      },
      {
        question: 'Can I get certificates for completed courses?',
        answer: 'Yes! Upon successful completion of a course (including all assignments and quizzes), you\'ll receive a verified certificate that you can share on LinkedIn and other platforms.'
      },
      {
        question: 'What if I\'m struggling with course material?',
        answer: 'Our AI tutor provides personalized help, you can join study groups, ask questions in course forums, or schedule 1-on-1 sessions with instructors for premium courses.'
      }
    ],
    'technical': [
      {
        question: 'The video player is not working',
        answer: 'Try refreshing the page, clearing your browser cache, or switching to a different browser. Ensure you have a stable internet connection and that JavaScript is enabled.'
      },
      {
        question: 'I\'m having trouble with quizzes',
        answer: 'Make sure your browser allows cookies and JavaScript. If the issue persists, try using an incognito/private browsing window or contact our technical support team.'
      },
      {
        question: 'The platform is running slowly',
        answer: 'This could be due to internet connectivity or browser issues. Try closing other tabs, clearing your browser cache, or switching to a different network connection.'
      },
      {
        question: 'I can\'t access my courses',
        answer: 'Verify that your subscription is active and that you\'re logged into the correct account. If you\'re still having issues, contact our support team with your account details.'
      }
    ],
    'mobile': [
      {
        question: 'Is there a mobile app available?',
        answer: 'Yes! Our mobile app is available for both iOS and Android devices. Download it from the App Store or Google Play Store and log in with your existing account.'
      },
      {
        question: 'Can I download courses for offline viewing?',
        answer: 'Absolutely! The mobile app allows you to download video lectures and course materials for offline access. Perfect for learning on the go without internet.'
      },
      {
        question: 'How do I sync my progress between devices?',
        answer: 'Your progress automatically syncs across all devices when you\'re connected to the internet. Just make sure you\'re logged into the same account on all devices.'
      },
      {
        question: 'The mobile app keeps crashing',
        answer: 'Try updating the app to the latest version, restarting your device, or reinstalling the app. If the problem persists, contact our mobile support team.'
      }
    ],
    'ai-features': [
      {
        question: 'How does the AI study assistant work?',
        answer: 'Our AI assistant analyzes your learning patterns, identifies knowledge gaps, and provides personalized recommendations for study materials, practice exercises, and review sessions.'
      },
      {
        question: 'Can the AI help me with assignments?',
        answer: 'Yes! The AI can provide hints, explain concepts, and guide you through problem-solving steps. However, it won\'t complete assignments for you - it\'s designed to help you learn.'
      },
      {
        question: 'How accurate are the AI-generated study plans?',
        answer: 'Our AI uses advanced machine learning algorithms trained on millions of learning interactions. Study plans are continuously refined based on your progress and feedback.'
      },
      {
        question: 'Can I customize AI recommendations?',
        answer: 'Absolutely! You can set learning preferences, goals, and time availability in your profile. The AI will adapt its recommendations based on your specific needs and schedule.'
      }
    ]
  };

  const quickActions = [
    {
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      icon: '💬',
      action: 'chat',
      available: true
    },
    {
      title: 'Schedule a Call',
      description: 'Book a 1-on-1 session with our experts',
      icon: '📞',
      action: 'call',
      available: true
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      icon: '🎥',
      action: 'tutorials',
      available: true
    },
    {
      title: 'Community Forum',
      description: 'Connect with other learners',
      icon: '👥',
      action: 'forum',
      available: true
    }
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitSuccess(true);
      setIsSubmitting(false);
      setContactForm({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: '',
        priority: 'medium'
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredFaqs = faqs[activeCategory]?.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Find answers to your questions, get support, and make the most of your learning journey
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help articles, tutorials, or FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pl-12 rounded-xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/50 focus:bg-white transition-all duration-200"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Get Help Instantly</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {action.description}
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium">
                    {action.action === 'chat' && 'Start Chat'}
                    {action.action === 'call' && 'Book Call'}
                    {action.action === 'tutorials' && 'Watch Now'}
                    {action.action === 'forum' && 'Join Forum'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Help Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <div className="font-medium">{category.title}</div>
                        <div className={`text-xs ${
                          activeCategory === category.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* FAQs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Frequently Asked Questions
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredFaqs.length} articles
                </span>
              </div>

              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <summary className="cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white pr-4">
                          {faq.question}
                        </h3>
                        <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </summary>
                    <div className="p-4 bg-white dark:bg-gray-800">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms or browse different categories
                  </p>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Still Need Help? Contact Us
              </h2>

              {submitSuccess ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={contactForm.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={contactForm.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing & Account</option>
                        <option value="course">Course Related</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={contactForm.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 resize-vertical"
                      placeholder="Please provide detailed information about your question or issue..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-red-500">*</span> Required fields
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Additional Resources</h2>
            <p className="text-blue-100 mb-8 max-w-3xl mx-auto">
              Explore more ways to get help and enhance your learning experience
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/courses/materials"
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-xl font-semibold mb-2">Learning Resources</h3>
                <p className="text-blue-100 text-sm">
                  Access comprehensive guides, tutorials, and documentation
                </p>
              </Link>

              <Link
                to="/courses/discussion"
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">Community Forum</h3>
                <p className="text-blue-100 text-sm">
                  Connect with fellow learners and share knowledge
                </p>
              </Link>

              <a
                href="mailto:support@ai-elearning.com"
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">📧</div>
                <h3 className="text-xl font-semibold mb-2">Direct Email</h3>
                <p className="text-blue-100 text-sm">
                  Send us an email for personalized assistance
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
