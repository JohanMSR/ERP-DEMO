import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Shield, 
  Zap, 
  BarChart3, 
  Gift, 
  Target,
  CheckCircle2,
  ArrowRight,
  Star,
  Sparkles,
  Globe,
  Lock,
  Rocket,
  Menu,
  X,
  Mail,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Helper function to navigate to login - redirects to app subdomain in production
  const navigateToLogin = () => {
    const hostname = window.location.hostname;
    // If on main domain (enrolanow.com or www.enrolanow.com), redirect to app subdomain
    if (hostname === 'enrolanow.com' || hostname === 'www.enrolanow.com') {
      window.location.href = 'https://app.enrolanow.com/login';
    } else {
      // In development or already on app subdomain, use normal navigation
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: Users,
      title: t.landing.features.referralManagement.title,
      description: t.landing.features.referralManagement.description,
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      icon: TrendingUp,
      title: t.landing.features.growthAnalytics.title,
      description: t.landing.features.growthAnalytics.description,
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: Award,
      title: t.landing.features.rewardSystem.title,
      description: t.landing.features.rewardSystem.description,
      gradient: 'from-orange-600 to-red-500'
    },
    {
      icon: Shield,
      title: t.landing.features.fraudPrevention.title,
      description: t.landing.features.fraudPrevention.description,
      gradient: 'from-red-500 to-orange-500'
    },
    {
      icon: Zap,
      title: t.landing.features.instantAutomation.title,
      description: t.landing.features.instantAutomation.description,
      gradient: 'from-orange-500 to-amber-400'
    },
    {
      icon: BarChart3,
      title: t.landing.features.realtimeReports.title,
      description: t.landing.features.realtimeReports.description,
      gradient: 'from-amber-400 to-orange-500'
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: t.landing.benefits.increaseSales.title,
      description: t.landing.benefits.increaseSales.description,
      stat: t.landing.benefits.increaseSales.stat
    },
    {
      icon: Users,
      title: t.landing.benefits.customerGrowth.title,
      description: t.landing.benefits.customerGrowth.description,
      stat: t.landing.benefits.customerGrowth.stat
    },
    {
      icon: Gift,
      title: t.landing.benefits.customerLoyalty.title,
      description: t.landing.benefits.customerLoyalty.description,
      stat: t.landing.benefits.customerLoyalty.stat
    },
    {
      icon: Rocket,
      title: t.landing.benefits.fastDeployment.title,
      description: t.landing.benefits.fastDeployment.description,
      stat: t.landing.benefits.fastDeployment.stat
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '49',
      period: 'month',
      description: 'Perfect for small businesses starting with referrals',
      features: [
        'Up to 500 referrals/month',
        'Basic analytics dashboard',
        'Email notifications',
        'Standard reward system',
        'Email support',
        'API access'
      ],
      popular: false,
      gradient: 'from-orange-50 to-amber-50'
    },
    {
      name: 'Professional',
      price: '149',
      period: 'month',
      description: 'For growing companies with advanced needs',
      features: [
        'Up to 5,000 referrals/month',
        'Advanced analytics & reports',
        'Multi-channel notifications',
        'Custom reward rules',
        'Priority support',
        'Advanced API & webhooks',
        'Custom branding',
        'Fraud detection'
      ],
      popular: true,
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large organizations',
      features: [
        'Unlimited referrals',
        'White-label solution',
        'Dedicated account manager',
        'Custom integrations',
        '24/7 phone support',
        'Advanced security features',
        'Custom development',
        'SLA guarantee',
        'Multi-tenant support'
      ],
      popular: false,
      gradient: 'from-indigo-50 to-purple-50'
    }
  ];

  const contactMethods = [
    {
      icon: Globe,
      title: 'Email Support',
      description: 'Get help from our support team',
      contact: 'support@enrola.com',
      action: 'mailto:support@enrola.com'
    },
    {
      icon: Users,
      title: 'Sales Inquiries',
      description: 'Interested in our Enterprise plan?',
      contact: 'sales@enrola.com',
      action: 'mailto:sales@enrola.com'
    },
    {
      icon: Shield,
      title: 'Technical Support',
      description: 'Need technical assistance?',
      contact: 'tech@enrola.com',
      action: 'mailto:tech@enrola.com'
    }
  ];

  const capabilities = [
    { value: 'Unlimited', label: 'Scalability' },
    { value: 'Real-time', label: 'Processing' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: 'Enterprise', label: 'Ready' }
  ];

  const faqs = [
    {
      question: 'How quickly can I get started?',
      answer: 'You can set up your referral program in less than 15 minutes. Our intuitive dashboard makes it easy to configure rewards, customize branding, and start inviting customers.'
    },
    {
      question: 'What integrations do you support?',
      answer: 'We offer integrations with major CRM platforms, email marketing tools, payment processors, and e-commerce platforms. We also provide a robust API for custom integrations.'
    },
    {
      question: 'How do you prevent fraud?',
      answer: 'Our advanced fraud detection system uses machine learning to identify suspicious activities, duplicate accounts, and invalid referrals in real-time.'
    },
    {
      question: 'Can I customize the reward structure?',
      answer: 'Absolutely! You have complete flexibility to create custom reward tiers, set different rewards for referrers and referees, and implement time-limited campaigns.'
    },
    {
      question: 'Is there a contract or can I cancel anytime?',
      answer: 'All our plans are month-to-month with no long-term contracts. You can upgrade, downgrade, or cancel anytime without penalties.'
    },
    {
      question: 'Do you provide customer support?',
      answer: 'Yes! We offer email support for all plans, priority support for Professional plans, and 24/7 phone support for Enterprise customers.'
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-soft border-b border-secondary-200/50' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Enrola Logo" 
                className="h-10 object-contain"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="nav-link hover:text-orange-500" onClick={(e) => { e.preventDefault(); document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); }}>{t.landing.nav.features}</a>
              <a href="#benefits" className="nav-link hover:text-orange-500" onClick={(e) => { e.preventDefault(); document.getElementById('benefits').scrollIntoView({ behavior: 'smooth' }); }}>{t.landing.nav.benefits}</a>
              <a href="#pricing" className="nav-link hover:text-orange-500" onClick={(e) => { e.preventDefault(); document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' }); }}>{t.landing.nav.pricing}</a>
              <a href="#contact" className="nav-link hover:text-orange-500" onClick={(e) => { e.preventDefault(); document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); }}>{t.landing.nav.contact}</a>
              <a href="#faq" className="nav-link hover:text-orange-500" onClick={(e) => { e.preventDefault(); document.getElementById('faq').scrollIntoView({ behavior: 'smooth' }); }}>{t.landing.nav.faq}</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={navigateToLogin}
                className="btn-ghost"
              >
                {t.landing.nav.signIn}
              </button>
              <button
                onClick={navigateToLogin}
                className="btn-primary"
              >
                {t.landing.nav.getStarted}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-secondary-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-secondary-200/50">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block py-2 text-secondary-600 hover:text-orange-600" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); }}>{t.landing.nav.features}</a>
              <a href="#benefits" className="block py-2 text-secondary-600 hover:text-orange-600" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('benefits').scrollIntoView({ behavior: 'smooth' }); }}>{t.landing.nav.benefits}</a>
              <a href="#pricing" className="block py-2 text-secondary-600 hover:text-orange-600" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' }); }}>{t.landing.nav.pricing}</a>
              <a href="#contact" className="block py-2 text-secondary-600 hover:text-orange-600" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); }}>{t.landing.nav.contact}</a>
              <a href="#faq" className="block py-2 text-secondary-600 hover:text-orange-600" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('faq').scrollIntoView({ behavior: 'smooth' }); }}>{t.landing.nav.faq}</a>
              <div className="pt-4 space-y-3">
                <button onClick={navigateToLogin} className="w-full btn-ghost">
                  {t.nav.signIn}
                </button>
                <button onClick={navigateToLogin} className="w-full btn-primary">
                  {t.nav.getStarted}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-soft border border-white/50 mb-8 animate-fade-in-up">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-secondary-700">
                {t.landing.hero.badge}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                {t.landing.hero.title1}
              </span>
              <br />
              <span className="text-secondary-900">
                {t.landing.hero.title2}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-secondary-600 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {t.landing.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <button 
                onClick={navigateToLogin}
                className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
              >
                {t.landing.hero.startTrial}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <a 
                href="#pricing"
                className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
                onClick={(e) => { e.preventDefault(); document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' }); }}
              >
                {t.landing.hero.viewPricing}
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-secondary-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-success-500" />
                <span>{t.landing.hero.noCreditCard}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-success-500" />
                <span>{t.landing.hero.freeTrial}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-success-500" />
                <span>{t.landing.hero.cancelAnytime}</span>
              </div>
            </div>
          </div>

          {/* Capabilities Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                {t.landing.capabilities.unlimited}
              </div>
              <div className="text-secondary-600 font-medium">{t.landing.capabilities.scalability}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                {t.landing.capabilities.realtime}
              </div>
              <div className="text-secondary-600 font-medium">{t.landing.capabilities.processing}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                {t.landing.capabilities.uptime}
              </div>
              <div className="text-secondary-600 font-medium">{t.landing.capabilities.sla}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                {t.landing.capabilities.enterprise}
              </div>
              <div className="text-secondary-600 font-medium">{t.landing.capabilities.ready}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              {t.landing.features.title}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"> {t.landing.features.titleHighlight}</span>
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              {t.landing.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group card-premium p-8 hover-lift cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-elegant`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              {t.landing.benefits.title}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"> {t.landing.benefits.titleHighlight}</span>
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              {t.landing.benefits.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="card-premium p-8 hover-lift">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-elegant">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3">
                    {benefit.stat}
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-secondary-600">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              {t.landing.pricing.title}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"> {t.landing.pricing.titleHighlight}</span>
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              {t.landing.pricing.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative ${
                  plan.popular 
                    ? 'card-premium bg-gradient-to-br from-orange-500 to-amber-500 text-white transform scale-105 shadow-glow-lg' 
                    : 'card-premium'
                }`}
              >

                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-secondary-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mb-6 ${plan.popular ? 'text-white/90' : 'text-secondary-600'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <div className="flex items-baseline">
                      {plan.price !== 'Custom' && (
                        <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-secondary-900'}`}>
                          ${plan.price}
                        </span>
                      )}
                      {plan.price === 'Custom' && (
                        <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-secondary-900'}`}>
                          {plan.price}
                        </span>
                      )}
                      {plan.period && (
                        <span className={`ml-2 ${plan.popular ? 'text-white/80' : 'text-secondary-600'}`}>
                          /{plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle2 className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-orange-500'}`} />
                        <span className={plan.popular ? 'text-white/90' : 'text-secondary-600'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={navigateToLogin}
                    className={`w-full py-4 rounded-xl font-semibold transition-[color,background-color,box-shadow] duration-300 ${
                      plan.popular
                        ? 'bg-white text-orange-600 hover:bg-white/90 shadow-elegant'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-elegant hover:shadow-glow'
                    }`}
                  >
                    {plan.price === 'Custom' ? t.landing.pricing.contactSales : t.landing.pricing.startTrial}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-secondary-600 mt-12">
            {t.landing.pricing.trialNote}
          </p>
        </div>
      </section>

      {/* Contact & Support Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              {t.landing.contact.title}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"> {t.landing.contact.titleHighlight}</span>
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              {t.landing.contact.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="card-premium p-8 hover-lift text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant">
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">
                  {method.title}
                </h3>
                <p className="text-secondary-600 mb-4">
                  {method.description}
                </p>
                <a 
                  href={method.action}
                  className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  {method.contact}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="card-premium p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                {t.landing.contact.immediate}
              </h3>
              <p className="text-secondary-600 mb-6">
                {t.landing.contact.immediateDesc}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href="mailto:support@enrola.com"
                  className="btn-primary"
                >
                  {t.landing.contact.contactSupport}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
                <a 
                  href="mailto:sales@enrola.com"
                  className="btn-secondary"
                >
                  {t.landing.contact.salesInquiry}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              {t.landing.faq.title}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"> {t.landing.faq.titleHighlight}</span>
            </h2>
            <p className="text-xl text-secondary-600">
              {t.landing.faq.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="card-premium overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/50 transition-colors"
                >
                  <span className="font-semibold text-secondary-900 pr-4">
                    {faq.question}
                  </span>
                  <div className={`transform transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 text-secondary-600 leading-relaxed pt-2">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="card-premium p-12 text-center bg-gradient-to-br from-orange-500 to-amber-500">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t.landing.cta.title}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t.landing.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={navigateToLogin}
                className="bg-white text-orange-600 hover:bg-white/90 px-8 py-4 rounded-xl font-semibold text-lg shadow-elegant transition-[background-color,transform,box-shadow] duration-300 hover:scale-105 w-full sm:w-auto"
              >
                {t.landing.cta.startTrial}
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
              <a
                href="#pricing"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 px-8 py-4 rounded-xl font-semibold text-lg border border-white/30 transition-[background-color,border-color] duration-300 w-full sm:w-auto"
                onClick={(e) => { e.preventDefault(); document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' }); }}
              >
                {t.landing.cta.viewPricing}
              </a>
            </div>
            <p className="text-white/80 mt-6 text-sm">
              {t.landing.cta.trialNote}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/logo.png" 
                  alt="Enrola Logo" 
                  className="w-10 h-10 object-contain"
                />
                <span className="text-2xl font-bold">Enrola</span>
              </div>
              <p className="text-secondary-400 mb-6">
                {t.landing.footer.description}
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-secondary-400 hover:text-white cursor-pointer transition-colors" />
                <Lock className="w-5 h-5 text-secondary-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4">{t.landing.footer.product}</h4>
              <ul className="space-y-3 text-secondary-400">
                <li><a href="#features" className="hover:text-white transition-colors">{t.landing.footer.features}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">{t.landing.footer.pricing}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.integrations}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.api}</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4">{t.landing.footer.company}</h4>
              <ul className="space-y-3 text-secondary-400">
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.aboutUs}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.blog}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.careers}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.contact}</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4">{t.landing.footer.legal}</h4>
              <ul className="space-y-3 text-secondary-400">
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.privacyPolicy}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.termsOfService}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.securityLink}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.landing.footer.gdpr}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-secondary-400 text-sm">
                {t.landing.footer.copyright}
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <Shield className="w-5 h-5 text-secondary-400" />
                <span className="text-secondary-400 text-sm">
                  {t.landing.footer.security}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-full shadow-elegant hover:shadow-glow transition-[box-shadow,transform] duration-300 hover:scale-110 z-50 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LandingPage;

