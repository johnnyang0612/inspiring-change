const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const cheerio = require('cheerio');
const https = require('https');
const http = require('http');

const HTML_FILE = 'service.html';
const BASE_URL = 'https://minmax.tw';
const OUTPUT_FILE = 'service-resource.json';

// 下載圖片
function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

async function analyzeImages() {
    const htmlContent = fs.readFileSync(HTML_FILE, 'utf8');
    const $ = cheerio.load(htmlContent);
    const imageInfo = [];
    const promises = [];

    $('img').each((index, element) => {
        let src = $(element).attr('src');
        if (src) {
            // 統一補全為完整網址
            if (!src.startsWith('http')) {
                if (!src.startsWith('/')) src = '/' + src;
                src = BASE_URL + src;
            }
            promises.push(
                downloadImage(src)
                    .then(async (buffer) => {
                        const metadata = await sharp(buffer).metadata();
                        imageInfo.push({
                            src: src,
                            width: metadata.width,
                            height: metadata.height,
                            format: metadata.format,
                            size: buffer.length
                        });
                    })
                    .catch(error => {
                        console.error(`Error processing image ${src}:`, error.message);
                    })
            );
        }
    });

    await Promise.all(promises);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(imageInfo, null, 2));
    console.log('圖片分析完成，結果已保存到', OUTPUT_FILE);
}

analyzeImages().catch(console.error); 