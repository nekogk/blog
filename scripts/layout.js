// 모든 페이지가 공유하는 머리글(로고·검색창)과 바닥글
// 각 HTML은 <div class="container"> 안에 본문만 두고, 이 스크립트가 앞뒤를 채움
import { initSearch } from '/scripts/search.js';

const SITE_NAME = '도양록';
const COPYRIGHT = '© 2026 Raeyon Kim. All rights reserved.';

function headerHtml() {
  return `
    <header class="site-header">
      <a href="/" class="site-logo">
        <img src="/icon.svg" alt="">
        <span>${SITE_NAME}</span>
      </a>
    </header>`;
}

function footerHtml() {
  return `
    <footer>${COPYRIGHT}</footer>`;
}

function initLayout() {
  const container = document.querySelector('.container');
  if (!container) return;

  // 이미 있으면(예전 HTML) 다시 넣지 않음
  if (!container.querySelector(':scope > .site-header')) container.insertAdjacentHTML('afterbegin', headerHtml());
  if (!container.querySelector(':scope > footer')) container.insertAdjacentHTML('beforeend', footerHtml());

  initSearch(container.querySelector(':scope > .site-header'));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLayout);
else initLayout();
