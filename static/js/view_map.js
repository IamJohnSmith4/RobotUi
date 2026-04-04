window.addEventListener('DOMContentLoaded', () => {
    const startNode = typeof START_ROOM !== 'undefined' ? START_ROOM : "HOME";
    const destNode = typeof DEST_ROOM !== 'undefined' ? DEST_ROOM : "";
    const svgLayer = document.getElementById('route-layer');

    // 📍 1. พิกัดศูนย์กลางของแต่ละห้อง (สำหรับวางจุดวงกลม)
    const ROOMS = {
        "HOME":  { x: 13, y: 99 },
        "1301":  { x: 29, y: 65 },
        "1302":  { x: 29, y: 47 },
        "1303A": { x: 41, y: 17 },
        "1303B": { x: 41, y: -3 },
        "1304A": { x: 59, y: -3 },
        "1304B": { x: 59, y: 17 },
        "1305":  { x: 71, y: 43 },
        "1306":  { x: 71, y: 58 },
        "1307":  { x: 71, y: 73 },
        "1308":  { x: 71, y: 87 }
    };

    const MANUAL_PATHS = {
        // HOME to ...
        "HOME-1301": [ {x: 29, y: 99 } ],
        "HOME-1302": [ {x: 29, y: 99 } ],
        "HOME-1303A": [ {x: 29, y: 99}, {x: 29, y: 30}, {x: 41, y: 30} ],
        "HOME-1303B": [ {x: 29, y: 99}, {x: 29, y: 30}, {x: 41, y: 30} ],
        "HOME-1304A": [ {x: 29, y: 99}, {x: 29, y: 30}, {x: 59, y: 30} ],
        "HOME-1304B": [ {x: 29, y: 99}, {x: 29, y: 30}, {x: 59, y: 30} ], 
        "HOME-1305": [ {x: 71, y: 99.5} ],
        "HOME-1306": [ {x: 71, y: 99.5} ],
        "HOME-1307": [ {x: 71, y: 99.5} ],
        "HOME-1308": [ {x: 71, y: 99.5} ],
        
        // 1301 to ...
        "1301-1302": [ {x: 29, y: 62} ],
        "1301-1303A": [ {x: 29, y: 62}, {x: 29, y: 30}, {x: 41, y: 30} ],
        "1301-1303B": [ {x: 29, y: 62}, {x: 29, y: 30}, {x: 41, y: 30} ],
        "1301-1304A": [ {x: 29, y: 62}, {x: 29, y: 30}, {x: 59, y: 30} ],
        "1301-1304B": [ {x: 29, y: 62}, {x: 29, y: 30}, {x: 59, y: 30} ],
        "1301-1305": [ {x: 29, y: 62}, {x: 29, y: 30}, {x: 71, y: 30} ],
        "1301-1306": [ {x: 29, y: 62}, {x: 29, y: 30}, {x: 71, y: 30} ],
        "1301-1307": [ {x: 29, y: 62}, {x: 29, y: 30}, {x: 71, y: 30} ],
        "1301-1308": [ {x: 29, y: 62}, {x: 29, y: 30}, {x: 71, y: 30} ],

        // 1302 to ...
        "1302-1301": [ {x: 29, y: 62} ],
        "1302-1303A": [ {x: 29, y: 30}, {x: 41, y: 30} ],
        "1302-1303B": [ {x: 29, y: 30}, {x: 41, y: 30} ],
        "1302-1304A": [ {x: 29, y: 30}, {x: 59, y: 30} ],
        "1302-1304B": [ {x: 29, y: 30}, {x: 59, y: 30} ],
        "1302-1305": [ {x: 29, y: 30}, {x: 71, y: 30} ],
        "1302-1306": [ {x: 29, y: 30}, {x: 71, y: 30} ],
        "1302-1307": [ {x: 29, y: 30}, {x: 71, y: 30} ],
        "1302-1308": [ {x: 29, y: 30}, {x: 71, y: 30} ],
        
        // 1303A to ...
        "1303A-1303B": [ {x: 41, y: 17} ],
        "1303A-1304A": [ {x: 41, y: -3} ],
        "1303A-1304B": [ {x: 59, y: 17} ],
        "1303A-1305": [ {x: 41, y: 30}, {x: 71, y: 30} ],
        "1303A-1306": [ {x: 41, y: 30}, {x: 71, y: 30} ],
        "1303A-1307": [ {x: 41, y: 30}, {x: 71, y: 30} ],
        "1303A-1308": [ {x: 41, y: 30}, {x: 71, y: 30} ],

        // 1303B to ...
        "1303B-1304B": [ {x: 59, y: -3} ],
        "1303B-1305": [ {x: 41, y: 30}, {x: 71, y: 30} ],
        "1303B-1306": [ {x: 41, y: 30}, {x: 71, y: 30} ],
        "1303B-1307": [ {x: 41, y: 30}, {x: 71, y: 30} ],
        "1303B-1308": [ {x: 41, y: 30}, {x: 71, y: 30} ],

        // 1304A to ...
        "1304A-1305": [ {x: 59, y: 30}, {x: 71, y: 30} ],
        "1304A-1306": [ {x: 59, y: 30}, {x: 71, y: 30} ],
        "1304A-1307": [ {x: 59, y: 30}, {x: 71, y: 30} ],
        "1304A-1308": [ {x: 59, y: 30}, {x: 71, y: 30} ],

        // 1304B to ...
        "1304B-1305": [ {x: 59, y: 30}, {x: 71, y: 30} ],
        "1304B-1306": [ {x: 59, y: 30}, {x: 71, y: 30} ],
        "1304B-1307": [ {x: 59, y: 30}, {x: 71, y: 30} ],
        "1304B-1308": [ {x: 59, y: 30}, {x: 71, y: 30} ],

    };

    if (ROOMS[startNode] && ROOMS[destNode] && svgLayer) {
        let pathData = [];
        pathData.push(ROOMS[startNode]); // จุดเริ่ม (ในห้อง)

        // ตรวจสอบว่ามีการตั้งค่าเส้นทางพิเศษไว้ไหม
        const routeKey = `${startNode}-${destNode}`;
        const reverseKey = `${destNode}-${startNode}`; // สำหรับขา กลับ

        if (MANUAL_PATHS[routeKey]) {
            // ใช้เส้นทางที่คุณกำหนดเอง
            pathData.push(...MANUAL_PATHS[routeKey]);
        } else if (MANUAL_PATHS[reverseKey]) {
            // ถ้ามีขาไป แต่ไม่มีขากลับ ให้ใช้จุดเดิมแต่ย้อนลำดับ
            const revPath = [...MANUAL_PATHS[reverseKey]].reverse();
            pathData.push(...revPath);
        }

        pathData.push(ROOMS[destNode]); // จุดจบ (ในห้อง)

        // --- วาดเส้นประ ---
        let d = `M ${pathData[0].x} ${pathData[0].y} `;
        for (let i = 1; i < pathData.length; i++) {
            d += `L ${pathData[i].x} ${pathData[i].y} `;
        }

        const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.setAttribute("d", d);
        pathEl.setAttribute("stroke", "#00E5FF");
        pathEl.setAttribute("stroke-width", "0.8");
        pathEl.setAttribute("fill", "none");
        pathEl.setAttribute("stroke-dasharray", "1, 1");
        pathEl.setAttribute("stroke-linejoin", "round");
        pathEl.setAttribute("stroke-linecap", "round");
        svgLayer.appendChild(pathEl);

        // --- ฟังก์ชันวาดจุด (ดึงโค้ดที่คุณแก้ล่าสุดมาใช้) ---
        function drawNode(x, y, label, isDest) {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x); circle.setAttribute("cy", y);
            circle.setAttribute("r", "1.3"); // ขนาดจุดวงกลม
            circle.setAttribute("fill", isDest ? "#FFCC00" : "#00FF88");
            svgLayer.appendChild(circle);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x); text.setAttribute("y", y - 3);
            text.setAttribute("text-anchor", "middle");
            text.style.fontSize = "2.8px";
            text.style.fontWeight = "900";
            text.style.fontFamily = "'Orbitron', sans-serif";
            text.textContent = label === "HOME" ? "(HOME)" : label;

            if (!isDest) {
                text.setAttribute("fill", "#00FF88");
                text.setAttribute("stroke", "#000000");
                text.setAttribute("stroke-width", "0.6");
                text.setAttribute("paint-order", "stroke fill");
            } else {
                text.setAttribute("fill", "#000000");
                text.setAttribute("stroke", "#ffffff");
                text.setAttribute("stroke-width", "0.1");
                text.setAttribute("paint-order", "stroke fill");
            }
            svgLayer.appendChild(text);
        }

        drawNode(ROOMS[startNode].x, ROOMS[startNode].y, startNode, false);
        drawNode(ROOMS[destNode].x, ROOMS[destNode].y, destNode, true);
    }
});
