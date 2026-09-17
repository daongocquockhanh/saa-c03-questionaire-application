## Section 15: Management and Governance (Other Services You Should Know)

### Services / features
- Amazon CloudWatch — metrics, logs, alarms, dashboards. Monitors Bedrock/SageMaker latency, invocations, token usage. CloudWatch Logs stores model invocation logs. Alarms trigger on thresholds (e.g., high inference latency, error rate). Custom metrics via PutMetricData. Container Insights for ECS/EKS GenAI workloads.
- AWS CloudTrail — records API calls for audit/compliance. Tracks who invoked Bedrock models, SageMaker endpoints, S3 access. Management events default on; data events (S3, Lambda) opt-in. Immutable trail to S3. Exam: audit model access, detect unauthorized InvokeModel calls.
- AWS Config — tracks resource configuration changes + compliance rules. Records config history of SageMaker endpoints, IAM roles, S3 buckets. Managed rules (e.g., s3-bucket-public-read-prohibited). Remediation via SSM automation. Detects drift from compliant state.
- AWS Systems Manager (SSM) — operational hub. Parameter Store holds config/secrets (free tier) — store Bedrock model IDs, endpoint names. Session Manager for shell without SSH/bastion. Run Command, Patch Manager, Automation runbooks. Fleet Manager for EC2 hosting inference.
- AWS Trusted Advisor — best-practice checks across 5 pillars: cost, performance, security, fault tolerance, service limits. Business/Enterprise Support unlock full checks. Flags unused resources, exposed S3, IAM issues.
- AWS Organizations — multi-account management. Consolidated billing, Service Control Policies (SCPs) restrict actions across OUs (e.g., deny Bedrock in non-approved regions). Root OU → OUs → accounts. Foundation for Control Tower.
- AWS Control Tower — automated landing zone for multi-account. Sets up SSO, logging archive, audit account, guardrails (preventive SCPs + detective Config rules). Account Factory provisions new accounts. Best for GenAI orgs needing governance at scale.
- AWS Service Catalog — curated portfolio of approved products (CloudFormation templates). Publish standardized SageMaker notebook, Bedrock RAG stack. End users self-serve without deep AWS knowledge. Enforces tagging, guardrails.
- AWS License Manager — track/manage software licenses (Microsoft, Oracle, SAP). BYOL enforcement.
- AWS Compute Optimizer — ML-driven right-sizing recommendations for EC2, EBS, Lambda, ASG, ECS on Fargate. Suggests instance type/size changes. Reduces cost of hosting inference/training workloads.
- AWS Cost Explorer — visualize/analyze spend, forecast up to 12 months. Filter by tag, service, account. Identify Bedrock token cost, SageMaker training spend. Rightsizing + Savings Plans recommendations.
- AWS Budgets — set custom cost/usage/RI/Savings Plan budgets with alerts (SNS/email). Budget Actions auto-apply IAM policies or stop EC2 when threshold breached. Guardrail against runaway LLM costs.
- Savings Plans — 1yr/3yr commitment for compute usage ($/hr). Compute Savings Plans (flexible, up to 66% off), EC2 Instance Savings Plans (specific family, up to 72%), SageMaker Savings Plans (up to 64% off SageMaker training/inference/notebook).
- Reserved Instances (RI) — 1yr/3yr capacity reservation for EC2/RDS/ElastiCache/Redshift/OpenSearch. Standard (up to 72% off, less flexible), Convertible (up to 54%, exchange allowed). Not for SageMaker (use Savings Plans instead).
- Spot Instances — up to 90% off unused EC2 capacity. Interruptible with 2-min warning. Ideal for fault-tolerant training jobs, batch inference, hyperparameter tuning. SageMaker Managed Spot Training saves up to 90% on training cost.

### Must-know for exam
- CloudTrail = who did what (audit). CloudWatch = metrics/logs (perf). Config = resource state/compliance.
- SCPs (Organizations) restrict Bedrock/SageMaker actions across accounts; Control Tower automates landing zones with guardrails.
- SageMaker Savings Plans (NOT RIs) discount SageMaker; RIs cover EC2/RDS/Redshift.
- SageMaker Managed Spot Training = up to 90% off, use checkpointing for interruptions.
- Cost Explorer for analysis/forecast; Budgets for alerts + Budget Actions to enforce.
- SSM Parameter Store = free secrets/config; Secrets Manager = paid with rotation.
- Compute Optimizer right-sizes inference hosts.
- Trusted Advisor full checks require Business/Enterprise Support.
- Service Catalog distributes approved GenAI stacks (SageMaker notebooks, RAG blueprints) to teams safely.


