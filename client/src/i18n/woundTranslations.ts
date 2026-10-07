import { SupportedLanguage, WoundType } from '@/shared/index.js';

export interface LocalizedOption {
  value: string;
  en: string;
  te: string;
  hi: string;
  ta: string;
}

// 1. Clinical Wound Classifications translated across English, Telugu, Hindi, and Tamil
export const LOCALIZED_WOUND_TYPES: {
  value: WoundType;
  labels: Record<SupportedLanguage, string>;
}[] = [
  {
    value: 'Post-Surgical Incision',
    labels: {
      en: 'Post-Surgical Incision',
      te: 'శస్త్రచికిత్స అనంతర కోత గాయం (Post-Surgical)',
      hi: 'सर्जरी के बाद का चीरा घाव (Post-Surgical)',
      ta: 'அறுவை சிகிச்சைக்குப் பிந்தைய காயம் (Post-Surgical)'
    }
  },
  {
    value: 'Diabetic Foot Ulcer (DFU)',
    labels: {
      en: 'Diabetic Foot Ulcer (DFU)',
      te: 'డయాబెటిక్ పాదపు పుండు (DFU)',
      hi: 'मधुमेह पैर का अल्सर (DFU)',
      ta: 'நீரிழிவு பாதப் புண் (DFU)'
    }
  },
  {
    value: 'Venous Leg Ulcer (VLU)',
    labels: {
      en: 'Venous Leg Ulcer (VLU)',
      te: 'సిరల కాలు పుండు (Venous Leg Ulcer)',
      hi: 'वेनस लेग अल्सर (नसों का घाव)',
      ta: 'நரம்பு கால் புண் (Venous Leg Ulcer)'
    }
  },
  {
    value: 'Arterial Insufficiency Ulcer',
    labels: {
      en: 'Arterial Insufficiency Ulcer',
      te: 'ధమనుల లోపం వల్ల వచ్చే పుండు (Arterial Ulcer)',
      hi: 'धमनी अपर्याप्तता अल्सर (Arterial Ulcer)',
      ta: 'தமனி பற்றாக்குறை புண் (Arterial Ulcer)'
    }
  },
  {
    value: 'Pressure Injury (Stage 1-4)',
    labels: {
      en: 'Pressure Injury / Bed Sore (Stage 1-4)',
      te: 'ఒత్తిడి పుండు / బెడ్‌సోర్ (Bed Sore Stage 1-4)',
      hi: 'दबाव घाव / बेडसोर (Bed Sore Stage 1-4)',
      ta: 'அழுத்தப் புண் / படுக்கைப் புண் (Bed Sore)'
    }
  },
  {
    value: 'Traumatic Laceration / Abrasion',
    labels: {
      en: 'Traumatic Laceration / Abrasion',
      te: 'గాయం వల్ల చర్మం చీలిక / రాపిడి (Laceration)',
      hi: 'चोट का घाव / छिलना (Laceration / Abrasion)',
      ta: 'காயத்தால் ஏற்பட்ட வெட்டு / சிராய்ப்பு'
    }
  },
  {
    value: 'Burn (1st/2nd Degree Superficial)',
    labels: {
      en: 'Burn Injury (1st/2nd Degree Superficial)',
      te: 'కాలిన గాయం (Burn Injury 1st/2nd Degree)',
      hi: 'जलने का घाव (Burn Injury 1st/2nd Degree)',
      ta: 'தீக்காயம் (Burn Injury 1st/2nd Degree)'
    }
  },
  {
    value: 'Other Cutaneous Wound',
    labels: {
      en: 'Other Cutaneous / Skin Wound',
      te: 'ఇతర చర్మ సంబంధిత గాయం (Other Wound)',
      hi: 'अन्य त्वचा का घाव (Other Skin Wound)',
      ta: 'மற்ற தோல் காயம் (Other Cutaneous Wound)'
    }
  }
];

