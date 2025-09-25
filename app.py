from flask import Flask, Response, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import os
import time
from ultralytics import YOLO
import threading

app = Flask(__name__)
CORS(app)

# Global variables to control the camera thread
camera_thread = None
is_camera_running = False
cap = None

# Load your trained YOLO model
model = YOLO("crack.pt")

output_folder = "detected_cracks"
os.makedirs(output_folder, exist_ok=True)

def generate_frames():
    """Generator function to yield video frames."""
    global cap
    frame_count = 0

    while is_camera_running:
        if cap is not None:
            ret, frame = cap.read()
            if not ret:
                print("❌ Failed to grab frame")
                break

            # Run YOLO inference on the frame
            results = model(frame, stream=True, classes=0, conf=0.72)

            crack_detected = False
            for r in results:
                frame = r.plot()
                if len(r.boxes) > 0:
                    crack_detected = True

            if crack_detected:
                timestamp = time.strftime("%Y%m%d-%H%M%S")
                filename = f"frame_{timestamp}_{frame_count}.jpg"
                cv2.imwrite(os.path.join(output_folder, filename), frame)
                print(f"✅ Crack detected! Frame saved as {filename}")
                frame_count += 1

            # Encode the frame in JPEG format
            (flag, encodedImage) = cv2.imencode(".jpg", frame)
            if not flag:
                continue

            # Yield the output frame in the byte format
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' +
                   bytearray(encodedImage) + b'\r\n')

@app.route('/start_camera', methods=['POST'])
def start_camera():
    """Starts the camera and the detection process."""
    global camera_thread, is_camera_running, cap

    if not is_camera_running:
        is_camera_running = True
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return jsonify({"error": "Cannot open camera"}), 500

        camera_thread = threading.Thread(target=generate_frames)
        camera_thread.start()
        return jsonify({"message": "Camera started successfully"})
    return jsonify({"message": "Camera is already running"})

@app.route('/stop_camera', methods=['POST'])
def stop_camera():
    """Stops the camera and the detection process."""
    global is_camera_running, cap
    if is_camera_running:
        is_camera_running = False
        if camera_thread is not None:
            camera_thread.join()
        if cap is not None:
            cap.release()
            cap = None
    return jsonify({"message": "Camera stopped successfully"})

@app.route('/video_feed')
def video_feed():
    """Route to stream the video feed."""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/detected_images', methods=['GET'])
def get_detected_images():
    """Route to get the list of detected crack images."""
    try:
        # Sort files by modification time, newest first
        files = sorted(
            [f for f in os.listdir(output_folder) if f.endswith('.jpg')],
            key=lambda x: os.path.getmtime(os.path.join(output_folder, x)),
            reverse=True
        )
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/detected_cracks/<path:filename>')
def serve_detected_image(filename):
    """Route to serve a specific detected image."""
    return send_from_directory(output_folder, filename)

if __name__ == '__main__':
    app.run(debug=True, threaded=True, use_reloader=False)