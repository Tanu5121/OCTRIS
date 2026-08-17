from ultralytics import YOLO

print("Loading YOLO...")

model = YOLO("yolo11n.pt")

print("YOLO model loaded successfully!")
print("Available classes:")
print(model.names)