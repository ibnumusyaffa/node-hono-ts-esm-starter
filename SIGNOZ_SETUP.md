# Multi-Platform OpenTelemetry Integration

This project includes OpenTelemetry Collector integration for sending telemetry data to both SigNoz and Grafana.

## Architecture

```
Your App → OpenTelemetry Collector → SigNoz + Grafana
```

The setup includes:
- Your application sends telemetry to a local OpenTelemetry Collector (port 4318)
- The collector processes and forwards data to both SigNoz and Grafana
- All traces, metrics, and logs are collected and sent to both platforms

## Configuration Files

### 1. `otel-collector-config.yaml`
OpenTelemetry Collector configuration that:
- Receives OTLP data on ports 4317 (gRPC) and 4318 (HTTP)
- Processes data with batching and resource attribution
- Forwards to both SigNoz and Grafana with proper authentication

### 2. Updated `docker-compose.yml`
- Added `otel-collector` service
- Your app services now depend on the collector
- Collector is configured with environment variables

### 3. Updated Environment Configuration
Added environment variables for both platforms:

**SigNoz:**
- `SIGNOZ_OTLP_ENDPOINT`: SigNoz endpoint
- `SIGNOZ_ACCESS_TOKEN`: Your SigNoz access token
- `SIGNOZ_INSECURE`: Whether to use TLS (false for production)

**Grafana:**
- `GRAFANA_OTLP_TRACES_ENDPOINT`: Grafana traces endpoint
- `GRAFANA_PROMETHEUS_ENDPOINT`: Grafana Prometheus endpoint
- `GRAFANA_LOKI_ENDPOINT`: Grafana Loki endpoint
- `GRAFANA_AUTH_HEADER`: Grafana authentication header
- `GRAFANA_INSECURE`: Whether to use TLS (false for production)

## Setup Instructions

### 1. Configure Environment Variables

Add these variables to your `.env` file:

```bash
# SigNoz Configuration
SIGNOZ_OTLP_ENDPOINT=http://localhost:4317
SIGNOZ_ACCESS_TOKEN=your-signoz-access-token
SIGNOZ_INSECURE=true

# Grafana Configuration (optional - leave empty to disable)
GRAFANA_OTLP_TRACES_ENDPOINT=https://tempo-prod-04-prod-us-east-0.grafana.net:443
GRAFANA_PROMETHEUS_ENDPOINT=https://prometheus-prod-01-prod-us-east-0.grafana.net/api/prom/push
GRAFANA_LOKI_ENDPOINT=https://logs-prod-006.grafana.net/loki/api/v1/push
GRAFANA_AUTH_HEADER=Bearer your-grafana-api-key
GRAFANA_INSECURE=false
```

### 2. For SigNoz Cloud

If using SigNoz Cloud, update your environment variables:

```bash
SIGNOZ_OTLP_ENDPOINT=https://ingest.<region>.signoz.cloud:443
SIGNOZ_ACCESS_TOKEN=your-cloud-access-token
SIGNOZ_INSECURE=false
```

Replace `<region>` with your SigNoz region (e.g., `us`, `eu`, `in`).

### 3. For Self-hosted SigNoz

If running SigNoz locally or on your own infrastructure:

```bash
SIGNOZ_OTLP_ENDPOINT=http://your-signoz-host:4317
SIGNOZ_ACCESS_TOKEN=  # Leave empty if not required
SIGNOZ_INSECURE=true
```

### 4. Start the Services

```bash
docker-compose up -d
```

This will start:
- Your application services
- OpenTelemetry Collector
- Database and other dependencies

## Verification

1. **Check Collector Logs**:
   ```bash
   docker-compose logs otel-collector
   ```

2. **Check Application Telemetry**:
   - Run your application with telemetry enabled:
     ```bash
     npm run otel
     ```
   - Make some API requests to generate telemetry data

3. **Verify in SigNoz**:
   - Open your SigNoz dashboard
   - Look for traces from service name `hono-api`
   - Check metrics and logs sections

## Troubleshooting

### Common Issues

1. **Collector not receiving data**:
   - Check that your app is sending to `http://localhost:4318`
   - Verify collector is running: `docker-compose ps otel-collector`

2. **SigNoz not receiving data**:
   - Verify `SIGNOZ_OTLP_ENDPOINT` is correct
   - Check `SIGNOZ_ACCESS_TOKEN` if using SigNoz Cloud
   - Check collector logs for export errors

3. **TLS/SSL Issues**:
   - For SigNoz Cloud, set `SIGNOZ_INSECURE=false`
   - For local/self-hosted, set `SIGNOZ_INSECURE=true`

### Debug Mode

To enable debug logging in the collector, update `otel-collector-config.yaml`:

```yaml
exporters:
  logging:
    loglevel: debug
```

And add `logging` to your service pipelines exporters list.

## Data Types Collected

- **Traces**: HTTP requests, database queries, external API calls
- **Metrics**: Application performance metrics, custom business metrics
- **Logs**: Application logs with correlation to traces

## Next Steps

1. Set up custom metrics and traces in your application code
2. Configure alerting rules in SigNoz
3. Create dashboards for monitoring key business metrics
4. Set up log aggregation and analysis
