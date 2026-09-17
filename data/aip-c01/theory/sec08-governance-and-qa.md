## Section 8: Governance and QA

### Key topics
- Model/agent observability, evaluation methodology, RAG QA
- Audit trails, tracing, config compliance, data governance/lineage
- Metrics-driven ops: alarms, dashboards, log analytics

### Services / features
- Amazon Bedrock Agent trace — step-by-step reasoning trace (rationale, invocation input/output, observation, orchestration). Exam: use trace to debug agent action groups, prompt orchestration, KB lookups.
- Amazon Bedrock Model Evaluation — automatic (built-in metrics/benchmarks) + human-based (own workforce or AWS-managed). Metrics: accuracy, robustness, toxicity, BERTScore, F1, real-world knowledge (RWK).
- LLM-as-a-judge — model grades another model's output; scalable, cheap, less reliable on nuance/bias; good for pairwise preference, coherence, helpfulness.
- Human evaluation — subjective quality, safety, brand tone; slow, expensive, gold standard; use rubrics + inter-rater agreement.
- Benchmark evaluation — standardized datasets (MMLU, HELM, TruthfulQA); objective, reproducible; may not reflect domain use case.
- RAG evaluation criteria — Faithfulness (answer grounded in retrieved context), Answer Relevance, Context Precision, Context Recall, Context Relevance, Answer Correctness. Tools: RAGAS-style metrics inside Bedrock Evaluations (Knowledge Base evaluation).
- Amazon Bedrock Guardrails — content filters, denied topics, PII redaction, contextual grounding check (detects hallucination vs source). Exam: grounding + relevance thresholds for RAG.
- Amazon CloudWatch Metrics — Bedrock emits InvocationLatency, InputTokenCount, OutputTokenCount, Invocations, InvocationClientErrors, InvocationServerErrors, InvocationThrottles, LegalDisclaimers. SageMaker endpoint: Invocations, ModelLatency, OverheadLatency, CPUUtilization, GPUUtilization, MemoryUtilization.
- CloudWatch Logs — model invocation logging (Bedrock: enable in settings, sends prompts/responses to CW Logs or S3). SageMaker training/inference logs.
- CloudWatch Alarms — threshold on metric (e.g., throttle rate, latency p99); actions to SNS/Lambda/Auto Scaling.
- CloudWatch Dashboards — custom widgets aggregating metrics/logs; cross-account/region.
- CloudWatch Logs Insights — query language over logs; useful for prompt/response audit.
- AWS CloudTrail — API-level audit (who called InvokeModel, CreateAgent, CreateKnowledgeBase). Management + data events (data events for Bedrock model invocations available). Immutable trail to S3, integrates Athena/EventBridge.
- AWS X-Ray — distributed tracing across Lambda/API Gateway/Bedrock Agent calls; latency map, service graph, subsegments for LLM latency debugging.
- AWS Config — resource config history + compliance rules (e.g., is Bedrock logging enabled, is KMS enabled on KB, is S3 bucket public). Conformance packs, remediation via SSM.
- AWS Lake Formation — fine-grained access (row/column/cell) on S3 data lake; LF-tags; centralized permissions consumed by Athena/Redshift Spectrum/EMR/Glue. Exam: govern training/RAG data access.
- Data lineage — track data flow source-to-model. Tools: SageMaker ML Lineage Tracking (artifacts, actions, contexts, associations for datasets/models/endpoints), AWS Glue DataBrew lineage, Amazon DataZone (business catalog + lineage), OpenLineage integration.
- Amazon SageMaker Model Cards — document intended use, training data, metrics, risk rating; governance artifact.
- Amazon SageMaker Model Dashboard — central view of models, endpoints, drift, bias, explainability.
- SageMaker Clarify — bias detection (pre/post training), feature importance/SHAP; foundation model evaluations too.
- SageMaker Model Monitor — data quality, model quality, bias drift, feature attribution drift.

### Must-know for exam
- Bedrock Agent trace = debug tool; enable in InvokeAgent (`enableTrace=true`); shows preProcessing/orchestration/postProcessing/knowledgeBaseLookup.
- Choose evaluator: automatic for scale/objective, human for subjective/safety, LLM-as-judge for pairwise fast QA, benchmarks for baseline comparison.
- RAG faithfulness vs relevance: faithfulness = grounded in context (hallucination check); relevance = answers the question. Bedrock contextual grounding guardrail measures both.
- CloudTrail = who/when API calls; CloudWatch = performance metrics/logs; X-Ray = latency traces; Config = resource compliance state. Do not confuse.
- Enable Bedrock model invocation logging via console/API — required for prompt/response audit; delivers to CloudWatch Logs and/or S3, KMS-encrypted.
- CloudWatch alarms on InvocationThrottles/ModelLatency for prod SLOs.
- Lake Formation for training-data access control at row/column level; pair with IAM + KMS.
- SageMaker ML Lineage Tracking auto-captures pipeline artifacts; use for reproducibility/audit; Amazon DataZone for business-level lineage/catalog.
- Model Cards for governance/documentation; Clarify for bias/explainability; Model Monitor for drift.
- Guardrails contextual grounding threshold is the primary hallucination mitigation control at inference.


