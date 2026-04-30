# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Final stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /app/target/gallery-api-0.1.0.jar app.jar

# Create non-root user for security
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/artists || exit 1

# Run application
# Shell form para que $JAVA_OPTS del docker-compose sea recogido correctamente.
# Las credenciales de BD vienen como env vars (SPRING_DATASOURCE_URL, etc.)
# -Dserver.tomcat.max-http-form-post-size=-1  → sin límite de POST en Tomcat
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS \
  -Dserver.tomcat.max-http-form-post-size=-1 \
  -Dspring.servlet.multipart.max-file-size=500MB \
  -Dspring.servlet.multipart.max-request-size=500MB \
  -jar app.jar"]
