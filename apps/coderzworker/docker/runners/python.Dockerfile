FROM python:3.12-alpine
WORKDIR /code
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]