// 2. Common Wound Names and Preset Labels in every language
export const LOCALIZED_WOUND_NAMES: {
  en: string;
  te: string;
  hi: string;
  ta: string;
}[] = [
  {
    en: 'Left Lateral Malleolus Incision',
    te: 'ఎడమ చీలమండ కోత గాయం (Left Ankle Incision)',
    hi: 'बाएं टखने का चीरा (Left Ankle Incision)',
    ta: 'இடது கணுக்கால் கீறல் காயம்'
  },
  {
    en: 'Diabetic Foot Ulcer (Great Toe)',
    te: 'డయాబెటిక్ బొటనవేలి పుండు (Great Toe DFU)',
    hi: 'पैर के अंगूठे का मधुमेह अल्सर (Great Toe DFU)',
    ta: 'நீரிழிவு பெருவிரல் புண் (Great Toe DFU)'
  },
  {
    en: 'Abdominal Laparoscopic Incision',
    te: 'పొత్తికడుపు లాపరోస్కోపిక్ శస్త్రచికిత్స గాయం',
    hi: 'पेट का लैप्रोस्कोपिक सर्जिकल चीरा',
    ta: 'வயிற்று லேப்ராஸ்கோபிக் அறுவை சிகிச்சை கீறல்'
  },
  {
    en: 'Sacral Pressure Injury Stage 2',
    te: 'వెన్నుపూస ఒత్తిడి పుండు దశ 2 (Sacral Sore)',
    hi: 'कमर के निचले हिस्से का दबाव घाव स्टेज 2',
    ta: 'முதுகுத்தண்டு அழுத்த புண் நிலை 2'
  },
  {
    en: 'Right Knee Surgery Incision',
    te: 'కుడి మోకాలి శస్త్రచికిత్స గాయం (Knee Incision)',
    hi: 'दाहिने घुटने की सर्जरी का चीरा (Knee Incision)',
    ta: 'வலது முழங்கால் அறுவை சிகிச்சை கீறல்'
  },
  {
    en: 'Forearm Traumatic Laceration',
    te: 'ముంజేయి గాయం / రాపిడి (Forearm Laceration)',
    hi: 'हाथ की अग्रबाहु का घाव (Forearm Laceration)',
    ta: 'முன்கை சிராய்ப்பு காயம் (Forearm Laceration)'
  }
];

// 3. Anatomical Locations translated in every language
export const LOCALIZED_LOCATIONS: {
  en: string;
  te: string;
  hi: string;
  ta: string;
}[] = [
  {
    en: 'Left Ankle (Lateral Aspect)',
    te: 'ఎడమ చీలమండ (Left Ankle)',
    hi: 'बायां टखना (Left Ankle)',
    ta: 'இடது கணுக்கால் (Left Ankle)'
  },
  {
    en: 'Plantar Surface (Right Foot Sole)',
    te: 'కుడి అరికాలు (Right Sole)',
    hi: 'दाहिने पैर का तलवा (Right Sole)',
    ta: 'வலது உள்ளங்கால் (Right Sole)'
  },
  {
    en: 'Lower Abdomen (Midline)',
    te: 'దిగువ పొత్తికడుపు (Lower Abdomen)',
    hi: 'निचला पेट (Lower Abdomen)',
    ta: 'கீழ் வயிறு (Lower Abdomen)'
  },
  {
    en: 'Sacrum / Lower Back',
    te: 'నడుము క్రింది భాగం / శాక్రమ్ (Lower Back)',
    hi: 'कमर का निचला हिस्सा / सेक्रम (Lower Back)',
    ta: 'கீழ் முதுகு / சாக்ரம் (Lower Back)'
  },
  {
    en: 'Right Knee (Anterior Aspect)',
    te: 'కుడి మోకాలు (Right Knee)',
    hi: 'दाहिना घुटना (Right Knee)',
    ta: 'வலது முழங்கால் (Right Knee)'
  },
  {
    en: 'Forearm / Upper Limb',
    te: 'ముంజేయి / చేతి భాగం (Forearm)',
    hi: 'अग्रबाहु / हाथ (Forearm)',
    ta: 'முன்கை / கை பகுதி (Forearm)'
  }
];

