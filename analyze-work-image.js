const fs = require('fs');
const path = require('path');
const https = require('https');
const { JSDOM } = require('jsdom');
const sharp = require('sharp');

// 获取图片尺寸的函数
async function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to load image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const metadata = await sharp(buffer).metadata();
          resolve({
            width: metadata.width,
            height: metadata.height,
            size: buffer.length,
            url: url,
            format: metadata.format
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// 主函数
async function analyzeImages() {
  try {
    // 从网站获取 HTML
    const html = await new Promise((resolve, reject) => {
      https.get('https://minmax.tw/work', (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => resolve(data));
      }).on('error', reject);
    });

    const dom = new JSDOM(html);
    const document = dom.window.document;
    const images = document.querySelectorAll('img');
    
    const imageInfo = [];
    
    for (const img of images) {
      const src = img.getAttribute('src');
      if (src) {
        try {
          const fullUrl = src.startsWith('http') ? src : `https://minmax.tw${src}`;
          console.log(`Processing image: ${fullUrl}`);
          const dimensions = await getImageDimensions(fullUrl);
          imageInfo.push({
            src: fullUrl,
            alt: img.getAttribute('alt') || '',
            dimensions: dimensions
          });
        } catch (error) {
          console.error(`Error processing image ${src}:`, error.message);
        }
      }
    }

    // 将结果写入 JSON 文件
    fs.writeFileSync(
      'work-resource.json',
      JSON.stringify(imageInfo, null, 2),
      'utf-8'
    );
    
    console.log('分析完成！结果已保存到 work-resource.json');
  } catch (error) {
    console.error('Error:', error);
  }
}

// 运行分析
analyzeImages().catch(console.error); 