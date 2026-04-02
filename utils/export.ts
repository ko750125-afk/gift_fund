/**
 * 데이터를 CSV 파일로 변환하여 다운로드합니다.
 * @param events 경조사 기록 배열
 * @param peopleIdToName 지인 ID를 이름으로 매핑한 객체/맵
 */
export const downloadEventsAsCSV = (events: any[], peopleIdToName: Map<string, string>) => {
  try {
    // CSV 데이터 생성
    let csvContent = "\uFEFF"; // 한글 깨짐 방지 BOM
    csvContent += "날짜,이름,종류,금액,방향,메모\n";

    events.forEach(event => {
      const name = peopleIdToName.get(event.personId) || "알 수 없음";
      const direction = event.direction === "give" ? "함(낸)" : "받음";
      
      // CSV 형식에 맞게 데이터 정합성 유지 (쉼표 등 처리)
      const memo = event.memo ? `"${event.memo.replace(/"/g, '""')}"` : "";
      
      csvContent += `${event.date},${name},${event.type},${event.amount},${direction},${memo}\n`;
    });

    // 파일 다운로드 실행
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `경조사비_내역_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("CSV 다운로드 중 에러:", error);
    alert("데이터를 내보내는 중 에러가 발생했습니다.");
  }
};
