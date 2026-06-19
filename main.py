from fastapi import Depends, FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.staticfiles import StaticFiles
from model import product
from database import session,engine
import databasemodel 
from sqlalchemy.orm import Session
from pathlib import Path



app=FastAPI()
BASE_DIR = Path(__file__).resolve().parent
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

databasemodel.Base.metadata.create_all(bind=engine)



products=[
    product(id=1,name="laptop",description="dell" ,price=90000,quantity=50),
    product(id=2,name="phone",description="iphone" ,price=127000,quantity=20),
    product(id=3,name="watch",description="titan watch" ,price=10000,quantity=150)
]

def get_db():
    db = session()
    try:
        yield db

    finally:
        db.close()


def init__db():
    db = session()
    count = 0
    if count == 0:
      for product in products:
        db.add(databasemodel.product(**product.model_dump()))
    db.commit()

@app.get("/products")
def get_all_products(db: Session = Depends(get_db)):
    db_product = db.query(databasemodel.product).all()
    return db_product
    

@app.get("/product/{id}")
def get_product_by_id(id: int,db:Session = Depends(get_db)):
    db_product = db.query(databasemodel.product).filter(databasemodel.product.id==id).first()
    if db_product:
        return "updated sussfully"
    else:
        return "Product not found"

        

@app.post("/product")
def add_product(product: product, db: Session = Depends(get_db)):
    try:
        db_product = databasemodel.product(**product.model_dump())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)

        print("SUCCESS: Product saved")
        return db_product

    except Exception as e:
        db.rollback()
        print("DATABASE ERROR:", str(e))
        return {"error": str(e)}

@app.put("/product")
def update_product(id:int,product:product,db:Session = Depends(get_db)):
    db_product = db.query(databasemodel.product).filter(databasemodel.product.id==id).first()
    if db_product:
          db_product.name=product.name
          db_product.description=product.description
          db_product.price=product.price
          db_product.quantity=product.quantity
          db.commit()
          return "updated sussecfully"
    else:
        return "product not found"

@app.delete("/product")
def delete_product(id:int,db:Session = Depends(get_db)):
    db_product = db.query(databasemodel.product).filter(databasemodel.product.id==id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return "Product deleted successfully"
    else:
        return "Product not found"

# Mount frontend LAST so it does NOT shadow the API routes above
app.mount(
    "/",
    StaticFiles(directory=str(BASE_DIR / "forentend"), html=True),
    name="frontend"
)
