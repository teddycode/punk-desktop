const countryDataMap = {
  CN: { countryName: 'China', languageCode: 'zh-CN' },
  TW: { countryName: 'Taiwan', languageCode: 'zh-TW' },
  US: { countryName: 'United States', languageCode: 'en-US' },
  GB: { countryName: 'United Kingdom', languageCode: 'en' },
  AE: { countryName: 'United Arab Emirates', languageCode: 'ar' },
  SA: { countryName: 'Saudi Arabia', languageCode: 'ar' },
  BG: { countryName: 'Bulgaria', languageCode: 'bg' },
  BD: { countryName: 'Bangladesh', languageCode: 'bn' },
  CZ: { countryName: 'Czech Republic', languageCode: 'cs' },
  DE: { countryName: 'Germany', languageCode: 'de' },
  ES: { countryName: 'Spain', languageCode: 'es' },
  IR: { countryName: 'Iran', languageCode: 'fa' },
  FR: { countryName: 'France', languageCode: 'fr' },
  HR: { countryName: 'Croatia', languageCode: 'hr' },
  HU: { countryName: 'Hungary', languageCode: 'hu' },
  IT: { countryName: 'Italy', languageCode: 'it' },
  JP: { countryName: 'Japan', languageCode: 'ja' },
  KR: { countryName: 'South Korea', languageCode: 'ko' },
  LT: { countryName: 'Lithuania', languageCode: 'lt' },
  PL: { countryName: 'Poland', languageCode: 'pl' },
  BR: { countryName: 'Brazil', languageCode: 'pt-PB' },
  PT: { countryName: 'Portugal', languageCode: 'pt-PT' },
  RU: { countryName: 'Russia', languageCode: 'ru' },
  TR: { countryName: 'Turkey', languageCode: 'tr' },
  UA: { countryName: 'Ukraine', languageCode: 'uk' },
  UZ: { countryName: 'Uzbekistan', languageCode: 'uz' },
  VN: { countryName: 'Vietnam', languageCode: 'vi' },
  HK: { countryName: 'HongKong', languageCode: 'zh-TW' },
  SG: { countryName: 'Singapore', languageCode: 'en' },
};

export async function getUserCountryAndLanguage() {
  try {
    // 调用第三方API获取地理位置信息
    const response = await fetch('https://ipinfo.io/json?token=48014d5ea1f7d7');
    const data = await response.json();

    // 获取国家代码
    const countryCode = data.country;
    console.log(`Country Code: ${countryCode}`);

    // 获取国家名称和语言代码
    const { countryName, languageCode } = getCountryNameAndLanguageCode(countryCode);
    console.log(`Country Name: ${countryName}`);
    console.log(`Language Code: ${languageCode}`);

    return {
      countryName: countryName,
      languageCode: languageCode,
    };
  } catch (error) {
    console.error("Error fetching the user's location:", error);
  }
}

function getCountryNameAndLanguageCode(countryCode) {
  return countryDataMap[countryCode] || { countryName: 'Unknown', languageCode: 'en' };
}

// 调用方法并输出结果
getUserCountryAndLanguage().then((result) => {
  console.log(result);
});
