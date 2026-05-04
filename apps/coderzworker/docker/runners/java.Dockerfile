FROM eclipse-temurin:21-jdk-alpine
WORKDIR /code
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]
