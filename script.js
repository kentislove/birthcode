// 捲動顯示動畫與互動功能
document.addEventListener('DOMContentLoaded', () => {

    // 1. 導覽列縮放效果
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '12px 0';
            header.style.boxShadow = 'var(--shadow-strong)';
        } else {
            header.style.padding = '24px 0';
            header.style.boxShadow = 'none';
        }
    });

    // 2. 手機版選單切換
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }

    // 3. 實作 Intersection Observer (捲動揭開效果)
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // 綁定隱藏元素 (確保這些元素在 HTML 中有加上 'reveal' class)
    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // 3. 平滑捲動功能 (針對錨點連結)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    /* ----------------------------------------------------
        4. 雙引擎健康評估體驗 (諮詢表單計算引擎)
    ---------------------------------------------------- */
    const btnAnalyze = document.getElementById('btn-analyze');
    if (btnAnalyze) {
        btnAnalyze.addEventListener('click', () => {
            // 抓取生理數值
            const gender = document.getElementById('user-gender').value;
            const age = parseInt(document.getElementById('user-age').value);
            const height = parseFloat(document.getElementById('user-height').value);
            const weight = parseFloat(document.getElementById('user-weight').value);
            const fatRate = parseFloat(document.getElementById('user-fat').value);
            const bmr = parseFloat(document.getElementById('user-bmr').value);

            // 抓取生日
            const birthdayVal = document.getElementById('user-birthday').value;

            // 檢查必填
            if (!age || !height || !weight || !fatRate || !bmr || !birthdayVal) {
                alert("老師溫馨提醒：請填寫所有帶有紅色星星 * 的選填生理數據與公曆生日，這樣推算才能精準發揮作用喔！");
                return;
            }

            // ==========================================
            // 老師的科學推理邏輯開始
            // ==========================================

            // 1. 標準體重計算邏輯
            // 女性: (身高-100)*0.8 | 男性: (身高-100)*0.9
            let baseStandardWeight = gender === 'female' ? (height - 100) * 0.8 : (height - 100) * 0.9;

            // 年齡係數微調：30歲以下依低標，過40歲+3kg，過50歲+5kg
            let maxStandardWeight = baseStandardWeight;
            if (age >= 50) {
                maxStandardWeight += 5;
            } else if (age >= 40) {
                maxStandardWeight += 3;
            } else if (age > 30) {
                // 30~39歲在此依照低標或專案可調整。範本中我們用低標(即不加)。
            }

            // 四捨五入取到小數第二位
            baseStandardWeight = Math.round(baseStandardWeight * 100) / 100;
            maxStandardWeight = Math.round(maxStandardWeight * 100) / 100;

            // 計算個案需要管理的總體重數值
            let totalManageWeight = weight - maxStandardWeight;
            if (totalManageWeight < 0) totalManageWeight = 0;

            // 2. 健康管理的公斤數（處理多餘脂肪）
            // 公式：體重 * 體脂肪 - 一般正常健康狀態應有的脂肪量15kg
            let excessFatKg = (weight * (fatRate / 100)) - 15;
            if (excessFatKg < 0) excessFatKg = 0;
            excessFatKg = Math.round(excessFatKg * 100) / 100;

            // 3. 熱量計算的體重管理
            // 總需減重 - 健康管理(多餘脂肪) = 熱量算出的體重管理
            let calorieManageWeight = totalManageWeight - excessFatKg;
            if (calorieManageWeight < 0) calorieManageWeight = 0;
            calorieManageWeight = Math.round(calorieManageWeight * 100) / 100;

            // 4. 每日攝取總熱量限制 (自然防備機制不鼓勵低於1000)
            // 女性: BMR - (BMR * 0.25)
            // 男性: BMR - (BMR * 0.3)
            let intakeCalorie = gender === 'female' ? (bmr - bmr * 0.25) : (bmr - bmr * 0.3);

            let healthWarning = '';
            if (intakeCalorie < 1000) {
                intakeCalorie = 1000;
                healthWarning = ' <span style="color:#d9534f;font-size:0.9rem;">(因身體防備機制，老師不建議您每日攝取熱量低於1000大卡，易造成體重管理反效果且健康下降)</span>';
            }

            // 計算每日熱量缺口
            let dailyDeficit = bmr - intakeCalorie;
            dailyDeficit = Math.round(dailyDeficit);
            let daysForOneKg = 0;
            if (dailyDeficit > 0) {
                // 每累積7700熱量減少1公斤
                daysForOneKg = Math.ceil(7700 / dailyDeficit);
            }

            // ==========================================
            // 心理情緒特質 (西元生日數字簡化試算)
            // ==========================================
            const birthParams = birthdayVal.split('-');
            let personalityText = "";

            if (birthParams.length === 3) {
                // 計算生命靈數 (1~9)
                const numbers = birthdayVal.replace(/-/g, '').split('');
                let sum = numbers.reduce((a, b) => parseInt(a) + parseInt(b), 0);
                while (sum > 9) {
                    sum = sum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
                }
                const lifeNumber = sum;

                let traits = {
                    1: "您天生具備獨立與開創的特質。如果壓力大或無法自己作主時，容易尋求『被理解』的情緒出口；這時容易造成飲食失調或防禦性囤脂。",
                    2: "您是很體貼、在乎和諧的人。當感受到委屈且無處訴說時，情緒容易堆積。例如女孩子若委屈累積多時，下半身特別容易發胖或浮腫。",
                    3: "您充滿創意且樂觀。如果表達受阻或感受不到快樂時，容易利用攝取『精緻碳水化合物』來安撫大腦，這是體重起伏的關鍵。",
                    4: "您重視安全感與穩定。生活一旦失控或壓力大，身體為了防禦，就容易讓基礎代謝停滯，肚子周圍的脂防會比較難消除。",
                    5: "您愛好自由與體驗。在減重過程中，最怕『被制約』或單調的節食。你需要變化多端且充滿趣味的行動計畫。",
                    6: "您非常照顧他人，有時卻忘了照顧自己。肩上的責任感太重，身心疲憊時代謝自然就降下來了，要先學會為自己保留空間。",
                    7: "您擅長思考與分析。但如果鑽牛角尖會耗掉太多精神，導致神經緊繃且睡眠品質不佳，這是影響瘦身荷爾蒙分泌的最大阻礙。",
                    8: "您追求目標與成就。在遇到瓶頸時容易產生極大壓力。當壓力荷爾蒙(皮質醇)升高時，內臟脂肪是最容易直線上升的。",
                    9: "您有著大愛與服務精神。當無私付出卻覺得心寒空虛時，那種『空虛感』很容易轉化成為對高熱量食物的依賴。"
                };

                personalityText = `<p style="margin-bottom: 10px;">老師初步為您推算的生日密碼指標為 <strong><span style="color:var(--primary-color); font-size:1.3em;">${lifeNumber}</span></strong>。</p>
                                   <p>${traits[lifeNumber]}</p>
                                   <p style="margin-top: 10px; font-size: 0.95em;">（老師備註：這只是您生日金字塔中的一環！當我們正式諮詢時，我們團隊會運用完整的金字塔原理、參考您缺乏與互補的數字，幫您全盤分析先天體質潛能與行為模式。）</p>`;
            }

            // ==========================================
            // 報表渲染繪製
            // ==========================================
            totalManageWeight = totalManageWeight > 0 ? parseFloat(totalManageWeight.toFixed(2)) : 0;

            const reportContent = document.getElementById('report-content');
            reportContent.innerHTML = `
                <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                    <p><strong>1️⃣ 生理標準體重評估：</strong></p>
                    <ul style="margin-top:5px; margin-bottom:15px; padding-left: 20px;">
                        <li>依您的性別與身高，基礎極限低標應落在 <strong>${baseStandardWeight} kg</strong>。</li>
                        <li>經由老師科學評估您的實足年齡 (${age} 歲)，您的理想標準體重調整區間上限約為 <strong>${maxStandardWeight} kg</strong>。</li>
                        <li>對照目前體重 <strong>${weight} kg</strong>，您約有 <strong style="color:#d9534f; font-size:1.1rem;">${totalManageWeight} kg</strong> 距離標準值需要被管理。</li>
                    </ul>
                    
                    <p><strong>2️⃣ 雙引擎管理解析 (健康體態與熱量管理)：</strong></p>
                    <ul style="margin-top:5px; margin-bottom:15px; padding-left: 20px;">
                        <li>🩸 <strong>健康管理體數 (針對多餘脂肪)：</strong> 經公式計算((體重*體脂肪)-15kg)，您身上的多餘脂肪約有 <strong>${excessFatKg} kg</strong>，這部位必須透過健康調整作為首要目標。</li>
                        <li>🔥 <strong>熱量計算管理：</strong> 總差距扣除多餘脂肪後，剩餘的 <strong>${calorieManageWeight} kg</strong> 則著重於您的「每日熱量累積與計算」管理。</li>
                    </ul>

                    <p><strong>3️⃣ 初階行動計畫與時間預算：</strong></p>
                    <ul style="margin-top:5px; padding-left: 20px;">
                        <li>您的原始基礎代謝率為 <strong>${bmr} 大卡</strong>。</li>
                        <li>依照公式，您每日應攝取的總熱量請維持在 <strong>${intakeCalorie} 大卡</strong>${healthWarning}。</li>
                        <li>您的基礎代謝減去攝取熱量後，每日能創造約 <strong>${dailyDeficit > 0 ? dailyDeficit : 0} 大卡</strong> 的健康缺口。</li>
                        <li>${dailyDeficit > 0 ? `數學公式 (7700 / ${dailyDeficit} 缺口 = ${daysForOneKg}) 指出，理論上每 <strong>${daysForOneKg} 天</strong> 可以下降 1 公斤。<br><span style="color:#555; font-size:0.9em;">(老師的實務經驗：再進階搭配健康上的體重管理「並行執行」，估計每週就可以減少 1.2 到 1.5 公斤噢！)</span>` : `<strong style="color:red;">糟糕！您沒有可用的代謝熱量缺口，老師強烈建議進入深入諮詢，先挽救您的底層健康五要素！</strong>`}</li>
                    </ul>
                </div>
            `;

            document.getElementById('psychology-content').innerHTML = `
                <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px;">
                    ${personalityText}
                </div>
            `;

            // 顯示結果面板
            document.getElementById('report-result').style.display = 'block';

            // 讓使用者平滑捲動看到報告
            window.scrollTo({
                top: document.getElementById('report-result').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    }
});
