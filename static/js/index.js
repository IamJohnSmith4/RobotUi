// ── Particle Background ──
(function () {
    const c = document.getElementById('canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    let W, H, pts = [];

    // ตั้งค่าเริ่มต้นและสร้างจุดดาว
    function init() {
        W = c.width = window.innerWidth;
        H = c.height = window.innerHeight;
        pts = [];
        // สร้างจุดดาว 100 จุด
        for (let i = 0; i < 100; i++) {
            pts.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.5 + 0.5, // ขนาดดาว
                o: Math.random(),             // ความโปร่งใส (Opacity)
                s: Math.random() * 0.4 + 0.1  // ความเร็วในการเคลื่อนที่
            });
        }
    }

    // วาดและอัปเดตตำแหน่ง
    function draw() {
        ctx.clearRect(0, 0, W, H);
        pts.forEach(p => {
            ctx.fillStyle = `rgba(0, 229, 255, ${p.o})`; // สี Cyan ตามตัวแปร --cyan
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            // ขยับจุดขึ้นด้านบน
            p.y -= p.s;
            if (p.y < -10) p.y = H + 10;

            // ทำให้ดาวกะพริบ (Blinking effect)
            p.o += (Math.random() - 0.5) * 0.05;
            if (p.o < 0.1) p.o = 0.1;
            if (p.o > 0.8) p.o = 0.8;
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', init);
    init();
    draw();
})();

// ── Navigation & Fullscreen (โค้ดเดิมของคุณ) ──
function goToRooms() {
    const btn = document.querySelector('.cta');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size:1rem"></i> กำลังโหลด...';
    }
    setTimeout(() => { window.location.href = '/room'; }, 450);
}

function toggleFS() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
    } else {
        document.exitFullscreen();
    }
}

// รีเซ็ตปุ่มเมื่อกด Back กลับมา
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        const btn = document.querySelector('.cta');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `
                <span class="cta-ic" aria-hidden="true"><i class="fas fa-map-location-dot"></i></span>
                เลือกห้องเรียน
            `;
        }
    }
});