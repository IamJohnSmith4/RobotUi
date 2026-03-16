import tkinter as tk
import requests # ต้องมี Library นี้ (ลงด้วย pip install requests)
import threading

class StationGUI:
    def __init__(self, root, robot_ip):
        self.root = root
        self.robot_ip = robot_ip # IP ของ Ubuntu
        self.root.title("Robot Station Control (Remote)")
        self.root.geometry("500x600")

        self.current_station = 1
        self.is_busy = False

        self.title_label = tk.Label(root, text="Current Station: 1 (HOME)", font=("Arial", 20))
        self.title_label.pack(pady=20)

        self.status_label = tk.Label(root, text="READY", fg="green", font=("Arial", 14))
        self.status_label.pack(pady=5)

        self.button_frame = tk.Frame(root)
        self.button_frame.pack(pady=20)

        self.update_screen()

    def update_screen(self):
        self.title_label.config(text=f"Current Station: {self.current_station}" if self.current_station != 1 else "Current Station: 1 (HOME)")
        for widget in self.button_frame.winfo_children():
            widget.destroy()

        if not self.is_busy:
            stations = [s for s in range(1, 12) if s != self.current_station]
            row, col = 0, 0
            for station in stations:
                btn = tk.Button(self.button_frame, text=f"Go to {station}", width=12, height=2,
                                command=lambda s=station: self.start_move_thread(s))
                btn.grid(row=row, column=col, padx=5, pady=5)
                col += 1
                if col == 3: col, row = 0, row + 1

    def start_move_thread(self, target):
        # ใช้ Thread เพื่อไม่ให้หน้าจอ GUI ค้างระหว่างหุ่นเดิน
        threading.Thread(target=self.go_to_station, args=(target,), daemon=True).start()

    def go_to_station(self, target):
        self.is_busy = True
        self.status_label.config(text="MOVING...", fg="orange")
        self.update_screen()

        try:
            # ส่งคำสั่งไปยัง Ubuntu
            url = f"http://{self.robot_ip}:5000/command"
            response = requests.post(url, json={"start": self.current_station, "target": target}, timeout=300)
            
            if response.status_code == 200:
                self.current_station = target
                self.status_label.config(text="READY", fg="green")
            else:
                self.status_label.config(text="SERVER ERROR", fg="red")
        except Exception as e:
            self.status_label.config(text="CONNECTION FAILED", fg="red")
            print(f"Error: {e}")

        self.is_busy = False
        self.update_screen()

if __name__ == "__main__":
    root = tk.Tk()
    # เปลี่ยน "192.168.x.x" เป็น IP จริงของหุ่นยนต์
    app = StationGUI(root, "192.168.1.46") 
    root.mainloop()