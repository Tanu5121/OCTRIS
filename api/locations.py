from fastapi import APIRouter, HTTPException


router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)


LOCATIONS = [

    {
        "id": 1,
        "name": "Main Road",
        "latitude": 21.1458,
        "longitude": 79.0882
    },

    {
        "id": 2,
        "name": "University Road",
        "latitude": 21.1490,
        "longitude": 79.0800
    }

]


# GET ALL LOCATIONS
@router.get("/")
def get_locations():

    return LOCATIONS 


# GET LOCATION BY ID
@router.get("/{location_id}")
def get_location(location_id: int):

    location = get_location_by_id(
        location_id
    )

    if location is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    return location


# INTERNAL FUNCTION
def get_location_by_id(location_id: int):

    for location in LOCATIONS:

        if location["id"] == location_id:

            return location

    return None
