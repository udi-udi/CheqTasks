# CheqTasks API

A RESTful task management API built with NestJS, TypeScript, and PostgreSQL. Deployed on AWS EC2 with a full CI/CD pipeline.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js / TypeScript) |
| Database | PostgreSQL (Render) |
| ORM | TypeORM |
| Validation | class-validator + class-transformer |
| Docs | Swagger / OpenAPI |
| Infrastructure | AWS CDK (EC2, VPC, Secrets Manager) |
| CI/CD | GitHub Actions |
| Container | Docker (multi-stage build) |

---

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Create .env
echo "DATABASE_URL=postgresql://<user>:<password>@<host>/<db>" > .env

# 3. Start dev server
npm run start:dev

# 4. Open Swagger
open http://localhost:3000/api
```

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start with ts-node (development) |
| `npm run start` | Compile then run from dist (production) |
| `npm test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage report |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/tasks` | Retrieve paginated tasks (`?limit=20&offset=0`) |
| `POST` | `/tasks` | Create a task (`{ title, description? }`) |
| `GET` | `/health` | Health check — returns uptime and DB status |
| `GET` | `/api` | Swagger UI |

### `GET /tasks` response shape

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "OPEN",
      "createdAt": "2026-03-21T10:00:00.000Z"
    }
  ],
  "total": 42
}
```

---

## Deploying infrastructure

```bash
cd infra
npm install
cdk deploy --context sshPublicKey="$(cat ~/.ssh/cheqtasks_deploy.pub)"
```

CDK provisions: VPC → public subnet → security group → IAM role (Secrets Manager read) → t3.micro EC2 (Amazon Linux 2023). The instance bootstraps itself on first boot: installs Docker, clones this repo, fetches `DATABASE_URL` from AWS Secrets Manager, builds the image and starts the container.

---

## Architecture questions

### Scalability — if traffic spikes 10x tomorrow

Right now the app runs on a single EC2 instance with no load balancer. That's fine for low traffic, but it won't survive a real spike. Here's what I'd do, roughly in order of impact:

**1. Put an Auto Scaling Group + Load Balancer in front of it**
This is the biggest win for the least amount of work — no application code changes needed. The ALB spreads requests across instances, and the ASG spins up more when things get busy and back down when they don't.

**2. Stop letting the database be the bottleneck**
Once you scale the app tier, Postgres becomes the weak point. A read replica handles the `GET /tasks` load, and RDS Multi-AZ keeps things running if the primary goes down.

**3. Cache the common reads**
`GET /tasks` with the same pagination params hits the DB every time. A Redis layer (ElastiCache) in front makes those near-instant and takes a huge amount of pressure off the DB. You just need to invalidate on `POST /tasks`.

**4. Move the database into AWS**
The DB is currently on Render, outside AWS entirely. Every query crosses provider boundaries. Moving it to RDS in the same VPC removes that latency and simplifies networking.

**5. Switch to ECS Fargate**
Long-term, managing EC2 instances gets tedious. Fargate runs the same Docker container without you having to think about instance types or patching. The existing Dockerfile works as-is.

---

### Observability — tracking errors in production

**Structured logs**
The current `console.error` output is hard to search. Switching to JSON logs (e.g. with `pino`) means every line has `requestId`, `userId`, `statusCode`, `durationMs` — fields you can actually query.

**Log aggregation**
Ship those logs to CloudWatch Logs. Set a 30-day retention on production. From there you can search, filter, and build dashboards without SSHing into the box.

**Error tracking with Sentry**
One line in `AllExceptionsFilter` — `Sentry.captureException(exception)` — and you get full stack traces, error grouping, and alerts when something starts failing more than usual. Worth it.

**Alerting on what matters**
Set CloudWatch Alarms on 5xx rate > 1% and p95 latency > 500ms, routed to SNS → email or PagerDuty. You want to know before your users tell you something is broken.

**Distributed tracing**
AWS X-Ray (or OpenTelemetry) lets you follow a single request from the controller into the service and down to the DB query. When something is slow, you can see exactly where the time went instead of guessing.

**Uptime monitoring**
The `/health` endpoint already checks the DB. Point an external monitor (UptimeRobot, Better Uptime) at it. If the whole instance goes down, CloudWatch won't tell you — but an external ping will.
