const express = require('express');
const cors = require('cors');
const axios = require('axios');
const md5 = require('md5');
const path = require('path');
const config = require('./config');

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 支付配置
const PAY_CONFIG = config.PAYMENT;

// 生成签名
function generatePayHash(params) {
    const sortedParams = {};
    Object.keys(params).sort().forEach(key => {
        if (params[key] !== null && params[key] !== '' && key !== 'hash') {
            sortedParams[key] = params[key];
        }
    });

    const stringA = Object.entries(sortedParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    return md5(stringA + PAY_CONFIG.APPSECRET);
}

// 支付接
app.post('/api/payment/create', async (req, res) => {
    try {
        const orderId = 'HT360_' + Date.now();
        const origin = req.headers.origin || 'http://localhost:5500'; // 获取请求来源
        const params = {
            version: '1.1',
            appid: PAY_CONFIG.APPID,
            trade_order_id: orderId,
            total_fee: 10, // 10元
            title: '合同360智能审查服务',
            time: Math.floor(Date.now() / 1000),
            notify_url: 'http://localhost:3001/api/payment/notify',
            return_url: origin,
            callback_url: origin,
            plugins: 'HeTong360',
            nonce_str: Math.random().toString(36).substr(2),
        };

        // 生成签名
        params.hash = generatePayHash(params);

        // 发起支付请求
        const response = await axios.post(PAY_CONFIG.PAY_URL, new URLSearchParams(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('支付请求错误:', error);
        res.status(500).json({
            errcode: -1,
            errmsg: error.message || '支付请求失败'
        });
    }
});

// 支付通知接口
app.post('/api/payment/notify', (req, res) => {
    // 处理支付成功通知
    console.log('支付通知:', req.body);
    res.json({ errcode: 0, errmsg: 'success' });
});

// 配置接口 - 只返回前端需要的配置
app.get('/api/config', (req, res) => {
    res.json({
        DEEPSEEK: {
            API_URL: config.DEEPSEEK.API_URL
        },
        PAYMENT: {
            PRICE: config.PAYMENT.PRICE
        }
    });
});

// 404处理 - 放在所有路由之后
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            errcode: -1,
            errmsg: '接口不存在'
        });
    } else {
        res.status(404).send('页面未找到');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}); 