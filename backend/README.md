# EventPilot Backend

Spring Boot 3 / Java 21 backend for the EventPilot migration.

## Run

```bash
cd backend
mvn spring-boot:run
```

Required services:

- PostgreSQL database named `eventpilot`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `AI_API_KEY`

The API is served at `http://localhost:8080`.
