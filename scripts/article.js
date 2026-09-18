// 글 페이지: 같은 폴더의 article.md를 불러와서 #content에 렌더링한다.
// Obsidian 문법(수식, ![[임베드]], [[위키링크]], ==하이라이트==, %%주석%%, 콜아웃)을 처리한다.

import markdownit from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';
import katex from 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.mjs';

const KATEX_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';

// 자리표시자: 마크다운 파서가 절대 건드리지 않는 사용 영역(Private Use) 문자
const MATH_OPEN = '\uE000', MATH_CLOSE = '\uE001';
const CODE_OPEN = '\uE002', CODE_CLOSE = '\uE003';
const HTML_OPEN = '\uE004', HTML_CLOSE = '\uE005';

const md = markdownit({
  html: true,        // 내 글이니까 md 안의 HTML 허용
  linkify: true,
  typographer: false,
  breaks: true,      // Obsidian처럼 줄바꿈 한 번을 <br>로
});

// 페이지 제목(<h1>)은 index.json에서 오므로 md의 제목은 한 단계씩 내린다.
// # → h2, ## → h3, ... ##### → h6, ###### → h6
md.core.ruler.push('shift_headings', state => {
  for (const t of state.tokens) {
    if (t.type === 'heading_open' || t.type === 'heading_close') {
      t.tag = 'h' + Math.min(Number(t.tag.slice(1)) + 1, 6);
    }
  }
});

// ---------- 전처리 ----------

