import { useState, useEffect, useMemo } from 'react';
import { subscribeEvents, subscribePeople } from '@/lib/db';
import { EventRecord, Person } from '@/types';

/**
 * 경조사 내역 정보를 관리하는 커스텀 훅입니다.
 * 실시간 업데이트, 검색 필터링, 통계 계산을 담당합니다.
 */
export function useEvents(userId: string | undefined) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 실시간 구독 설정
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    
    // 지인 목록 구독
    const unsubscribePeople = subscribePeople(userId, (fetchedPeople) => {
      setPeople(fetchedPeople);
    });

    // 경조사 내역 구독
    const unsubscribeEvents = subscribeEvents(userId, 'date', (fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    });

    return () => {
      unsubscribePeople();
      unsubscribeEvents();
    };
  }, [userId]);

  // 지인 ID를 이름으로 매핑하는 Map (조회 성능 최적화)
  const peopleMap = useMemo(() => {
    const map = new Map<string, string>();
    people.forEach(p => {
      if (p.id) map.set(p.id, p.name);
    });
    return map;
  }, [people]);

  // 검색어에 따른 필터링된 목록
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    
    const query = searchQuery.toLowerCase();
    return events.filter(event => {
      const personName = peopleMap.get(event.personId)?.toLowerCase() || '';
      const type = event.type.toLowerCase();
      const memo = event.memo?.toLowerCase() || '';
      
      return personName.includes(query) || type.includes(query) || memo.includes(query);
    });
  }, [events, searchQuery, peopleMap]);

  // 통계 계산 (보낸 금액, 받은 금액)
  const stats = useMemo(() => {
    return filteredEvents.reduce(
      (acc, event) => {
        if (event.direction === 'give') {
          acc.totalGive += event.amount;
        } else {
          acc.totalReceive += event.amount;
        }
        return acc;
      },
      { totalGive: 0, totalReceive: 0 }
    );
  }, [filteredEvents]);

  return {
    events,
    filteredEvents,
    people,
    peopleMap,
    searchQuery,
    setSearchQuery,
    stats,
    loading
  };
}
