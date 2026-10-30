import { SITE_NAME } from '/scripts/layout.js';

const listEl = document.getElementById('post-list');
const PAGE_TITLE = `<h1 class="page-title">대문</h1><p class="page-intro">${SITE_NAME}에 오신 것을 환영합니다!</p>`;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function normalizePath(key) {
  return ('/' + key.replace(/^\/+|\/+$/g, '') + '/');   // 항상 "/2026/fourier/"
}

function buildPreview(src) {
  const body = src.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  const out = [];
  let started = false;   // 본문(제목이 아닌 첫 줄)에 들어섰는지

  for (const line of body.split(/\r?\n/)) {
    if (/^\s{0,3}#{1,6}\s/.test(line)) {
      if (!started) continue;   // 글 맨 앞의 제목은 건너뛴다 (카드에 이미 제목이 있으니까)
      break;                    // 본문 뒤에 다음 #이 나오면 거기서 끝
    }
    if (!line.trim()) continue;
    started = true;
    out.push(line.trim());
  }

  return out.join(' ').replace(/\s+/g, ' ').trim();
}

async function fillPreview(el, path) {
  try {
    const res = await fetch(path + 'article.md');
    if (!res.ok) throw new Error(res.status);
    const text = buildPreview(await res.text());
    if (text) el.textContent = text;
    else el.remove();
  } catch {
    el.remove();   // 미리보기를 못 불러와도 제목 카드는 그대로 둔다
  }
}

async function main() {
  try {
    const res = await fetch('/index.json');
    if (!res.ok) throw new Error(`index.json 응답 ${res.status}`);
    const data = await res.json();

    const posts = Object.entries(data)
      .map(([key, info]) => {
        const path = normalizePath(key);
        return { path, year: path.split('/')[1], title: info.title, date: info.date };
      })
      // 날짜 내림차순, 같은 날이면 경로 역순
      .sort((a, b) => b.date.localeCompare(a.date) || b.path.localeCompare(a.path));

    if (!posts.length) {
      listEl.innerHTML = PAGE_TITLE + '<p class="list-message">아직 올라온 글이 없습니다</p>';
      return;
    }

    // 정렬 순서를 유지하며 해별로 묶기 (폴더 이름 = 연도)
    const groups = [];
    for (const p of posts) {
      const last = groups[groups.length - 1];
      if (last && last.year === p.year) last.posts.push(p);
      else groups.push({ year: p.year, posts: [p] });
    }

    // 제목 카드를 먼저 그리고, 미리보기는 도착하는 대로 채운다
    listEl.innerHTML = PAGE_TITLE + groups.map(g => {
      return `
      <section class="year">
        <h2 class="year-code"><time datetime="${g.year}">${g.year}년</time></h2>
        <ol class="year-posts">
          ${g.posts.map(p => `
          <li>
            <a class="post-card" href="${p.path}">
              <div class="post-head">
                <h3 class="post-title">${escapeHtml(p.title)}</h3>
                <time class="post-date" datetime="${p.date}">${p.date.slice(5, 7)}.${p.date.slice(8, 10)}</time>
              </div>
              <p class="post-preview" data-path="${p.path}"></p>
            </a>
          </li>`).join('')}
        </ol>
      </section>`;
    }).join('');

    listEl.querySelectorAll('.post-preview').forEach(el => fillPreview(el, el.dataset.path));
  } catch (err) {
    listEl.innerHTML = PAGE_TITLE + '<p class="list-message">글 목록을 불러오지 못했습니다</p>';
    console.error(err);
  }
}

main();
