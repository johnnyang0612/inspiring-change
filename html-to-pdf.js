const puppeteer = require('puppeteer');
const path = require('path');

async function convertHtmlToPdf() {
    try {
        // 啟動瀏覽器
        const browser = await puppeteer.launch({
            headless: 'new'  // 使用新的 headless 模式
        });
        
        // 創建新頁面
        const page = await browser.newPage();
        
        // 設置視窗大小
        await page.setViewport({
            width: 1200,
            height: 800
        });

        // 讀取本地 HTML 文件
        const htmlPath = path.join(__dirname, 'about-resource.html');
        await page.goto(`file://${htmlPath}`, {
            waitUntil: 'networkidle0'  // 等待所有網絡請求完成
        });

        // 等待圖片加載完成
        await page.waitForSelector('.img-block img', {
            timeout: 10000
        });

        // 生成 PDF
        await page.pdf({
            path: 'about-resource.pdf',
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        console.log('PDF 已生成：about-resource.pdf');

        // 關閉瀏覽器
        await browser.close();
    } catch (error) {
        console.error('轉換過程中發生錯誤：', error);
    }
}

// 執行轉換
convertHtmlToPdf(); 