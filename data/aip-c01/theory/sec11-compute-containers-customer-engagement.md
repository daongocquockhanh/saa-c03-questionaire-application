## Section 11: Compute / Containers / Customer Engagement

### Services / features
- **Amazon EC2** — Elastic Compute Cloud, IaaS. Rent VMs, attach EBS drives, distribute load via ELB, scale via ASG. Choose OS (Linux/Windows/Mac), CPU/RAM, storage (EBS/EFS network-attached or EC2 Instance Store hardware), network card + Public IP, Security Group firewall rules, EC2 User Data bootstrap.
- **EC2 User Data** — bootstrap script, runs once at first start, runs as **root**. Automates installs, updates, downloads.
- **EBS** — network-attached virtual drive for EC2.
- **EC2 Instance Store** — hardware storage attached to EC2 host.
- **ELB** — load balancer distributing traffic across EC2.
- **ASG** — Auto Scaling Group, scales EC2 fleet.
- **Amazon ECS** — AWS's own container platform. Launches Docker containers as **ECS Tasks** on **ECS Clusters**.
  - **EC2 Launch Type**: you provision/maintain EC2 instances; each runs **ECS Agent** to register with cluster. AWS starts/stops containers.
  - **Fargate Launch Type**: serverless, no EC2 to manage. Define task definitions, specify CPU/RAM, scale by adding tasks.
- **EC2 Instance Profile** (EC2 launch type only) — used by ECS Agent: API calls to ECS, ship logs to CloudWatch Logs, pull images from ECR, read Secrets Manager / SSM Parameter Store.
- **ECS Task Role** — per-task IAM role, defined in task definition. Different roles for different services.
- **ECS Load Balancer integration** — ALB for most use cases; NLB for high throughput / PrivateLink; CLB supported but not recommended (no Fargate).
- **ECS + EFS** — mount EFS on tasks (EC2 or Fargate), multi-AZ shared persistent storage. **Fargate + EFS = serverless**. **S3 cannot be mounted as filesystem.**
- **Amazon ECR** — Elastic Container Registry, stores Docker container images.
- **Amazon EKS** — managed Kubernetes on AWS. Alternative to ECS, different API. Supports EC2 worker nodes or Fargate. Use case: existing Kubernetes on-prem / other cloud migrating to AWS. Kubernetes is cloud-agnostic. One EKS cluster per region for multi-region. Logs/metrics via **CloudWatch Container Insights**.
- **EKS node types** — **Managed Node Groups** (EKS creates/manages EC2 nodes in ASG, On-Demand or Spot); **Self-Managed Nodes** (you register, use Amazon EKS Optimized AMI, On-Demand or Spot); **Fargate** (no nodes to manage).
- **EKS Storage** — specify **StorageClass** manifest, uses **CSI-compliant driver**. Supports Amazon EBS, Amazon EFS (works with Fargate), FSx for Lustre, FSx for NetApp ONTAP.
- **AWS Fargate** — serverless container compute, works with ECS and EKS. No infrastructure to manage.
- **Amazon Lex** — same tech as Alexa. ASR (speech→text) + NLU (intent recognition). Build chatbots and call center bots.
- **Amazon Connect** — cloud-based virtual contact center. Receive calls, build contact flows, integrate with CRM/AWS. No upfront cost, ~80% cheaper than traditional. Flow: Phone → Connect → Lex → Lambda → CRM.

### Must-know for exam
- EC2 User Data runs **once at first boot, as root**.
- ECS **EC2 launch** = you manage instances + ECS Agent; **Fargate launch** = serverless, task definitions only.
- **EC2 Instance Profile** = ECS Agent perms; **ECS Task Role** = per-task perms, set in task definition.
- ALB is default LB for ECS; NLB for perf/PrivateLink.
- **S3 not mountable**; use EFS for shared multi-AZ container storage. Fargate + EFS supported.
- ECR stores images; ECS/EKS pull from it.
- EKS = managed Kubernetes; pick over ECS for K8s portability / migrations. One cluster per region.
- EKS nodes: Managed Node Groups, Self-Managed (EKS Optimized AMI), or Fargate. Spot supported on node groups.
- EKS storage via CSI: EBS, EFS (Fargate-compatible), FSx Lustre, FSx NetApp ONTAP.
- CloudWatch Container Insights for EKS logs/metrics.
- Lex = Alexa engine (ASR + NLU) for bots; Connect = virtual contact center; pair Connect + Lex + Lambda for automated call flows.


