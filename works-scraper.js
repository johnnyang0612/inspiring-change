const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const { URL } = require('url');

// 创建资源目录
const createResourceDirs = async () => {
    const dirs = ['css', 'js', 'images', 'videos', 'fonts', 'icons'];
    for (const dir of dirs) {
        await fs.mkdir(path.join(__dirname, 'assets', dir), { recursive: true });
    }
};

// 下载资源文件
const downloadResource = async (url, resourcePath) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await fs.writeFile(resourcePath, response.data);
        console.log(`已下载: ${url} -> ${resourcePath}`);
        return true;
    } catch (error) {
        console.error(`下载失败 ${url}:`, error.message);
        return false;
    }
};

// 处理资源URL
const processResourceUrl = (baseUrl, resourceUrl) => {
    if (!resourceUrl) return null;
    try {
        const absoluteUrl = new URL(resourceUrl, baseUrl).href;
        const urlObj = new URL(absoluteUrl);
        const pathname = urlObj.pathname;
        const ext = path.extname(pathname).toLowerCase();
        
        let localPath;
        if (ext === '.css') {
            localPath = path.join('assets/css', path.basename(pathname));
        } else if (ext === '.js') {
            localPath = path.join('assets/js', path.basename(pathname));
        } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
            localPath = path.join('assets/images', path.basename(pathname));
        } else if (['.mp4', '.webm', '.ogg'].includes(ext)) {
            localPath = path.join('assets/videos', path.basename(pathname));
        } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
            localPath = path.join('assets/fonts', path.basename(pathname));
        } else if (['.ico', '.png'].includes(ext) && pathname.includes('favicon')) {
            localPath = path.join('assets/icons', path.basename(pathname));
        } else {
            return null;
        }
        
        return {
            absoluteUrl,
            localPath
        };
    } catch (error) {
        console.error(`处理URL失败 ${resourceUrl}:`, error.message);
        return null;
    }
};

async function scrapeWebsite() {
    try {
        const baseUrl = '/works';
        console.log('开始抓取网站...');
        
        // 创建资源目录
        await createResourceDirs();
        
        // 获取页面内容，设置正确的编码
        const response = await axios.get(baseUrl, {
            responseType: 'arraybuffer',
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        
        // 使用 UTF-8 解码
        const html = new TextDecoder('utf-8').decode(response.data);
        const $ = cheerio.load(html, { decodeEntities: false });
        
        // 处理head标签中的资源
        $('head').find('link[rel*="icon"], link[rel*="shortcut"], link[rel*="apple-touch-icon"], link[rel*="manifest"], link[rel*="mask-icon"]').each((i, elem) => {
            const href = $(elem).attr('href');
            const resource = processResourceUrl(baseUrl, href);
            if (resource) {
                downloadResource(resource.absoluteUrl, path.join(__dirname, resource.localPath));
                $(elem).attr('href', resource.localPath);
            }
        });
        
        // 处理CSS文件
        $('link[rel="stylesheet"]').each((i, elem) => {
            const href = $(elem).attr('href');
            const resource = processResourceUrl(baseUrl, href);
            if (resource) {
                downloadResource(resource.absoluteUrl, path.join(__dirname, resource.localPath));
                $(elem).attr('href', resource.localPath);
            }
        });
        
        // 处理JavaScript文件
        $('script[src]').each((i, elem) => {
            const src = $(elem).attr('src');
            const resource = processResourceUrl(baseUrl, src);
            if (resource) {
                downloadResource(resource.absoluteUrl, path.join(__dirname, resource.localPath));
                $(elem).attr('src', resource.localPath);
            }
        });
        
        // 处理图片
        $('img[src]').each((i, elem) => {
            const src = $(elem).attr('src');
            const resource = processResourceUrl(baseUrl, src);
            if (resource) {
                downloadResource(resource.absoluteUrl, path.join(__dirname, resource.localPath));
                $(elem).attr('src', resource.localPath);
            }
        });
        
        // 处理视频
        $('video source[src]').each((i, elem) => {
            const src = $(elem).attr('src');
            const resource = processResourceUrl(baseUrl, src);
            if (resource) {
                downloadResource(resource.absoluteUrl, path.join(__dirname, resource.localPath));
                $(elem).attr('src', resource.localPath);
            }
        });
        
        // 处理meta标签中的图片
        $('meta[property="og:image"], meta[name="twitter:image"]').each((i, elem) => {
            const content = $(elem).attr('content');
            const resource = processResourceUrl(baseUrl, content);
            if (resource) {
                downloadResource(resource.absoluteUrl, path.join(__dirname, resource.localPath));
                $(elem).attr('content', resource.localPath);
            }
        });
        
        // 保存修改后的HTML
        await fs.writeFile('work.html', $.html());
        console.log('网站内容已成功保存到 work.html');
        
    } catch (error) {
        console.error('抓取过程中发生错误:', error.message);
    }
}

scrapeWebsite(); 