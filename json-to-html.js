const fs = require('fs');
const path = require('path');

// 讀取JSON資料
const json = JSON.parse(fs.readFileSync('work-info.json', 'utf8'));

// 產生每一筆專案的li區塊
function renderProject(item, idx) {
  const imgPath = `/assets/images/600X400/${idx + 1}.png`;  
  const url = item.網址 || '#';
  const name = item.專案名稱 || '';
  const service = item.服務項目 || '';
  const feature = item.專案特色說明 || '';
  return `        <li class="all export">
      <a class="box" href="${url}" title="${name}">
        <span class="box-line"></span>
        <span class="pic img jqimgFill">
          <img
            src="${imgPath}"
            draggable="false"
            alt="${name}" />
        </span>
      </a>
      <div class="text">
        <h3 class="name h2">${name}</h3>
        <span class="summary d-none d-md-inline-block">${service}${feature ? ' · ' + feature : ''}</span>
      </div>
    </li>`;
}

const newList = json.map(renderProject).join('\n');

// 讀取原始HTML
let html = fs.readFileSync('work-info.html', 'utf8');

// 用正則找到<ul class="list list-unstyled clearfix">... </ul>區塊
html = html.replace(
  /(<ul class="list list-unstyled clearfix">)[\s\S]*?(<\/ul>)/,
  `$1\n${newList}\n$2`
);

// 寫回HTML
fs.writeFileSync('work-info.html', html, 'utf8');

console.log('已成功批次替換專案區塊！'); 