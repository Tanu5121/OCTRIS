from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
from deployment_engine import PoliceDeploymentEngine

app = Flask(__name__)

CORS(app, origins=["http://localhost:5173"])

socketio = SocketIO(app, cors_allowed_origins="*")

engine = PoliceDeploymentEngine()

engine.register_location("loc_001", "Sitabuldi", 21.1458, 79.0882)
engine.register_location("loc_002", "Nagpur Airport", 21.0922, 79.0471)

engine.register_police_unit(
    "P-01", "P-01",
    status="DEPLOYED",
    lat=21.145,
    lon=79.090
)

engine.register_police_unit(
    "P-02", "P-02",
    status="BUSY",
    lat=21.135,
    lon=79.080
)

engine.register_police_unit(
    "P-03", "P-03",
    status="AVAILABLE",
    lat=21.125,
    lon=79.100
)

engine.register_police_unit(
    "P-04", "P-04",
    status="OFFLINE",
    lat=21.155,
    lon=79.075
)


@app.route('/api/police/units', methods=['GET'])
def get_police_units():
    return jsonify({
        "success": True,
        "units": list(engine.police_units.values())
    })


@app.route('/api/deployment/recommend/<location_id>', methods=['GET'])
def get_recommendation(location_id):
    result = engine.generate_recommendation(location_id)
    return jsonify(result)


@app.route('/api/deployment/accept', methods=['POST'])
def accept_deployment():
    data = request.json or {}

    res = engine.accept_recommendation(
        data.get("recommendation_id")
    )

    if res.get("success"):
        socketio.emit(
            "POLICE_UNIT_UPDATED",
            res["unit"]
        )

    return jsonify(res)


@app.route('/api/deployment/redeploy', methods=['POST'])
def execute_redeployment():
    data = request.json or {}

    res = engine.execute_redeployment(
        data.get("redeployment_id")
    )

    if res.get("success"):
        socketio.emit(
            "DEPLOYMENT_UPDATED",
            res["unit"]
        )

    return jsonify(res)


if __name__ == '__main__':
    socketio.run(
        app,
        port=5002,
        debug=True
    )
    