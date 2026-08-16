import math
from datetime import datetime

class PoliceDeploymentEngine:
    def __init__(self):
        self.police_units = {}       # unit_id -> unit dict
        self.locations = {}          # location_id -> location dict
        self.recommendations = {}    # rec_id -> recommendation dict
        self.deployment_history = [] # audit log of all events

    def register_location(self, loc_id, name, lat, lon):
        self.locations[loc_id] = {
            "id": loc_id,
            "name": name,
            "latitude": lat,
            "longitude": lon
        }

    def register_police_unit(self, unit_id, unit_name, status="AVAILABLE", lat=0.0, lon=0.0):
        self.police_units[unit_id] = {
            "id": unit_id,
            "unit_name": unit_name,
            "status": status,
            "latitude": lat,
            "longitude": lon,
            "assigned_location_id": None
        }

    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        return math.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)

    def generate_recommendation(self, location_id):
        if location_id not in self.locations:
            return {"success": False, "reason": f"Location {location_id} does not exist."}

        target_loc = self.locations[location_id]
        available_units = [u for u in self.police_units.values() if u["status"] == "AVAILABLE"]

        if not available_units:
            return {"success": False, "reason": "No available police units remaining."}

        nearest_unit = min(
            available_units,
            key=lambda u: self._calculate_distance(u["latitude"], u["longitude"], target_loc["latitude"], target_loc["longitude"])
        )

        rec_id = f"REC-{len(self.recommendations) + 101}"
        rec_data = {
            "id": rec_id,
            "location_id": location_id,
            "recommended_unit_id": nearest_unit["id"],
            "reason": f"Unit {nearest_unit['id']} is the nearest available unit.",
            "status": "PENDING"
        }
        self.recommendations[rec_id] = rec_data
        return {"success": True, "recommendation": rec_data}

    def validate_deployment(self, unit_id, location_id, is_redeployment=False):
        if unit_id not in self.police_units:
            return False, "Nonexistent unit cannot be deployed."
        if location_id not in self.locations:
            return False, "Nonexistent location cannot be targeted."

        unit = self.police_units[unit_id]

        if unit["status"] == "OFFLINE":
            return False, f"Unit {unit_id} is OFFLINE and cannot be deployed."

        if unit["status"] == "BUSY":
            return False, f"Unit {unit_id} is BUSY on another assignment."

        if unit["status"] == "DEPLOYED" and unit["assigned_location_id"] == location_id:
            return False, f"Unit {unit_id} is already deployed to this location."

        if unit["status"] == "DEPLOYED" and not is_redeployment:
            return False, f"Unit {unit_id} is currently DEPLOYED. Must use redeployment action."

        return True, "Validation successful."

    def accept_recommendation(self, rec_id):
        if rec_id not in self.recommendations:
            return {"success": False, "reason": "Recommendation ID not found."}

        rec = self.recommendations[rec_id]
        unit_id = rec["recommended_unit_id"]
        loc_id = rec["location_id"]

        is_valid, reason = self.validate_deployment(unit_id, loc_id)
        if not is_valid:
            rec["status"] = "FAILED"
            return {"success": False, "reason": reason}

        self.police_units[unit_id]["status"] = "DEPLOYED"
        self.police_units[unit_id]["assigned_location_id"] = loc_id
        rec["status"] = "ACCEPTED"

        self._log_history("DEPLOYMENT_ACCEPTED", unit_id, loc_id)
        return {"success": True, "event": "POLICE_UNIT_UPDATED", "unit": self.police_units[unit_id]}

    def modify_recommendation(self, rec_id, new_unit_id):
        if rec_id not in self.recommendations:
            return {"success": False, "reason": "Recommendation ID not found."}

        rec = self.recommendations[rec_id]
        loc_id = rec["location_id"]

        is_valid, reason = self.validate_deployment(new_unit_id, loc_id)
        if not is_valid:
            return {"success": False, "reason": f"Deployment failed: {reason}"}

        self.police_units[new_unit_id]["status"] = "DEPLOYED"
        self.police_units[new_unit_id]["assigned_location_id"] = loc_id
        rec["recommended_unit_id"] = new_unit_id
        rec["status"] = "MODIFIED_AND_ACCEPTED"

        self._log_history("DEPLOYMENT_MODIFIED", new_unit_id, loc_id)
        return {"success": True, "event": "POLICE_UNIT_UPDATED", "unit": self.police_units[new_unit_id]}

    def reject_recommendation(self, rec_id):
        if rec_id not in self.recommendations:
            return {"success": False, "reason": "Recommendation ID not found."}

        self.recommendations[rec_id]["status"] = "REJECTED"
        self._log_history("DEPLOYMENT_REJECTED", self.recommendations[rec_id]["recommended_unit_id"], self.recommendations[rec_id]["location_id"])
        return {"success": True, "message": "Deployment recommendation rejected."}

    def recommend_redeployment(self, unit_id, from_loc_id, to_loc_id, reason_str):
        unit = self.police_units.get(unit_id)
        if not unit or unit["status"] != "DEPLOYED":
            return {"success": False, "reason": "Unit is not currently deployed."}

        rec_id = f"REDEP-{len(self.recommendations) + 101}"
        rec_data = {
            "id": rec_id,
            "unit_id": unit_id,
            "from_location_id": from_loc_id,
            "to_location_id": to_loc_id,
            "reason": reason_str,
            "type": "REDEPLOYMENT",
            "status": "PENDING"
        }
        self.recommendations[rec_id] = rec_data
        return {"success": True, "recommendation": rec_data}

    def execute_redeployment(self, redep_rec_id):
        rec = self.recommendations.get(redep_rec_id)
        if not rec or rec.get("type") != "REDEPLOYMENT":
            return {"success": False, "reason": "Invalid redeployment record."}

        unit_id = rec["unit_id"]
        to_loc_id = rec["to_location_id"]

        is_valid, reason = self.validate_deployment(unit_id, to_loc_id, is_redeployment=True)
        if not is_valid:
            rec["status"] = "FAILED"
            return {"success": False, "reason": reason}

        self.police_units[unit_id]["assigned_location_id"] = to_loc_id
        rec["status"] = "ACCEPTED"

        self._log_history("REDEPLOYMENT_EXECUTED", unit_id, to_loc_id)
        return {"success": True, "event": "DEPLOYMENT_UPDATED", "unit": self.police_units[unit_id]}

    def _log_history(self, event_type, unit_id, location_id):
        self.deployment_history.append({
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "event": event_type,
            "unit_id": unit_id,
            "location_id": location_id
        })