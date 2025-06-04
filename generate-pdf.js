const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF() {
    try {
        // 启动浏览器
        const browser = await puppeteer.launch({
            headless: 'new'
        });
        
        // 创建新页面
        const page = await browser.newPage();
        
        // 设置视口大小
        await page.setViewport({
            width: 1920,
            height: 1080
        });

        // 获取 HTML 文件的绝对路径
        const htmlPath = path.join(__dirname, 'contact-resource.html');
        const fileUrl = `file://${htmlPath}`;

        // 导航到 HTML 文件
        await page.goto(fileUrl, {
            waitUntil: 'networkidle0'
        });

        // 等待图片加载完成
        await page.waitForSelector('.image-card img', {
            waitUntil: 'networkidle0'
        });

        // 生成 PDF
        await page.pdf({
            path: 'contact-resource.pdf',
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        console.log('PDF 生成成功！保存为 contact-resource.pdf');

        // 关闭浏览器
        await browser.close();
    } catch (error) {
        console.error('生成 PDF 时发生错误:', error);
    }
}

// 运行生成函数
generatePDF(); 