// 대표님, 앱에서 사용하는 데이터의 '설계도(타입)'입니다.
// 이 설계도 덕분에 오타를 방지하고 안전하게 코딩할 수 있습니다.

export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Person {
  id?: string;          // Firestore 문서 ID
  userId: string;       // 작성자(로그인 사용자) ID
  name: string;         // 지인 이름
  relationship: string; // 관계 (가족, 친구, 직장 등)
  createdAt: any;       // 생성일
}

export type EventType = "결혼" | "장례" | "돌잔치" | "기타";
export type EventDirection = "give" | "receive";

export interface EventRecord {
  id?: string;          // Firestore 문서 ID
  userId: string;       // 작성자 ID
  personId: string;     // 대상 지인 ID
  type: EventType;      // 이벤트 종류
  amount: number;       // 금액
  direction: EventDirection; // 낸 금액(give) / 받은 금액(receive)
  date: string;         // 이벤트 날짜 (YYYY-MM-DD)
  memo?: string;        // 메모 (선택사항)
  createdAt: any;       // 생성일
}

// 화면 표시용 지인 요약 정보
export interface PersonSummary extends Person {
  totalGiven: number;   // 내가 준 총 금액
  totalReceived: number; // 내가 받은 총 금액
}
