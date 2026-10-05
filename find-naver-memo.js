const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true
  });

  const page = await browser.newPage();

  try {
    console.log('네이버 지도에 접속 중...');
    await page.goto('https://map.naver.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 페이지 전체 텍스트 추출
    const allText = await page.innerText('body');

    // "[외근 메모]" 찾기
    if (allText.includes('[외근 메모]') || allText.includes('외근 메모')) {
      console.log('✓ "[외근 메모]" 발견됨\n');

      const lines = allText.split('\n');
      let found = false;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('외근') || lines[i].includes('메모')) {
          // 주변 컨텍스트와 함께 출력
          const start = Math.max(0, i - 2);
          const end = Math.min(lines.length, i + 3);
          console.log(`--- 라인 ${i + 1} 근처 ---`);
          for (let j = start; j < end; j++) {
            console.log(`${j + 1}: ${lines[j].trim()}`);
          }
          console.log('');
          found = true;
        }
      }

      if (!found) {
        console.log('외근/메모 관련 텍스트를 찾을 수 없습니다.');
      }
    } else {
      console.log('✗ 페이지에서 "[외근 메모]"를 찾을 수 없습니다.\n');

      // 가능한 메뉴 탐색
      const lines = allText.split('\n');
      console.log('페이지에서 "외근" 또는 "메모" 관련 텍스트:');
      const relevant = lines.filter(line => line.includes('외근') || line.includes('메모'));

      if (relevant.length > 0) {
        relevant.slice(0, 10).forEach((line, idx) => {
          console.log(`  ${idx + 1}. ${line.trim()}`);
        });
      } else {
        console.log('  (없음)');
      }
    }

    // 스크린샷 저장
    await page.screenshot({ path: '/tmp/claude-0/-home-claude-time/5b8bac27-64af-5278-9f7b-d29ea783ec61/scratchpad/naver-map-screenshot.png', fullPage: true });
    console.log('\n✓ 스크린샷 저장 완료: naver-map-screenshot.png');

  } catch (error) {
    console.error('오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();