function stripFrontmatter(src) {
  return src.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

// 코드 펜스(``` / ~~~) 바깥 부분에만 fn을 적용한다.
function mapOutsideFences(src, fn) {
  const lines = src.split('\n');
  const out = [];
  let buf = [];
  let fence = null;
  const flush = () => { if (buf.length) { out.push(fn(buf.join('\n'))); buf = []; } };

  for (const line of lines) {
    const m = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      out.push(line);
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length && /^\s*[`~]+\s*$/.test(line)) fence = null;
    } else if (m) {
      flush();
      fence = m[1];
      out.push(line);
    } else {
      buf.push(line);
    }
  }
  flush();
  return out.join('\n');
}

function encodePath(p) {
  return p.split('/').map(encodeURIComponent).join('/');
}

function headingId(text) {
  return text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_-]/gu, '');
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i;

// [[2609/fourier/article#제목|표시]] 의 대상 → 사이트 주소
function resolveWikiTarget(target) {
  const [pathPart, heading] = target.split('#');
  const hash = heading ? '#' + headingId(heading) : '';
  if (!pathPart) return hash;                              // [[#제목]] : 같은 글 안
  const m = pathPart.replace(/\.md$/, '').match(/^\/?(\d{4})\/([^/]+)/);
  if (m) return `/${m[1]}/${m[2]}/${hash}`;                // [[2609/fourier/article]]
  return null;                                              // 어느 글인지 알 수 없음
}

function transformText(text, base, maths, htmls) {
  const codes = [];
  // 만들어 낸 HTML은 자리표시자로 넣어서 마크다운 문단 처리를 방해하지 않게 한다
  const keep = h => { htmls.push(h); return HTML_OPEN + (htmls.length - 1) + HTML_CLOSE; };

  // %%주석%% 제거
  text = text.replace(/%%[\s\S]*?%%/g, '');

  // 인라인 코드 보호
  text = text.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, m => {
    codes.push(m);
    return CODE_OPEN + (codes.length - 1) + CODE_CLOSE;
  });

  // 블록 수식 $$...$$
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    // 콜아웃/인용 안의 수식이면 각 줄 앞의 "> "를 걷어낸다
    tex = tex.replace(/^[ \t]*>[ \t]?/gm, '');
    maths.push({ tex, display: true });
    return MATH_OPEN + (maths.length - 1) + MATH_CLOSE;
  });

  // 인라인 수식 $...$ (Obsidian 규칙: $ 바로 안쪽에 공백 없음)
  text = text.replace(/(^|[^\\$])\$(?=\S)((?:\\.|[^$\\\n])+?)(?<=\S)\$(?!\d)/g, (_, pre, tex) => {
    maths.push({ tex, display: false });
    return pre + MATH_OPEN + (maths.length - 1) + MATH_CLOSE;
  });

  // 임베드 ![[파일|크기]]
  text = text.replace(/!\[\[([^\]]+)\]\]/g, (_, inner) => {
    const [target, opt] = inner.split('|');
    const name = target.trim();
    if (IMAGE_EXT.test(name)) {
      let size = '';
      const s = opt && opt.trim().match(/^(\d+)(?:x(\d+))?$/);
      if (s) size = ` width="${s[1]}"` + (s[2] ? ` height="${s[2]}"` : '');
      return keep(`<img src="${base}${encodePath(name)}" alt="${escapeHtml(opt && !s ? opt.trim() : '')}"${size} loading="lazy">`);
    }
    // 이미지가 아닌 임베드(다른 노트 등)는 링크로
    const href = resolveWikiTarget(name);
    const label = escapeHtml(opt ? opt.trim() : name);
    return keep(href !== null ? `<a href="${href}">${label}</a>` : label);
  });

  // 위키링크 [[대상|표시]]
  text = text.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
    const [target, alias] = inner.split('|');
    const label = escapeHtml((alias ?? target.split('#').pop().split('/').pop()).trim());
    const href = resolveWikiTarget(target.trim());
    return keep(href !== null ? `<a href="${href}">${label}</a>` : `<span class="wikilink-unresolved">${label}</span>`);
  });

  // ==하이라이트==
  text = text.replace(/==([^=\n]+)==/g, (_, inner) => keep('<mark>') + inner + keep('</mark>'));

  // 인라인 코드 복원
  text = text.replace(new RegExp(CODE_OPEN + '(\\d+)' + CODE_CLOSE, 'g'), (_, i) => codes[+i]);
  return text;
}

// ---------- 후처리 ----------

function restorePlaceholders(html, maths, htmls) {
  html = html.replace(new RegExp(`${HTML_OPEN}(\\d+)${HTML_CLOSE}`, 'g'), (_, i) => htmls[+i]);
  const render = (i, forceDisplay) => {
    const { tex, display } = maths[+i];
    const out = katex.renderToString(tex.trim(), { displayMode: display || forceDisplay, throwOnError: false });
    return display ? `<span class="math-display">${out}</span>` : out;
  };
  // 블록 수식은 그 자체로 한 줄을 차지하므로, 바로 앞뒤의 <br>은 빈 줄만 만든다 → 제거
  html = html.replace(new RegExp(`(?:<br>\\s*)?(${MATH_OPEN}(\\d+)${MATH_CLOSE})(?:\\s*<br>)?`, 'g'),
    (whole, ph, i) => (maths[+i].display ? ph : whole));
  // 한 문단 전체가 블록 수식이면 <p>를 벗겨낸다
  html = html.replace(new RegExp(`<p>${MATH_OPEN}(\\d+)${MATH_CLOSE}</p>`, 'g'), (_, i) => render(i));
  return html.replace(new RegExp(`${MATH_OPEN}(\\d+)${MATH_CLOSE}`, 'g'), (_, i) => render(i));
}

// > [!note] 제목  /  > [!tip]- 접힌 콜아웃
function buildCallouts(root) {
  for (const bq of root.querySelectorAll('blockquote')) {
    const first = bq.firstElementChild;
    if (!first || first.tagName !== 'P') continue;
    const m = first.innerHTML.match(/^\s*\[!([\w-]+)\]([+-]?)[ \t]*([^\n<]*?)\s*(?:<br>\s*|$)/);
    if (!m) continue;

    const [whole, type, fold, rawTitle] = m;
    const title = rawTitle || type.charAt(0).toUpperCase() + type.slice(1);
    first.innerHTML = first.innerHTML.slice(whole.length);
    if (!first.innerHTML.trim()) first.remove();

    const box = document.createElement(fold ? 'details' : 'div');
    box.className = `callout callout-${type.toLowerCase()}`;
    if (fold === '+') box.open = true;

    const head = document.createElement(fold ? 'summary' : 'div');
    head.className = 'callout-title';
    head.innerHTML = title;

    const body = document.createElement('div');
    body.className = 'callout-body';
    body.append(...bq.childNodes);

    box.append(head);
    if (body.textContent.trim() || body.querySelector('img,.katex')) box.append(body);
    bq.replaceWith(box);
  }
}

function addHeadingIds(root) {
  const used = new Map();
  for (const h of root.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    let id = headingId(h.textContent) || 'section';
    const n = used.get(id) || 0;
    used.set(id, n + 1);
    if (n) id += '-' + n;
    h.id = id;
  }
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

// ---------- 실행 ----------

export function renderMarkdown(src, base) {
  const maths = [], htmls = [];
  const pre = mapOutsideFences(stripFrontmatter(src), t => transformText(t, base, maths, htmls));
  return restorePlaceholders(md.render(pre), maths, htmls);
}

async function main() {
  const root = document.getElementById('content');
  if (!root) return;

  if (!document.querySelector(`link[href="${KATEX_CSS}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = KATEX_CSS;
    document.head.append(link);
  }

  const base = location.pathname.replace(/\/?$/, '/');   // 항상 "/2609/fourier/" 형태
  const key = base.replace(/\/$/, '');

  try {
    const [mdRes, meta] = await Promise.all([
      fetch(base + 'article.md'),
      fetch('/index.json').then(r => (r.ok ? r.json() : {})).catch(() => ({})),
    ]);
    if (!mdRes.ok) throw new Error(`article.md를 찾을 수 없습니다 (${mdRes.status})`);

    const info = meta[base] || meta[key];
    let header = '';
    if (info) {
      header = `<header class="article-header">
        <h1>${escapeHtml(info.title)}</h1>
        <time datetime="${info.date}">${formatDate(info.date)}</time>
      </header>`;
    }

    root.innerHTML = header + `<div class="article-body">${renderMarkdown(await mdRes.text(), base)}</div>`;
    const bodyEl = root.querySelector('.article-body');
    buildCallouts(bodyEl);
    addHeadingIds(bodyEl);

    // 표와 긴 수식이 화면 밖으로 넘치지 않게 감싼다
    for (const t of bodyEl.querySelectorAll('table')) {
      const wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      t.replaceWith(wrap);
      wrap.append(t);
    }

    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  } catch (err) {
    root.innerHTML = `<p class="load-error">글을 불러오지 못했습니다. ${escapeHtml(err.message)}</p>`;
    console.error(err);
  }
}

main();
