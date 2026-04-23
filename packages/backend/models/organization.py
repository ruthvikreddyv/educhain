from pydantic import BaseModel

class Organization(BaseModel):
    name: str
    email: str
    password: str
    wallet_address: str