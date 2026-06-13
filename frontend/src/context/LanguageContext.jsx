import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    navHome: 'Home',
    navSearch: 'Find Equipment',
    navDashboard: 'Dashboard',
    navLogin: 'Login',
    navSignup: 'Register',
    navLogout: 'Logout',
    roleFarmer: 'Farmer',
    roleOwner: 'Equipment Owner',
    roleAdmin: 'Admin',
    heroTitle: 'Rent Agricultural Equipment Near You',
    heroSubtitle: 'Connect with equipment owners in your neighborhood and save on farming costs.',
    searchPlaceholder: 'Search equipment (e.g. Tractor, Harvester)',
    pincodePlaceholder: 'Pincode (e.g. 560001)',
    searchBtn: 'Search',
    categories: 'Equipment Categories',
    featuredListings: 'Featured Listings',
    allListings: 'All Available Equipment',
    weatherTitle: 'Weather & Farming Alerts',
    weatherCompatibility: 'Farming Compatibility',
    weatherDelay: 'delay rotavator due to heavy rain',
    weatherAlert: 'Heavy rain forecasted. Soil operations are highly discouraged.',
    recommendationTitle: 'AI Equipment Recommendation',
    recommendationSubtitle: 'Input your crop details to receive specialized equipment, timeline, and cost estimations.',
    cropLabel: 'Crop Type',
    areaLabel: 'Land Area (Acres)',
    activityLabel: 'Farming Activity',
    estimateCostBtn: 'Estimate Cost',
    getRecBtn: 'Get Recommendation',
    similarEquipment: 'Similar Equipment',
    specifications: 'Specifications',
    ownerInfo: 'Owner Information',
    availabilityCalendar: 'Availability Calendar',
    bookNow: 'Book Now',
    totalRentals: 'Total Bookings',
    totalRevenue: 'Total Earnings',
    activeRentals: 'Active Rentals',
    bookingHistory: 'Rental History',
    disputeReport: 'Report / Support request',
    submitReview: 'Submit Review',
    analyticsTitle: 'Platform Analytics',
    ratings: 'Reviews & Ratings',
    weatherAwareAlert: 'Weather-Aware Alert',
    nearbyEquipments: 'Nearby Equipment Map',
    demandHeatmap: 'High Demand Areas Heatmap'
  },
  hi: {
    navHome: 'होम',
    navSearch: 'उपकरण खोजें',
    navDashboard: 'डैशबोर्ड',
    navLogin: 'लॉगिन',
    navSignup: 'पंजीकरण',
    navLogout: 'लॉगआउट',
    roleFarmer: 'किसान',
    roleOwner: 'उपकरण मालिक',
    roleAdmin: 'एडमिन',
    heroTitle: 'अपने निकटतम कृषि उपकरण किराए पर लें',
    heroSubtitle: 'अपने पड़ोस में उपकरण मालिकों से जुड़ें और खेती की लागत पर बचाएं।',
    searchPlaceholder: 'उपकरण खोजें (जैसे ट्रैक्टर, हार्वेस्टर)',
    pincodePlaceholder: 'पिनकोड (जैसे 560001)',
    searchBtn: 'खोजें',
    categories: 'उपकरण श्रेणियाँ',
    featuredListings: 'विशेष रुप से प्रदर्शित उपकरण',
    allListings: 'सभी उपलब्ध उपकरण',
    weatherTitle: 'मौसम और कृषि चेतावनियां',
    weatherCompatibility: 'कृषि अनुकूलता',
    weatherDelay: 'भारी बारिश के कारण रोटावेटर में देरी',
    weatherAlert: 'भारी बारिश का अनुमान है। मिट्टी के संचालन की सख्त मनाही है।',
    recommendationTitle: 'एआई उपकरण अनुशंसा',
    recommendationSubtitle: 'विशेष उपकरण, समयरेखा और लागत अनुमान प्राप्त करने के लिए अपनी फसल का विवरण दर्ज करें।',
    cropLabel: 'फसल का प्रकार',
    areaLabel: 'भूमि क्षेत्र (एकड़)',
    activityLabel: 'कृषि गतिविधि',
    estimateCostBtn: 'लागत का अनुमान लगाएं',
    getRecBtn: 'सिफारिश प्राप्त करें',
    similarEquipment: 'समान उपकरण',
    specifications: 'तकनीकी निर्देश',
    ownerInfo: 'मालिक की जानकारी',
    availabilityCalendar: 'उपलब्धता कैलेंडर',
    bookNow: 'अभी बुक करें',
    totalRentals: 'कुल बुकिंग',
    totalRevenue: 'कुल कमाई',
    activeRentals: 'सक्रिय किराया',
    bookingHistory: 'किराया इतिहास',
    disputeReport: 'रिपोर्ट / समर्थन अनुरोध',
    submitReview: 'समीक्षा जमा करें',
    analyticsTitle: 'प्लेटफ़ॉर्म विश्लेषिकी',
    ratings: 'समीक्षाएं और रेटिंग',
    weatherAwareAlert: 'मौसम-सचेत चेतावनी',
    nearbyEquipments: 'निकटवर्ती उपकरण मानचित्र',
    demandHeatmap: 'उच्च मांग वाले क्षेत्र का मानचित्र'
  },
  kn: {
    navHome: 'ಮುಖಪುಟ',
    navSearch: 'ಉಪಕರಣ ಹುಡುಕಿ',
    navDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    navLogin: 'ಲಾಗಿನ್',
    navSignup: 'ನೋಂದಣಿ',
    navLogout: 'ಲಾಗ್ ಔಟ್',
    roleFarmer: 'ರೈತ',
    roleOwner: 'ಉಪಕರಣ ಮಾಲೀಕ',
    roleAdmin: 'ಅಡ್ಮಿನ್',
    heroTitle: 'ನಿಮ್ಮ ಹತ್ತಿರದ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಬಾಡಿಗೆಗೆ ಪಡೆಯಿರಿ',
    heroSubtitle: 'ನಿಮ್ಮ ನೆರೆಹೊರೆಯಲ್ಲಿರುವ ಉಪಕರಣ ಮಾಲೀಕರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ ಮತ್ತು ಕೃಷಿ ವೆಚ್ಚವನ್ನು ಉಳಿಸಿ.',
    searchPlaceholder: 'ಉಪಕರಣ ಹುಡುಕಿ (ಉದಾ: ಟ್ರ್ಯಾಕ್ಟರ್, ಹಾರ್ವೆಸ್ಟರ್)',
    pincodePlaceholder: 'ಪಿನ್ ಕೋಡ್ (ಉದಾ: 560001)',
    searchBtn: 'ಹುಡುಕು',
    categories: 'ಉಪಕರಣಗಳ ವರ್ಗಗಳು',
    featuredListings: 'ವಿಶೇಷ ಉಪಕರಣಗಳು',
    allListings: 'ಲಭ್ಯವಿರುವ ಎಲ್ಲಾ ಉಪಕರಣಗಳು',
    weatherTitle: 'ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಎಚ್ಚರಿಕೆಗಳು',
    weatherCompatibility: 'ಕೃಷಿ ಸೂಕ್ತತೆ',
    weatherDelay: 'ಭಾರೀ ಮಳೆಯಿಂದಾಗಿ ರೋಟಾವೇಟರ್ ವಿಳಂಬ',
    weatherAlert: 'ಭಾರೀ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇದೆ. ಮಣ್ಣಿನ ಕೆಲಸಗಳನ್ನು ಮಾಡಬೇಡಿ.',
    recommendationTitle: 'AI ಉಪಕರಣ ಶಿಫಾರಸು',
    recommendationSubtitle: 'ವಿಶೇಷ ಉಪಕರಣಗಳು, ಕಾಲಮಿತಿ ಮತ್ತು ವೆಚ್ಚದ ಅಂದಜು ಪಡೆಯಲು ನಿಮ್ಮ ಬೆಳೆಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
    cropLabel: 'ಬೆಳೆಯ ವಿಧ',
    areaLabel: 'ಭೂಪ್ರದೇಶ (ಎಕರೆ)',
    activityLabel: 'ಕೃಷಿ ಚಟುವಟಿಕೆ',
    estimateCostBtn: 'ವೆಚ್ಚ ಅಂದಾಜು ಮಾಡಿ',
    getRecBtn: 'ಶಿಫಾರಸು ಪಡೆಯಿರಿ',
    similarEquipment: 'ಸಂಬಂಧಿತ ಉಪಕರಣಗಳು',
    specifications: 'ವಿಶೇಷಣಗಳು',
    ownerInfo: 'ಮಾಲೀಕರ ವಿವರಗಳು',
    availabilityCalendar: 'ಲಭ್ಯತೆ ಕ್ಯಾಲೆಂಡರ್',
    bookNow: 'ಈಗಲೇ ಕಾಯ್ದಿರಿಸಿ',
    totalRentals: 'ಒಟ್ಟು ಬುಕಿಂಗ್‌ಗಳು',
    totalRevenue: 'ಒಟ್ಟು ಗಳಿಕೆ',
    activeRentals: 'ಸಕ್ರಿಯ ಬಾಡಿಗೆಗಳು',
    bookingHistory: 'ಬಾಡಿಗೆ ಇತಿಹಾಸ',
    disputeReport: 'ವರದಿ / ಸಹಾಯ ವಿನಂತಿ',
    submitReview: 'ವಿಮರ್ಶೆ ಸಲ್ಲಿಸಿ',
    analyticsTitle: 'ವೇದಿಕೆಯ ವಿಶ್ಲೇಷಣೆ',
    ratings: 'ವಿಮರ್ಶೆಗಳು ಮತ್ತು ರೇಟಿಂಗ್‌ಗಳು',
    weatherAwareAlert: 'ಹವಾಮಾನ ಜಾಗೃತಿ ಎಚ್ಚರಿಕೆ',
    nearbyEquipments: 'ಹತ್ತಿರದ ಉಪಕರಣಗಳ ನಕ್ಷೆ',
    demandHeatmap: 'ಹೆಚ್ಚಿನ ಬೇಡಿಕೆಯ ಪ್ರದೇಶಗಳ ನಕ್ಷೆ'
  },
  te: {
    navHome: 'హోమ్',
    navSearch: 'పరికరాలు వెతకండి',
    navDashboard: 'డ్యాష్‌బోర్డ్',
    navLogin: 'లాగిన్',
    navSignup: 'నమోదు',
    navLogout: 'లాగ్ అవుట్',
    roleFarmer: 'రైతు',
    roleOwner: 'పరికరాల యజమాని',
    roleAdmin: 'అడ్మిన్',
    heroTitle: 'మీ సమీపంలోని వ్యవసాయ పరికరాలను అద్దెకు తీసుకోండి',
    heroSubtitle: 'మీ పరిసరాల్లోని పరికరాల యజమానులతో కనెక్ట్ అవ్వండి మరియు వ్యవసాయ ఖర్చులపై ఆదా చేసుకోండి.',
    searchPlaceholder: 'పరికరాల శోధన (ఉదా: ట్రాక్టర్, హార్వెస్టర్)',
    pincodePlaceholder: 'పిన్ కోడ్ (ఉదా: 560001)',
    searchBtn: 'వెతకండి',
    categories: 'పరికరాల రకాలు',
    featuredListings: 'ఫీచర్ చేయబడిన పరికరాలు',
    allListings: 'అందుబాటులో ఉన్న అన్ని పరికరాలు',
    weatherTitle: 'ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಎಚ್ಚರಿಕೆಗಳು',
    weatherCompatibility: 'వ్యవసాయ అనుకూలత',
    weatherDelay: 'భారీ వర్షాల వల్ల రోటవేటర్ ఆలస్యం',
    weatherAlert: 'భారీ వర్షాల సూచన ఉంది. మట్టి పనులు వాయిదా వేసుకోండి.',
    recommendationTitle: 'AI పరికరాల సిఫార్సు',
    recommendationSubtitle: 'ప్రత్యేక పరికరాలు, కాలక్రమం మరియు ఖర్చు అంచనాలను పొందడానికి మీ పంట వివరాలను నమోదు చేయండి.',
    cropLabel: 'పంట రకం',
    areaLabel: 'భూమి వైశాల్యం (ఎకరాలు)',
    activityLabel: 'వ్యవసాయ పని',
    estimateCostBtn: 'ఖర్చు అంచనా వేయండి',
    getRecBtn: 'సిఫార్సు పొందండి',
    similarEquipment: 'ఇతర సమాన పరికరాలు',
    specifications: 'పరికరాల వివరాలు',
    ownerInfo: 'యజమాని వివరాలు',
    availabilityCalendar: 'అందుబాటు క్యాలెండర్',
    bookNow: 'ఇప్పుడే బుక్ చేయండి',
    totalRentals: 'మొత్తం బుకింగ్‌లు',
    totalRevenue: 'మొత్తం సంపాదన',
    activeRentals: 'సక్రియ అద్దెలు',
    bookingHistory: 'అద్దె చరిత్ర',
    disputeReport: 'ఫిర్యాదు / సహాయ అభ్యర్థన',
    submitReview: 'సమీక్ష సమర్పించండి',
    analyticsTitle: 'విశ్లేషణలు',
    ratings: 'సమీక్షలు & రేటింగ్‌లు',
    weatherAwareAlert: 'వాతావరణ హెచ్చరిక',
    nearbyEquipments: 'సమీప పరికరాల మ్యాప్',
    demandHeatmap: 'అధిక డిమాండ్ ఉన్న ప్రాంతాల మ్యాప్'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('agrishare-lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agrishare-lang', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
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
