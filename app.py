from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# หน้าแรก (Welcome Screen)
@app.route('/')
def index():
    return render_template('index.html')

# หน้าเลือกห้อง (Room Selection)
@app.route('/room')
def room():
    return render_template('room.html')

# หน้าแสดงการนำทางและแผนที่ (Navigation Screen)
@app.route('/navigating')
def navigating():
    # รับชื่อห้องจาก URL เช่น /navigating?room=1304a
    room_id = request.args.get('room', '...') 
    return render_template('navigating.html', room_id=room_id)
# --- ส่วนของ API สำหรับคุยกับ ROS (Kobuki / Kinect) ---

@app.route('/api/move_to/<room_id>')
def move_to(room_id):
    print(f"กำลังสั่งหุ่นยนต์ Kobuki ไปที่ห้อง: {room_id}")
    
    # ตรงนี้คือจุดที่คุณจะใส่โค้ด ROS (rospy) ในอนาคต
    # เช่นการส่ง Goal ไปยัง move_base
    
    return jsonify({
        "status": "success", 
        "message": f"Robot is moving to {room_id}",
        "target": room_id
    })

if __name__ == '__main__':
    # ปรับเป็น host='0.0.0.0' เพื่อให้เครื่องอื่นหรือตัวหุ่นยนต์เข้าถึงได้ผ่าน IP
    app.run(debug=True, host='0.0.0.0', port=5000)