function selectRoom(cardEl, roomId) {
    const allCards   = document.querySelectorAll('.scard');
    const statusBar  = document.getElementById('status-bar');
    const statusText = document.getElementById('status-text');

    // 1. ล็อคหน้าจอและแสดงสถานะ
    document.body.style.pointerEvents = 'none'; 
    allCards.forEach(c => c.classList.add('dimmed'));
    cardEl.classList.remove('dimmed');
    cardEl.classList.add('selected');

    const targetID = roomId.toUpperCase(); // เช่น "1301" หรือ "1303A"

    if(statusBar) {
        statusBar.style.borderColor = 'var(--gold)';
        statusBar.style.color       = 'var(--gold)';
        statusText.innerHTML = `กำลังเตรียมนำทางไปห้อง <strong>${targetID}</strong>...`;
    }

    // 2. ส่งไปที่ API ของ main.py (Windows Flask)
    // หมายเหตุ: ใช้ URL '/api/move_to/' ตามที่กำหนดใน main.py
    fetch('/api/move_to/' + targetID)
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(data => {
            // เช็คสถานะ "moving" ตามที่ Python ส่งกลับมา
            if (data.status === 'moving') {
                setTimeout(() => {
                    // ย้ายหน้าไปที่ /navigate/<room_id>
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

// ฟังก์ชันสำหรับปุ่ม Reset Home (เรียกใช้ Proxy Reset ใน main.py)
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
            // เรียกไปที่ @app.route('/api/reset-home') ใน main.py
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
function toggleFS() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen();
}

