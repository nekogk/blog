// 홈페이지: /index.json을 읽어 최신순으로 정렬하고, 폴더(2609, 2610...)별로 묶어 보여준다.

const listEl = document.getElementById('post-list');

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function normalizePath(key) {
  return ('/' + key.replace(/^\/+|\/+$/g, '') + '/');   // 항상 "/2609/fourier/"
}

async function main() {
  try {
    const res = await fetch('/index.json');
    if (!res.ok) throw new Error(`index.json 응답 ${res.status}`);
    const data = await res.json();

    const posts = Object.entries(data)
      .map(([key, info]) => {
        const path = normalizePath(key);
        return { path, month: path.split('/')[1], title: info.title, date: info.date };
      })
      // 날짜 내림차순, 같은 날이면 경로 역순
      .sort((a, b) => b.date.localeCompare(a.date) || b.path.localeCompare(a.path));

    if (!posts.length) {
      listEl.innerHTML = '<p class="list-message">아직 올라온 글이 없습니다.</p>';
      return;
    }

    // 정렬 순서를 유지하며 폴더별로 묶기
    const groups = [];
    for (const p of posts) {
      const last = groups[groups.length - 1];
      if (last && last.month === p.month) last.posts.push(p);
      else groups.push({ month: p.month, posts: [p] });
    }

    listEl.innerHTML = groups.map(g => {
      const y = '20' + g.month.slice(0, 2), m = Number(g.month.slice(2));
      return `
      <section class="month" aria-label="${y}년 ${m}월">
        <h2 class="month-code"><time datetime="${y}-${g.month.slice(2)}">${escapeHtml(g.month)}</time></h2>
        <ol class="month-posts">
          ${g.posts.map(p => `
          <li>
            <a href="${p.path}">
              <span class="post-title">${escapeHtml(p.title)}</span>
              <time class="post-date" datetime="${p.date}">${Number(p.date.slice(5, 7))}월 ${Number(p.date.slice(8, 10))}일</time>
            </a>
          </li>`).join('')}
        </ol>
      </section>`;
    }).join('');
  } catch (err) {
    listEl.innerHTML = '<p class="list-message">글 목록을 불러오지 못했습니다. index.json 파일의 형식을 확인해 주세요.</p>';
    console.error(err);
  }
}

main();
