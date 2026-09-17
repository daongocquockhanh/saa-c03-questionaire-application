## Section 5: Operations Efficiency and Optimization

### Key topics
- Token estimation, tracking, latency metrics
- Context/response optimization, prompt compression
- Cost-capability tradeoff, dynamic routing
- Batching, capacity planning, provisioned throughput
- Caching (semantic, prompt, edge)
- Parallel workflows, latency-optimized inference
- OpenSearch tuning, A/B testing, tunable params
- SageMaker deployment, UltraServers, Lambda endpoint mgmt
- Retry/backoff, connection pooling, cross-region inference

### Services / features
- Bedrock CountTokens API — returns token count without running inference, free, model-specific behavior. Use to estimate costs/fit token limits.
- CloudWatch — tracks InputTokenCount, outputTokenCount, TTFT (Time to First Token, streaming), model latency, invocation count, throttles, cache reads/writes.
- Context Pruning — chunk RAG data, limit retrieved chunks, filter by metadata, summarize/discard old chat history.
- Response Limiting — maxTokens, bake length into prompt, few-shot examples, JSON output.
- Prompt Compression — small model summarizes before large model; use Knowledge Bases vs full docs.
- Bedrock Intelligent Prompt Routing — tiered routing to small/medium/large models by complexity (native Bedrock feature). Alternatives: conditional Flow, Lambda, Agent Squad, Strands.
- Bedrock Evaluations — human/LLM judges or predefined metrics; compare feature visualizes model performance on your prompts. Pair with token counting for cost tradeoffs.
- Bedrock Batch Inference — submit many prompts via S3, get responses in S3.
- AWS Service Quotas (Bedrock tool) — plan TPM/RPM; request quota increase or provisioned throughput. CloudFormation templates aid capacity planning.
- Tensor parallelism — shards LLM weights across GPUs, better memory utilization.
- Provisioned Throughput — provisioned by Tokens or Model Units (MUs); REQUIRED for customized models; must supply provisioned model ARN as modelID. Doesn't work with cross-region inference profiles.
- AWS Cost Explorer — attribute model costs to business functions.
- Semantic Caching — embed prompts/responses, store in ElastiCache for Valkey, MemoryDB (or OpenSearch); new prompt → embed → nearest neighbor → return if similarity > threshold. Tune threshold carefully.
- Prompt Caching — cache static prefix (instructions, few-shot, system prompt); dynamic content at end; cache checkpoint separates. Discounted per token on reads, writes may cost more. Available in Bedrock Prompt Management. Monitored in CloudWatch.
- Edge Caching via CloudFront — hash deterministic request as fingerprint into GET, aggressive TTL. Also cache non-LLM app pieces.
- Latency-optimized inference — Bedrock feature; set performanceConfig={'latency':'optimized'}; optimizes TTFT, OTPS (Output Tokens per Second), E2E latency.
- Parallel requests — multi-agent workflows, Step Functions; response streaming.
- Tunable params — Temperature (0-1), Top_p (nucleus sampling, use OR temperature), Top_k.
- A/B testing — Bedrock Evaluations, CloudWatch Evidently.
- OpenSearch — optimize indices, hybrid search + custom scoring, query pre-processing (normalize, split multi-part, filter, keyword extraction).
- SageMaker AI — deploys models up to 500GB; adjust container health check + download timeout quotas. Supports Triton, FasterTransformer, DeepSpeed. Large: ml.p4d.24xlarge (GPU); small: ml.c5.9xlarge (CPU).
- UltraServers (Trn2, P6e-GB200) — connect EC2 with low-latency high-bandwidth accelerator interconnects.
- Lambda endpoint lifecycle management — auto-init endpoints, download model artifacts from S3 on demand.
- Retry/backoff — start 100ms, backoff factor 2, max 3-5 attempts, jitter ±100ms.
- Connection pooling — 10-20 connections/instance, TTL 60-300s.
- Cross-region inference profiles — Geographic (data residency, standard pricing) or Global (max throughput, 10% cost savings). Priced where called. No enabling needed. Encrypted in transit, CloudTrail logged. Doesn't work with provisioned throughput. Watch SCPs blocking regions.

### Must-know for exam
- CountTokens is FREE, doesn't run inference.
- TTFT + OTPS + E2E are the Bedrock latency-optimized targets.
- Provisioned Throughput mandatory for customized models; use MUs; incompatible with cross-region inference.
- Semantic cache lives in ElastiCache Valkey/MemoryDB.
- Prompt cache: static prefix first, dynamic last, checkpoint between.
- Global cross-region inference = 10% cost savings; pricing based on caller region.
- SCPs can silently break cross-region inference.
- SageMaker 500GB model limit — adjust health check + download timeouts.
- Retry defaults: 100ms/×2/3-5/±100ms jitter.
- Connection pool: 10-20/instance, TTL 60-300s.
- Bedrock Intelligent Prompt Routing = built-in tiered routing.
- Top_p OR Temperature, not both.


