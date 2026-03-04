import cv2
import numpy as np
import time
import threading
from flask import Flask, render_template, Response, request, jsonify


# --- [CONFIG & DATA] ---
# ข้อมูลรายละเอียดแต่ละห้อง
ROOM_DATA = {
    "1301": {
        "dept": "CCE",
        "subjects": "คอมพิวเตอร์และการจำลอง, วงจรไฟฟ้า, การออกแบบวงจรย่านความถี่วิทยุและไมโครเวฟ",
        "desc": "ห้องปฏิบัติการคอมพิวเตอร์และคลื่นความถี่สูง",
        "youtube_id": "UXl1GCrkAag",
        "dub": "ขณะนี้เราเดินทางมาถึงห้อง EN 1301 ห้องปฏิบัติการคอมพิวเตอร์และการจำลองแล้วครับ ห้องนี้ใช้สำหรับการเรียนรู้ด้านการเขียนโปรแกรม การจำลองระบบทางวิศวกรรม และการวิเคราะห์ข้อมูลด้วยซอฟต์แวร์ที่ทันสมัย เพื่อให้นักศึกษาได้ฝึกฝนทักษะดิจิทัลที่จำเป็นสำหรับวิศวกรยุคใหม่ครับ"
    },

    "1302": {
        "dept": "EL",
        "subjects": "เครื่องมือวัดและการวัดทางไฟฟ้า, วิศวกรรมความปลอดภัย, การวิเคราะห์วงจรไฟฟ้า",
        "desc": "ห้องปฏิบัติการวงจรไฟฟ้าและอิเล็กทรอนิกส์",
        "youtube_id": "QJNFH0FFYZ0",
        "dub": "ตอนนี้เราเดินทางมาถึงห้อง EN 1302 ห้องปฏิบัติการวงจรไฟฟ้าและอิเล็กทรอนิกส์แล้วครับ ห้องนี้ใช้สำหรับการเรียนรู้พื้นฐานวิศวกรรมไฟฟ้า และการวิเคราะห์วงจร โดยใช้เครื่องมือวัดที่ทันสมัย เพื่อเสริมสร้างความเข้าใจเชิงปฏิบัติให้กับนักศึกษาครับ"
    },

    "1303b": {
        "dept": "EL",
        "subjects": "ไมโครคอนโทรลเลอร์, ระบบสมองกลฝังตัว, ระบบอัดประจุยานยนต์ไฟฟ้า",
        "desc": "ศูนย์นวัตกรรมสมองกลและยานยนต์ไฟฟ้า",
        "youtube_id": "kauhPiQdd6A",
        "dub": "ยินดีต้อนรับสู่ห้อง EN 1303B ครับ ห้องนี้เป็นศูนย์นวัตกรรมด้านระบบสมองกลและยานยนต์ไฟฟ้า ใช้สำหรับการทดสอบระบบควบคุมมอเตอร์ และอุปกรณ์ไฟฟ้ากำลัง โดยนักศึกษาจะได้ลงมือปฏิบัติจริงกับชุดสาธิตและเครื่องมือวัดที่ได้มาตรฐานครับ"
    },

    "1304a": {
        "dept": "CCE",
        "subjects": "ไมโครคอนโทรลเลอร์, วงจรดิจิทัลและลอจิก, ระบบฐานข้อมูล, PLC, การสื่อสารข้อมูล",
        "desc": "ห้องปฏิบัติการเครือข่ายและการสื่อสาร (A)",
        "youtube_id": "lyo8H_Bezns",
        "dub": "ยินดีต้อนรับสู่ห้อง EN 1304A ครับ ห้องปฏิบัติการเครือข่ายและการสื่อสาร ห้องนี้ใช้สำหรับการเรียนรู้ระบบเครือข่ายคอมพิวเตอร์ การรับส่งข้อมูล และเทคโนโลยีการสื่อสารไร้สาย เพื่อเตรียมความพร้อมสู่การเป็นผู้เชี่ยวชาญด้านไอทีในอนาคตครับ"
    },

    "1304b": {
        "dept": "CCE",
        "subjects": "การเขียนโปรแกรมเชิงวัตถุ, ระบบฐานข้อมูล, ปัญญาประดิษฐ์, Machine Learning",
        "desc": "ห้องปฏิบัติการคอมพิวเตอร์และ AI (B)",
        "youtube_id": "AbByLJ_iKPc",
        "dub": "ยินดีต้อนรับสู่ห้อง EN 1304B ครับ ห้องปฏิบัติการคอมพิวเตอร์และปัญญาประดิษฐ์ ที่นี่เป็นศูนย์รวมการเรียนรู้ด้านการพัฒนาอัลกอริทึม และการสร้างโมเดลปัญญาประดิษฐ์ เพื่อให้นักศึกษาได้สร้างสรรค์นวัตกรรมที่ขับเคลื่อนเทคโนโลยีแห่งอนาคตครับ"
    },

    "1305": {
        "dept": "CCE",
        "subjects": "ระบบการสื่อสารและเครือข่ายไร้สาย, โครงงานวิศวกรรม CCE",
        "desc": "ห้องปฏิบัติการการสื่อสารและเครือข่ายไร้สาย",
        "youtube_id": "uqnxToTdPy8",
        "dub": "ขณะนี้เราเดินทางมาถึงห้อง EN 1305 ห้องปฏิบัติการการสื่อสารและเครือข่ายไร้สายครับ ห้องนี้ใช้สำหรับการเรียนรู้และวิจัยด้านระบบการสื่อสารผ่านคลื่นวิทยุ เทคโนโลยีเครือข่าย และระบบสื่อสารไร้สายความเร็วสูง เพื่อรองรับการเชื่อมต่อในยุคไอโอทีครับ"
    },

    "1307": {
        "dept": "EL",
        "subjects": "คณิตศาสตร์วิศวกรรม, อากาศยานไร้คนขับ (Drone), วิศวกรรมการผลิต EV",
        "desc": "ห้องปฏิบัติการวิศวกรรมการผลิตและหุ่นยนต์",
        "youtube_id": "ULZhKyz1tZY",
        "dub": "ยินดีต้อนรับสู่ห้อง EN 1307 ครับ ห้องปฏิบัติการวิศวกรรมการผลิตและหุ่นยนต์ ที่นี่เป็นศูนย์กลางการเรียนรู้ด้านระบบอัตโนมัติ การออกแบบหุ่นยนต์อุตสาหกรรม และเทคโนโลยีการผลิตขั้นสูง เพื่อเตรียมความพร้อมสู่ยุคอุตสาหกรรม 4.0 อย่างมืออาชีพครับ"
    }
}

