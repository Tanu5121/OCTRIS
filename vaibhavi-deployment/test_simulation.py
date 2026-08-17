from deployment_engine import PoliceDeploymentEngine

def run_hackathon_demo():
    engine = PoliceDeploymentEngine()

    engine.register_location("loc_001", "MG Road Junction", 19.076, 72.8777)
    engine.register_location("loc_002", "Airport Junction", 19.090, 72.8600)
    engine.register_police_unit("P-03", "P-03", status="AVAILABLE", lat=19.072, lon=72.872)
    engine.register_police_unit("P-04", "P-04", status="OFFLINE", lat=19.073, lon=72.873)

    print("\n--- TEST 1: Generate Recommendation ---")
    rec = engine.generate_recommendation("loc_001")
    print("Result:", rec)

    print("\n--- TEST 2: Accept Recommendation ---")
    rec_id = rec["recommendation"]["id"]
    accept = engine.accept_recommendation(rec_id)
    print("Result:", accept)

    print("\n--- TEST 3: Validate Illegal OFFLINE Deployment ---")
    is_valid, reason = engine.validate_deployment("P-04", "loc_001")
    print("Is Valid:", is_valid, "| Reason:", reason)

    print("\n--- TEST 4: Execute Redeployment ---")
    redep = engine.recommend_redeployment("P-03", "loc_001", "loc_002", "High risk score at Airport Junction")
    redep_exec = engine.execute_redeployment(redep["recommendation"]["id"])
    print("Redeployment Executed:", redep_exec)

if __name__ == "__main__":
    run_hackathon_demo()