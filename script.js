// 添加 DeepSeek API 配置
const DEEPSEEK_API_KEY = 'sk-aacab0ed2f2e4cedbe034cccfebd97a9';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

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

            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
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
                                '你需要公正客观地分析合同。'
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
                            2. 条款的关联性：补充或修改建议必须与合同现有内容保持逻辑关联，${
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
                              - 送达方式（包括但不限于手机短信、电子邮件、快递等）
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
                            
                            三、需要补充的条款
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
                            
                            注意：修改后的合同必须是一个完整的、可直接使用的法律文本。`
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
            // 储修改后的合同���容
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

            // 检查 docx 库是否正确加载
            if (!window.docx) {
                // 如果 docx 库未加载，使用纯文本方式导出
                const blob = new Blob([contractSection.trim()], { type: 'text/plain;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '修改后的合同.txt';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                return;
            }

            // 创建新的 Word 文档
            const { Document, Paragraph, TextRun, AlignmentType, Packer } = window.docx;
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
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
                        }),
                        ...contractSection
                            .trim()
                            .split('\n')
                            .map(line => {
                                // 处理标题
                                if (line.startsWith('#')) {
                                    const level = line.match(/^#+/)[0].length;
                                    const text = line.replace(/^#+\s*/, '');
                                    return new Paragraph({
                                        children: [
                                            new TextRun({
                                                text,
                                                bold: true,
                                                size: 28 - (level * 2),
                                            }),
                                        ],
                                        spacing: {
                                            before: 300,
                                            after: 200,
                                        },
                                    });
                                }
                                // 处理普通段落
                                return new Paragraph({
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
                                });
                            }),
                    ],
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
        } catch (error) {
            console.error('导出错误:', error);
            // 如果出错，回退到纯文本导出
            try {
                const contractSection = window.modifiedContract.split('五、修改后的完整合同')[1];
                if (contractSection) {
                    const blob = new Blob([contractSection.trim()], { type: 'text/plain;charset=utf-8' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = '修改后的合同.txt';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    alert('导出失败：无法获取修改后的合同内容');
                }
            } catch (e) {
                alert('导出失败：' + error.message);
            }
        }
    }

    // 更新文件编码检测函数
    function detectEncoding(buffer) {
        // 尝试不同的编码方式
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
            const previewContent = document.querySelector('.preview-content');
            
            // 显示预览���域
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
                        console.error('文件编码处理错误:', error);
                        previewContent.innerHTML = '<div class="error">无法正确读取文件，请确保文件使用正确的中文编码</div>';
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

            // 移除他按钮的激活状态
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
        });
    });

    // 添加导出按钮事件监听
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', exportModifiedContract);
    }
}); 