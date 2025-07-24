from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np
from pydantic import BaseModel

# Load the trained model and scaler
model = joblib.load("credit_score_model.pkl")
scaler = joblib.load("scaler.pkl")

# Define the input data model using Pydantic
class CreditScoreInput(BaseModel):
    enq_L3m: float
    num_std: float
    time_since_recent_enq: float
    num_std_12mts: float
    enq_L6m: float
    AGE: float
    recent_level_of_deliq: float
    time_since_recent_deliquency: float
    Time_With_Curr_Empr: float
    time_since_recent_payment: float
    NETMONTHLYINCOME: float

# Initialize FastAPI app
app = FastAPI()

# ✅ Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL (e.g., "http://127.0.0.1:5500")
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)
@app.post("/predict/")
async def predict_credit_score(input_data: CreditScoreInput):
    try:
        # Convert input data to DataFrame
        input_dict = input_data.dict()
        input_df = pd.DataFrame([input_dict])

        # Apply the same scaling as during training
        scaled_input = scaler.transform(input_df)

        # Make prediction
        prediction = model.predict(scaled_input)

        # Return the prediction
        return {"predicted_credit_score": prediction[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# To run the FastAPI app, use the following command:
# uvicorn main:app --reload