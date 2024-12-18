// 从服务器获取配置
async function getConfig() {
    try {
        const response = await fetch('/api/config');
        return await response.json();
    } catch (error) {
        console.error('获取配置失败:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const roleSelection = document.querySelector('.role-selection');
    const reviewSection = document.querySelector('.review-section');

    // 文件拖放处理
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.background = 'rgba(0, 122, 255, 0.05)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.background = 'white';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = 'white';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 点击上传处理
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // AI 分析合同
    async function analyzeContract(content, role) {
        try {
            // 检查是否已上传合同
            if (!window.contractContent) {
                return '请先上传合同文件再进行分析。';
            }

            // 获取配置
            const config = await getConfig();
            if (!config || !config.DEEPSEEK) {
                throw new Error('无法获取配置信息');
            }

            const response = await fetch(config.DEEPSEEK.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.DEEPSEEK.API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        {
                            "role": "system",
                            "content": `你是一位资深的法律顾问，具有丰富的合同审查经验。请严格从${
                                role === 'party_a' ? '甲方' : 
                                role === 'party_b' ? '乙方' : 
                                '中立'
                            }的角度分析以下合同。${
                                role !== 'neutral' ? 
                                '你的职责是最大程度维护委托方利益，提供的建议必须对委托方有利。' : 
                                '你需要站在委托方的角度分析合同。'
                            }\n\n分析要求：${
                                role === 'neutral' ? 
                                '公正地详细分析以下内容：\n1. 合同中双方的权利义务关系\n2. 合同条款的完整性和合理性\n3. 潜在的法律风险\n4. 需要补充或完善的条款\n5. 对条款的具体修改建议' : 
                                '详细分析合同条款，重点关注：\n1. 如何最大化保护我方权益\n2. 如何限制和明确我方责任范围\n3. 对我方不利的条款及其改进方案\n4. 可能加强我方地位的补充条款\n5. 维护我方利益的具体修改建议'
                            }\n\n特别注意：
                            1. 合同条款的完整性：检查是否缺少重要条款（如违约责任、争议解决、合同变更与解除等），${
                                role !== 'neutral' ? 
                                '如有缺失，请提供对我方最有利的补充条款建议；' : 
                                '如有缺失，请根据合同主要内容提供平衡的补充建议；'
                            }
                            2. 条款的关联性：充或修改建议必须与合同现有内容保持逻辑关联，${
                                role !== 'neutral' ? 
                                '同时确保改后的条款最大程度保护我方利益；' : 
                                '确保修改后的合同整体协调一致；'
                            }
                            3. 合同履行保障：${
                                role !== 'neutral' ? 
                                '建议加入对我方有利的履约保障措施，如担保条款、对方违约时的高额违约金条款等；' : 
                                '检查合同是否包含充分且合理的履约保障措施；'
                            }
                            4. 风险防范：${
                                role !== 'neutral' ? 
                                '识别合同中对我方不利的法律风险，提供规避或转移风险的具体建议；' : 
                                '识别合同中可能存在的法律风险，并提供平衡的防范建议；'
                            }
                            5. 送达条款：如果合同中未约定送达地址和送达方式，请在分析建议中明确提出添加：
                              - 双方的详细送达地址
                              - 送达方式（包括但不于手机短信、电子邮件、快递等）
                              - 送达的生效时间和条件
                            
                            请按以下格式输出分析结果：
                            
                            一、合同基本情况
                            [简要说明合同类型和主要内容]
                            
                            二、条款分析及修改建议
                            ${role !== 'neutral' ? 
                            '请逐条分析关键条款，对每条分析后立即给出对应的修改建议：\n' +
                            '1. [条款序号] 条款内容\n' +
                            '   • 分析：[分析该条款对我方的影响]\n' +
                            '   • 建议：[具体的修改或补充建议，给出明确的条款表述]\n' : 
                            '请逐条分析关键条款，对每条分析后给出平衡的修改建议：\n' +
                            '1. [条款序号] 条款内容\n' +
                            '   • 分析：[客观分析该条款对双方的影响]\n' +
                            '   • 建议：[平衡的修改或补充建议，给出明确的条款表述]\n'}
                            
                            三、要补充的条款
                            ${role !== 'neutral' ? 
                            '根据合同内容，建议补充以下条款（每个补充条款都应该对我方有利\n' +
                            '1. [补充条款名称]\n' +
                            '   • 必要性：[说明为什么需要补充此条款]\n' +
                            '   • 建议条款：[给出具体的条款表述]\n' : 
                            '根据合同内容，建议补充以下条款：\n' +
                            '1. [补充条款名称]\n' +
                            '   • 必要性：[说明为什么需要补充此条款]\n' +
                            '   • 建议条款：[给出平衡的条款表述]\n'}
                            
                            四、风险提示及防范建议
                            ${role !== 'neutral' ? 
                            '请列出对我方不利的风险点，并立即给出相应的防范建议：\n' +
                            '1. [风险点]\n' +
                            '   • 风险分析：[具体说明风险]\n' +
                            '   • 防范建议：[具体的防范措施或条款修改建议]\n' : 
                            '请列出合同中的风险点，并给出平衡的防范建议：\n' +
                            '1. [风险点]\n' +
                            '   • 风险分析：[具体说明风险]\n' +
                            '   • 防范建议：[平衡的防范建议]\n'}
                            
                            五、修改后的完整合同
                            请根据以上分析和建议，生成一份完整的修改后合同。要求：
                            1. 保持原合同的基本结构
                            2. 整合所有修改建议
                            3. 补充所有建议添加的条款
                            4. 确保条款之间逻辑严密、表述规范
                            5. 使用以下格式输出：
                               # 合同标题
                               ## 第一条 总则
                               1.1 ...
                               1.2 ...
                               ## 第二条 ...
                            
                            注意：修改后的合同必须是一个完整的、可直接���用的法律文本。`
                        },
                        {
                            "role": "user",
                            "content": content
                        }
                    ],
                    stream: false
                })
            });

            const data = await response.json();
            window.modifiedContract = data.choices[0].message.content;
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI 分析出错:', error);
            return '抱歉，AI 分析过程中出现错误，请稍后重试。';
        }
    }

    // 添加导出合同函数
    async function exportModifiedContract() {
        try {
            if (!window.modifiedContract) {
                throw new Error('请先进行合同分析');
            }

            // 提取修改后的合同部分
            const contractSection = window.modifiedContract.split('五、修改后的完整合同')[1];
            if (!contractSection) {
                throw new Error('未找到修改后的合同内容');
            }

            // 更新按钮状态
            const downloadBtn = document.querySelector('.download-btn');
            downloadBtn.disabled = true;
            downloadBtn.textContent = '正在准备导出...';

            // 获取原始文件格式
            const originalFormat = window.uploadedFileFormat;
            const content = contractSection.trim();

            // 根据原始文件格式选择导出方式
            if (originalFormat === 'docx' && window.docxLib) {
                // Word 格式导出
                const { Document, Paragraph, TextRun, AlignmentType, Packer } = window.docxLib;
                if (!Document || !Paragraph || !TextRun || !AlignmentType || !Packer) {
                    throw new Error('Word导出组件初始化失败，将以文本格式导出');
                }
                
                // 解析合同内容
                const lines = content.split('\n');
                const documentChildren = [];
                
                // 添加标题
                documentChildren.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "修改后的合同",
                                bold: true,
                                size: 36,
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: {
                            after: 400,
                        },
                    })
                );
                
                // 处理每一行内容
                lines.forEach(line => {
                    if (line.trim()) {  // 跳过空行
                        if (line.startsWith('#')) {
                            // 处理标题
                            const level = line.match(/^#+/)[0].length;
                            const text = line.replace(/^#+\s*/, '');
                            documentChildren.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text,
                                            bold: true,
                                            size: 32 - (level * 4),
                                        }),
                                    ],
                                    spacing: {
                                        before: 400,
                                        after: 200,
                                    },
                                    heading: level,
                                })
                            );
                        } else {
                            // 处理普通段落
                            documentChildren.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: line,
                                            size: 24,
                                        }),
                                    ],
                                    spacing: {
                                        before: 120,
                                        after: 120,
                                        line: 360,
                                    },
                                })
                            );
                        }
                    }
                });

                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: documentChildren,
                    }],
                });

                // 生成并下载文档
                Packer.toBlob(doc).then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = '修改后的合同.docx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                });
            } else {
                // 文本格式导出
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '修改后的合同.txt';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }

            downloadBtn.textContent = '导出修改后的合同';
            downloadBtn.disabled = false;
        } catch (error) {
            console.error('导出错误:', error);
            alert('导出失败：' + error.message);
            
            const downloadBtn = document.querySelector('.download-btn');
            downloadBtn.textContent = '导出修改后的合同';
            downloadBtn.disabled = false;
        }
    }

    // 更新文件编码检测函数
    function detectEncoding(buffer) {
        // 尝试同的编码方式
        const encodings = ['UTF-8', 'GB18030', 'GBK', 'GB2312', 'UTF-16LE', 'UTF-16BE'];
        
        for (let encoding of encodings) {
            try {
                const decoder = new TextDecoder(encoding);
                const text = decoder.decode(buffer);
                
                // 检查是否包含乱码字符
                if (!/[\uFFFD]/.test(text) && /[\u4E00-\u9FA5]/.test(text)) {
                    return encoding;
                }
            } catch (e) {
                continue;
            }
        }
        
        // 如果都无法正确解码，返回 GB18030（最全面的中文编码）
        return 'GB18030';
    }

    // 更新文件处理函数
    const handleFile = function(file) {
        if (file) {
            // 记录文件格式
            window.uploadedFileFormat = file.name.toLowerCase().split('.').pop();
            const previewContent = document.querySelector('.preview-content');
            
            // 显示预览区域
            reviewSection.style.display = 'grid';
            
            // 显示加载提示
            previewContent.innerHTML = '<div class="loading">正在加载文件内容...</div>';
            
            // 检查文件类型
            const fileType = file.name.toLowerCase();
            
            if (fileType.endsWith('.docx')) {
                // 处理 Word 文档
                const reader = new FileReader();
                reader.onload = function(e) {
                    mammoth.convertToHtml({arrayBuffer: e.target.result})
                        .then(function(result) {
                            const content = result.value;
                            // 存储文件内容供后续使用
                            window.contractContent = content.replace(/<[^>]+>/g, ' '); // 移除 HTML 标签用于 AI 分析
                            
                            // 在预览区域显示合同内容
                            previewContent.innerHTML = `
                                <div class="word-content">
                                    ${content}
                                </div>
                            `;
                            
                            // 清空建议区域
                            const suggestionsContent = document.querySelector('.suggestions-content');
                            suggestionsContent.innerHTML = '<div class="hint">请选择您的立场开始分析</div>';
                        })
                        .catch(function(error) {
                            previewContent.innerHTML = `<div class="error">文件读取错误: ${error.message}</div>`;
                        });
                };
                reader.readAsArrayBuffer(file);
            } else if (fileType.endsWith('.txt')) {
                // 处理文本文件
                const reader = new FileReader();
                reader.onload = function(e) {
                    const buffer = new Uint8Array(e.target.result);
                    try {
                        const encoding = detectEncoding(buffer);
                        const decoder = new TextDecoder(encoding);
                        const content = decoder.decode(buffer);

                        // 存储文件内容供后续使用
                        window.contractContent = content;
                        
                        // 在预览区域显示合同内容
                        previewContent.innerHTML = content
                            .split('\n')
                            .map(line => `<div class="contract-line">${line}</div>`)
                            .join('');
                        
                        // 清空建议区域
                        const suggestionsContent = document.querySelector('.suggestions-content');
                        suggestionsContent.innerHTML = '<div class="hint">请选择您的立场开始分析</div>';
                    } catch (error) {
                        console.error('文件编码理错误:', error);
                        previewContent.innerHTML = '<div class="error">无法确读取文件，请确保文件使用正确的中文编码</div>';
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                previewContent.innerHTML = '<div class="error">不支持的文件格式，请上传 .docx 或 .txt 文件</div>';
            }
        } else {
            console.error('没有选择文件');
        }
    };

    // 生成签名
    function generatePayHash(params) {
        // 按照参数名ASCII码从小到大排序
        const sortedParams = {};
        Object.keys(params).sort().forEach(key => {
            if (params[key] !== null && params[key] !== '' && key !== 'hash') {
                sortedParams[key] = params[key];
            }
        });

        // 拼接参数
        const stringA = Object.entries(sortedParams)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        // 加入密钥生成签名
        return md5(stringA + PAY_CONFIG.APPSECRET);
    }

    // 发起支付
    async function initPayment() {
        try {
            // 生成订单ID
            const orderId = 'HT360_' + Date.now();
            localStorage.setItem('currentOrderId', orderId);
            
            // 发起支付请求到后端
            const response = await fetch('http://localhost:3001/api/payment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId })
            });

            const result = await response.json();
            
            if (result.errcode === 0) {
                // 跳转到支付页面
                window.location.href = result.url;
            } else {
                throw new Error(result.errmsg || '支付初始化失败');
            }
        } catch (error) {
            console.error('支付错误:', error);
            alert('支付发��失败：' + error.message);
        }
    }

    // 检查支付状态
    async function checkPaymentStatus() {
        const orderId = localStorage.getItem('currentOrderId');
        if (!orderId) return false;
        
        try {
            const response = await fetch(`http://localhost:3001/api/payment/check/${orderId}`);
            const result = await response.json();
            if (result.paid) {
                localStorage.setItem('paymentCompleted', 'true');
                return true;
            }
        } catch (error) {
            console.error('检查支付状态失败:', error);
        }
        return false;
    }

    // 检查使用次数
    function checkUsageLimit() {
        // 检查是否已支付
        if (localStorage.getItem('paymentCompleted') === 'true') {
            return true;
        }
        // 检查免费次数
        const usageCount = parseInt(localStorage.getItem('usageCount') || '0');
        return usageCount < 1;
    }

    // 更新使用次数
    function updateUsageCount() {
        const usageCount = parseInt(localStorage.getItem('usageCount') || '0');
        localStorage.setItem('usageCount', (usageCount + 1).toString());
    }

    // 更新角色选择处理
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(function(btn) {
        btn.addEventListener('click', async function() {
            // 检查是否已上传文件
            if (!window.contractContent) {
                const suggestionsContent = document.querySelector('.suggestions-content');
                suggestionsContent.innerHTML = '<div class="error">请先上传合同文件</div>';
                return;
            }

            // 检查使用次数
            if (!checkUsageLimit()) {
                // 显示支付提示
                const paymentPrompt = document.getElementById('paymentPrompt');
                paymentPrompt.style.display = 'flex';
                
                // 绑定按钮事件
                const confirmBtn = paymentPrompt.querySelector('.confirm-btn');
                const cancelBtn = paymentPrompt.querySelector('.cancel-btn');
                
                // 等待用户操作
                await new Promise((resolve) => {
                    confirmBtn.onclick = async () => {
                        paymentPrompt.style.display = 'none';
                        await initPayment();
                        resolve(false);
                    };
                    
                    cancelBtn.onclick = () => {
                        paymentPrompt.style.display = 'none';
                        resolve(false);
                    };
                });
                
                return;
            }

            // 移除其他按钮的激活状态
            document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
            // 添加当前按钮的激活状态
            this.classList.add('active');

            const role = this.dataset.role;
            
            // 显示加载状态
            const suggestionsContent = document.querySelector('.suggestions-content');
            suggestionsContent.innerHTML = '<div class="loading">AI 正在分析合同内容...</div>';
            
            // 调用 AI 分析
            const analysis = await analyzeContract(window.contractContent, role);
            
            // 显示分析结果
            suggestionsContent.innerHTML = `
                <div class="analysis-result">
                    ${analysis.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
            `;
            
            // 启用导出按钮
            document.querySelector('.download-btn').disabled = false;

            // 更新使用次数
            updateUsageCount();
        });
    });

    // 添加导出按钮事件监听
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', exportModifiedContract);
    }

    // 页面加载完成预加载 docx 库
    document.addEventListener('DOMContentLoaded', async function() {
        try {
            await window.loadDocxLibrary();
            console.log('Word导出组件加载成功');
        } catch (error) {
            console.warn('Word导出组件预加载失败，将在首次导出时重试');
        }
    });

    // 页面加载时检查支付状态
    window.addEventListener('load', async () => {
        await checkPaymentStatus();
    });

    // 检查URL参数是否包含支付成功标记
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('paid') === 'true') {
        // 等待几秒检查支付状态
        setTimeout(async () => {
            const paid = await checkPaymentStatus();
            if (paid) {
                alert('支付成功！您可以继续使用服务了。');
            }
        }, 2000);
    }
}); 