const THEMES_BY_NAME = {
  'Bronze Gift Card': {
    gradient: 'linear-gradient(135deg, #b87333 0%, #8b5a2b 45%, #6b3e1f 100%)',
    accent: '#f5d0a8',
    chip: '#d4a574',
    label: 'Bronze',
  },
  'Silver Gift Card': {
    gradient: 'linear-gradient(135deg, #e8e8e8 0%, #a8b0b8 50%, #6b7280 100%)',
    accent: '#f8fafc',
    chip: '#cbd5e1',
    label: 'Silver',
  },
  'Gold Gift Card': {
    gradient: 'linear-gradient(135deg, #fde68a 0%, #d4af37 40%, #b8860b 100%)',
    accent: '#fffbeb',
    chip: '#fbbf24',
    label: 'Gold',
  },
  'Premium Discount': {
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #5b21b6 100%)',
    accent: '#ede9fe',
    chip: '#c4b5fd',
    label: 'Discount',
  },
  'VIP Membership': {
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #0f172a 100%)',
    accent: '#fde68a',
    chip: '#d4af37',
    label: 'VIP',
  },
  'Platinum Reward': {
    gradient: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 45%, #475569 100%)',
    accent: '#f8fafc',
    chip: '#e2e8f0',
    label: 'Platinum',
  },
};

const KEYWORD_THEMES = [
  { keywords: ['bronze'], theme: THEMES_BY_NAME['Bronze Gift Card'] },
  { keywords: ['silver'], theme: THEMES_BY_NAME['Silver Gift Card'] },
  { keywords: ['gold'], theme: THEMES_BY_NAME['Gold Gift Card'] },
  { keywords: ['platinum'], theme: THEMES_BY_NAME['Platinum Reward'] },
  { keywords: ['discount', 'off', '%', 'coupon'], theme: THEMES_BY_NAME['Premium Discount'] },
  { keywords: ['vip', 'membership', 'lounge', 'exclusive'], theme: THEMES_BY_NAME['VIP Membership'] },
  { keywords: ['gift', 'card', 'amazon', 'voucher'], theme: THEMES_BY_NAME['Bronze Gift Card'] },
  { keywords: ['credit', 'cash', 'store', 'wallet'], theme: THEMES_BY_NAME['Platinum Reward'] },
];

const DEFAULT_THEME = {
  gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)',
  accent: '#fff7ed',
  chip: '#fdba74',
  label: 'Reward',
};

export function getRewardCardTheme(reward) {
  if (!reward) return DEFAULT_THEME;

  const byName = THEMES_BY_NAME[reward.name];
  if (byName) return byName;

  const haystack = `${reward.name || ''} ${reward.description || ''}`.toLowerCase();
  const match = KEYWORD_THEMES.find(({ keywords }) =>
    keywords.some((kw) => haystack.includes(kw))
  );
  return match?.theme ?? DEFAULT_THEME;
}
