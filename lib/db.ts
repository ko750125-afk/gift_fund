import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  getDocs,
  writeBatch,
  doc,
  updateDoc,
  deleteDoc,
  limit
} from "firebase/firestore";
import { db } from "./firebase";
import { Person, EventRecord, EventType, EventDirection, ChatMessage } from "@/types";

// --- 1. 지인(Person) 관련 로직 ---

// 지인 추가
export const addPerson = async (userId: string, name: string, relationship: string) => {
  try {
    const docRef = await addDoc(collection(db, "people"), {
      userId,
      name,
      relationship,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("지인 추가 중 에러:", error);
    throw error;
  }
};

// 이름(관계) 문자열을 받아서 지인을 찾거나 생성하는 헬퍼
export const getOrCreatePerson = async (userId: string, combinedString: string) => {
  const name = combinedString.trim();
  const relationship = "지인"; // 사용자가 원하시면 빈 값으로 두어도 되지만 관리 편의상 '지인'으로 설정합니다.

  // 먼저 해당 이름(관계포함)을 가진 지인이 있는지 검색
  const q = query(
    collection(db, "people"),
    where("userId", "==", userId),
    where("name", "==", name)
  );
  
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].id;
  }

  // 없으면 새로 생성
  return await addPerson(userId, name, relationship);
};

// 지인 목록 실시간 조회 (사용자별)
export const subscribePeople = (userId: string, callback: (people: Person[]) => void) => {
  const q = query(
    collection(db, "people"),
    where("userId", "==", userId),
    orderBy("name", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const people = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Person[];
    callback(people);
  });
};


// --- 2. 경조사(Event) 관련 로직 ---

// 경조사 기록 추가
export const addEvent = async (event: Omit<EventRecord, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      ...event,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("경조사 기록 추가 중 에러:", error);
    throw error;
  }
};

// 최근 경조사 기록 실시간 조회 (정렬 옵션 포함)
export const subscribeEvents = (
  userId: string, 
  sortBy: "date" | "amount" = "date",
  callback: (events: EventRecord[]) => void
) => {
  const q = query(
    collection(db, "events"),
    where("userId", "==", userId),
    orderBy(sortBy, "desc"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventRecord[];
    callback(events);
  });
};

// 특정 지인의 경조사 기록 실시간 조회 (정렬 옵션 포함)
export const subscribePersonEvents = (
  personId: string,
  sortBy: "date" | "amount" = "date",
  callback: (events: EventRecord[]) => void
) => {
  const q = query(
    collection(db, "events"),
    where("personId", "==", personId),
    orderBy(sortBy, "desc"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventRecord[];
    callback(events);
  });
};

// 경조사 기록 수정
export const updateEvent = async (eventId: string, data: Partial<EventRecord>) => {
  try {
    const docRef = doc(db, "events", eventId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("경조사 기록 수정 중 에러:", error);
    throw error;
  }
};

// 경조사 기록 삭제
export const deleteEvent = async (eventId: string) => {
  try {
    const docRef = doc(db, "events", eventId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("경조사 기록 삭제 중 에러:", error);
    throw error;
  }
};


// --- 3. 대량 처리 관련 로직 ---

/**
 * 여러 건의 경조사 내역을 동시에 저장합니다 (배치 처리).
 * @param userId 사용자 고유 ID
 * @param eventDetails 추가할 이벤트 정보 배열
 */
export const addEventsBatch = async (userId: string, eventDetails: any[]) => {
  const batch = writeBatch(db);
  const peopleCache = new Map<string, string>(); // 이름 중복 방지를 위한 캐시

  try {
    for (const data of eventDetails) {
      const { personName, type, amount, direction, date, memo } = data;
      
      let personId = peopleCache.get(personName);
      
      if (!personId) {
        // 지인이 이미 있는지 확인하고 없으면 새로 생성
        personId = await getOrCreatePerson(userId, personName);
        peopleCache.set(personName, personId);
      }

      const eventRef = doc(collection(db, "events"));
      batch.set(eventRef, {
        userId,
        personId,
        type,
        amount,
        direction,
        date,
        memo,
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    console.error("배치 저장 중 에러:", error);
    throw error;
  }
};


// --- 4. 실시간 채팅 관련 로직 ---

// 메시지 전송
export const sendMessage = async (message: Omit<ChatMessage, "id" | "createdAt">) => {
  try {
    await addDoc(collection(db, "messages"), {
      ...message,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("메시지 전송 중 에러:", error);
    throw error;
  }
};

// 실시간 메시지 구독 (최신 50개)
export const subscribeMessages = (callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, "messages"),
    orderBy("createdAt", "asc"), // 오래된 순으로 가져와서 아래로 쌓기
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  });
};
