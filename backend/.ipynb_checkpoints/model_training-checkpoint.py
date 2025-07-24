import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

# Load dataset
file_path = "External_Cibil_Dataset.xlsx"  # Make sure this file is inside the backend folder
df = pd.read_excel(file_path)

# Drop non-informative columns
drop_cols = ["PROSPECTID", "last_prod_enq2", "first_prod_enq2", "Approved_Flag"]
df = df.drop(columns=drop_cols, errors="ignore")

# Handle categorical encoding
df["MARITALSTATUS"] = df["MARITALSTATUS"].astype("category").cat.codes
df["EDUCATION"] = df["EDUCATION"].astype("category").cat.codes
df["GENDER"] = df["GENDER"].astype("category").cat.codes

# Fill missing values with median
df.fillna(df.median(), inplace=True)

# Feature Selection (top features based on RandomForest)
selected_features = ["enq_L3m", "num_std", "time_since_recent_enq", "num_std_12mts",
                     "enq_L6m", "AGE", "recent_level_of_deliq", "time_since_recent_deliquency",
                     "Time_With_Curr_Empr", "time_since_recent_payment", "NETMONTHLYINCOME"]

X = df[selected_features]
y = df["Credit_Score"]

# Split into train and test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Apply Z-score normalization
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train Random Forest Model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save the trained model and scaler
joblib.dump(model, "credit_score_model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("Model and Scaler saved successfully!")
