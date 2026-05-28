import React, { createContext, useContext } from 'react';

const translations = {
  en: {
    // Navigation
    nav: {
      features: 'Features',
      benefits: 'Benefits',
      pricing: 'Pricing',
      contact: 'Contact',
      faq: 'FAQ',
      signIn: 'Sign In',
      getStarted: 'Get Started'
    },
    // Landing Page
    landing: {
      nav: {
        features: 'Features',
        benefits: 'Benefits',
        pricing: 'Pricing',
        contact: 'Contact',
        faq: 'FAQ',
        signIn: 'Sign In',
        getStarted: 'Get Started'
      },
      hero: {
        badge: 'Powered by AI',
        title1: 'Transform Customers',
        title2: 'Into Brand Promoters',
        subtitle: 'Launch powerful referral programs that drive growth, increase customer loyalty, and scale your business with our all-in-one platform.',
        startTrial: 'Start Free Trial',
        viewPricing: 'View Pricing',
        noCreditCard: 'No credit card required',
        freeTrial: '14-day free trial',
        cancelAnytime: 'Cancel anytime'
      },
      capabilities: {
        unlimited: 'Unlimited',
        scalability: 'Scalability',
        realtime: 'Real-time',
        processing: 'Processing',
        uptime: '99.9%',
        sla: 'Uptime SLA',
        enterprise: 'Enterprise',
        ready: 'Ready'
      },
      features: {
        title: 'Everything You Need to',
        titleHighlight: 'Succeed',
        subtitle: 'Powerful features designed to help you create, manage, and optimize your referral programs with ease.',
        referralManagement: {
          title: 'Referral Management',
          description: 'Complete system to manage and track all your referrals in real-time with detailed analytics.'
        },
        growthAnalytics: {
          title: 'Growth Analytics',
          description: 'Advanced analytics and insights to understand your referral program performance.'
        },
        rewardSystem: {
          title: 'Reward System',
          description: 'Flexible and customizable reward system to incentivize your customers.'
        },
        fraudPrevention: {
          title: 'Fraud Prevention',
          description: 'Advanced security measures to prevent fraud and ensure program integrity.'
        },
        instantAutomation: {
          title: 'Instant Automation',
          description: 'Automate referral tracking, rewards distribution, and notifications.'
        },
        realtimeReports: {
          title: 'Real-time Reports',
          description: 'Get instant reports and insights about your referral program performance.'
        }
      },
      benefits: {
        title: 'Why Choose',
        titleHighlight: 'Enrola',
        subtitle: 'Built with cutting-edge technology to power your business growth.',
        increaseSales: {
          title: 'Increase Sales',
          description: 'Boost your sales by up to 300% through strategic referral programs.',
          stat: '+300%'
        },
        customerGrowth: {
          title: 'Customer Growth',
          description: 'Acquire new customers at 5x lower cost than traditional marketing.',
          stat: '5x ROI'
        },
        customerLoyalty: {
          title: 'Customer Loyalty',
          description: 'Increase customer retention and lifetime value significantly.',
          stat: '+85%'
        },
        fastDeployment: {
          title: 'Fast Deployment',
          description: 'Get your referral program running in less than 24 hours.',
          stat: '< 24h'
        }
      },
      pricing: {
        title: 'Simple, Transparent',
        titleHighlight: 'Pricing',
        subtitle: 'Choose the perfect plan for your business. Scale as you grow.',
        trialNote: 'All plans include a 14-day free trial. No credit card required.',
        startTrial: 'Start Free Trial',
        contactSales: 'Contact Sales'
      },
      contact: {
        title: 'Contact &',
        titleHighlight: 'Support',
        subtitle: 'Get in touch with our team for support, questions, or partnership opportunities.',
        immediate: 'Need Immediate Assistance?',
        immediateDesc: 'Our support team is available 24/7 to help you with any questions or issues you may have.',
        contactSupport: 'Contact Support',
        salesInquiry: 'Sales Inquiry'
      },
      faq: {
        title: 'Frequently Asked',
        titleHighlight: 'Questions',
        subtitle: 'Everything you need to know about Enrola.'
      },
      cta: {
        title: 'Ready to Grow Your Business?',
        subtitle: 'Start building successful referral programs with our powerful, enterprise-ready platform.',
        startTrial: 'Start Your Free Trial',
        viewPricing: 'View Pricing',
        trialNote: 'No credit card required • 14-day free trial • Cancel anytime'
      },
      footer: {
        description: 'Elantar Referral Program - The most powerful referral platform for growing businesses.',
        product: 'Product',
        company: 'Company',
        legal: 'Legal',
        security: 'Enterprise-grade security',
        copyright: '© 2025 Enrola - Elantar Referral Program. All rights reserved.',
        features: 'Features',
        pricing: 'Pricing',
        integrations: 'Integrations',
        api: 'API',
        aboutUs: 'About Us',
        blog: 'Blog',
        careers: 'Careers',
        contact: 'Contact',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        securityLink: 'Security',
        gdpr: 'GDPR'
      }
    },
    // Login
    login: {
      welcome: 'Welcome to the',
      future: 'Future of Referrals',
      subtitle: 'Join thousands of successful referrers earning with our premium platform. Start your journey today and unlock unlimited earning potential.',
      welcomeBack: 'Welcome Back',
      signInAccount: 'Sign in to your account',
      username: 'Username',
      password: 'Password',
      enterUsername: 'Enter your username',
      enterPassword: 'Enter your password',
      signIn: 'Sign In',
      forgotPassword: 'Forgot your password?',
      features: {
        launch: {
          title: 'Launch Your Success',
          desc: 'Start earning with our powerful referral system'
        },
        secure: {
          title: 'Secure & Trusted',
          desc: 'Enterprise-grade security for your peace of mind'
        },
        premium: {
          title: 'Premium Experience',
          desc: 'Enjoy our premium platform features and support'
        }
      },
      welcomeBackToast: 'Welcome back!',
      errorToast: 'An unexpected error occurred'
    },
    // Forgot Password
    forgotPassword: {
      title: 'Recover your',
      titleHighlight: 'Password',
      subtitle: 'Enter your email address and we will send you a secure link to reset your password.',
      recoverPassword: 'Recover Password',
      sendLink: 'We will send you a secure link to your email',
      email: 'Email',
      enterEmail: 'Enter your email address',
      sendRecoveryLink: 'Send Recovery Link',
      backToLogin: '← Back to Sign In',
      features: {
        secure: {
          title: 'Secure Recovery',
          desc: 'Secure password recovery system'
        },
        protection: {
          title: 'Account Protection',
          desc: 'Your information is protected at all times'
        },
        support: {
          title: 'Quick Support',
          desc: 'Recover access to your account quickly'
        }
      },
      successMessage: 'If the email exists, a recovery link has been sent',
      errorMessage: 'Error processing request',
      connectionError: 'Connection error'
    },
    // Reset Password
    resetPassword: {
      new: 'New',
      titleHighlight: 'Password',
      subtitle: 'Create a secure new password to protect your account.',
      createNewPassword: 'Create New Password',
      chooseSecure: 'Choose a secure password for your account',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      enterNewPassword: 'Enter your new password',
      confirmNewPassword: 'Confirm your new password',
      updatePassword: 'Update Password',
      backToLogin: '← Back to Sign In',
      passwordStrength: 'Password strength:',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      passwordsMatch: 'Passwords match',
      passwordsNoMatch: 'Passwords do not match',
      features: {
        security: {
          title: 'Maximum Security',
          desc: 'Your new password is protected with encryption'
        },
        instant: {
          title: 'Instant Access',
          desc: 'You can access your account immediately'
        },
        continuity: {
          title: 'Guaranteed Continuity',
          desc: 'Resume your activities without interruptions'
        }
      },
      invalidLink: 'Invalid Link',
      invalidLinkDesc: 'The recovery link is invalid or has expired.',
      requestNewLink: 'Request New Link',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      passwordUpdated: 'Password updated successfully',
      resetError: 'Error resetting password',
      connectionError: 'Connection error'
    },
    // Common
    common: {
      loading: 'Loading...',
      saving: 'Saving...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      close: 'Close',
      search: 'Search',
      searchPlaceholder: 'Search...',
      noResults: 'No results found',
      error: 'Error',
      success: 'Success',
      yes: 'Yes',
      no: 'No',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      username: 'Username',
      password: 'Password',
      user: 'User',
      admin: 'Admin',
      member: 'Member',
      administrator: 'Administrator'
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your activity',
      loading: 'Loading your dashboard...',
      rewardPoints: 'Reward Points',
      conversions: 'Conversions',
      lifetimePoints: 'Lifetime Points',
      last7Days: 'Last 7 days',
      referrals: 'Referrals',
      analytics: 'Analytics',
      network: 'Network',
      rewards: 'Rewards',
      activeLinks: 'Active Links',
      totalClicks: 'Total Clicks',
      yourEarnedRewardPoints: 'Your earned reward points',
      successfulReferralConversions: 'Successful referral conversions',
      viewRewardPoints: 'View your reward points and available rewards',
      trackEarnedPoints: 'Track how you have earned your reward points',
      startReferringClients: 'Start referring clients to earn reward points!',
      conversionsToGo: 'conversions to go',
      welcomeBack: 'Welcome back, {name}!',
      crushingIt: 'You\'re crushing it! Your referral program is performing excellently.',
      proMember: 'Pro Member',
      loadingDashboard: 'Loading your dashboard...',
      failedToLoadAnalytics: 'Failed to load analytics data',
      nextMilestone: 'Next Milestone',
      growthRate: 'Growth Rate',
      newClicks: 'New Clicks',
      pointsHistory: 'Points History',
      noPointsHistoryYet: 'No points history yet',
      date: 'Date',
      event: 'Event',
      referredClient: 'Referred Client',
      pointsEarned: 'Points Earned',
      joined: 'Joined',
      trackPerformance: 'Track your performance and growth metrics',
      manageReferralLinks: 'Manage and monitor your referral links',
      referralNetwork: 'Your referral network and connections',
      stayUpdated: 'Stay updated with the latest activities',
      customizeAccount: 'Customize your account and preferences',
      performanceOverview: 'Welcome back, {name}! Here\'s your performance overview.',
      vsLastPeriod: 'vs last period',
      recentReferralLinks: 'Recent Referral Links',
      noReferralLinks: 'No referral links yet',
      createFirstLink: 'Create your first referral link to start earning commissions.',
      createLink: 'Create Link',
      quickActions: 'Quick Actions',
      viewAnalytics: 'View Analytics',
      manageReferrals: 'Manage Referrals',
      viewNetwork: 'View Network',
      referralLinks: 'Referral Links',
      manageTrack: 'Manage and track all your referral links',
      yourNetwork: 'Your Network',
      peopleReferred: 'People you have referred to the platform',
      networkStats: 'Network Stats',
      totalReferred: 'Total Referred',
      activeMembers: 'Active Members',
      totalReferralsMade: 'Total Referrals Made',
      networkMembers: 'Network Members',
      loadingRewards: 'Loading rewards...',
      currentPoints: 'Current Points',
      yourReferrals: 'Your Referrals',
      nextReward: 'Next Reward',
      availableRewards: 'Available Rewards',
      noPointsHistory: 'No points history yet',
      noRewardsAvailable: 'No rewards available at the moment'
    },
    // Sidebar
    sidebar: {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      referrals: 'Referrals',
      network: 'Network',
      rewards: 'Rewards',
      users: 'Users',
      importUsers: 'Import Users',
      myClients: 'My Clients',
      settings: 'Settings',
      logout: 'Logout'
    },
    // TopBar
    topBar: {
      settings: 'Settings',
      signOut: 'Sign out',
      useLightTheme: 'Use light theme',
      useDarkTheme: 'Use dark theme'
    },
    // Settings
    settings: {
      title: 'Settings',
      subtitle: 'Manage your account and preferences',
      systemSettings: 'System Settings',
      profile: 'Profile',
      notifications: 'Notifications',
      privacy: 'Privacy',
      appearance: 'Appearance',
      updateAccount: 'Update your account name and password',
      name: 'Name',
      yourName: 'Your name',
      changePassword: 'Change Password',
      leaveEmpty: 'Leave password fields empty if you don\'t want to change it',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      enterCurrentPassword: 'Enter current password',
      enterNewPassword: 'Enter new password',
      confirmNewPasswordPlaceholder: 'Confirm new password',
      saveChanges: 'Save Changes',
      personalInfo: 'Personal Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      bio: 'Biography',
      tellUs: 'Tell us about yourself...',
      saveProfile: 'Save Changes',
      notificationPreferences: 'Notification Preferences',
      emailNotifications: 'Email Notifications',
      emailNotificationsDesc: 'Receive notifications by email',
      pushNotifications: 'Push Notifications',
      pushNotificationsDesc: 'Real-time notifications',
      weeklyReports: 'Weekly Reports',
      weeklyReportsDesc: 'Weekly activity summary',
      newReferrals: 'New Referrals',
      newReferralsDesc: 'When someone uses your code',
      conversions: 'Conversions',
      conversionsDesc: 'When a conversion is completed',
      savePreferences: 'Save Preferences',
      privacySettings: 'Privacy Settings',
      publicProfile: 'Public Profile',
      publicProfileDesc: 'Make your profile visible to other users',
      showStats: 'Show Statistics',
      showStatsDesc: 'Show your statistics publicly',
      allowMessages: 'Allow Messages',
      allowMessagesDesc: 'Allow others to send you messages',
      dataSharing: 'Share Data',
      dataSharingDesc: 'Share anonymous data to improve service',
      savePrivacy: 'Save Configuration',
      appearanceLocalization: 'Appearance and Localization',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      auto: 'Automatic',
      language: 'Language',
      timezone: 'Timezone',
      dateFormat: 'Date Format',
      saveAppearance: 'Save Preferences',
      confirmChanges: 'Confirm Changes',
      confirmChangesDesc: 'Are you sure you want to update your settings with the following changes?',
      updating: 'Updating...',
      nameRequired: 'Name is required',
      currentPasswordRequired: 'Current password is required to change password',
      passwordsNoMatch: 'New passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      settingsUpdated: 'Settings updated successfully!',
      failedUpdate: 'Failed to update settings',
      errorUpdating: 'An error occurred while updating settings',
      savedSuccessfully: 'saved successfully'
    },
    // Referral Page
    referral: {
      loading: 'Loading...',
      welcome: 'Welcome!',
      referredBy: 'You were referred by',
      joinNow: 'Join Now',
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign In',
      register: 'Register',
      createAccount: 'Create Account',
      exclusiveRewards: 'Exclusive Rewards',
      exclusiveRewardsDesc: 'Earn unique benefits for each referral',
      premiumProgram: 'Premium Program',
      premiumProgramDesc: 'Access advanced system features',
      activeCommunity: 'Active Community',
      activeCommunityDesc: 'Join a network of committed users',
      registrationSuccessful: 'Registration successful! Welcome to our platform!',
      registrationFailed: 'Registration failed',
      errorOccurred: 'An error occurred during registration',
      passwordsDoNotMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      invalidReferralLink: 'Invalid referral link'
    },
    // Notifications
    notifications: {
      title: 'Notifications',
      all: 'All',
      unread: 'unread',
      success: 'Success',
      info: 'Info',
      markAllRead: 'Mark all as read',
      markAsRead: 'Mark as read',
      delete: 'Delete',
      loading: 'Loading notifications...',
      noNotifications: 'No notifications',
      failedToLoad: 'Failed to load notifications',
      failedToMarkRead: 'Failed to mark notification as read',
      failedToMarkAllRead: 'Failed to mark all notifications as read'
    },
    // Admin Dashboard
    admin: {
      dashboard: 'Dashboard',
      users: 'Users',
      analytics: 'Analytics',
      importUsers: 'Import Users',
      rewards: 'Rewards',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      totalReferrals: 'Total Referrals',
      conversionRate: 'Conversion Rate',
      addUser: 'Add User',
      editUser: 'Edit User',
      deleteUser: 'Delete User',
      userDetails: 'User Details',
      import: 'Import',
      export: 'Export',
      filter: 'Filter',
      sort: 'Sort',
      searchUsers: 'Search users...',
      all: 'All',
      clients: 'Clients',
      vendors: 'Vendors',
      admins: 'Admins',
      adminControlCenter: 'Admin Control Center',
      completeSystemOverview: 'Complete system overview and management tools at your fingertips.',
      systemAdministrator: 'System Administrator',
      systemAnalytics: 'System Analytics',
      userManagement: 'User Management',
      systemSettings: 'System Settings',
      notifications: 'Notifications',
      rewardsManagement: 'Rewards Management',
      adminDashboard: 'Admin Dashboard',
      monitorSystemPerformance: 'Monitor system performance and user metrics',
      manageUsers: 'Manage users and their referral activities',
      configureSystemSettings: 'Configure system settings and preferences',
      systemAlerts: 'System alerts and important updates',
      configureRewardPoints: 'Configure reward points and manage rewards catalog',
      welcomeBack: 'Welcome back, {name}! Here\'s your system overview.',
      totalRevenue: 'Total Revenue',
      growthAnalytics: 'Growth Analytics',
      advancedAnalytics: 'Advanced analytics and insights to understand your referral program performance',
      activeReferrals: 'Active Referrals',
      activeReferrers: 'Active Referrers',
      totalPlatformRevenue: 'Total platform revenue',
      registeredPlatformUsers: 'Registered platform users',
      totalSuccessfulReferrals: 'Total successful referrals',
      clientsMakingReferrals: 'Clients making referrals',
      platformRevenue: 'Platform revenue',
      allUsers: 'All users',
      platformReferrals: 'Platform referrals',
      recentUsers: 'Recent Users',
      viewAllUsers: 'View All Users',
      userOverview: 'User Overview',
      latestUserRegistrations: 'Latest user registrations and activity',
      quickActions: 'Quick Actions',
      manageUsers: 'Manage Users',
      viewAnalytics: 'View Analytics',
      importUsers: 'Import Users',
      rewardsSystem: 'Rewards System',
      notifications: 'Notifications',
      platformStatistics: 'Platform Statistics',
      totalVendors: 'Total Vendors',
      totalClients: 'Total Clients',
      avgReferralsPerClient: 'Avg Referrals/Client',
      activeReferralRate: 'Active Referral Rate',
      administrators: 'Administrators',
      searchByUsername: 'Search by username, email, or phone...',
      all: 'All',
      dateJoined: 'Date Joined',
      user: 'User',
      type: 'Type',
      contact: 'Contact',
      joined: 'Joined',
      actions: 'Actions',
      viewDetails: 'View Details',
      clientStateDistribution: 'Client State Distribution',
      affiliated: 'Affiliated',
      contacted: 'Contacted',
      visited: 'Visited',
      completed: 'Completed',
      keyPerformanceIndicators: 'Key Performance Indicators',
      activeReferralLinks: 'Active Referral Links',
      totalClicks: 'Total Clicks',
      topVendors: 'Top Vendors',
      topClients: 'Top Clients',
      noVendorsYet: 'No vendors yet',
      noActiveClientsYet: 'No active clients yet',
      revenueAnalytics: 'Revenue Analytics',
      fromReferrals: 'From {count} referrals',
      revenuePerReferral: 'Revenue per Referral',
      standardCommission: 'Standard commission',
      revenuePerVendor: 'Revenue per Vendor',
      averageAcrossVendors: 'Average across {count} vendors',
      importUsersFromExcel: 'Import Users from Excel',
      chooseImportType: 'Choose the type of users you want to import and upload an Excel file following the template.',
      importVendors: 'Import Vendors',
      importClients: 'Import Clients',
      downloadTemplate: 'Download Template',
      uploadFileToPreview: 'Upload File to Preview',
      selectVendor: 'Select vendor for client assignment',
      selectAVendor: 'Select a vendor...',
      allImportedClientsAssigned: 'All imported clients will be assigned to the selected vendor.',
      clients: 'clients',
      noPhone: 'No phone',
      noUsersFound: 'No users found',
      tryAdjustingFilters: 'Try adjusting your filters or search term.',
      username: 'Username',
      vsLastPeriod: 'vs last period',
      last7Days: 'Last 7 days',
      importFailed: 'Import failed',
      pleaseSelectVendor: 'Please select a vendor for client import',
      failedToLoadVendors: 'Failed to load vendors'
    },
    // Vendor Dashboard
    vendor: {
      dashboard: 'Dashboard',
      clients: 'My Clients',
      analytics: 'Analytics',
      addClient: 'Add Client',
      editClient: 'Edit Client',
      clientDetails: 'Client Details',
      totalClients: 'Total Clients',
      activeClients: 'Active Clients',
      totalCommission: 'Total Commission',
      clientReferrals: 'Client Referrals',
      activeClientsLabel: 'Active Clients',
      assignedClients: 'Assigned clients',
      totalEarnings: 'Total earnings',
      totalReferrals: 'Total referrals',
      makingReferrals: 'Making referrals'
    },
    // Rewards
    rewards: {
      title: 'Rewards Configuration',
      pointConfigs: 'Point Configurations',
      rewards: 'Rewards',
      addReward: 'Add Reward',
      editReward: 'Edit Reward',
      deleteReward: 'Delete Reward',
      name: 'Name',
      description: 'Description',
      pointsRequired: 'Points Required',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      create: 'Create',
      update: 'Update',
      savedSuccessfully: 'Point configurations saved successfully!',
      failedToSave: 'Failed to save configurations',
      createdSuccessfully: 'Reward created successfully!',
      failedToCreate: 'Failed to create reward',
      updatedSuccessfully: 'Reward updated successfully!',
      failedToUpdate: 'Failed to update reward',
      deletedSuccessfully: 'Reward deleted successfully!',
      failedToDelete: 'Failed to delete reward',
      fillRequiredFields: 'Please fill in all required fields',
      loading: 'Loading rewards configuration...',
      failedToLoad: 'Failed to load rewards configuration',
      rewardsConfiguration: 'Rewards Configuration',
      configureRewardPoints: 'Configure reward points for client states and manage available rewards',
      stateRewardPoints: 'State Reward Points',
      configurePointsAwarded: 'Configure points awarded to referrers when their referred clients advance through states',
      editPoints: 'Edit Points',
      rewardPoints: 'Reward Points',
      whenClientRefers: 'When a client refers another person',
      whenSellerContacts: 'When seller contacts the affiliate by phone',
      whenSellerVisits: 'When seller visits the affiliate in person',
      whenSaleCompleted: 'When sale is completed',
      rewardsCatalog: 'Rewards Catalog',
      manageRewardsRedeem: 'Manage rewards that clients can redeem with their points',
      addReward: 'Add Reward',
      pointsRequired: 'Points Required',
      noRewardsYet: 'No Rewards Yet',
      createFirstReward: 'Create your first reward for clients to redeem',
      points: 'points',
      inactive: 'Inactive',
      cancel: 'Cancel',
      save: 'Save',
      createReward: 'Create Reward',
      createNewReward: 'Create New Reward',
      editReward: 'Edit Reward',
      rewardName: 'Reward Name',
      description: 'Description',
      active: 'Active',
      confirmDeleteReward: 'Are you sure you want to delete this reward?',
      describeReward: 'Describe the reward...',
      rewardNamePlaceholder: 'e.g., $50 Gift Card'
    },
    enrola: {
      giftsHome: 'Gifts',
      programs: 'Referral programs',
      wallet: 'Wallet',
      club: 'Shopping club',
      promoCard: 'Promo & virtual card',
      enrolaHub: 'Enrola hub',
      corporate: 'Corporate'
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const language = 'en';
  const t = translations.en;

  const changeLanguage = () => {};

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

