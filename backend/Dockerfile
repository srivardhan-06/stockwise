# Stage 1 — Build the app using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies first (faster rebuilds)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the jar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2 — Run the app using a lightweight Java image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar from Stage 1
COPY --from=build /app/target/*.jar app.jar

# Expose port 5000
EXPOSE 5000

# Start the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
