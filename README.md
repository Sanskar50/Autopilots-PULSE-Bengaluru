# PULSE BENGALURU

## Feed Interface
The main data visualization dashboard for citizen reports and incidents in Bengaluru.

<img width="1293" height="692" alt="Screenshot from 2025-08-23 15-17-11" src="https://github.com/user-attachments/assets/fe0ff84d-7e9d-4bb5-9582-b230958abd7c" />

## Geotag Feature
Location-based reporting system that captures latitude and longitude coordinates to precisely map incidents across the city. This enables spatial analysis and targeted responses.

![WhatsApp Image 2025-08-23 at 3 16 38 PM](https://github.com/user-attachments/assets/eaa89a8c-a3b2-4665-86de-7dfb8091560e)

## Firebase Realtime Database
RealTime database that stores all reports, alerts, and forecast data. The system uses Firebase REST API for real-time synchronization across all components.

![WhatsApp Image 2025-08-23 at 3 21 56 PM](https://github.com/user-attachments/assets/b2973ff2-794d-4a1e-95b1-8c2134a404f8)

## PULSE Agent
AI Agent that processes data from multiple sources (traffic reports, citizen issues, Reddit reports, BTP news) to generate actionable alerts for citizens. The agent combines insights across data sources to provide timely and relevant information.

<img width="1285" height="689" alt="Screenshot from 2025-08-23 20-21-50" src="https://github.com/user-attachments/assets/56ea9042-1013-403a-aad8-7a34590cf7a3" />

## FORECAST Agent
AI Agent that generates urban forecasts based on upcoming events in Bengaluru. It analyzes event data to predict traffic patterns, crowd behavior, and potential congestion points, helping citizens plan their movements around the city more efficiently.

![WhatsApp Image 2025-08-23 at 8 22 48 PM](https://github.com/user-attachments/assets/ef01537b-53cd-42a2-9f74-7469a640975f)

## Technical Architecture
- **Backend**: FastAPI server with Firebase integration for data storage
- **Gen AI Layer**: Gemini 2.5 Flash model for alert generation and urban forecasting
- **Data Sources**: Multiple collections including citizen reports, traffic news, and event forecasts
- **API Endpoints**: RESTful endpoints for submitting reports, retrieving alerts, and generating forecasts
