from brand_json import Brand
from Enum import IntEnum
import json
import time


db_file = "sustainify_database.json"

class WeightingEnum(IntEnum):
    FIRST: 0.2
    SECOND: 0.1
    THIRD: 0.0