const PREVIEW_CHARS = 96;

const listEl = document.getElementById('post-list');

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function normalizePath(key) {
  return ('/' + key.replace(/^\/+|\/+$/g, '') + '/');   // 항상 "/2609/fourier/"
}

function buildPreview(src) {
  const text = src
    .replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const chars = Array.from(text);   // 이모지 같은 문자가 반으로 잘리지 않게
  return chars.length > PREVIEW_CHARS ? chars.slice(0, PREVIEW_CHARS).join('') + '…' : text;
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
        return { path, month: path.split('/')[1], title: info.title, date: info.date };
      })
      // 날짜 내림차순, 같은 날이면 경로 역순
      .sort((a, b) => b.date.localeCompare(a.date) || b.path.localeCompare(a.path));

    if (!posts.length) {
      listEl.innerHTML = '<p class="list-message">아직 올라온 글이 없습니다</p>';
      return;
    }

    // 정렬 순서를 유지하며 달별로 묶기
    const groups = [];
    for (const p of posts) {
      const last = groups[groups.length - 1];
      if (last && last.month === p.month) last.posts.push(p);
      else groups.push({ month: p.month, posts: [p] });
    }

    // 제목 카드를 먼저 그리고, 미리보기는 도착하는 대로 채운다
    listEl.innerHTML = groups.map(g => {
      const y = '20' + g.month.slice(0, 2), m = Number(g.month.slice(2));
      return `
      <section class="month">
        <h2 class="month-code"><time datetime="${y}-${g.month.slice(2)}">${y}년 ${m}월</time></h2>
        <ol class="month-posts">
          ${g.posts.map(p => `
          <li>
            <a class="post-card" href="${p.path}">
              <div class="post-head">
                <h3 class="post-title">${escapeHtml(p.title)}</h3>
                <time class="post-date" datetime="${p.date}">${Number(p.date.slice(8, 10))}일</time>
              </div>
              <p class="post-preview" data-path="${p.path}"></p>
            </a>
          </li>`).join('')}
        </ol>
      </section>`;
    }).join('');

    listEl.querySelectorAll('.post-preview').forEach(el => fillPreview(el, el.dataset.path));
  } catch (err) {
    listEl.innerHTML = '<p class="list-message">글 목록을 불러오지 못했습니다</p>';
    console.error(err);
  }
}

main();
