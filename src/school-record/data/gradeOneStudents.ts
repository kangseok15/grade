import { StudentProfile } from "../types";

// 숭신여자고등학교 1학년 학생 목록 (학번 순 정렬: 반 -> 번호)
// 1. 김민송 (1학년 1반 3번) - 1.30등급
// 2. 김봄 (1학년 1반 4번) - 1.48등급
// 3. 우채원 (1학년 2반 10번) - 1.00등급 (전과목 1등급)
// 4. 문지영 (1학년 4반 7번) - 1.30등급
// 5. 이민준 (1학년 4반 14번) - 1.48등급
// 6. 전은설 (1학년 4반 18번) - 1.13등급
// 7. 김도연 (1학년 5반 3번) - 1.00등급 (전과목 1등급)
// 8. 지은서 (1학년 5반 20번) - 1.17등급
// 9. 하윤성 (1학년 5반 21번) - 1.48등급
// 10. 임지호 (1학년 8반 13번) - 1.17등급
// 11. 김민정 (1학년 9반 3번) - 1.17등급
// 12. 양태훈 (1학년 9반 12번) - 1.17등급
// 13. 조하린 (1학년 9반 20번) - 1.35등급
// 14. 배준서 (1학년 10반 9번) - 1.00등급 (전과목 1등급)
// 15. 이하영 (1학년 10반 19번) - 1.17등급

