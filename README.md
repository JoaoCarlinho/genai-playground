GenAI Playground
This repository contains a full-stack application designed for experimentation and development with generative AI, data management, and analytics. The stack is orchestrated using Docker Compose and includes backend APIs, data storage, machine learning model serving, and supporting infrastructure.

Features & Capabilities
1. Terraform State Management API
Provides endpoints for managing and querying Terraform state files.
Supports infrastructure automation and state tracking.
2. Unity Catalog API
Manages data cataloging and governance for analytics and ML workflows.
Enables metadata management and access control for datasets.
3. Multi-context RAG Based conversation support
Takes advantage of various instruction sets and Vector databases to 
provide RAG-support chat capabilities applied to varying use-cases.
4. Causal-based reinforcement learning applied to autonomous vehicle navigation
Causal reinforcemnt learning applied to train the policy model for navigation of 
autonomous vehhicles.
5. Stock Predictor App
Implements machine learning models for stock price prediction.
Integrates with data sources and provides prediction endpoints.
6. Stock Trading App
Offers APIs for simulated or real stock trading operations.
Supports order management, portfolio tracking, and analytics.
Service Architecture
The application is composed of the following services, as defined in docker-compose.yml:

Backend
Python-based API server (Flask or FastAPI).
Handles business logic for state management, catalog, prediction, and trading.
Persistent storage for video and split data.
Connected to PostgreSQL and Redis.
Ollama
Containerized LLM (Large Language Model) serving via Ollama.
Supports embedding storage and custom model files.
Exposes endpoints for generative AI inference.
Database (Postgres)
Stores application data, user information, and metadata.
Persistent volume for durability.
MinIO
S3-compatible object storage for datasets, models, and results.
Managed via MinIO console.
Redis
In-memory data store for caching and task queues.
RQ Worker & Dashboard
Distributed task processing using RQ (Redis Queue).
Dashboard for monitoring background jobs.
Nginx
Reverse proxy and load balancer for frontend and backend services.
Elasticsearch Cluster & Kibana
Multi-node Elasticsearch cluster for search and analytics.
Kibana for visualization and dashboarding.
Secure communication with SSL certificates and user authentication.
Data & Model Storage
All persistent data is stored in mapped volumes for durability.
Model files and inference data are managed via Ollama and MinIO.
Elasticsearch supports backup and restore via dedicated volumes.
Getting Started
Clone the repository:

Configure environment variables:

Edit .env files as needed for secrets and service configuration.
Start the stack:

Access services:

Backend API: http://localhost:5005
Ollama LLM: http://localhost:11434
MinIO Console: http://localhost:9001
RQ Dashboard: http://localhost:9181
Nginx Proxy: http://localhost
Kibana: http://localhost:5601
Extending the Playground
Add new models to Ollama by updating the Modelfile.
Integrate new APIs or data sources in the backend.
Use MinIO for storing large datasets and model artifacts.
Visualize and analyze data in Kibana and Elasticsearch.
Contributing
Pull requests and issues are welcome! Please see the repository guidelines for more details.

License
This project is licensed under the MIT License.

For more details, see the individual service documentation and configuration files.

