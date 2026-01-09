export type Language = 'zh' | 'ja' | 'en';

export const translations = {
  zh: {
    // App
    appTitle: 'PvP 日历',
    appSubtitle: '在线追踪对战地图轮换情况',
    
    // Tabs
    frontline: '纷争前线',
    frontlineShort: '纷争前线',
    crystallineConflict: '水晶冲突',
    crystallineConflictShort: '水晶冲突',
    
    // Common
    current: '当前',
    currentMap: '当前地图',
    nextRotation: '下次轮换',
    rotationSchedule: '轮换规则',
    calendar: '日历',
    timeline: '时间轴',
    settings: '设置',
    language: '语言',
    theme: '主题',
    timezone: '时区',
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
    hours: '小时',
    minutes: '分钟',
    seconds: '秒',
    day: '日',
    
    // Frontline
    calendarHint: '日期下缀的是当日0:00时所处的地图。悬停在日期上方可以查看当日内的轮换信息。',
    
    // Crystalline Conflict
    ccRotation: '每90分钟轮换',
    nextDay: '次日',
    
    // Map names
    maps: {
      secure: '周边遗迹群（阵地战）',
      seize: '尘封秘岩（争夺战）',
      shatter: '荣誉野（碎冰战）',
      naadam: '昂萨哈凯尔（竞争战）',
      palaistra: '角力学校',
      volcanic: '火山之心',
      castletown: '机关大殿',
      bayside: '海岸斗场',
      cloudnine: '九霄云上',
      redsands: '赤土红沙',
    },
    mapShort: {
      secure: '阵地',
      seize: '尘封',
      shatter: '碎冰',
      naadam: '草原',
      palaistra: '角力',
      volcanic: '火山',
      castletown: '机关',
      bayside: '海岸',
      cloudnine: '九霄',
      redsands: '赤土',
    },
    
    // Weekdays
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  ja: {
    appTitle: 'PvP Calendar',
    appSubtitle: '現在の対戦マップをリアルタイムで確認',
    
    frontline: 'フロントライン',
    frontlineShort: 'FL',
    crystallineConflict: 'クリスタルコンフリクト',
    crystallineConflictShort: 'CC',
    
    current: '現在',
    currentMap: '現在のマップ',
    nextRotation: '次のローテーション',
    rotationSchedule: 'ローテーション規則',
    calendar: 'カレンダー',
    timeline: 'タイムライン',
    settings: '設定',
    language: '言語',
    theme: 'テーマ',
    timezone: 'タイムゾーン',
    light: 'ライト',
    dark: 'ダーク',
    system: 'システム',
    hours: '時間',
    minutes: '分',
    seconds: '秒',
    day: '日',
    
    calendarHint: '日付の後ろに付いているのは当日0時時点のマップです。ホバーで詳細を表示。',
    
    ccRotation: '90分ごとにローテーション',
    nextDay: '翌日',
    
    maps: {
      secure: '外縁遺跡群（制圧戦）',
      seize: 'シールロック（争奪戦）',
      shatter: 'フィールド・オブ・グローリー（砕氷戦）',
      naadam: 'オンサル・ハカイル（終節戦）',
      palaistra: 'パライストラ',
      volcanic: 'ヴォルカニックハート',
      castletown: '東方絡繰御殿',
      bayside: 'ベイサイド・バトルグラウンド',
      cloudnine: 'クラウドナイン',
      redsands: 'レッド・サンズ',
    },
    mapShort: {
      secure: '制圧',
      seize: '争奪',
      shatter: '砕氷',
      naadam: '終節',
      palaistra: 'パラ',
      volcanic: '火山',
      castletown: '御殿',
      bayside: 'ベイ',
      cloudnine: '雲',
      redsands: '砂',
    },
    
    weekdays: ['日', '月', '火', '水', '木', '金', '土'],
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  en: {
    appTitle: 'PvP Calendar',
    appSubtitle: 'Real-time PvP map tracker',
    
    frontline: 'Frontline',
    frontlineShort: 'FL',
    crystallineConflict: 'Crystalline Conflict',
    crystallineConflictShort: 'CC',
    
    current: 'Current',
    currentMap: 'Current Map',
    nextRotation: 'Next Rotation',
    rotationSchedule: 'Rotation Schedule',
    calendar: 'Calendar',
    timeline: 'Timeline',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    timezone: 'Timezone',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    hours: 'h',
    minutes: 'm',
    seconds: 's',
    day: 'Day',
    
    calendarHint: 'The map displayed under the date is the one at 0:00 on that day. Hovering it could show the rotation info.',
    
    ccRotation: 'Rotates every 90 minutes',
    nextDay: 'Next day ',
    
    maps: {
      secure: 'Secure Ruins (Secure)',
      seize: 'Seal Rock (Seize)',
      shatter: 'The Fields of Glory (Shatter)',
      naadam: 'Onsal Hakair (Danshig Naadam)',
      palaistra: 'Palaistra',
      volcanic: 'Volcanic Heart',
      castletown: 'Clockwork Castletown',
      bayside: 'Bayside Battleground',
      cloudnine: 'Cloud Nine',
      redsands: 'Red Sands',
    },
    mapShort: {
      secure: 'Secure',
      seize: 'Seize',
      shatter: 'Shatter',
      naadam: 'Naadam',
      palaistra: 'Palai',
      volcanic: 'Volca',
      castletown: 'Clock',
      bayside: 'Bay',
      cloudnine: 'Cloud',
      redsands: 'Sands',
    },
    
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
} as const;

export type TranslationKey = keyof typeof translations.zh;

export function getTranslation(lang: Language) {
  return translations[lang];
}
