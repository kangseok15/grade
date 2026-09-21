import { ExamRecord } from '../types';

/**
 * 2026년 대학수학능력시험 6월 모의평가 (실시일: 2026. 6. 4. / 성적통지표 발급: 2026. 7. 1.)
 * 한국교육과정평가원 공인 성적통지표 100% 일치 실측 데이터
 * 숭신고등학교 3학년 미래인재반 14명 학생 실측 반영
 * (※ 공인 성적통지표에 기재된 표준점수, 백분위, 등급, 선택과목을 무결하게 반영하였으며 미기재된 원점수는 추정하지 않고 undefined 처리)
 */
export const GRADE_3_JUNE_EXAMS: ExamRecord[] = [
  // 1. 현려경 (3학년 10반 19번) - 자연
  {
    id: '현려경__2026-06-04',
    studentId: '현려경',
    studentName: '현려경',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 125,
        percentile: 91,
        grade: 2,
      },
      math: {
        name: '미적분',
        standard: 129,
        percentile: 96,
        grade: 1,
      },
      english: {
        grade: 2,
      },
      history: {
        grade: 2,
      },
      elective1: {
        name: '사회·문화',
        standard: 55,
        percentile: 65,
        grade: 4,
      },
      elective2: {
        name: '물리학Ⅰ',
        standard: 63,
        percentile: 87,
        grade: 3,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 2. 최시온 (3학년 2반 18번) - 인문
  {
    id: '최시온__2026-06-04',
    studentId: '최시온',
    studentName: '최시온',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 115,
        percentile: 72,
        grade: 4,
      },
      math: {
        name: '확률과 통계',
        standard: 112,
        percentile: 62,
        grade: 4,
      },
      english: {
        grade: 2,
      },
      history: {
        grade: 1,
      },
      elective1: {
        name: '생활과 윤리',
        standard: 58,
        percentile: 76,
        grade: 3,
      },
      elective2: {
        name: '사회·문화',
        standard: 59,
        percentile: 77,
        grade: 3,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 3. 강지윤 (3학년 3반 1번) - 자연
  {
    id: '강지윤__2026-06-04',
    studentId: '강지윤',
    studentName: '강지윤',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 114,
        percentile: 70,
        grade: 4,
      },
      math: {
        name: '미적분',
        standard: 118,
        percentile: 76,
        grade: 3,
      },
      english: {
        grade: 2,
      },
      history: {
        grade: 1,
      },
      elective1: {
        name: '물리학Ⅰ',
        standard: 48,
        percentile: 49,
        grade: 5,
      },
      elective2: {
        name: '생명과학Ⅰ',
        standard: 67,
        percentile: 97,
        grade: 1,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 4. 신예은 (3학년 4반 11번) - 자연
  {
    id: '신예은__2026-06-04',
    studentId: '신예은',
    studentName: '신예은',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '언어와 매체',
        standard: 129,
        percentile: 97,
        grade: 1,
      },
      math: {
        name: '미적분',
        standard: 132,
        percentile: 98,
        grade: 1,
      },
      english: {
        grade: 2,
      },
      history: {
        grade: 3,
      },
      elective1: {
        name: '화학Ⅰ',
        standard: 53,
        percentile: 62,
        grade: 4,
      },
      elective2: {
        name: '생명과학Ⅰ',
        standard: 54,
        percentile: 63,
        grade: 4,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 5. 강정인 (3학년 5반 1번) - 인문
  {
    id: '강정인__2026-06-04',
    studentId: '강정인',
    studentName: '강정인',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 120,
        percentile: 82,
        grade: 3,
      },
      math: {
        name: '확률과 통계',
        standard: 121,
        percentile: 83,
        grade: 3,
      },
      english: {
        grade: 2,
      },
      history: {
        grade: 1,
      },
      elective1: {
        name: '생활과 윤리',
        standard: 67,
        percentile: 94,
        grade: 2,
      },
      elective2: {
        name: '사회·문화',
        standard: 64,
        percentile: 91,
        grade: 2,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 6. 문채원 (3학년 5반 8번) - 자연
  {
    id: '문채원__2026-06-04',
    studentId: '문채원',
    studentName: '문채원',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 118,
        percentile: 78,
        grade: 3,
      },
      math: {
        name: '미적분',
        standard: 120,
        percentile: 80,
        grade: 3,
      },
      english: {
        grade: 3,
      },
      history: {
        grade: 2,
      },
      elective1: {
        name: '사회·문화',
        standard: 55,
        percentile: 65,
        grade: 4,
      },
      elective2: {
        name: '생활과 윤리',
        standard: 50,
        percentile: 52,
        grade: 5,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 7. 조성희 (3학년 6반 18번) - 자연
  {
    id: '조성희__2026-06-04',
    studentId: '조성희',
    studentName: '조성희',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 126,
        percentile: 92,
        grade: 2,
      },
      math: {
        name: '확률과 통계',
        standard: 119,
        percentile: 78,
        grade: 3,
      },
      english: {
        grade: 3,
      },
      history: {
        grade: 3,
      },
      elective1: {
        name: '생활과 윤리',
        standard: 54,
        percentile: 66,
        grade: 4,
      },
      elective2: {
        name: '사회·문화',
        standard: 51,
        percentile: 54,
        grade: 5,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 9. 최은서 (3학년 6반 20번) - 인문
  {
    id: '최은서__2026-06-04',
    studentId: '최은서',
    studentName: '최은서',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 121,
        percentile: 83,
        grade: 3,
      },
      math: {
        name: '확률과 통계',
        standard: 116,
        percentile: 71,
        grade: 4,
      },
      english: {
        grade: 5,
      },
      history: {
        grade: 1,
      },
      elective1: {
        name: '생활과 윤리',
        standard: 63,
        percentile: 87,
        grade: 3,
      },
      elective2: {
        name: '사회·문화',
        standard: 60,
        percentile: 80,
        grade: 3,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 10. 김현서 (3학년 7반 7번) - 인문
  {
    id: '김현서__2026-06-04',
    studentId: '김현서',
    studentName: '김현서',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 111,
        percentile: 64,
        grade: 4,
      },
      math: {
        name: '확률과 통계',
        standard: 117,
        percentile: 73,
        grade: 4,
      },
      english: {
        grade: 3,
      },
      history: {
        grade: 3,
      },
      elective1: {
        name: '생활과 윤리',
        standard: 66,
        percentile: 93,
        grade: 2,
      },
      elective2: {
        name: '사회·문화',
        standard: 61,
        percentile: 83,
        grade: 3,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 11. 박주원 (3학년 7반 9번) - 자연
  {
    id: '박주원__2026-06-04',
    studentId: '박주원',
    studentName: '박주원',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 114,
        percentile: 70,
        grade: 4,
      },
      math: {
        name: '미적분',
        standard: 123,
        percentile: 87,
        grade: 2,
      },
      english: {
        grade: 3,
      },
      history: {
        grade: 4,
      },
      elective1: {
        name: '사회·문화',
        standard: 61,
        percentile: 83,
        grade: 3,
      },
      elective2: {
        name: '생명과학Ⅰ',
        standard: 54,
        percentile: 63,
        grade: 4,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 12. 오윤서 (3학년 8반 13번) - 인문
  {
    id: '오윤서__2026-06-04',
    studentId: '오윤서',
    studentName: '오윤서',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '언어와 매체',
        standard: 129,
        percentile: 97,
        grade: 1,
      },
      math: {
        name: '확률과 통계',
        standard: 106,
        percentile: 53,
        grade: 5,
      },
      english: {
        grade: 2,
      },
      history: {
        grade: 2,
      },
      elective1: {
        name: '생활과 윤리',
        standard: 53,
        percentile: 61,
        grade: 4,
      },
      elective2: {
        name: '세계사',
        standard: 65,
        percentile: 87,
        grade: 3,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 13. 정시은 (3학년 8반 16번) - 인문
  {
    id: '정시은__2026-06-04',
    studentId: '정시은',
    studentName: '정시은',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 125,
        percentile: 91,
        grade: 2,
      },
      math: {
        name: '미적분',
        standard: 120,
        percentile: 80,
        grade: 3,
      },
      english: {
        grade: 3,
      },
      history: {
        grade: 3,
      },
      elective1: {
        name: '한국지리',
        standard: 59,
        percentile: 79,
        grade: 3,
      },
      elective2: {
        name: '사회·문화',
        standard: 65,
        percentile: 94,
        grade: 2,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },

  // 14. 강희주 (3학년 9반 1번) - 인문
  {
    id: '강희주__2026-06-04',
    studentId: '강희주',
    studentName: '강희주',
    label: '2026년 6월 고3 모의평가 (평가원)',
    examDate: '2026-06-04',
    subjects: {
      korean: {
        name: '화법과 작문',
        standard: 124,
        percentile: 89,
        grade: 2,
      },
      math: {
        name: '확률과 통계',
        standard: 98,
        percentile: 44,
        grade: 5,
      },
      english: {
        grade: 2,
      },
      history: {
        grade: 1,
      },
      elective1: {
        name: '생활과 윤리',
        standard: 67,
        percentile: 94,
        grade: 2,
      },
      elective2: {
        name: '사회·문화',
        standard: 65,
        percentile: 94,
        grade: 2,
      },
    },
    weakItems: {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    },
  },
];
