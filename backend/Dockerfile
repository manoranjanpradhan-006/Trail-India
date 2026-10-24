# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/trail-india-api ./cmd/api

# Final minimal runtime
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app

COPY --from=builder /app/trail-india-api /app/trail-india-api
COPY migrations /app/migrations

EXPOSE 8080

CMD ["/app/trail-india-api"]
