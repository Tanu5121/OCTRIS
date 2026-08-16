from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from deployment_engine import PoliceDeploymentEngine

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
engine = PoliceDeploymentEngine()

engine.register_location("loc_001", "MG Road Junction", 19.076, 72.8777)
engine.register_location("loc_002", "Airport Junction", 19.090, 72.8600)

engine.register_police_unit("P-01", "P-01", status="DEPLOYED", lat=19.070, lon=72.870)
engine.register_police_unit("P-02", "P-02", status="BUSY", lat=19.071, lon=72.871)
engine.register_police_unit("P-03", "P-03", status="AVAILABLE", lat=19.072, lon=72.872)
engine.register_police_unit("P-04", "P-04", status="OFFLINE", lat=19.073, lon=72.873)

@app.route('/api/deployment/recommend/<location_id>', methods=['GET'])
def get_recommendation(location_id):
    result = engine.generate_recommendation(location_id)
    return jsonify(result)

@app.route('/api/deployment/accept', methods=['POST'])
def accept_deployment():
    data = request.json or {}
    res = engine.accept_recommendation(data.get("recommendation_id"))
    if res.get("success"):
        socketio.emit("POLICE_UNIT_UPDATED", res["unit"])
    return jsonify(res)

@app.route('/api/deployment/redeploy', methods=['POST'])
def execute_redeployment():
    data = request.json or {}
    res = engine.execute_redeployment(data.get("redeployment_id"))
    if res.get("success"):
        socketio.emit("DEPLOYMENT_UPDATED", res["unit"])
    return jsonify(res)

if __name__ == '__main__':
    socketio.run(app, port=5002, debug=True)