app = Flask(__name__)
# --- [ROS PREPARATION / MOCK DATA] ---
latest_map_data = None 

def generate_map_frame():
    """ฟังก์ชันจำลองแผนที่สำหรับการ Feed ไปยังหน้า UI"""
    while True:
        if latest_map_data is not None:
            img = latest_map_data.copy()
        else:
            img = np.zeros((500, 500, 3), dtype=np.uint8)
            for i in range(0, 500, 50):
                cv2.line(img, (i, 0), (i, 500), (40, 40, 40), 1)
                cv2.line(img, (0, i), (500, i), (40, 40, 40), 1)
            t = time.time()
            x, y = int(250 + 80*np.cos(t*0.4)), int(250 + 80*np.sin(t*0.4))
            cv2.circle(img, (x, y), 12, (0, 229, 255), -1) 
            cv2.putText(img, "UDRU ROBOT", (x+15, y+5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 229, 255), 1)

        ret, buffer = cv2.imencode('.jpg', img)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# --- [PAGES ROUTES] ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/room')
def room():
    return render_template('room.html')

@app.route('/view_map')
def view_map():
    room_id = request.args.get('room', '...')
    return render_template('view_map.html', room_id=room_id)

@app.route('/arrived')
def arrived():
    room_id = request.args.get('room', '...')
    return render_template('arrived.html', room_id=room_id)

# แก้ไขฟังก์ชันนำทาง: รวม navigatng และ navigate เข้าด้วยกันเพื่อลดความซับซ้อน
@app.route('/navigate/<room_id>')
def navigate_to_room(room_id):
    """ฟังก์ชันหลักในการแสดงหน้าจอนำทาง พร้อมวิดีโอและข้อมูลห้อง"""
    # 1. ดึงข้อมูลจาก ROOM_DATA
    info = ROOM_DATA.get(room_id, {
        "subjects": "ไม่ระบุวิชาเรียน", 
        "desc": "ห้องปฏิบัติการ",
        "dept": "CCE/EL"
    })
    
    # 2. กำหนดชื่อไฟล์วิดีโอให้ตรงกับ roomId (เช่น EN1302.mp4)
    video_filename = f"EN{room_id}.mp4" 
    
    # 3. ส่งข้อมูลไปยัง navigation.html
    return render_template('navigating.html', 
                           room_id=room_id, 
                           video_file=video_filename, 
                           info=info)

# --- [API ROUTES] ---

@app.route('/api/ble_status')
def ble_status():
    return jsonify(get_latest_tags())

@app.route('/api/map_feed')
def map_feed():
    return Response(generate_map_frame(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/move_to/<room_id>')
def api_move_to(room_id):
    """API สำหรับสั่งให้หุ่นยนต์เริ่มเคลื่อนที่"""
    print(f"[ROS CMD] Sending robot to: {room_id}")
    # ในอนาคตใส่คำสั่งส่ง Goal ไปยัง ROS Navigation Stack ที่นี่
    return jsonify({"status": "moving", "target": room_id})

# --- [MAIN RUN] ---
if __name__ == '__main__':
    # รัน Flask App บนพอร์ต 5000
    app.run(debug=True, host='0.0.0.0', port=5000)