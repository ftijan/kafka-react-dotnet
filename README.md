# .NET Aspire Kafka Weather Explorer

A distributed application built with **.NET Aspire**, **Apache Kafka**, and a **React** frontend. This application demonstrates how to orchestrate containerized Kafka resources using Aspire, produce weather forecast events to a Kafka topic, and consume/flatten those logs on demand for a historical UI view.

---

## Features

* **.NET Aspire Orchestration:** Manages the AppHost, backend API service, frontend SPA, and an out-of-the-box Apache Kafka container (`confluentinc/confluent-local`).
* **Kafka Event Publishing:** Automatically pushes newly generated weather forecast batches to a Kafka topic (`weather-topics`) whenever the live endpoint is hit.
* **Kafka Event Consumption:** Reads accumulated logs from the Kafka topic, flattens the nested batch structure, and serves a full history feed.
* **React Dashboard:** Features a dual-view interface allowing you to toggle smoothly between a **Live Weather Feed** (which triggers Kafka pushes) and a **Flattened Kafka History Log**, complete with persistent Celsius/Fahrenheit unit toggling.

---

## Note

* This sample application was AI-engineered (AKA "vibe-coded") with the help of a Google Gemini model.