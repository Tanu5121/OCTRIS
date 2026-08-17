from ultralytics import YOLO


# Load model once
model = YOLO("yolo11n.pt")


TRAFFIC_CLASSES = {
    "car",
    "motorcycle",
    "bus",
    "truck",
    "bicycle",
    "person"
}


def detect_traffic(image_path):

    results = model(
        image_path,
        conf=0.20,
        imgsz=1280
    )

    counts = {
        "car": 0,
        "motorcycle": 0,
        "bus": 0,
        "truck": 0,
        "bicycle": 0,
        "person": 0
    }

    detections = []

    for result in results:

        for box in result.boxes:

            class_id = int(box.cls[0])

            class_name = model.names[class_id]

            confidence = float(box.conf[0])

            if class_name not in TRAFFIC_CLASSES:
                continue

            counts[class_name] += 1

            detections.append({
                "class": class_name,
                "confidence": round(confidence, 2)
            })

    total_vehicles = (
        counts["car"]
        + counts["motorcycle"]
        + counts["bus"]
        + counts["truck"]
        + counts["bicycle"]
    )

    return {
        "counts": counts,
        "total_vehicles": total_vehicles,
        "detections": detections
    }