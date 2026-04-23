# Remotion ExcelCNA Lambda Renderer

This project exposes one Remotion composition:

```text
ExcelCNAEditor
```

The API accepts a JSON payload from n8n, starts a Remotion Lambda render, and returns a video URL from S3 when the render is complete.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run lambda:deploy
npm run serve:render-api
```

## API

Health:

```text
GET /health
```

Check deployed Lambda config:

```text
GET /config
Authorization: Bearer <RENDER_API_TOKEN>
```

Start render:

```text
POST /render/lambda
Authorization: Bearer <RENDER_API_TOKEN>
Content-Type: application/json
```

Poll progress:

```text
GET /render/lambda/progress?renderId=...&bucketName=...&functionName=...
Authorization: Bearer <RENDER_API_TOKEN>
```

One-request render, useful only when your HTTP client timeout is high enough:

```text
POST /render/lambda/wait
Authorization: Bearer <RENDER_API_TOKEN>
Content-Type: application/json
```

## Lambda Defaults

Defaults are tuned for the current AWS account limits:

```text
memory: 3008 MB
disk: 4096 MB
timeout: 240 seconds
concurrency: 5
codec: h264
crf: 18
jpeg quality: 95
```

For accounts with low concurrency limits, include this in the request body:

```json
{
  "renderConcurrency": 2
}
```
