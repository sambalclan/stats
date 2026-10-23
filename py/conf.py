import os
from dotenv import load_dotenv

load_dotenv()

API_TOKEN = os.getenv("COC_API_TOKEN")
# Base URL API.
BASE_URL = os.getenv("COC_BASE_URL", "https://api.clashofclans.com/v1")


# Tag klan & pemain 
CLAN_TAG = "#2RVRP900V"
PLAYER_TAG = "" 

OUTPUT_DIR = "data" 

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Accept": "application/json"
}