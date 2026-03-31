// ── Particle Background ──
(function () {
    const c = document.getElementById('canvas');
    const ctx = c.getContext('2d');
    let W, H, pts = [];
    
    // ... (โค้ด JS ทั้งหมดของคุณ) ...
})();

// ── Navigation & Fullscreen ──
function goToRooms() {
    const btn = document.querySelector('.cta');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size:1rem"></i> กำลังโหลด...';
    setTimeout(() => { window.location.href = '/room'; }, 450);
}

function toggleFS() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen();
}
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        const btn = document.querySelector('.cta');
        if (btn) {
            // รีเซ็ตปุ่มให้กลับมาใช้งานได้
            btn.disabled = false;
            // คืนค่าข้อความเดิมของปุ่ม (ต้องตรงกับใน HTML ของคุณ)
            btn.innerHTML = `
                <span class="cta-ic" aria-hidden="true"><i class="fas fa-map-location-dot"></i></span>
                เลือกห้องเรียน
            `;
        }
    }
});