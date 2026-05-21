from pydantic import BaseModel
from typing import Dict, Any


class CustomerData(BaseModel):
    data: Dict[str, Any]