export const GRADE_ONE_STUDENTS: StudentProfile[] = [
  {
    "id": "kim_min_song",
    "name": "김민송",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 1,
    "studentNum": 3,
    "track": "공통계열 (이공·자연)",
    "memo": "수학(96점/1등급), 국어(93점/1등급), 통과(92점/1등급), 영어(92점/1등급), 정보(86점/1등급)",
    "records": [
      {
        "id": "kms-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 92,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "kms-11-2",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 93,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "kms-11-3",
        "semester": "1-1",
        "category": "기술가정/정보",
        "subjectName": "정보",
        "courseType": "일반",
        "units": 3,
        "rawScore": 86,
        "subjectMean": 67.5,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 106,
        "achievementRatios": {
          "A": 16,
          "B": 32.1,
          "C": 20.8,
          "D": 17,
          "E": 14.1
        }
      },
      {
        "id": "kms-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 86,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "kms-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 81,
        "subjectMean": 67.2,
        "achievement": "B",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "kms-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 96,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "kms-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 92,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      }
    ]
  },
  {
    "id": "kim_bom",
    "name": "김봄",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 1,
    "studentNum": 4,
    "track": "공통계열 (인문·사회)",
    "memo": "국어(95점/1등급), 한국사(91점), 통사(90점/1등급), 수학(90점/1등급), 통과(91점)",
    "records": [
      {
        "id": "kb-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 91,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "kb-11-2",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 95,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "kb-11-3",
        "semester": "1-1",
        "category": "기술가정/정보",
        "subjectName": "정보",
        "courseType": "일반",
        "units": 3,
        "rawScore": 85,
        "subjectMean": 67.5,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 106,
        "achievementRatios": {
          "A": 16,
          "B": 32.1,
          "C": 20.8,
          "D": 17,
          "E": 14.1
        }
      },
      {
        "id": "kb-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 90,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "kb-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 91,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "kb-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 90,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "kb-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 87,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      }
    ]
  },
  {
    "id": "woo_chae_won",
    "name": "우채원",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 2,
    "studentNum": 10,
    "track": "공통계열 (최상위권)",
    "memo": "★ 1학년 1학기 전과목 석차 1.00등급 달성! 과학(98), 국어(96), 한국사(97), 영어(96), 수학(92)",
    "records": [
      {
        "id": "wcw-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 98,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "wcw-11-2",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 96,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "wcw-11-3",
        "semester": "1-1",
        "category": "기술가정/정보",
        "subjectName": "정보",
        "courseType": "일반",
        "units": 3,
        "rawScore": 85,
        "subjectMean": 67.5,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 106,
        "achievementRatios": {
          "A": 16,
          "B": 32.1,
          "C": 20.8,
          "D": 17,
          "E": 14.1
        }
      },
      {
        "id": "wcw-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 91,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "wcw-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 97,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "wcw-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 92,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "wcw-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 96,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      }
    ]
  },
  {
    "id": "moon_ji_young",
    "name": "문지영",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 4,
    "studentNum": 7,
    "track": "공통계열 (이공·융합)",
    "memo": "통과(95점), 국어(94점), 통사(94점), 정보(93점), 수학(88점) 등 5과목 1등급의 우수한 성취",
    "records": [
      {
        "id": "mjy-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 95,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "mjy-11-2",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "mjy-11-3",
        "semester": "1-1",
        "category": "기술가정/정보",
        "subjectName": "정보",
        "courseType": "일반",
        "units": 3,
        "rawScore": 93,
        "subjectMean": 67.5,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 106,
        "achievementRatios": {
          "A": 16,
          "B": 32.1,
          "C": 20.8,
          "D": 17,
          "E": 14.1
        }
      },
      {
        "id": "mjy-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "mjy-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 88,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "mjy-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 88,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "mjy-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 86,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      }
    ]
  },
  {
    "id": "lee_min_jun",
    "name": "이민준",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 4,
    "studentNum": 14,
    "track": "공통계열 (이공·SW)",
    "memo": "수학(98점/1등급), 영어(95점/1등급), 정보(89점/1등급), 통사(89점/1등급)",
    "records": [
      {
        "id": "lmj-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 92,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "lmj-11-2",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 92,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "lmj-11-3",
        "semester": "1-1",
        "category": "기술가정/정보",
        "subjectName": "정보",
        "courseType": "일반",
        "units": 3,
        "rawScore": 89,
        "subjectMean": 67.5,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 106,
        "achievementRatios": {
          "A": 16,
          "B": 32.1,
          "C": 20.8,
          "D": 17,
          "E": 14.1
        }
      },
      {
        "id": "lmj-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 89,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "lmj-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 92,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "lmj-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 98,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "lmj-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 95,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      }
    ]
  },
  {
    "id": "jeon_eun_seol",
    "name": "전은설",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 4,
    "studentNum": 18,
    "track": "공통계열 (인문·어문)",
    "memo": "영어(100점) 만점 1등급, 국어(99점) 1등급, 통과(97점) 1등급 등 극상위권 성적 유지",
    "records": [
      {
        "id": "jes-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 97,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "jes-11-2",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 99,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "jes-11-3",
        "semester": "1-1",
        "category": "기술가정/정보",
        "subjectName": "정보",
        "courseType": "일반",
        "units": 3,
        "rawScore": 83,
        "subjectMean": 67.5,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 106,
        "achievementRatios": {
          "A": 16,
          "B": 32.1,
          "C": 20.8,
          "D": 17,
          "E": 14.1
        }
      },
      {
        "id": "jes-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 95,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "jes-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 90,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "jes-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 86,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "jes-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 100,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      }
    ]
  },
  {
    "id": "kim_do_yeon",
    "name": "김도연",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 5,
    "studentNum": 3,
    "track": "공통계열 (최상위권)",
    "memo": "★ 1학년 1학기 이수 전과목(정보 포함) 1등급! 영어(99), 정보(98), 한국사(98), 수학(97), 국어(97)",
    "records": [
      {
        "id": "kdy-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "kdy-11-2",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 97,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "kdy-11-3",
        "semester": "1-1",
        "category": "기술가정/정보",
        "subjectName": "정보",
        "courseType": "일반",
        "units": 3,
        "rawScore": 98,
        "subjectMean": 67.5,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 106,
        "achievementRatios": {
          "A": 16,
          "B": 32.1,
          "C": 20.8,
          "D": 17,
          "E": 14.1
        }
      },
      {
        "id": "kdy-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 96,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "kdy-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 98,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "kdy-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 97,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "kdy-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 99,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      }
    ]
  },
  {
    "id": "ji_eun_seo",
    "name": "지은서",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 5,
    "studentNum": 20,
    "track": "공통계열 (상경·사회과학)",
    "memo": "영어(96), 통사(94), 통과(94), 한국사(93), 국어(93), 정보(92) 등 주요과목 1등급 유지",
    "records": [
      {
        "id": "jes2-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "jes2-11-2",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 93,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "jes2-11-3",
        "semester": "1-1",
        "category": "기술가정/정보",
        "subjectName": "정보",
        "courseType": "일반",
        "units": 3,
        "rawScore": 92,
        "subjectMean": 67.5,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 106,
        "achievementRatios": {
          "A": 16,
          "B": 32.1,
          "C": 20.8,
          "D": 17,
          "E": 14.1
        }
      },
      {
        "id": "jes2-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "jes2-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 93,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "jes2-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 83,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "jes2-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 96,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      }
    ]
  },
  {
    "id": "ha_yoon_sung",
    "name": "하윤성",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 5,
    "studentNum": 21,
    "track": "공통계열 (자연·사회융합)",
    "memo": "국어(93점/1등급), 수학(91점/1등급), 통사(89점/1등급), 영어(88점), 통과(85점)",
    "records": [
      {
        "id": "hys-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 85,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "hys-11-2",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 93,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "hys-11-3",
        "semester": "1-1",
        "category": "기술가정/정보",
        "subjectName": "정보",
        "courseType": "일반",
        "units": 3,
        "rawScore": 80,
        "subjectMean": 67.5,
        "achievement": "B",
        "rankGrade5": 2,
        "studentCount": 106,
        "achievementRatios": {
          "A": 16,
          "B": 32.1,
          "C": 20.8,
          "D": 17,
          "E": 14.1
        }
      },
      {
        "id": "hys-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 89,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "hys-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 83,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "hys-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 91,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "hys-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 88,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      }
    ]
  },
  {
    "id": "lim_ji_ho",
    "name": "임지호",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 8,
    "studentNum": 13,
    "track": "공통계열 (이공·수학우수)",
    "memo": "통과(94/1등급), 영어(94/1등급), 수학(93/1등급), 한국사(93/1등급), 통사(90/1등급), 국어(91/2등급)",
    "records": [
      {
        "id": "ljh-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "과학탐구실험1",
        "courseType": "공통",
        "units": 1,
        "rawScore": 96,
        "subjectMean": 85,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "ljh-11-2",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "ljh-11-3",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 91,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "ljh-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 90,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "ljh-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 93,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "ljh-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 93,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "ljh-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      },
      {
        "id": "ljh-11-8",
        "semester": "1-1",
        "category": "예술",
        "subjectName": "미술",
        "courseType": "예체",
        "units": 3,
        "rawScore": 92,
        "subjectMean": 88,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "ljh-11-9",
        "semester": "1-1",
        "category": "체육",
        "subjectName": "체육1",
        "courseType": "예체",
        "units": 2,
        "rawScore": 94,
        "subjectMean": 87,
        "achievement": "A",
        "studentCount": 211
      }
    ]
  },
  {
    "id": "kim_min_jeong",
    "name": "김민정",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 9,
    "studentNum": 3,
    "track": "공통계열 (인문·어문우수)",
    "memo": "한국사(99/1등급), 국어(99/1등급), 통과(96/1등급), 영어(94/1등급), 통사(89/1등급), 수학(82/2등급)",
    "records": [
      {
        "id": "kmj-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "과학탐구실험1",
        "courseType": "공통",
        "units": 1,
        "rawScore": 97,
        "subjectMean": 85,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "kmj-11-2",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 96,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "kmj-11-3",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 99,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "kmj-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 89,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "kmj-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 99,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "kmj-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 82,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "kmj-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      },
      {
        "id": "kmj-11-8",
        "semester": "1-1",
        "category": "예술",
        "subjectName": "미술",
        "courseType": "예체",
        "units": 3,
        "rawScore": 94,
        "subjectMean": 88,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "kmj-11-9",
        "semester": "1-1",
        "category": "체육",
        "subjectName": "체육1",
        "courseType": "예체",
        "units": 2,
        "rawScore": 93,
        "subjectMean": 87,
        "achievement": "A",
        "studentCount": 211
      }
    ]
  },
  {
    "id": "yang_tae_hoon",
    "name": "양태훈",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 9,
    "studentNum": 12,
    "track": "공통계열 (이공·수학영재)",
    "memo": "영어(98/1등급), 수학(96/1등급), 통과(94/1등급), 한국사(94/1등급), 국어(93/1등급), 통사(87/2등급)",
    "records": [
      {
        "id": "yth-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "과학탐구실험1",
        "courseType": "공통",
        "units": 1,
        "rawScore": 97,
        "subjectMean": 85,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "yth-11-2",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "yth-11-3",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 93,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "yth-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 87,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "yth-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 94,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "yth-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 96,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "yth-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 98,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      },
      {
        "id": "yth-11-8",
        "semester": "1-1",
        "category": "예술",
        "subjectName": "미술",
        "courseType": "예체",
        "units": 3,
        "rawScore": 93,
        "subjectMean": 88,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "yth-11-9",
        "semester": "1-1",
        "category": "체육",
        "subjectName": "체육1",
        "courseType": "예체",
        "units": 2,
        "rawScore": 94,
        "subjectMean": 87,
        "achievement": "A",
        "studentCount": 211
      }
    ]
  },
  {
    "id": "jo_ha_rin",
    "name": "조하린",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 9,
    "studentNum": 20,
    "track": "공통계열 (인문·사회과학)",
    "memo": "한국사(94/1등급), 통사(94/1등급), 통과(93/1등급), 국어(92/1등급), 영어(87/2등급), 수학(82/2등급)",
    "records": [
      {
        "id": "jhr-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "과학탐구실험1",
        "courseType": "공통",
        "units": 1,
        "rawScore": 96,
        "subjectMean": 85,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "jhr-11-2",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 93,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "jhr-11-3",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 92,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "jhr-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "jhr-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 94,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "jhr-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 82,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "jhr-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 87,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      },
      {
        "id": "jhr-11-8",
        "semester": "1-1",
        "category": "예술",
        "subjectName": "미술",
        "courseType": "예체",
        "units": 3,
        "rawScore": 93,
        "subjectMean": 88,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "jhr-11-9",
        "semester": "1-1",
        "category": "체육",
        "subjectName": "체육1",
        "courseType": "예체",
        "units": 2,
        "rawScore": 92,
        "subjectMean": 87,
        "achievement": "A",
        "studentCount": 211
      }
    ]
  },
  {
    "id": "bae_jun_seo",
    "name": "배준서",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 10,
    "studentNum": 9,
    "track": "공통계열 (최상위권)",
    "memo": "★ 1학년 1학기 전과목 석차 1.00등급! 통합과학1 100점 만점, 한국사 98점, 국어 97점, 수학 96점, 영어 93점, 통합사회 92점",
    "records": [
      {
        "id": "bjs-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "과학탐구실험1",
        "courseType": "공통",
        "units": 1,
        "rawScore": 100,
        "subjectMean": 85,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "bjs-11-2",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 100,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "bjs-11-3",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 97,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "bjs-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 92,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "bjs-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 98,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "bjs-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 96,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "bjs-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 93,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      },
      {
        "id": "bjs-11-8",
        "semester": "1-1",
        "category": "예술",
        "subjectName": "미술",
        "courseType": "예체",
        "units": 3,
        "rawScore": 95,
        "subjectMean": 88,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "bjs-11-9",
        "semester": "1-1",
        "category": "체육",
        "subjectName": "체육1",
        "courseType": "예체",
        "units": 2,
        "rawScore": 94,
        "subjectMean": 87,
        "achievement": "A",
        "studentCount": 211
      }
    ]
  },
  {
    "id": "lee_ha_young",
    "name": "이하영",
    "school": "숭신여자고등학교",
    "grade": 1,
    "classNum": 10,
    "studentNum": 19,
    "track": "공통계열 (인문·자연융합)",
    "memo": "한국사(95/1등급), 국어(94/1등급), 통과(93/1등급), 통사(91/1등급), 영어(89/1등급), 수학(82/2등급)",
    "records": [
      {
        "id": "lhy-11-1",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "과학탐구실험1",
        "courseType": "공통",
        "units": 1,
        "rawScore": 95,
        "subjectMean": 85,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "lhy-11-2",
        "semester": "1-1",
        "category": "과학",
        "subjectName": "통합과학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 93,
        "subjectMean": 67.7,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 22.3,
          "B": 18.5,
          "C": 40.3,
          "D": 15.2,
          "E": 3.7
        }
      },
      {
        "id": "lhy-11-3",
        "semester": "1-1",
        "category": "국어",
        "subjectName": "공통국어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 94,
        "subjectMean": 73.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 51.2,
          "B": 26.5,
          "C": 13.7,
          "D": 6.2,
          "E": 2.4
        }
      },
      {
        "id": "lhy-11-4",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "통합사회1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 91,
        "subjectMean": 74.1,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 35.1,
          "B": 34.1,
          "C": 21.8,
          "D": 6.2,
          "E": 2.8
        }
      },
      {
        "id": "lhy-11-5",
        "semester": "1-1",
        "category": "사회",
        "subjectName": "한국사1",
        "courseType": "공통",
        "units": 3,
        "rawScore": 95,
        "subjectMean": 67.2,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 24.6,
          "B": 20.9,
          "C": 41.2,
          "D": 11.8,
          "E": 1.4
        }
      },
      {
        "id": "lhy-11-6",
        "semester": "1-1",
        "category": "수학",
        "subjectName": "공통수학1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 82,
        "subjectMean": 65.3,
        "achievement": "A",
        "rankGrade5": 2,
        "studentCount": 211,
        "achievementRatios": {
          "A": 21.3,
          "B": 36,
          "C": 22.7,
          "D": 14.2,
          "E": 5.7
        }
      },
      {
        "id": "lhy-11-7",
        "semester": "1-1",
        "category": "영어",
        "subjectName": "공통영어1",
        "courseType": "공통",
        "units": 4,
        "rawScore": 89,
        "subjectMean": 71,
        "achievement": "A",
        "rankGrade5": 1,
        "studentCount": 211,
        "achievementRatios": {
          "A": 23.2,
          "B": 37,
          "C": 31.8,
          "D": 8.1,
          "E": 0
        }
      },
      {
        "id": "lhy-11-8",
        "semester": "1-1",
        "category": "예술",
        "subjectName": "미술",
        "courseType": "예체",
        "units": 3,
        "rawScore": 93,
        "subjectMean": 88,
        "achievement": "A",
        "studentCount": 211
      },
      {
        "id": "lhy-11-9",
        "semester": "1-1",
        "category": "체육",
        "subjectName": "체육1",
        "courseType": "예체",
        "units": 2,
        "rawScore": 92,
        "subjectMean": 87,
        "achievement": "A",
        "studentCount": 211
      }
    ]
  }
];
