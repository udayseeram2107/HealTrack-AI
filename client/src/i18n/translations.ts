import { SupportedLanguage } from '@/shared/index.js';

export interface TranslationDictionary {
  brandTitle: string;
  brandTagline: string;
  navDashboard: string;
  navWounds: string;
  navHospitals: string;
  navNewEntry: string;
  emergencyAlertTitle: string;
  emergencyAlertSubtitle: string;
  callEmergencyButton: string;
  findNearestERButton: string;
  dismissBanner: string;
  stableBadge: string;
  monitorBadge: string;
  reviewBadge: string;
  nonDiagnosticDisclaimer: string;
  wizardStep1: string;
  wizardStep2: string;
  wizardStep3: string;
  wizardStep4: string;
  voiceJournalTitle: string;
  voiceJournalInstruction: string;
  recordVoiceBtn: string;
  stopVoiceBtn: string;
  listeningStatus: string;
  processingVoiceStatus: string;
  manualNotePlaceholder: string;
  painLevelLabel: string;
  exudateLevelLabel: string;
  exudateTypeLabel: string;
  odorLevelLabel: string;
  periwoundLabel: string;
  systemicSymptomsLabel: string;
  careTipsHeader: string;
  risksIfNeglectedHeader: string;
  recommendedStepsHeader: string;
  generateDoctorShareBtn: string;
  sbarSummaryHeader: string;
  compareButton: string;
  saveAndAnalyzeBtn: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    brandTitle: 'HealTrack AI',
    brandTagline: 'Clinical Decision-Support & Remote Wound Monitoring',
    navDashboard: 'Dashboard',
    navWounds: 'My Wounds',
    navHospitals: 'Hospital Directory',
    navNewEntry: '+ New Entry',
    emergencyAlertTitle: 'CRITICAL CLINICAL ESCALATION DETECTED',
    emergencyAlertSubtitle:
      'Signs of severe acute infection or rapid tissue necrosis detected. Do not wait for routine appointments.',
    callEmergencyButton: 'Call Emergency (112 / 911)',
    findNearestERButton: 'Locate Nearest Trauma Center',
    dismissBanner: 'Acknowledge Notice',
    stableBadge: 'Stable',
    monitorBadge: 'Monitor Closely',
    reviewBadge: 'Clinical Review Recommended',
    nonDiagnosticDisclaimer:
      'Educational Clinical Decision-Support Only: This system does not replace licensed medical evaluation or formal diagnosis. Immediately contact emergency care if symptoms rapidly escalate.',
    wizardStep1: 'Photo Capture',
    wizardStep2: 'Voice Journal',
    wizardStep3: 'Clinical Telemetry',
    wizardStep4: 'AI TIME Analysis',
    voiceJournalTitle: 'Multilingual Voice-to-Wound Journal',
    voiceJournalInstruction:
      'Speak naturally in English, Telugu, Hindi, or Tamil about your pain, drainage, sensation, or dressing changes.',
    recordVoiceBtn: 'Start Voice Recording',
    stopVoiceBtn: 'Complete Recording',
    listeningStatus: 'Listening to your symptoms...',
    processingVoiceStatus: 'Translating and extracting clinical markers...',
    manualNotePlaceholder: 'Or describe your symptoms manually (e.g., pain sensations, changes since yesterday)...',
    painLevelLabel: 'Pain Rating (NRS 0 - 10)',
    exudateLevelLabel: 'Exudate / Drainage Volume',
    exudateTypeLabel: 'Exudate Appearance',
    odorLevelLabel: 'Wound Odor',
    periwoundLabel: 'Periwound Skin Condition',
    systemicSymptomsLabel: 'Systemic Symptoms',
    careTipsHeader: 'Hygienic Care Guidance',
    risksIfNeglectedHeader: 'Potential Risks if Neglected',
    recommendedStepsHeader: 'Recommended Specialist Consultations',
    generateDoctorShareBtn: 'Share with Doctor (Expiring Link & QR)',
    sbarSummaryHeader: 'Physician SBAR Clinical Summary',
    compareButton: 'Visual Diff Comparison',
    saveAndAnalyzeBtn: 'Execute Clinical Telemetry Analysis'
  },
  te: {
    brandTitle: 'హీల్‌ట్రాక్ AI',
    brandTagline: 'క్లినికల్ డెసిషన్ సపోర్ట్ & రిమోట్ గాయం పర్యవేక్షణ',
    navDashboard: 'డ్యాష్‌బోర్డ్',
    navWounds: 'నా గాయాలు',
    navHospitals: 'ఆసుపత్రుల జాబితా',
    navNewEntry: '+ కొత్త నమోదు',
    emergencyAlertTitle: 'తీవ్రమైన క్లినికల్ ఎస్కలేషన్ గుర్తించబడింది',
    emergencyAlertSubtitle:
      'తీవ్రమైన ఇన్ఫెక్షన్ లేదా వేగంగా కణజాలం క్షీణించే సంకేతాలు కనిపించాయి. వెంటనే అత్యవసర సంరక్షణను పొందండి.',
    callEmergencyButton: 'అత్యవసర కాల్ చేయండి (112 / 108)',
    findNearestERButton: 'సమీప ట్రామా సెంటర్‌ను కనుగొనండి',
    dismissBanner: 'హెచ్చరికను గమనించాను',
    stableBadge: 'స్థిరంగా ఉంది (Stable)',
    monitorBadge: 'పర్యవేక్షించండి (Monitor)',
    reviewBadge: 'వైద్యుని సమీక్ష అవసరం (Review)',
    nonDiagnosticDisclaimer:
      'విద్యా మరియు నిర్ణయ మద్దతు మాత్రమే: ఈ వేదిక లైసెన్స్ పొందిన వైద్య నిర్ధారణను భర్తీ చేయదు. లక్షణాలు తీవ్రమైతే వెంటనే అత్యవసర కేంద్రాన్ని సంప్రదించండి.',
    wizardStep1: 'ఫోటో తీయండి',
    wizardStep2: 'వాయిస్ జర్నల్',
    wizardStep3: 'లక్షణాల వివరాలు',
    wizardStep4: 'AI క్లినికల్ విశ్లేషణ',
    voiceJournalTitle: 'బహుభాషా వాయిస్ జర్నల్ (తెలుగు)',
    voiceJournalInstruction:
      'మీ నొప్పి, చీము, వాపు లేదా మార్పుల గురించి తెలుగులో మాట్లాడండి. మా AI వ్యవస్థ విశ్లేషిస్తుంది.',
    recordVoiceBtn: 'వాయిస్ రికార్డింగ్ ప్రారంభించండి',
    stopVoiceBtn: 'రికార్డింగ్ ఆపండి',
    listeningStatus: 'మీ లక్షణాలను వింటున్నాము...',
    processingVoiceStatus: 'అనువదిస్తోంది మరియు పరిశీలిస్తోంది...',
    manualNotePlaceholder: 'లేదా మీ గాయం లక్షణాలను ఇక్కడ రాయండి...',
    painLevelLabel: 'నొప్పి తీవ్రత (0 - 10)',
    exudateLevelLabel: 'స్రావం / చీము పరిమాణం',
    exudateTypeLabel: 'స్రావం రకం',
    odorLevelLabel: 'వాసన స్థాయి',
    periwoundLabel: 'గాయం చుట్టూ చర్మ పరిస్థితి',
    systemicSymptomsLabel: 'శరీర సాధారణ లక్షణాలు (జ్వరం మొదలైనవి)',
    careTipsHeader: 'గాయం సంరక్షణ సూచనలు',
    risksIfNeglectedHeader: 'నిర్లక్ష్యం చేస్తే వచ్చే ప్రమాదాలు',
    recommendedStepsHeader: 'సిఫార్సు చేయబడిన నిపుణుల సంప్రదింపులు',
    generateDoctorShareBtn: 'వైద్యునికి షేర్ చేయండి (QR కోడ్ & లింక్)',
    sbarSummaryHeader: 'వైద్యుల SBAR క్లినికల్ సారాంశం',
    compareButton: 'చిత్రాల పోలిక (Visual Diff)',
    saveAndAnalyzeBtn: 'క్లినికల్ విశ్లేషణ చేయండి'
  },
  hi: {
    brandTitle: 'हीलट्रैक AI',
    brandTagline: 'क्लिनिकल डिसीजन-सपोर्ट और घाव निगरानी प्लेटफॉर्म',
    navDashboard: 'डैशबोर्ड',
    navWounds: 'मेरे घाव',
    navHospitals: 'अस्पताल खोजें',
    navNewEntry: '+ नई प्रविष्टि',
    emergencyAlertTitle: 'गंभीर आपातकालीन स्थिति का संकेत',
    emergencyAlertSubtitle:
      'गंभीर संक्रमण या ऊतक क्षति के लक्षण पाए गए हैं। तुरंत आपातकालीन चिकित्सा सहायता प्राप्त करें।',
    callEmergencyButton: 'आपातकालीन कॉल करें (112 / 108)',
    findNearestERButton: 'निकटतम ट्रॉमा सेंटर खोजें',
    dismissBanner: 'सूचना स्वीकार करें',
    stableBadge: 'स्थिर (Stable)',
    monitorBadge: 'निगरानी रखें (Monitor)',
    reviewBadge: 'डॉक्टर से परामर्श जरूरी (Review)',
    nonDiagnosticDisclaimer:
      'केवल शैक्षिक और निर्णय समर्थन के लिए: यह प्लेटफॉर्म पेशेवर चिकित्सीय निदान का विकल्प नहीं है। लक्षण बिगड़ने पर तुरंत अस्पताल जाएं।',
    wizardStep1: 'फोटो लें',
    wizardStep2: 'आवाज से विवरण',
    wizardStep3: 'लक्षणों का विवरण',
    wizardStep4: 'AI क्लिनिकल विश्लेषण',
    voiceJournalTitle: 'बहुभाषी वॉयस जर्नल (हिंदी)',
    voiceJournalInstruction:
      'अपने दर्द, स्राव, सूजन या घाव की स्थिति के बारे में हिंदी में बोलें।',
    recordVoiceBtn: 'बोलना शुरू करें',
    stopVoiceBtn: 'रिकॉर्डिंग समाप्त करें',
    listeningStatus: 'आपकी आवाज सुनी जा रही है...',
    processingVoiceStatus: 'अनुवाद और लक्षणों का विश्लेषण जारी है...',
    manualNotePlaceholder: 'या अपने लक्षणों को यहाँ टाइप करें...',
    painLevelLabel: 'दर्द का स्तर (0 - 10)',
    exudateLevelLabel: 'रिसाव / मवाद की मात्रा',
    exudateTypeLabel: 'रिसाव का प्रकार',
    odorLevelLabel: 'घाव की गंध',
    periwoundLabel: 'घाव के आसपास की त्वचा',
    systemicSymptomsLabel: 'शारीरिक लक्षण (जैसे बुखार, कंपकंपी)',
    careTipsHeader: 'स्वच्छता और देखभाल संबंधी सुझाव',
    risksIfNeglectedHeader: 'अनदेखी करने पर संभावित खतरे',
    recommendedStepsHeader: 'सुझाए गए विशेषज्ञ डॉक्टर',
    generateDoctorShareBtn: 'डॉक्टर के साथ शेयर करें (QR कोड व लिंक)',
    sbarSummaryHeader: 'चिकित्सक SBAR क्लिनिकल सारांश',
    compareButton: 'तुलनात्मक समीक्षा (Visual Diff)',
    saveAndAnalyzeBtn: 'क्लिनिकल विश्लेषण पूरा करें'
  },
  ta: {
    brandTitle: 'ஹீல்ட்ராக் AI',
    brandTagline: 'மருத்துவ முடிவு ஆதரவு & தொலைதூர காயம் கண்காணிப்பு',
    navDashboard: 'முகப்பு பலகை',
    navWounds: 'என் காயங்கள்',
    navHospitals: 'மருத்துவமனைகள்',
    navNewEntry: '+ புதிய பதிவு',
    emergencyAlertTitle: 'தீவிர மருத்துவ அவசர எச்சரிக்கை',
    emergencyAlertSubtitle:
      'கடுமையான தொற்று அல்லது திசு சேத அறிகுறிகள் கண்டறியப்பட்டுள்ளன. தாமதிக்காமல் அவசர சிகிச்சை பெறவும்.',
    callEmergencyButton: 'அவசர உதவிக்கு அழைக்கவும் (112 / 108)',
    findNearestERButton: 'அருகிலுள்ள அவசர சிகிச்சை மையம்',
    dismissBanner: 'அறிவிப்பை பார்த்தேன்',
    stableBadge: 'நிலையானது (Stable)',
    monitorBadge: 'கண்காணிக்கவும் (Monitor)',
    reviewBadge: 'மருத்துவர் ஆலோசனை தேவை (Review)',
    nonDiagnosticDisclaimer:
      'கல்வி மற்றும் ஆதரவு பயன்பாட்டிற்கு மட்டுமே: இது பதிவுசெய்த மருத்துவரின் நேரடி பரிசோதனைக்கு மாற்றாகாது.',
    wizardStep1: 'படம் பதிவேற்றவும்',
    wizardStep2: 'குரல் பதிவு',
    wizardStep3: 'அறிகுறிகள் பட்டியல்',
    wizardStep4: 'AI மருத்துவ ஆய்வு',
    voiceJournalTitle: 'குரல் வழி காயம் பதிவேடு (தமிழ்)',
    voiceJournalInstruction:
      'வலி, சீழ், வீக்கம் குறித்து தமிழில் நேரடியாகப் பேசுங்கள்.',
    recordVoiceBtn: 'குரல் பதிவைத் தொடங்கவும்',
    stopVoiceBtn: 'பதிவை முடிக்கவும்',
    listeningStatus: 'உங்கள் குரலைக் கேட்கிறது...',
    processingVoiceStatus: 'மொழிபெயர்த்து ஆய்வு செய்கிறது...',
    manualNotePlaceholder: 'அல்லது உங்கள் அறிகுறிகளை இங்கு உள்ளிடவும்...',
    painLevelLabel: 'வலி அளவு (0 - 10)',
    exudateLevelLabel: 'கசிவு / சீழ் அளவு',
    exudateTypeLabel: 'கசிவு வகை',
    odorLevelLabel: 'நாற்றத்தின் அளவு',
    periwoundLabel: 'காயத்தை சுற்றியுள்ள தோல் நிலை',
    systemicSymptomsLabel: 'உடல் அறிகுறிகள் (காய்ச்சல் முதலியன)',
    careTipsHeader: 'பராமரிப்பு ஆலோசனைகள்',
    risksIfNeglectedHeader: 'புறக்கணித்தால் ஏற்படும் ஆபத்துகள்',
    recommendedStepsHeader: 'பரிந்துரைக்கப்பட்ட சிறப்பு மருத்துவர்கள்',
    generateDoctorShareBtn: 'மருத்துவருடன் பகிரவும் (QR & இணைப்பு)',
    sbarSummaryHeader: 'மருத்துவர் SBAR சுருக்கம்',
    compareButton: 'முந்தைய படத்துடன் ஒப்பிடு',
    saveAndAnalyzeBtn: 'மருத்துவ ஆய்வை இயக்கவும்'
  }
};
