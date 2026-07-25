# Andromeda

**Andromeda** is the event driven module to pull metrics from Agents and also expose edpoints for Agents to push data.

## How it works

Let me explain it in a simple way. As I said **Andromeda** works in 2 ways.

1. Agent pushs to **Andromeda**
2. **Andromeda** pulls from Agents

### Push method

Assume **Andromeda** as an endpoint: _POST - /api/andromeda_

Then Agents collect data and simply call this endpoint and send metrics as body.

Finally **Andromeda** stores data in **TimescaleDB**.

### Pull method

Every Agent has an endpoint: _GET - /api/metrics_

**Andromeda** discovers hosts (Agents) and call each at the same time and fetch metrics.

At last same as the other method, storing data in **TimescaleDB**.

## What is Andromeda using

- **Redis** in the first phase of this module.
- **FastAPI BackgroundTasks** to have things done in background.
- **Celery** not for this phase.
