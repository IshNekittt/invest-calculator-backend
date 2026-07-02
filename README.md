# 📈 Investment Calculator API (Monte Carlo & GBM)

RESTful API for an investment calculator using the Monte Carlo method based on Geometric Brownian Motion (GBM) for stochastic capital forecasting.

### 🛠 Tech Stack

- **Node.js & Express.js** — routing and request handling.
- **MongoDB & Mongoose** — calculation history storage.
- **Mathematics** — Ito's Lemma, Box-Muller transform, `Float64Array` optimization for 2000 simulations.

### 📍 Endpoints

#### 1. Calculate Model

`POST /api/calculate`
**Payload (JSON):** Requires `deviceId` and `inputs` (initial, monthly, expectedReturn, volatility, inflation, years).
Strict validation of incoming types and limits is built-in to protect against Event Loop overflow.

```json
{
  "deviceId": "uuid-string",
  "inputs": {
    "initial": 10000,
    "monthly": 500,
    "expectedReturn": 10,
    "volatility": 15,
    "inflation": 3,
    "years": 20
  }
}
```

**Response (201 Created):** Returns `chartData` for rendering the probability corridor and `summary` metrics.

#### 2. Get History

`GET /api/history/:deviceId`
**Response (200 OK):** Returns the last 10 calculations associated with the specific `deviceId` (excluding heavy chart data), sorted by date.
