let hasReached = false;
let statusInterval = null;

// เริ่มต้นทำงานเมื่อโหลดหน้าจอ
function startNavigation() {
    console.log("Navigation initialized...");
    // รันทันที 1 รอบแล้วค่อยตั้ง Interval
    pollStatus(); 
    statusInterval = setInterval(pollStatus, 1500);
}

function pollStatus() {
    if (hasReached) return;

    // ดึงข้อมูลผ่าน Proxy ใน main.py (Windows)
    fetch('/api/status')
        .then(res => res.json())
        .then(data => {
            // 0. ตรวจสอบว่าหุ่นยนต์ Online หรือไม่
            if (data.robot_online === false) {
                const statusEl = document.getElementById('robot-status');
                if (statusEl) statusEl.innerText = "⚠ เชื่อมต่อหุ่นยนต์ไม่ได้ (Offline)";
                return;
            }

            // 1. อัปเดต Progress Bar และตำแหน่ง Marker
            const progress = Math.round(Number(data.current_progress) || 0);
            updateUI(progress);

            // 2. อัปเดต "ตำแหน่งปัจจุบัน"
            const posEl = document.getElementById('current-pos');
            if (posEl && data.current_location !== undefined) {
                let locText = "";
                if (data.current_location == 1) {
                    locText = "จุดเริ่มต้น (Home)";
                } else {
                    // 🟢 แก้ไขตรงนี้: ดึงเลขห้องจาก URL (เช่น /navigate/1301) มาใช้โดยตรง
                    // แทนการใช้ {{ room_id }} ที่ JS อ่านไม่ได้
                    const pathParts = window.location.pathname.split('/').filter(Boolean);
                    const actualRoom = pathParts[pathParts.length - 1]; 
                    locText = "กำลังมุ่งหน้าไป: " + actualRoom.toUpperCase();
                }
                posEl.innerText = locText;
            }

            // 3. อัปเดต "ข้อความสถานะ"
            const statusEl = document.getElementById('robot-status');
            if (statusEl) {
                if (data.is_navigating) {
                    statusEl.innerText = "หุ่นยนต์กำลังเดินทาง...";
                    statusEl.style.color = "var(--gold)";
                } else if (progress >= 100) {
                    statusEl.innerText = "ถึงที่หมายแล้ว";
                    statusEl.style.color = "#4caf50";
                } else {
                    statusEl.innerText = "หุ่นยนต์หยุดนิ่ง";
                    statusEl.style.color = "#ff5252";
                }
            }

            // 4. เงื่อนไขจบภารกิจ (100% และหุ่นหยุดนิ่ง)
            if (progress >= 100 && !data.is_navigating) {
                handleFinish();
            }
        })
        .catch(err => {
            console.error("Fetch error:", err);
            const statusEl = document.getElementById('robot-status');
            if (statusEl) statusEl.innerText = "⚠ ระบบขัดข้อง";
        });
}

function updateUI(percent) {
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;
    const pStr = percent + '%';
    
    // อัปเดตทุก ID ที่ใช้แสดงความคืบหน้า
    const elements = {
        'p-bar': el => el.style.width = pStr,
        'p-text': el => el.innerText = pStr,
        'route-fill-h': el => el.style.width = pStr,
        'robot-marker': el => el.style.left = pStr,
        'marker-val': el => el.innerText = pStr
    };

    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) elements[id](el);
    }
}

function simulateArrival() {
    console.log("Simulating arrival...");
    if (statusInterval) clearInterval(statusInterval);
    
    updateUI(100);
    const statusEl = document.getElementById('robot-status');
    if (statusEl) {
        statusEl.innerText = "ถึงที่หมายแล้ว (โหมดจำลอง)";
        statusEl.style.color = "#4caf50";
    }
    
    // หน่วงเวลา 1.5 วินาทีให้คนดูทันก่อนเปลี่ยนหน้า
    setTimeout(handleFinish, 1500);
}

function handleFinish() {
    if (hasReached) return;
    hasReached = true;
    
    if (statusInterval) clearInterval(statusInterval);

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const actualRoom = pathParts[pathParts.length - 1];

    // ย้ายหน้าไปสรุปผล (ส่งเลขห้องที่ดึงมาได้ไปจริงๆ ไม่ใช่ส่งคำว่า {{ room_id }})
    setTimeout(() => {
        window.location.href = `/arrived?room=${actualRoom}`;
    }, 1000);
}
function confirmCancel() {
    Swal.fire({
        title: 'ยืนยันการยกเลิก?',
        text: "หุ่นยนต์จะหยุดทำงานทันที",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FF5252',
        confirmButtonText: 'หยุดหุ่นยนต์',
        cancelButtonText: 'ทำงานต่อ',
        background: '#0D1526',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            // เรียก /stop ใน main.py เพื่อสั่ง Ubuntu ให้หยุดหุ่น
            fetch('/stop')
                .finally(() => { 
                    window.location.href = '/room'; 
                });
        }
    });
}
