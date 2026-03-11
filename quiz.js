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
                1: "您具備獨立開創特質，壓力大時容易用『吃』當作情緒出口，造成防禦性囤脂。",
                2: "您是很在乎和諧的人。委屈累積多時容易造成下半身的肥胖與浮腫。",
                3: "您充滿創意，但快樂受阻時容易攝取『精緻碳水化合物』安撫大腦。",
                4: "您重視安全感。壓力大時身體防禦會讓『基礎代謝』停滯，讓肚子變大。",
                5: "您愛好自由。減重中最怕單調節食，需要充滿趣味的行動計畫。",
                6: "您非常照顧他人。責任感太重身心疲憊時，要先學會為自己保留空間。",
                7: "您擅長思考。鑽牛角尖會耗神且影響睡眠品質，這是阻礙瘦身荷爾蒙分泌的主因。",
                8: "您追求成就。遇到瓶頸時壓力荷爾蒙(皮質醇)升高，導致內臟脂肪直線上升。",
                9: "您有大愛精神。付出空虛時容易轉化為對高熱量食物的依賴。"
            };

            personalityText = `<strong style="font-size:1.2rem; color:var(--secondary-color);">天賦潛能：${lifeNumber}號人</strong><br>${traits[lifeNumber]}`;
        }

        // --- 4. 生成結果 ---
        const reportArea = document.getElementById('game-report-content');
        reportArea.innerHTML = `
            <div style="background: rgba(var(--secondary-rgb), 0.1); padding: 18px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid var(--secondary-color);">
                ${personalityText}
            </div>

            <h3 style="font-size: 1.1rem; color: var(--primary-color); border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">📈 步驟一：生理極限評估</h3>
            <p style="margin-bottom:20px;">
                依據您 ${age} 歲的身體年齡與身高，老師判斷您的完美極限落在 <strong>${baseStandardWeight} kg</strong> 左右。<br>
                將容錯範圍考量進去，目前體重約有 <strong style="color:#d9534f;">${totalManageWeight} kg</strong> 的管理額度。
            </p>

            <h3 style="font-size: 1.1rem; color: var(--primary-color); border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">⚖️ 步驟二：雙引擎減脂重點</h3>
            <p style="margin-bottom:20px;">
                第一引擎 (健康多餘脂肪)：約 <strong>${excessFatKg} kg</strong><br>
                第二引擎 (熱量總體防備)：約 <strong>${calorieManageWeight} kg</strong> <br>
                <span style="font-size: 0.9em; color:#777;">(註記：您必須優先處理引擎一的多餘脂肪，以防復胖)</span>
            </p>

            <h3 style="font-size: 1.1rem; color: var(--primary-color); border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">⏳ 步驟三：每日行動計畫</h3>
            <p>
                您的基礎代謝為 <strong>${bmr} 大卡</strong>。<br>
                建議每日熱量攝取：<strong>${intakeCalorie} 大卡</strong> <br>
                ${healthWarning}
            </p>
            ${daysForOneKg > 0 ?
                `<div style="margin-top:15px; background: rgba(var(--primary-rgb), 0.05); padding: 15px; border-radius: 8px; text-align: center;">
                    <strong style="color:var(--text-dark);">只要維持，每 <span style="color:var(--primary-color); font-size:1.4rem;">${daysForOneKg}</span> 天就能穩定減去 1 公斤！</strong>
                </div>` :
                `<div style="margin-top:15px; background: #ffebee; color:#c62828; padding: 15px; border-radius: 8px; text-align: center;">
                    <strong>目前缺乏足夠的代謝熱量缺口，請盡快尋求老師專業諮詢！</strong>
                </div>`
            }
        `;
    }
});
