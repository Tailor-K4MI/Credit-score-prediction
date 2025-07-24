from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
from pydantic import BaseModel

# Load trained model and scaler
model = joblib.load("credit_score_model.pkl")
scaler = joblib.load("scaler.pkl")


app = FastAPI()

# ✅ Fix CORS Issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# ✅ Define the input model correctly
class CreditScoreInput(BaseModel):
    enq_L3m: float
    num_std: float
    time_since_recent_enq: float
    num_std_12mts: float
    enq_L6m: float
    AGE: int
    recent_level_of_deliq: float
    time_since_recent_deliquency: float
    Time_With_Curr_Empr: float
    time_since_recent_payment: float
    NETMONTHLYINCOME: float

@app.post("/predict")
async def predict_credit_score(input_data: CreditScoreInput):
    try:
        print("Received Data:", input_data.dict())  # ✅ Debugging input JSON

        # Load trained model
        model = joblib.load("credit_score_model.pkl")
        scaler = joblib.load("scaler.pkl")

        # Convert input to array
        input_array = np.array([[input_data.enq_L3m, input_data.num_std, input_data.time_since_recent_enq,
                                input_data.num_std_12mts, input_data.enq_L6m, input_data.AGE,
                                input_data.recent_level_of_deliq, input_data.time_since_recent_deliquency,
                                input_data.Time_With_Curr_Empr, input_data.time_since_recent_payment,
                                input_data.NETMONTHLYINCOME]])
        
        # Scale and predict
        scaled_input = scaler.transform(input_array)
        prediction = model.predict(scaled_input)
        
        return {"predicted_credit_score": prediction[0]}
    except Exception as e:
        print("Error:", str(e))  # ✅ Debugging
        return {"error": str(e)}

