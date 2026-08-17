from fastapi import APIRouter

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
    },

    {
        "id": 3,
        "name": "Sitabardi",
        "latitude": 21.1458,
        "longitude": 79.0882
    }

]


@router.get("/")
def get_locations():

    return LOCATIONS 


def get_location_by_id(location_id: int):

    for location in LOCATIONS:

        if location["id"] == location_id:

            return location

    return None
