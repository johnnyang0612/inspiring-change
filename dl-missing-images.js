  // download-missing-images.js
  const fs = require('fs');
  const path = require('path');
  const https = require('https');
  const url = require('url');

  // 這裡填入所有缺失圖片的網址
  const imageUrls = [
    'https://minmax.tw/static/web/images/sub-tri.png',
    'https://minmax.tw/static/web/images/left-tri.png',
    'https://minmax.tw/static/web/images/right-line.png',
    'https://minmax.tw/static/web/images/right-tri.png',
    'https://minmax.tw/static/web/images/bottom-line.png',
    'https://minmax.tw/static/web/images/ipad-tri.png',
    'https://minmax.tw/static/web/images/we-do-tri.png',
    'https://minmax.tw/static/web/images/icon-arrow.png',
    'https://minmax.tw/static/web/images/ajax-loader.gif'
  ];

  const destDir = path.join(__dirname, 'assets/images');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  imageUrls.forEach(imgUrl => {
    const parsed = url.parse(imgUrl);
    const fileName = path.basename(parsed.pathname);
    const destPath = path.join(destDir, fileName);

    https.get(imgUrl, res => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`下載完成: ${fileName}`);
        });
      } else {
        console.log(`下載失敗: ${imgUrl} (${res.statusCode})`);
      }
    }).on('error', err => {
      console.log(`下載錯誤: ${imgUrl} (${err.message})`);
    });
  });