// 4. Wound Status Telemetry: Pain, Drainage, Odor in every language
export const LOCALIZED_STATUS_METRICS = {
  pain: {
    noPain: {
      en: 'No Pain (0/10)',
      te: 'నొప్పి లేదు (0/10)',
      hi: 'कोई दर्द नहीं (0/10)',
      ta: 'வலி இல்லை (0/10)'
    },
    mild: {
      en: 'Mild Discomfort',
      te: 'స్వల్ప నొప్పి',
      hi: 'हल्का दर्द',
      ta: 'லேசான வலி'
    },
    moderate: {
      en: 'Moderate Pain',
      te: 'మధ్యస్థ నొప్పి',
      hi: 'मध्यम दर्द',
      ta: 'மிதமான வலி'
    },
    severe: {
      en: 'Severe Distress',
      te: 'తీవ్రమైన నొప్పి',
      hi: 'गंभीर दर्द',
      ta: 'கடுமையான வலி'
    },
    worst: {
      en: 'Worst Possible Pain (10/10)',
      te: 'భరించలేని నొప్పి (10/10)',
      hi: 'असहनीय दर्द (10/10)',
      ta: 'தாங்க முடியாத வலி (10/10)'
    }
  },
  exudate: {
    none: {
      en: 'None',
      te: 'ఏమీ లేదు',
      hi: 'कोई नहीं',
      ta: 'இல்லை'
    },
    scant: {
      en: 'Scant',
      te: 'చాలా స్వల్పం',
      hi: 'बहुत कम',
      ta: 'மிகக் குறைவு'
    },
    moderate: {
      en: 'Moderate',
      te: 'మధ్యస్థం',
      hi: 'मध्यम',
      ta: 'மிதமானது'
    },
    heavy: {
      en: 'Heavy',
      te: 'అధికం',
      hi: 'अत्यधिक',
      ta: 'அதிகம்'
    }
  },
  odor: {
    none: {
      en: 'None',
      te: 'వాసన లేదు',
      hi: 'कोई गंध नहीं',
      ta: 'நாற்றம் இல்லை'
    },
    mild: {
      en: 'Mild',
      te: 'స్వల్ప వాసన',
      hi: 'हल्की गंध',
      ta: 'லேசான மணம்'
    },
    foul: {
      en: 'Foul',
      te: 'దుర్వాసన',
      hi: 'दुर्गंध',
      ta: 'துர்நாற்றம்'
    }
  }
};

/**
 * Helper function to translate any standard wound type value to the currently selected language
 */
export function getTranslatedWoundType(type: string, lang: SupportedLanguage): string {
  const match = LOCALIZED_WOUND_TYPES.find(
    (item) => item.value.toLowerCase() === type.toLowerCase()
  );
  if (match) {
    return match.labels[lang] || match.labels.en || type;
  }
  return type;
}

/**
 * Helper function to translate pain score to localized severity text
 */
export function getLocalizedPainText(score: number, lang: SupportedLanguage): string {
  const m = LOCALIZED_STATUS_METRICS.pain;
  if (score === 0) return m.noPain[lang] || m.noPain.en;
  if (score <= 3) return `${m.mild[lang] || m.mild.en} (${score}/10)`;
  if (score <= 6) return `${m.moderate[lang] || m.moderate.en} (${score}/10)`;
  if (score <= 8) return `${m.severe[lang] || m.severe.en} (${score}/10)`;
  return `${m.worst[lang] || m.worst.en}`;
}

/**
 * Helper function to translate drainage level
 */
export function getLocalizedExudate(level: string, lang: SupportedLanguage): string {
  const key = level.toLowerCase() as keyof typeof LOCALIZED_STATUS_METRICS.exudate;
  return LOCALIZED_STATUS_METRICS.exudate[key]?.[lang] || level;
}

/**
 * Helper function to translate odor level
 */
export function getLocalizedOdor(level: string, lang: SupportedLanguage): string {
  const key = level.toLowerCase() as keyof typeof LOCALIZED_STATUS_METRICS.odor;
  return LOCALIZED_STATUS_METRICS.odor[key]?.[lang] || level;
}
