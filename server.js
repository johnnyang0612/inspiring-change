const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// 提供靜態文件
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// 首頁路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 作品頁路由
app.get('/works', (req, res) => {
    res.sendFile(path.join(__dirname, 'work.html'));
});

// 聯絡頁路由
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// 關於我們頁路由
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

// 服務頁路由
app.get('/service', (req, res) => {
    res.sendFile(path.join(__dirname, 'service.html'));
});

    

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 