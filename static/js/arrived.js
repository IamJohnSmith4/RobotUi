// ── Particle System (สร้างเอฟเฟกต์พื้นหลัง) ──────────────────────
const canvas = document.getElementById('canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];

    // ปรับขนาด Canvas ให้เต็มจอเสมอ
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // สร้างคลาส Particle
    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
            this.alpha = Math.random();
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.fillStyle = `rgba(0, 229, 255, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // สร้างจุด 100 จุด
    for (let i = 0; i < 100; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// ── Navigation Logic ──────────────────────────────────────────────

/**
 * ฟังก์ชันกลับไปหน้าเลือกห้อง (Room Selection)
 */
function returnToRoom() {
    window.location.href = '/room';
}

/**
 * ฟังก์ชันส่งหุ่นกลับจุดเริ่มต้น (Home)
 */
function sendHome() {
    Swal.fire({
        title: 'ส่งหุ่นกลับจุดเริ่มต้น?',
        text: 'หุ่นยนต์จะเดินทางกลับไปยังจุด Home (Node 1) ทันที',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#00E5FF',
        cancelButtonColor: '#555',
        confirmButtonText: '<i class="fas fa-rotate-left"></i> ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        background: '#0D1526',
        color: '#ffffff',
        backdrop: 'rgba(0,0,0,0.8)',
    }).then(result => {
        if (result.isConfirmed) {
            // แสดง Loading
            Swal.fire({
                title: 'กำลังส่งคำสั่ง...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                background: '#0D1526',
                color: '#fff'
            });

            // เรียก API ไปยัง Node 1 (HOME)
            fetch('/api/move_to/HOME')
                .then(res => res.json())
                .then(data => {
                    console.log("Robot response:", data);
                    window.location.href = '/room';
                })
                .catch(err => {
                    console.error("Fetch error:", err);
                    window.location.href = '/room';
                });
        }
    });
}

// ฟังก์ชันอ่านออกเสียง (Text to Speech)
// ในไฟล์ arrived.js
function speakDetails() {
    window.speechSynthesis.cancel();
    // ต้องใช้ตัวแปร DUB_TEXT ที่เราประกาศไว้ใน HTML
    const utterance = new SpeechSynthesisUtterance(DUB_TEXT);
    utterance.lang = 'th-TH';
    window.speechSynthesis.speak(utterance);
}

// ── Lifecycle Logic ──────────────────────────────────────────────
window.onload = () => {
    const roomIdDisplay = typeof CURRENT_ROOM_ID !== 'undefined' ? CURRENT_ROOM_ID : 'Unknown';
    console.log("Welcome! Current Location:", roomIdDisplay);
 
    setTimeout(() => {
        speakDetails();
    }, 500); 

    const iframe = document.querySelector('iframe');
    if (iframe) {
        console.log("Video is ready to play.");
        console.warn("Note: Video may be muted by browser policy for autoplay.");
    }
};