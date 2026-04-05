// ── 1. Particle Background (ระบบดาวระยิบระยับ) ──
(function () {
    const canvas = document.getElementById('canvas');
    if (!canvas) return; // ป้องกัน Error ถ้าหา Canvas ไม่เจอ
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    // ฟังก์ชันเริ่มต้นสร้างเม็ดดาว
    function init() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 1.5 + 0.5,
                speed: Math.random() * 0.4 + 0.1,
                opacity: Math.random()
            });
        }
    }

    // วาดและขยับดาว
    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            ctx.fillStyle = `rgba(0, 229, 255, ${p.opacity})`; // สีฟ้า Cyan ตาม Theme
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // ขยับดาวขึ้นด้านบน
            p.y -= p.speed;
            if (p.y < 0) p.y = h;

            // เอฟเฟกต์กะพริบ
            p.opacity += (Math.random() - 0.5) * 0.05;
            if (p.opacity < 0.1) p.opacity = 0.1;
            if (p.opacity > 0.8) p.opacity = 0.8;
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', init);
    init();
    animate();
})();

// ── 2. ระบบเลือกห้อง (Room Selection) ──
function selectRoom(cardEl, roomId) {
    const allCards   = document.querySelectorAll('.scard');
    const statusBar  = document.getElementById('status-bar');
    const statusText = document.getElementById('status-text');

    // 1. ล็อคหน้าจอและแสดงสถานะ
    document.body.style.pointerEvents = 'none'; 
    allCards.forEach(c => c.classList.add('dimmed'));
    cardEl.classList.remove('dimmed');
    cardEl.classList.add('selected');

    const targetID = roomId.toUpperCase();

    if(statusBar) {
        statusBar.style.borderColor = 'var(--gold)';
        statusBar.style.color       = 'var(--gold)';
        statusText.innerHTML = `กำลังเตรียมนำทางไปห้อง <strong>${targetID}</strong>...`;
    }

    // 2. ส่งคำสั่งไปที่หุ่นยนต์
    fetch('/api/move_to/' + targetID)
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(data => {
            if (data.status === 'moving') {
                setTimeout(() => {
                    window.location.href = '/navigate/' + targetID;
                }, 800);
            } else {
                throw new Error(data.msg || 'หุ่นยนต์ไม่ตอบสนอง');
            }
        })
        .catch(err => {
            document.body.style.pointerEvents = 'auto'; 
            console.error('API Error:', err);
            allCards.forEach(c => c.classList.remove('dimmed', 'selected'));
            
            if(statusBar) {
                statusBar.style.borderColor = 'rgba(255,82,82,0.5)';
                statusBar.style.color       = '#ff8a80';
                statusText.innerHTML = '⚠ เชื่อมต่อหุ่นยนต์ไม่ได้ กรุณาลองใหม่อีกครั้ง';
            }
        });
}

// ── 3. ปุ่ม Reset Home ──
function confirmResetHome() {
    Swal.fire({
        title: 'รีเซ็ตระบบกลับจุดเริ่มต้น?',
        text: "หุ่นยนต์จะวิ่งกลับไปที่จุด Home",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'ยืนยันรีเซ็ต',
        background: '#0D1526',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/api/reset-home', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    Swal.fire({
                        title: 'กำลังกลับ Home...',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        background: '#0D1526',
                        color: '#fff'
                    });
                })
                .catch(err => console.error("Reset Error:", err));
        }
    });
}

// ── 4. ระบบเต็มจอ (Fullscreen) ──
function toggleFS() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(()=>{});
    } else {
        document.exitFullscreen();
    }
}