# Vaibhavi - Police Deployment & Redeployment Engine

## API Endpoints (For Yashaswee & Aishwarya)
- `GET /api/deployment/recommend/<location_id>`: Generates deployment recommendation.
- `POST /api/deployment/accept`: Accepts deployment recommendation.
- `POST /api/deployment/redeploy`: Executes unit redeployment.

## Real-Time WebSocket Events Emitted (For Sanvi & Tanushree)
- `POLICE_UNIT_UPDATED`: Sent when a police unit is assigned or modified.
- `DEPLOYMENT_UPDATED`: Sent when a unit is redeployed to a new location.