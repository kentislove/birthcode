document.addEventListener('DOMContentLoaded', () => {

    // --- 卡片 UI 控制變數 ---
    const cards = document.querySelectorAll('.quiz-card');
    const progressBar = document.getElementById('progress-fill');
    let currentStepIndex = 0;
    const totalSteps = cards.length - 2; // 不算最後 Loading & Report

    // 初始化第一步進度條
    updateProgress();

    // 檢查卡片必填完成度以解除按鈕鎖定
    function checkCurrentCardValidity(card) {
        const nextBtn = card.querySelector('.btn-next');
        if (!nextBtn) return;

        const requiredInputs = Array.from(card.querySelectorAll('input[required]'));
        if (requiredInputs.length === 0) return;

        const allValid = requiredInputs.every(input => input.checkValidity());
        if (allValid) {
            nextBtn.classList.remove('btn-disabled');
        } else {
            nextBtn.classList.add('btn-disabled');
        }
    }

    // 監聽有必填欄位的輸入，擴及整體以捕捉 radio group
    document.querySelectorAll('.quiz-card input').forEach(input => {
        ['input', 'change'].forEach(evt => {
            input.addEventListener(evt, (e) => {
                const currentCard = e.target.closest('.quiz-card');
                checkCurrentCardValidity(currentCard);
            });
        });
    });

    // 綁定「下一步」按鈕
    document.querySelectorAll('.btn-next').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('btn-disabled')) return; // 若被禁用則無效
            if (btn.id === 'btn-submit-game') return; // 最後一關送出鈕交給 submit 專屬方法處理

            const currentCard = e.target.closest('.quiz-card');

            // 再次檢查必填項目
            if (!validateCard(currentCard)) {
                return;
            }

            // 前進下一張卡片
            if (currentStepIndex < cards.length - 1) {
                transitionCard(currentCard, cards[currentStepIndex + 1]);
                currentStepIndex++;
                updateProgress();
            }
        });
    });

    // 綁定「上一步」按鈕
    document.querySelectorAll('.btn-prev').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const currentCard = e.target.closest('.quiz-card');
            // 回到上一張卡片
            if (currentStepIndex > 0) {
                transitionCardPrev(currentCard, cards[currentStepIndex - 1]);
                currentStepIndex--;
                updateProgress();
            }
        });
    });

    // 動畫函式：前進
    function transitionCard(current, next) {
        current.classList.remove('active');
        current.classList.add('exit'); // 往左消失

        setTimeout(() => {
            next.classList.remove('exit');
            next.classList.add('active'); // 放大出現
        }, 150); // 微幅等待以創造連續感
    }

    // 動畫函式：後退
    function transitionCardPrev(current, prev) {
        current.classList.remove('active');
        // 沒有特定 exit 動畫，直接 hide
        setTimeout(() => {
            prev.classList.remove('exit');
            prev.classList.add('active');
        }, 150);
    }

    // 進度條更新
    function updateProgress() {
        if (currentStepIndex >= totalSteps) {
            progressBar.style.width = '100%';
            return;
        }
        // STEP 1 就是 0 index
        const pct = Math.max(10, (currentStepIndex / totalSteps) * 100);
        progressBar.style.width = `${pct}%`;
    }

    // 簡單的 HTML5 Validation
    function validateCard(card) {
        const inputs = card.querySelectorAll('input[required]');
        for (let input of inputs) {
            if (!input.checkValidity()) {
                input.reportValidity();
                return false;
            }
        }
        return true;
    }


    /* ------------------------------------------------------------------
       運算與報告生成 (沿用老師核心算式)
    ------------------------------------------------------------------ */
    const submitBtn = document.getElementById('btn-submit-game');
    const loadingCard = document.getElementById('loading-card');
    const resultCard = document.getElementById('result-card');

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {

            if (submitBtn.classList.contains('btn-disabled')) return;
            // 抓取最後一頁的必填 (生日) 與前面儲存的表單 input
            const card = submitBtn.closest('.quiz-card');
            if (!validateCard(card)) return;

            // 進入 Loading 畫面 (Step 7)
            transitionCard(card, loadingCard);
            currentStepIndex++;
            updateProgress();

            // 模擬神經計算延遲
            setTimeout(() => {
                generateReport();
                transitionCard(loadingCard, resultCard);
                // 撒花特效
                if (typeof confetti !== 'undefined') {
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                }
            }, 2500);
        });
    }

    function generateReport() {
        // --- 1. 抓取所有資料 ---
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseInt(document.getElementById('g-age').value);
        const height = parseFloat(document.getElementById('g-height').value);
        const weight = parseFloat(document.getElementById('g-weight').value);
        const birthdayVal = document.getElementById('g-birthday').value;

        // --- 2. 老師的系統大腦：自動計算 BMR 與 體脂率 ---
        // 體脂率 (BFP) 公式: 1.2 × BMI + 0.23 × 年齡 - 10.8 × 性別參數(男1/女0) - 5.4
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        const genderNum = gender === 'male' ? 1 : 0;
        let fatRate = (1.2 * bmi) + (0.23 * age) - (10.8 * genderNum) - 5.4;
        if (fatRate < 5) fatRate = 5; // 避免極端數值
        fatRate = parseFloat(fatRate.toFixed(1));

        // BMR 公式 (Mifflin-St Jeor): 10 × 體重 + 6.25 × 身高 - 5 × 年齡 + (男:5 / 女:-161)
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr = gender === 'male' ? bmr + 5 : bmr - 161;
        bmr = Math.round(bmr);

        // --- 3. 老師的科學公式 (計算差距) ---

        // 標準體重
        let baseStandardWeight = gender === 'female' ? (height - 100) * 0.8 : (height - 100) * 0.9;
        let maxStandardWeight = baseStandardWeight;
        if (age >= 50) maxStandardWeight += 5;
        else if (age >= 40) maxStandardWeight += 3;

        baseStandardWeight = parseFloat(baseStandardWeight.toFixed(2));
        maxStandardWeight = parseFloat(maxStandardWeight.toFixed(2));

        // 總差距
        let totalManageWeight = weight - maxStandardWeight;
        if (totalManageWeight < 0) totalManageWeight = 0;
        totalManageWeight = parseFloat(totalManageWeight.toFixed(2));

        // 多餘脂肪 (健康管理)
        let excessFatKg = (weight * (fatRate / 100)) - 15;
        if (excessFatKg < 0) excessFatKg = 0;
        excessFatKg = parseFloat(excessFatKg.toFixed(2));

        // 熱量差距
        let calorieManageWeight = totalManageWeight - excessFatKg;
        if (calorieManageWeight < 0) calorieManageWeight = 0;
        calorieManageWeight = parseFloat(calorieManageWeight.toFixed(2));

        // 攝取熱量與缺口
        let intakeCalorie = gender === 'female' ? (bmr - bmr * 0.25) : (bmr - bmr * 0.3);
        let healthWarning = '';
        if (intakeCalorie < 1000) {
            intakeCalorie = 1000;
            healthWarning = '<div style="background:#fff3cd; color:#856404; padding:8px 12px; border-radius:6px; margin-top:5px; font-size:0.9rem;">⚠️ 注意：系統啟動保護機制，每日攝取熱量不得低於 1000 大卡，以免免疫力下降與代謝停滯！</div>';
        }
        let dailyDeficit = Math.round(bmr - intakeCalorie);
        let daysForOneKg = dailyDeficit > 0 ? Math.ceil(7700 / dailyDeficit) : 0;

        // --- 3. 生日靈數 ---
        let lifeNumber = 0;
        let personalityText = "";
        if (birthdayVal) {
            const numbers = birthdayVal.replace(/-/g, '').split('');
            let sum = numbers.reduce((a, b) => parseInt(a) + parseInt(b), 0);
            while (sum > 9) {
                sum = sum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
            }
            lifeNumber = sum;

            const traits = {
                1: { title: "領導力/創意", fear: "無能為力、被人否定、淪為平凡、威信掃地", strength: "精明幹練、俐落果敢、獨立完成挑戰、使命必達", weakness: "配合度低、不溝通、自我中心、強勢自負", text: "您具備領導者特質，但這背後常因恐懼平凡而過度內耗。建議學習放下「事必躬親」的執念。" },
                2: { title: "溝通力/貼心", fear: "無人理解、被人排擠、孤立無援、關係斷裂", strength: "擅長溝通協調、具同理心、傾聽並創造雙贏", weakness: "易猶豫不決、不喜歡獨處、依賴性高、受氣氛影響", text: "您非常在乎和諧。注意不要因為害怕衝突而委曲求全，那會導致下半身因情緒累積而浮腫。" },
                3: { title: "行動力/熱情", fear: "表現失常、無人喝采、光芒失色、才華不在", strength: "熱情天真、多才多藝、幽默感、驚人的學習速度", weakness: "衝動急躁、易分心、三分鐘熱度、說話不經大腦", text: "您是團隊的感染力來源。當您感到才華被忽視時，容易透過精緻碳水化合物尋求慰藉。" },
                4: { title: "整合力/計畫", fear: "根基動搖、秩序失控、安全崩盤、被迫改變", strength: "踏實謹慎、善於計畫、守規矩、專注力極強", weakness: "固執己見、不善變通、適應力弱、容易錯失機會", text: "穩定是您的核心。當安全感崩盤時，壓力會讓您的基礎代謝停滯，這正是肚子變大的主因。" },
                5: { title: "感染力/方向", fear: "行動受限、自由被奪、想逃無門、生活停滯", strength: "口才極佳、不接牌理出牌、獨特幽默、五湖四海皆朋友", weakness: "不擅長守約與承諾、犯錯時喜好狡辯、情緒寫在臉上", text: "自由是您的靈魂。減重計畫若太單調會讓您感到受限，需要充滿挑戰與趣味性的目標。" },
                6: { title: "策畫力/智慧", fear: "過度操心、關係破裂、愛無回應、道德枷鎖", strength: "領悟力高、學習強、能看見問題關鍵、追求完美", weakness: "性情急躁、急於追求完美、無法達標時容易自責", text: "您是智慧的策劃者。過度的追求完美會帶來情緒負擔，學會為自己保留空間才是瘦身關鍵。" },
                7: { title: "分析力/專業", fear: "思想貧乏、真相不明、追尋無果、問題無解", strength: "邏輯分析強、追根究柢、靠自學就能成為專家", weakness: "對不感興趣的人事物冷淡、行動力薄弱、難以接近", text: "分析是您的天賦。鑽牛角尖會耗損精神並影響睡眠，這會阻礙您的瘦身荷爾蒙分泌。" },
                8: { title: "影響力/責任", fear: "被人奪權、地位不保、力量削弱、雄心幻滅", strength: "重承諾負責、追求卓越、具商業頭腦、格局遠大", weakness: "愛管閒事、控制慾強、過度干涉他人、易迷失逐名利", text: "您有強大的責任感。當無力感產生時，皮質醇升高會導致內臟脂肪直線上升。" },
                9: { title: "洞察力/機會", fear: "願景失焦、無法貢獻、被當透明、無人接納", strength: "富同理心、洞察力強、機智應變、易獲認同成功", weakness: "博學而不專精、追夢易受誘惑分心、難長期堅持", text: "您具備宏觀的洞察力。當理想破滅感到孤寂時，容易轉化為對高熱量食物的心理依賴。" }
            };

            const t = traits[lifeNumber];
            personalityText = `
                <div style="margin-bottom: 15px;">
                    <strong style="font-size:1.3rem; color:var(--secondary-color);">${lifeNumber}號人：${t.title}</strong>
                </div>
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>✨ 天赋優勢：</strong>${t.strength}</p>
                    <p><strong>⚠️ 深層恐懼：</strong>${t.fear}</p>
                    <p><strong>🧠 心理盲點：</strong>${t.weakness}</p>
                    <p style="margin-top:10px; color:var(--primary-color);"><em>「${t.text}」</em></p>
                </div>
            `;
        }

        // --- 4. 抓取其他生理數據 ---
        const visceralVal = parseFloat(document.getElementById('g-visceral').value) || 0;
        const waterVal = parseFloat(document.getElementById('g-water').value) || 0;
        const muscleVal = parseFloat(document.getElementById('g-muscle').value) || 0;

        let waterAdvice = "";
        if (waterVal > 0) {
            const waterStandard = gender === 'male' ? 60 : 50;
            if (waterVal < waterStandard) {
                waterAdvice = `<p style="color:#d9534f; font-size:0.9rem;">⚠️ 注意：您的水分比例為 ${waterVal}%，低於標準 (${waterStandard}%)。<strong>肌肉是保存水分的堡壘</strong>，缺水會導致代謝下降，建議每日飲水 3000-4000cc。</p>`;
            }
        }

        let visceralAdvice = "";
        if (visceralVal >= 10) {
            visceralAdvice = `<p style="color:#d9534f; font-size:0.9rem;">⚠️ 警告：內臟脂肪高達 ${visceralVal}！這是引發「腰圍8090」代謝症候群的關鍵，必須優先透過飲食調整處理。</p>`;
        }

        // --- 5. 生成結果 ---
        const reportArea = document.getElementById('game-report-content');
        reportArea.innerHTML = `
            <div style="background: rgba(var(--secondary-rgb), 0.1); padding: 22px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid var(--secondary-color);">
                <h3 style="margin-top:0; margin-bottom:15px; color:var(--secondary-color);">第一部：自我探索與恐懼解析</h3>
                ${personalityText}
            </div>

            <h3 style="font-size: 1.15rem; color: var(--primary-color); border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 15px;">📈 第二部：科學健康減重評估</h3>
            
            <div style="margin-bottom:20px;">
                <p><strong>1. 生理極限與標準重量：</strong></p>
                <p>依據您 ${age} 歲的身高及生理狀態，老師判斷您的完美極限為 <strong>${baseStandardWeight} kg</strong>。目前您有 <strong style="color:#d9534f;">${totalManageWeight} kg</strong> 的管理額度。</p>
            </div>

            <div style="margin-bottom:20px;">
                <p><strong>2. 雙引擎減脂分析：</strong></p>
                <p>第一引擎 (健康多餘脂肪)：<strong>${excessFatKg} kg</strong> (這是您必須優先處理的頑固脂肪)<br>
                   第二引擎 (熱量總體防備)：<strong>${calorieManageWeight} kg</strong></p>
                <p style="font-size: 0.85rem; color:#666;">💡 知識：肌肉量是您的堡壘，肌肉燃燒熱量的效率是脂肪的 7 倍！</p>
            </div>

            <div style="margin-bottom:20px;">
                <p><strong>3. 生理指標分析：</strong></p>
                ${visceralAdvice}
                ${waterAdvice}
                ${visceralVal === 0 && waterVal === 0 ? '<p style="color:#777; font-size:0.9rem;">(未填寫進階數據內容，僅提供基礎生理分析)</p>' : ''}
            </div>

            <h3 style="font-size: 1.15rem; color: var(--primary-color); border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 15px;">⏳ 第三部：每日精準行動計畫</h3>
            <p>
                您的基礎代謝為 <strong>${bmr} 大卡</strong>。<br>
                <strong>目標攝取：${intakeCalorie} 大卡 / 每日缺口：${dailyDeficit} 大卡</strong>
                ${healthWarning}
            </p>
            
            ${daysForOneKg > 0 ?
                `<div style="margin-top:20px; background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--primary-rgb), 0.05)); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid rgba(var(--primary-rgb), 0.2);">
                    <p style="margin-bottom:5px; font-weight:bold;">執行口訣：兩兩相加，由內而外</p>
                    <strong style="color:var(--text-dark);">只要維持此計畫，預計每 <span style="color:var(--primary-color); font-size:1.6rem;">${daysForOneKg}</span> 天就能穩定減去 1 公斤純脂肪！</strong>
                </div>` :
                `<div style="margin-top:15px; background: #ffebee; color:#c62828; padding: 15px; border-radius: 8px; text-align: center;">
                    <strong>目前缺乏熱量缺口，減重將處於停滯期，請尋求老師進行生日解盤諮詢。</strong>
                </div>`
            }

            <div style="margin-top:25px; border-top: 1px dashed #ccc; padding-top: 20px;">
                <h4 style="color:var(--text-dark); margin-bottom:10px;">🌟 老師的叮嚀：防止復胖的「健康五要素」</h4>
                <ul style="text-align:left; font-size:0.9rem; color:#555; line-height:1.7;">
                    <li><strong>1. 均衡營養：</strong> 早餐最重要，晚餐熱量若未消化完會轉化為脂肪。</li>
                    <li><strong>2. 充足水分：</strong> 建議每日飲水 3000-4000cc，促進代謝與排毒。</li>
                    <li><strong>3. 足夠睡眠：</strong> 修復肌肉並調節抑制食慾的荷爾蒙。</li>
                    <li><strong>4. 適當運動：</strong> 建議體脂降到標準 10% 以內再開始規律運動。</li>
                    <li><strong>5. 愉悅心情：</strong> 避免「情緒性飲食」導致內臟脂肪堆積。</li>
                </ul>
            </div>
        `;
    }
});
