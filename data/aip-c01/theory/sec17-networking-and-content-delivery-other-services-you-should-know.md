## Section 17: Networking and Content Delivery (Other Services You Should Know)

### Services / features
- Amazon VPC — isolated virtual network in AWS; subnets (public/private), route tables, IGW, NAT Gateway, security groups (stateful), NACLs (stateless). Exam: host GenAI workloads (SageMaker, Bedrock endpoints) in private subnets; use VPC endpoints (Interface/Gateway) to reach AWS services without internet.
- VPC Endpoints — PrivateLink Interface Endpoints (ENI, most services incl. Bedrock, SageMaker Runtime) and Gateway Endpoints (S3, DynamoDB only). Exam: keep model inference traffic private, no NAT/IGW needed.
- Amazon Route 53 — managed DNS + domain registration + health checks. Routing policies: simple, weighted, latency, failover, geolocation, geoproximity, multi-value. Exam: latency/geolocation routing to nearest regional GenAI endpoint; failover for HA inference.
- Amazon CloudFront — global CDN, edge caching, Lambda@Edge, CloudFront Functions, OAC for S3, integrates WAF/Shield. Exam: cache static generative outputs/assets, low-latency delivery of chatbot UI, protect origin API Gateway/ALB.
- Amazon API Gateway — REST, HTTP, WebSocket APIs; throttling, usage plans, API keys, authorizers (IAM, Cognito, Lambda). Exam: front Lambda that calls Bedrock; WebSocket for streaming chat; throttling protects LLM costs.
- AWS Direct Connect — dedicated private fiber from on-prem to AWS, consistent bandwidth, lower latency than internet. Supports VIFs (public, private, transit). Exam: hybrid ML training data pipelines, private connectivity to Bedrock via public VIF + PrivateLink.
- AWS Transit Gateway — hub-and-spoke connecting many VPCs + on-prem (VPN/DX). Route tables for segmentation, inter-region peering. Exam: centralize connectivity for multi-account GenAI platform; replaces mesh VPC peering.
- Elastic Load Balancing (ELB)
  - Application Load Balancer (ALB) — Layer 7 HTTP/HTTPS, path/host routing, WebSocket, gRPC, target groups (Lambda/EC2/IP/ECS). Exam: route to model-serving containers on ECS/EKS.
  - Network Load Balancer (NLB) — Layer 4 TCP/UDP/TLS, ultra-low latency, static IP, PrivateLink source. Exam: expose inference service via PrivateLink; high-throughput.
  - Classic Load Balancer (CLB) — legacy L4/L7, EC2-Classic. Exam: avoid for new workloads.
  - Gateway Load Balancer (GWLB) — L3 for third-party virtual appliances (firewalls). Niche.
- AWS Global Accelerator — anycast static IPs at edge, routes over AWS backbone to nearest healthy regional endpoint (ALB/NLB/EC2/EIP). Exam: global TCP/UDP acceleration + fast regional failover; differs from CloudFront (no caching, non-HTTP OK).
- AWS App Mesh — service mesh (Envoy-based) for microservices; traffic control, observability, mTLS. Exam: manage GenAI microservice traffic across ECS/EKS/EC2; being deprecated in favor of Amazon VPC Lattice / ECS Service Connect — know it exists.
- AWS PrivateLink — powers Interface VPC Endpoints; expose your service privately to other VPCs via NLB. Exam: SaaS-style private access to hosted models.
- AWS Site-to-Site VPN — IPsec tunnels over internet, backup or alternative to Direct Connect.

### Must-know for exam
- Private access to Bedrock / SageMaker = Interface VPC Endpoint (PrivateLink), not Gateway.
- S3 and DynamoDB use Gateway Endpoints (free, route-table based).
- CloudFront = HTTP/S caching CDN; Global Accelerator = any TCP/UDP, no cache, static anycast IPs.
- API Gateway throttling + usage plans protect expensive LLM backends from cost overruns.
- ALB for HTTP model APIs; NLB when PrivateLink or extreme performance needed.
- Route 53 latency routing sends users to closest regional model endpoint; failover routing = HA.
- Transit Gateway simplifies multi-VPC/multi-account GenAI architectures; scales beyond VPC peering.
- Direct Connect + public VIF + PrivateLink = private on-prem-to-Bedrock path with predictable latency.
- Security groups stateful, NACLs stateless — subnet vs ENI scope.
- App Mesh present but legacy; do not choose over VPC Lattice for new designs unless question says App Mesh.


