import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional

load_dotenv()

app = FastAPI(title="ChicCloset Boutique API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection setup
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.seeta
product_collection = database.get_collection("products")

# Pydantic Models for Data Validation
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    category: str

class ProductResponse(ProductCreate):
    id: str

def product_helper(product) -> dict:
    return {
        "id": str(product["_id"]),
        "name": product["name"],
        "description": product["description"],
        "price": product["price"],
        "image_url": product["image_url"],
        "category": product["category"]
    }

@app.get("/")
async def read_root():
    return {"message": "Welcome to ChicCloset Boutique API. MongoDB connected successfully!"}

@app.get("/api/products", response_model=List[ProductResponse])
async def get_products():
    products = []
    async for product in product_collection.find():
        products.append(product_helper(product))
    return products

@app.post("/api/products", response_model=ProductResponse)
async def add_product(product: ProductCreate):
    product_data = product.model_dump()
    new_product = await product_collection.insert_one(product_data)
    created_product = await product_collection.find_one({"_id": new_product.inserted_id})
    return product_helper(created_product)

@app.post("/api/seed")
async def seed_database():
    # A quick way to fill the database with our starting data
    await product_collection.delete_many({})
    
    seed_products = [
        {
            "name": "Structured Linen Dress",
            "description": "A flattering mid-length dress in breathable fabric.",
            "price": 145.00,
            "image_url": "/assets/linen_dress.png",
            "category": "Dresses"
        },
        {
            "name": "Statement Crossbody Bag",
            "description": "Versatile fit, quality fabric, and effortless styling.",
            "price": 89.00,
            "image_url": "/assets/leather_bag.png",
            "category": "Accessories"
        }
    ]
    await product_collection.insert_many(seed_products)
    return {"message": "Database seeded successfully!"}
