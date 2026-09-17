## Section 9: Security, Identity, and Compliance

### Key topics
- Shared Responsibility Model — AWS secures cloud; you secure in cloud (data, IAM, config).
- Identity, access control, least-privilege for GenAI workloads (Bedrock, SageMaker, Q).
- Data protection: PII detection/masking, encryption at rest + in transit.
- Network isolation for model endpoints, RAG stores, agents.
- Threat detection, DDoS, WAF for GenAI apps and APIs.
- Compliance frameworks (HIPAA, PCI-DSS, SOC, GDPR, FedRAMP, ISO).
- Secrets and key lifecycle for LLM API keys, DB creds, embeddings stores.
- Guardrails vs security controls — Bedrock Guardrails handle content, IAM/KMS/VPC handle infra.

### Services / features
- IAM — users, groups, roles, policies (JSON). Roles = temp creds via STS; use for Bedrock/SageMaker/Lambda. Least-privilege: scope Action + Resource ARN + Condition. Identity-based vs resource-based policies. Use `bedrock:InvokeModel` on specific model ARNs, not `*`.
- IAM Identity Center (formerly SSO) — workforce identity for Amazon Q Business, QuickSight, SageMaker Studio. SAML/OIDC federation, trusted identity propagation so downstream services see end-user identity (row-level filtering).
- STS — AssumeRole, short-lived credentials for cross-account Bedrock access, federated users.
- KMS — CMKs (AWS-managed, customer-managed, imported). Envelope encryption. Customer-managed keys for Bedrock model customization jobs, SageMaker, S3 training data, DynamoDB. Key policies + grants. Rotate annually.
- AWS Secrets Manager — store API keys, DB creds, third-party LLM tokens. Automatic rotation, KMS-encrypted, resource policies. Preferred over env vars/Parameter Store SecureString for rotating secrets.
- Systems Manager Parameter Store — cheaper config store; SecureString uses KMS.
- Amazon Macie — S3 PII/PHI/credential discovery via ML. Scans training data buckets before fine-tuning to detect sensitive data leakage.
- Amazon Comprehend — DetectPiiEntities + ContainsPiiEntities APIs to redact/mask PII in prompts and RAG documents before sending to LLM.
- Bedrock Guardrails — PII filter (block/anonymize/mask with placeholders), denied topics, content filters, word filters, contextual grounding. Complements Comprehend for prompt-time redaction.
- DynamoDB fine-grained access — IAM condition `dynamodb:LeadingKeys` = `${aws:userid}` for row-level security in chat history tables.
- VPC — private isolated network. Subnets (public with IGW route, private with NAT), route tables, security groups (stateful), NACLs (stateless).
- Internet Gateway (IGW) — public egress/ingress for public subnets.
- NAT Gateway — outbound-only internet for private subnets (e.g., pulling models to SageMaker training).
- VPC Endpoints / AWS PrivateLink — private connectivity to Bedrock, SageMaker, S3, DynamoDB without traversing internet. Interface endpoints (ENI, Bedrock runtime) vs Gateway endpoints (S3, DynamoDB). Enforce via `aws:sourceVpce` condition.
- Site-to-Site VPN — IPsec tunnel corporate DC to VPC. Direct Connect = dedicated private line.
- SageMaker VPC mode / Network Isolation — training/inference containers with no internet.
- AWS WAF — L7 protection for API Gateway/ALB/CloudFront fronting GenAI apps. Managed rules, rate-limit rules (prompt-flooding), SQLi/XSS, bot control. Custom rules for prompt injection patterns.
- AWS Shield — Standard (free, L3/L4 DDoS auto). Advanced (paid, L7 DDoS, DRT support, cost protection).
- Amazon GuardDuty — threat detection on CloudTrail, VPC Flow Logs, DNS, EKS, S3, Lambda, Malware Protection. Detects compromised IAM creds, crypto-mining on training instances.
- AWS Config — resource config compliance, drift detection.
- AWS CloudTrail — API audit logs; Bedrock InvokeModel logged. Data events for S3/Lambda.
- AWS Audit Manager — automated evidence collection for compliance frameworks.
- AWS Artifact — download SOC, ISO, PCI, HIPAA BAA reports.
- Amazon Inspector — CVE scans EC2, ECR images, Lambda layers.
- Encryption at rest — S3 SSE-S3/SSE-KMS/SSE-C, EBS, RDS, DynamoDB, OpenSearch, Bedrock KB vector stores — all KMS-integrated.
- Encryption in transit — TLS 1.2+ on all AWS endpoints; enforce via `aws:SecureTransport` policy condition.
- Compliance frameworks — Bedrock is HIPAA-eligible, SOC 1/2/3, ISO, PCI-DSS, FedRAMP High (GovCloud), GDPR. Sign BAA via Artifact for PHI workloads.

### Must-know for exam
- Never hardcode Bedrock/API keys — use IAM roles + Secrets Manager.
- Least-privilege: scope `bedrock:InvokeModel` to exact model ARN, deny `*`.
- Bedrock Guardrails PII masking = anonymize with placeholder tags; combine with Comprehend for pre-processing RAG docs.
- Macie = find PII in S3 training data before fine-tune.
- KMS customer-managed key required when you need key policy control, audit, revocation for model customization + KB vectors.
- Private Bedrock access = VPC Interface Endpoint (PrivateLink), no NAT/IGW; enforce with `aws:sourceVpce`.
- Row-level RAG isolation = IAM Identity Center trusted identity propagation OR DynamoDB `LeadingKeys` condition.
- WAF rate-limit rule mitigates prompt-flooding/DoS on LLM APIs; Shield Advanced for L7 DDoS.
- GuardDuty catches stolen IAM creds invoking Bedrock from unusual regions.
- CloudTrail logs every Bedrock InvokeModel — enable for audit; Bedrock model invocation logging (separate) captures prompt/completion payloads to S3/CloudWatch.
- HIPAA workloads: Bedrock eligible, sign BAA, use CMK, VPC endpoint, disable model invocation logging or encrypt logs.
- Encryption in transit enforced via bucket policy `aws:SecureTransport=true`.
- STS AssumeRole for cross-account Bedrock; external ID for third-party.
- Secrets Manager rotation Lambda for DB creds behind RAG apps.


