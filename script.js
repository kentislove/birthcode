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
            // 切換按鈕圖案 (三 -> X)
            menuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
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
});
