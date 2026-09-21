export interface AdmissionTier {
  id: string;
  minSum: number;
  maxSum: number;
  minAvg: number;
  maxAvg: number;
  rangeText: string;
  avgText: string;
  line: string;
  tierName: string;
  notes?: string;
}

export const HUMANITIES_TIERS: AdmissionTier[] = [
  {
    id: 'h1',
    minSum: 285,
    maxSum: 300,
    minAvg: 95.0,
    maxAvg: 100,
    rangeText: '285점 이상',
    avgText: '95.0% 이상',
    tierName: '최상위권',
    line: '서울대, 연세대, 고려대 상위권 학과',
  },
  {
    id: 'h2',
    minSum: 276,
    maxSum: 284.99,
    minAvg: 92.0,
    maxAvg: 94.7,
    rangeText: '276 ~ 284점',
    avgText: '92.0 ~ 94.7%',
    tierName: '상위 1그룹',
    line: '서강대, 성균관대, 한양대, 중앙대 상위',
  },
  {
    id: 'h3',
    minSum: 267,
    maxSum: 275.99,
    minAvg: 89.0,
    maxAvg: 91.7,
    rangeText: '267 ~ 275점',
    avgText: '89.0 ~ 91.7%',
    tierName: '상위 2그룹',
    line: '중앙대, 경희대, 한국외대, 서울시립대, 이화여대',
  },
  {
    id: 'h4',
    minSum: 255,
    maxSum: 266.99,
    minAvg: 85.0,
    maxAvg: 88.7,
    rangeText: '255 ~ 266점',
    avgText: '85.0 ~ 88.7%',
    tierName: '중상위 1그룹',
    line: '건국대, 동국대, 홍익대, 숙명여대, 국민대 상위',
  },
  {
    id: 'h5',
    minSum: 240,
    maxSum: 254.99,
    minAvg: 80.0,
    maxAvg: 84.7,
    rangeText: '240 ~ 254점',
    avgText: '80.0 ~ 84.7%',
    tierName: '중상위 2그룹',
    line: '숭실대, 세종대, 단국대(죽전), 광운대, 서울과기대',
  },
  {
    id: 'h6',
    minSum: 225,
    maxSum: 239.99,
    minAvg: 75.0,
    maxAvg: 79.7,
    rangeText: '225 ~ 239점',
    avgText: '75.0 ~ 79.7%',
    tierName: '중위 1그룹',
    line: '명지대, 상명대, 가톨릭대, 가천대, 경기대, 인천대',
  },
  {
    id: 'h7',
    minSum: 204,
    maxSum: 224.99,
    minAvg: 68.0,
    maxAvg: 74.7,
    rangeText: '204 ~ 224점',
    avgText: '68.0 ~ 74.7%',
    tierName: '수도권·지거국',
    line: '수도권 중하위(한성대·서경대·삼육대·수원대) 및 지거국',
  },
  {
    id: 'h8',
    minSum: 180,
    maxSum: 203.99,
    minAvg: 60.0,
    maxAvg: 67.7,
    rangeText: '180 ~ 203점',
    avgText: '60.0 ~ 67.7%',
    tierName: '경기외곽·지방선',
    line: '경기 외곽권(대진대·평택대·신한대) 및 지방 거점 하위선',
  },
  {
    id: 'h9',
    minSum: 0,
    maxSum: 179.99,
    minAvg: 0,
    maxAvg: 59.9,
    rangeText: '180점 미만',
    avgText: '60.0% 미만',
    tierName: '기타 4년제',
    line: '수도권 외곽 및 지방 사립 4년제 일반학과 라인',
  },
];

export const NATURAL_TIERS: AdmissionTier[] = [
  {
    id: 'n1',
    minSum: 282,
    maxSum: 300,
    minAvg: 94.0,
    maxAvg: 100,
    rangeText: '282점 이상',
    avgText: '94.0% 이상',
    tierName: '최상위권',
    line: '서울대, 연세대, 고려대 주요 공과/이과대학',
    notes: '의약학계열(의·치·한·약·수)은 백분위 합 290~298점 선에서 형성',
  },
  {
    id: 'n2',
    minSum: 274,
    maxSum: 281.99,
    minAvg: 91.3,
    maxAvg: 93.7,
    rangeText: '274 ~ 281점',
    avgText: '91.3 ~ 93.7%',
    tierName: '상위 1그룹',
    line: '서강대, 성균관대, 한양대',
  },
  {
    id: 'n3',
    minSum: 265,
    maxSum: 273.99,
    minAvg: 88.3,
    maxAvg: 91.0,
    rangeText: '265 ~ 273점',
    avgText: '88.3 ~ 91.0%',
    tierName: '상위 2그룹',
    line: '중앙대, 경희대(국제 포함), 서울시립대, 이화여대',
  },
  {
    id: 'n4',
    minSum: 252,
    maxSum: 264.99,
    minAvg: 84.0,
    maxAvg: 88.0,
    rangeText: '252 ~ 264점',
    avgText: '84.0 ~ 88.0%',
    tierName: '중상위 1그룹',
    line: '건국대, 동국대, 홍익대, 서울과기대, 아주대·인하대 주요공대',
  },
  {
    id: 'n5',
    minSum: 237,
    maxSum: 251.99,
    minAvg: 79.0,
    maxAvg: 83.7,
    rangeText: '237 ~ 251점',
    avgText: '79.0 ~ 83.7%',
    tierName: '중상위 2그룹',
    line: '국민대, 숭실대, 세종대, 단국대(죽전), 항공대',
  },
  {
    id: 'n6',
    minSum: 219,
    maxSum: 236.99,
    minAvg: 73.0,
    maxAvg: 78.7,
    rangeText: '219 ~ 236점',
    avgText: '73.0 ~ 78.7%',
    tierName: '중위 1그룹',
    line: '광운대, 가천대, 명지대, 상명대, 경기대, 인천대, 충남·충북대',
  },
  {
    id: 'n7',
    minSum: 198,
    maxSum: 218.99,
    minAvg: 66.0,
    maxAvg: 72.7,
    rangeText: '198 ~ 218점',
    avgText: '66.0 ~ 72.7%',
    tierName: '수도권·지거국',
    line: '가톨릭대, 삼육대, 서경대, 수원대, 한국공학대, 지거국',
  },
  {
    id: 'n8',
    minSum: 174,
    maxSum: 197.99,
    minAvg: 58.0,
    maxAvg: 65.7,
    rangeText: '174 ~ 197점',
    avgText: '58.0 ~ 65.7%',
    tierName: '경기외곽·충청선',
    line: '수도권 외곽(안양대·대진대 등) 및 충청권 4년제 사립대',
  },
  {
    id: 'n9',
    minSum: 0,
    maxSum: 173.99,
    minAvg: 0,
    maxAvg: 57.9,
    rangeText: '174점 미만',
    avgText: '58.0% 미만',
    tierName: '기타 4년제',
    line: '수도권 외곽 및 지방 사립 4년제 일반학과 라인',
  },
];

export function getAdmissionTier(
  sum300: number,
  track: 'humanities' | 'natural'
): AdmissionTier {
  const tiers = track === 'humanities' ? HUMANITIES_TIERS : NATURAL_TIERS;
  for (const tier of tiers) {
    if (sum300 >= tier.minSum) {
      return tier;
    }
  }
  return tiers[tiers.length - 1];
}
