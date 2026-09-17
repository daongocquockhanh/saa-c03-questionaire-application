## Section 7: More Tools for Building AI Applications

### Key topics
- Serverless compute + event-driven glue for AI apps
- Streaming ingest for real-time inference/RAG
- API exposure for model endpoints
- Orchestration of multi-step GenAI workflows
- NoSQL for embeddings/session/chat history
- Messaging + SaaS data ingest

### Services / features
- AWS Lambda — serverless functions, event-driven, up to 15 min timeout, 10 GB mem, 10 GB ephemeral /tmp. Runs inference glue, Bedrock invocations, RAG pre/post-processing. Container image support up to 10 GB (large model deps). Provisioned Concurrency kills cold starts for latency-sensitive GenAI endpoints. Lambda SnapStart (Java/Python/.NET) for faster init. Integrates with API Gateway, EventBridge, S3, SQS, SNS, DynamoDB Streams, Kinesis.
- Amazon Kinesis Data Streams — real-time ingest, shards, 24hr default retention (up to 365 days). Producer via KPL/PutRecord, consumer via KCL/Enhanced Fan-Out (dedicated 2 MB/s per consumer). Use: stream events into embedding pipelines / real-time personalization.
- Amazon Data Firehose (formerly Kinesis Firehose) — near-real-time (buffer 60s+ or size), fully managed. Delivers to S3, Redshift, OpenSearch, Splunk, HTTP endpoints. Supports Lambda transform, format conversion (Parquet/ORC), dynamic partitioning. Use: land raw data to S3 for training/RAG index.
- Amazon Managed Service for Apache Flink — real-time analytics on streams (SQL/Flink apps). Use for sliding-window sentiment/anomaly detection feeding LLMs.
- Amazon Kinesis Video Streams — ingest video/audio for CV + Rekognition/Transcribe/Bedrock multimodal. WebRTC support for two-way.
- Amazon API Gateway — REST, HTTP, WebSocket APIs. Fronts Lambda/SageMaker/Bedrock endpoints. Features: throttling, usage plans + API keys, WAF, caching, request/response transforms, Lambda authorizers, Cognito auth. WebSocket API for streaming chat responses. HTTP API cheaper + lower latency than REST.
- Amazon DynamoDB — serverless NoSQL, single-digit ms. AI uses: session state, chat history, LangChain memory, feature store, vector metadata. Partition key + optional sort key. On-Demand vs Provisioned (with Auto Scaling). DynamoDB Streams -> Lambda for CDC to embedding pipeline. Global Tables (multi-region active-active). TTL to expire chat sessions. DAX for microsecond caching. Item size 400 KB max. Zero-ETL to OpenSearch (vector search integration).
- AWS Step Functions — visual workflows. Standard (up to 1 year, exactly-once, audited) vs Express (up to 5 min, at-least-once, high volume). Direct SDK integrations to Bedrock, SageMaker, Lambda. Use for multi-step agentic flows: retrieve -> summarize -> validate -> respond. Map state for parallel batch inference. Callback pattern (waitForTaskToken) for human-in-the-loop review.
- Amazon EventBridge — serverless event bus. Default bus, custom buses, partner buses (SaaS). Rules match events -> targets (Lambda, Step Functions, SQS, SNS, etc.). Schema Registry + discovery. EventBridge Pipes (source -> filter -> enrich -> target). Scheduler (replaces CloudWatch Events cron) for periodic model retrain/RAG refresh.
- Amazon SQS — managed queue. Standard (at-least-once, best-effort order, unlimited TPS) vs FIFO (exactly-once, ordered, 300 TPS / 3000 batched). Visibility timeout, DLQ, long polling (up to 20s), message retention up to 14 days, max 256 KB payload (larger via S3 Extended Client). Decouples LLM producers from workers; smooths burst traffic to Bedrock rate limits.
- Amazon SNS — pub/sub topics. Fanout to SQS/Lambda/HTTPS/email/SMS. FIFO topics pair with FIFO SQS. Message filtering by attributes. Use for fan-out of inference results to multiple downstream consumers.
- Amazon AppFlow — no-code SaaS data transfer. Sources: Salesforce, ServiceNow, Slack, Zendesk, SAP, Google Analytics, etc. Destinations: S3, Redshift, Snowflake. Use to hydrate S3 with SaaS data for Knowledge Bases / RAG. Supports scheduled, on-demand, event-triggered flows. Field mapping, filtering, masking, validation.
- AWS Glue — serverless ETL, Data Catalog. Preps data for training/RAG. Glue DataBrew for visual data prep. Crawlers populate catalog for Athena/Bedrock KB.
- Amazon MQ — managed ActiveMQ/RabbitMQ (migration workloads).
- AWS Batch — batch compute for large-scale offline embedding generation.

### Must-know for exam
- Lambda 15 min timeout — long inferences need Step Functions or ECS/Fargate, not raw Lambda.
- API Gateway WebSocket API is the pattern for streaming LLM token responses to browsers.
- Step Functions Standard for long-running agent workflows; Express for high-volume short flows.
- Kinesis Data Streams = real-time (ms), Firehose = near-real-time (60s+ buffer, no consumer code).
- DynamoDB Streams + Lambda = keep vector store / OpenSearch in sync with source-of-truth items (CDC).
- DynamoDB TTL for chat session expiry; store conversation history keyed by session ID.
- SQS FIFO caps at 300 TPS (3000 with batching) and gives exactly-once — pick Standard if higher throughput needed and dedup handled elsewhere.
- SNS + SQS fanout is canonical pattern to broadcast inference events to multiple queues.
- EventBridge = event-driven routing with filtering + schema; SQS/SNS = messaging. EventBridge Pipes for source->target with filter/enrich (replaces custom Lambda glue).
- AppFlow ingests SaaS (Salesforce, ServiceNow, Slack) to S3 to feed Bedrock Knowledge Bases without custom code.
- Lambda Provisioned Concurrency / SnapStart mitigate cold starts for latency-sensitive Bedrock proxying.
- Kinesis Video Streams is the ingest path for real-time video into Rekognition + multimodal Bedrock models.
- Step Functions waitForTaskToken enables human-in-the-loop approval in GenAI workflows.
- API Gateway usage plans + API keys throttle per-tenant access to shared LLM endpoints.
- DynamoDB item size 400 KB cap — store large context/documents in S3, reference by key.
- Firehose can Lambda-transform + convert to Parquet before landing in S3 — reduces downstream Athena/Glue cost for training data.


