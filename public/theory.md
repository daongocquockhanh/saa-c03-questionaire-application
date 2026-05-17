# Lý thuyết ôn thi AWS Solutions Architect Associate (SAA-C03)

> Tài liệu tổng hợp các kiến thức cốt lõi cần nắm cho kỳ thi SAA-C03. Đề thi gồm 65 câu, 130 phút, pass ~720/1000.

---

## I. AWS WELL-ARCHITECTED FRAMEWORK (6 trụ cột)

1. **Operational Excellence** – Vận hành tốt, tự động hóa, theo dõi.
2. **Security** – Bảo vệ dữ liệu, hệ thống, tài sản.
3. **Reliability** – Khôi phục sau lỗi, scale tự động.
4. **Performance Efficiency** – Dùng tài nguyên hiệu quả.
5. **Cost Optimization** – Tối ưu chi phí.
6. **Sustainability** – Giảm tác động môi trường.

**Shared Responsibility Model**:
- AWS lo "Security **OF** the Cloud" (phần cứng, hạ tầng, network vật lý).
- Khách hàng lo "Security **IN** the Cloud" (data, IAM, OS patching cho EC2, config service).

---

## II. IAM (Identity and Access Management)

- **Global service**, miễn phí.
- **Root account**: chỉ dùng để tạo user đầu tiên, sau đó bật MFA và khóa lại.
- **Users**: đại diện 1 người, có credentials.
- **Groups**: chứa users, gán policy theo nhóm.
- **Roles**: gán cho AWS service (EC2, Lambda…) hoặc cross-account. **Không có credentials cố định**, dùng STS token tạm thời.
- **Policies**: JSON, gồm `Effect`, `Action`, `Resource`, `Condition`.

**Loại policy**:
- **Identity-based**: gắn vào user/group/role.
- **Resource-based**: gắn vào resource (S3 bucket policy, KMS key policy).
- **Permission boundary**: giới hạn tối đa quyền của user/role.
- **SCP (Service Control Policy)**: ở AWS Organizations, áp lên account.

**Quy tắc đánh giá**: Mặc định **Deny**. Explicit **Deny** > Explicit **Allow**.

**IAM Identity Center (SSO)**: quản lý đăng nhập tập trung cho nhiều AWS account.

**STS**: cấp credentials tạm thời (AssumeRole, federation).

---

## III. EC2 (Elastic Compute Cloud)

### Loại instance
- **General Purpose** (T, M): cân bằng CPU/RAM.
- **Compute Optimized** (C): tính toán nặng (HPC, gaming server, ML inference).
- **Memory Optimized** (R, X): in-memory DB, SAP HANA.
- **Storage Optimized** (I, D, H): I/O cao, NoSQL, data warehouse.
- **Accelerated Computing** (P, G, Inf): GPU, ML training.

### Pricing model
- **On-Demand**: trả theo giờ/giây, linh hoạt nhất, đắt nhất.
- **Reserved Instances (RI)**: cam kết 1/3 năm, giảm tới 72%. Có Standard, Convertible.
- **Savings Plans**: cam kết $/giờ, áp cho EC2/Fargate/Lambda, linh hoạt hơn RI.
- **Spot Instances**: giảm tới 90%, AWS có thể thu hồi với 2 phút notice. Phù hợp batch, fault-tolerant workload.
- **Dedicated Host**: cả server vật lý dành riêng, dùng cho license BYOL.
- **Dedicated Instance**: chạy trên hardware riêng nhưng không quản lý host.
- **Capacity Reservations**: đảm bảo capacity trong AZ, không giảm giá.

### Placement Groups
- **Cluster**: trong 1 AZ, latency thấp, throughput cao (HPC).
- **Spread**: tách ra các hardware khác nhau, tối đa 7 instance/AZ, tính sẵn sàng cao.
- **Partition**: chia nhiều partition (mỗi partition ở hardware khác), dùng cho Hadoop, Cassandra, Kafka.

### EC2 Security Group vs NACL
| Tiêu chí | Security Group | Network ACL |
|---|---|---|
| Mức độ | Instance | Subnet |
| Stateful | Có | Không |
| Rule | Chỉ Allow | Allow + Deny |
| Đánh giá | Tất cả rules | Theo thứ tự rule number |

### User data & Metadata
- **User data**: script chạy lúc khởi tạo instance.
- **Instance metadata**: truy cập tại `http://169.254.169.254/latest/meta-data/`. Nên dùng **IMDSv2** (token-based).

---

## IV. EBS, EFS, FSx, Instance Store

### EBS (Elastic Block Store)
- Block storage, gắn vào 1 EC2 (trừ **Multi-Attach** với io1/io2 trong cùng AZ).
- Tồn tại độc lập, **bound vào 1 AZ**.
- Loại volume:
  - **gp3/gp2**: SSD đa năng. gp3 cho phép tách IOPS/throughput khỏi dung lượng.
  - **io1/io2**: SSD IOPS cao, mission-critical. io2 Block Express tới 256k IOPS.
  - **st1**: HDD throughput cao (big data, log).
  - **sc1**: HDD lạnh, rẻ nhất.
- **Snapshot**: backup vào S3, có thể copy cross-region, cross-account.
- **EBS encryption**: dùng KMS, không tốn phí.

### Instance Store
- Ổ vật lý gắn trực tiếp host, **ephemeral** – mất khi stop/terminate.
- IOPS rất cao, dùng cho cache, buffer.

### EFS (Elastic File System)
- NFS, **chia sẻ cho nhiều EC2** ở nhiều AZ (Linux only).
- Tự scale, trả theo dung lượng dùng.
- Storage class: Standard, Infrequent Access (IA), Archive (rẻ nhất).
- Lifecycle policy chuyển file lâu không dùng sang IA/Archive.

### FSx
- **FSx for Windows File Server**: SMB, AD integration.
- **FSx for Lustre**: HPC, ML, tích hợp S3.
- **FSx for NetApp ONTAP**: NFS/SMB/iSCSI, tương thích NetApp.
- **FSx for OpenZFS**: Linux file system trên ZFS.

---

## V. ELB & Auto Scaling

### Elastic Load Balancer
- **Application LB (ALB)**: Layer 7 (HTTP/HTTPS), routing theo path/host/header. Hỗ trợ WebSocket, HTTP/2, redirect, target = EC2/IP/Lambda/container.
- **Network LB (NLB)**: Layer 4 (TCP/UDP/TLS), latency cực thấp, **static IP / Elastic IP** mỗi AZ.
- **Gateway LB (GLB)**: Layer 3, dùng cho firewall ảo, IDS/IPS.
- **Classic LB (CLB)**: cũ, không khuyến nghị.

**Sticky Sessions**: ALB/CLB hỗ trợ session affinity qua cookie.

**Cross-Zone Load Balancing**:
- ALB: bật mặc định, miễn phí.
- NLB/GLB: tắt mặc định, bật sẽ phát sinh chi phí inter-AZ.

**SSL/TLS**: 
- ALB/NLB hỗ trợ **SNI** (nhiều cert trên 1 listener).
- Cert quản lý qua **ACM** (miễn phí với ALB/NLB/CloudFront).

### Auto Scaling Group (ASG)
- **Launch Template** (mới) thay cho Launch Configuration (cũ).
- Min / Desired / Max capacity.
- **Scaling policies**:
  - **Target Tracking**: VD giữ CPU = 50%.
  - **Step Scaling**: tăng/giảm theo bậc alarm.
  - **Simple Scaling**: đơn giản, có cooldown.
  - **Scheduled**: theo lịch.
  - **Predictive Scaling**: ML dự đoán.
- **Health check**: EC2 hoặc ELB.
- **Lifecycle hooks**: làm gì đó khi instance launch/terminate (cài đặt, copy log).
- **Termination policy**: oldest, newest, closest to billing hour…

---

## VI. VPC (Virtual Private Cloud)

### Thành phần
- **VPC**: dải IP riêng (CIDR), trong 1 region.
- **Subnet**: trong 1 AZ. Public (có route ra IGW) vs Private.
- **Route Table**: route cho subnet.
- **Internet Gateway (IGW)**: cho VPC ra Internet (2 chiều).
- **NAT Gateway**: cho private subnet ra Internet (1 chiều). Managed, scale auto, trong 1 AZ (HA = đặt mỗi AZ 1 cái).
- **NAT Instance**: cũ, EC2 tự quản, rẻ hơn nhưng phải tự HA.
- **Egress-only IGW**: cho IPv6 ra ngoài, 1 chiều.

### Kết nối VPC
- **VPC Peering**: 2 VPC kết nối trực tiếp, không transitive, không trùng CIDR.
- **Transit Gateway**: hub kết nối nhiều VPC, on-prem, Direct Connect. Hỗ trợ transitive, multicast.
- **VPC Endpoint**:
  - **Gateway Endpoint**: chỉ cho **S3 và DynamoDB**, miễn phí.
  - **Interface Endpoint (PrivateLink)**: cho service khác, dùng ENI, tính phí theo giờ + data.
- **Site-to-Site VPN**: IPSec qua Internet, nhanh setup.
- **Direct Connect (DX)**: đường truyền riêng, throughput cao, latency thấp, setup vài tuần.
- **Direct Connect Gateway**: kết DX tới nhiều VPC ở nhiều region.

### Bảo mật
- **Security Group** (stateful, instance level).
- **NACL** (stateless, subnet level).
- **VPC Flow Logs**: log traffic, lưu CloudWatch Logs hoặc S3.
- **Traffic Mirroring**: copy traffic ENI để phân tích.
- **AWS Network Firewall**: managed firewall ở VPC level.

---

## VII. S3 (Simple Storage Service)

- **Object storage**, bucket name globally unique.
- Max object: 5TB. Multipart upload bắt buộc khi > 5GB.
- **Eventually consistent** trước đây, **strong read-after-write consistency** từ 12/2020.

### Storage Classes
| Class | Use case | Min duration | Retrieval |
|---|---|---|---|
| Standard | Truy cập thường xuyên | - | ms |
| Standard-IA | Ít truy cập, cần ngay | 30 ngày | ms |
| One Zone-IA | IA nhưng 1 AZ | 30 ngày | ms |
| Intelligent-Tiering | Tự động chuyển tier | - | ms |
| Glacier Instant Retrieval | Archive truy cập tức thời | 90 ngày | ms |
| Glacier Flexible Retrieval | Archive | 90 ngày | phút–giờ |
| Glacier Deep Archive | Rẻ nhất | 180 ngày | 12 giờ |

**Lifecycle policy**: chuyển tier hoặc xóa theo thời gian.

### Bảo mật
- **Block Public Access** (mặc định bật).
- **Bucket Policy** (resource-based, JSON).
- **ACL** (cũ, hạn chế dùng).
- **IAM Policy** (user-based).
- **Pre-signed URL**: cấp quyền truy cập tạm thời.
- **S3 Object Lock + Glacier Vault Lock**: WORM, compliance.
- **Encryption**:
  - **SSE-S3** (mặc định, AES-256, AWS quản key).
  - **SSE-KMS** (KMS key, log truy cập key).
  - **SSE-C** (customer cung cấp key).
  - **Client-side**: mã hóa trước khi upload.
- **DSSE-KMS**: dual-layer encryption, FIPS 140-3.

### Tính năng
- **Versioning**: lưu nhiều version.
- **Replication**: CRR (cross-region), SRR (same-region). Bật versioning ở cả 2 bucket.
- **Transfer Acceleration**: upload qua CloudFront edge.
- **Multipart Upload**: bắt buộc > 5GB, khuyên dùng > 100MB.
- **S3 Select / Glacier Select**: query SQL trên object.
- **Event Notification**: push lên SNS/SQS/Lambda/EventBridge.
- **Requester Pays**: người tải về trả tiền.
- **Storage Lens**: phân tích usage cross-account.
- **Access Points**: nhiều endpoint riêng biệt cho cùng bucket.
- **S3 Object Lambda**: biến đổi object lúc GET.

---

## VIII. CloudFront

- **CDN** toàn cầu (450+ edge location).
- Cache nội dung tĩnh, giảm latency.
- Origin: S3, ALB, EC2, custom HTTP, MediaStore.
- **OAC (Origin Access Control)** thay cho OAI cũ: chỉ CloudFront mới đọc được S3.
- **Signed URL / Signed Cookie**: bảo vệ nội dung trả phí.
- Hỗ trợ **field-level encryption**, **WAF**, **Shield**.
- **CloudFront Functions** (rất nhẹ, viewer request/response) và **Lambda@Edge** (mạnh hơn, mọi event).
- **Geo restriction**: chặn/cho phép theo quốc gia.
- Pricing: trả theo data transfer + request, **không tính S3 → CloudFront**.

**Global Accelerator** (khác CloudFront):
- Anycast IP qua AWS backbone, dùng cho ứng dụng non-HTTP, gaming, IoT.
- Static IP, health check tự động failover region.

---

## IX. Route 53

- **DNS managed service**, 100% SLA.
- **Record types**: A, AAAA, CNAME, NS, MX, TXT, SRV, **Alias** (free, trỏ tới AWS resource, hỗ trợ apex domain).
- **Routing Policies**:
  - **Simple**: 1 hoặc nhiều IP, client random pick.
  - **Weighted**: chia trọng số (A/B test).
  - **Latency**: trả về region có latency thấp.
  - **Failover**: primary + secondary, kèm health check.
  - **Geolocation**: theo vị trí địa lý người dùng.
  - **Geoproximity**: theo khoảng cách + bias.
  - **Multivalue Answer**: trả nhiều IP với health check.
- **Health Check**: monitor endpoint, calculate, CloudWatch alarm.
- **Private Hosted Zone**: DNS riêng cho VPC.
- **Domain registration**: mua domain trực tiếp.

---

## X. RDS, Aurora, DynamoDB, ElastiCache

### RDS
- Managed: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, **Db2**.
- **Multi-AZ**: standby ở AZ khác, **synchronous replication**, **failover tự động**. Tăng availability, không tăng read.
- **Read Replicas**: tối đa 15, **async**, để scale đọc. Có thể cross-region.
- **Storage Auto Scaling**.
- **Backup**: automated (1–35 ngày), manual snapshot (giữ mãi).
- **Encryption**: KMS, bật lúc tạo (không bật được sau đó nếu chưa). Snapshot có thể copy sang dạng encrypted.
- **RDS Proxy**: pool connection, giảm failover time, IAM auth, dùng tốt với Lambda.
- **RDS Custom**: cho Oracle/SQL Server, cho phép truy cập OS.

### Aurora
- AWS-native, tương thích MySQL/PostgreSQL.
- 5x MySQL, 3x PostgreSQL về hiệu năng.
- **Storage tự scale tới 128TB**, replicate 6 copy across 3 AZ.
- Tối đa 15 **Aurora Replicas**, failover < 30s.
- **Aurora Serverless**: tự scale capacity (ACU), trả theo dùng. Serverless v2 scale mượt hơn.
- **Aurora Global Database**: 1 primary region + 5 read region, replicate < 1s, RPO < 1s, RTO < 1 phút.
- **Backtrack** (MySQL): rewind DB tới điểm trước.

### DynamoDB
- NoSQL, key-value + document, **fully managed serverless**.
- Latency ms 1 digit, scale vô hạn.
- **Capacity mode**: On-Demand vs Provisioned (có Auto Scaling).
- **Partition Key** (hash) + optional **Sort Key**.
- **GSI** (Global Secondary Index): khác partition key, async, tốn WCU/RCU riêng.
- **LSI** (Local Secondary Index): cùng partition key, khác sort, phải tạo lúc tạo table.
- **DAX**: cache in-memory, ms → microseconds, không đổi code.
- **Streams**: capture thay đổi, trigger Lambda.
- **Global Tables**: multi-region active-active.
- **TTL**: tự xóa item theo timestamp.
- **Transactions**: ACID, tốn 2x capacity.
- **PITR (Point-In-Time Recovery)**: 35 ngày.

### ElastiCache
- **Redis**: phức tạp hơn, hỗ trợ replication, persistence, pub/sub, sorted set. Có Multi-AZ.
- **Memcached**: đơn giản, multi-thread, dùng cho cache thuần, không persistence.
- **Redis OSS** và **Valkey** (fork mới của AWS, rẻ hơn).
- **MemoryDB for Redis**: in-memory + durable, dùng làm primary DB.

**Khi nào dùng cache**: read nhiều, latency thấp, session store, leaderboard, rate limit.

---

## XI. Compute Serverless

### Lambda
- Chạy code theo event, max **15 phút/lần**, **10GB RAM**, **6 vCPU**.
- Hỗ trợ Python, Node, Java, Go, Ruby, .NET, custom runtime, container image (10GB).
- **Cold start**: giảm bằng **Provisioned Concurrency**.
- **/tmp**: tối đa 10GB.
- **Concurrency**: 1000 mặc định/region, có thể tăng. Reserved Concurrency giới hạn function.
- **Layers**: chia sẻ thư viện.
- **Triggers**: API GW, S3, DynamoDB Streams, SQS, SNS, Kinesis, EventBridge, ALB…
- **Lambda + RDS**: dùng **RDS Proxy** để tránh quá tải connection.
- **Lambda SnapStart** (Java/Python/.NET): giảm cold start.

### API Gateway
- **REST API**, **HTTP API** (rẻ, nhanh, ít tính năng hơn), **WebSocket API**.
- Tích hợp Lambda, HTTP backend, AWS service.
- **Authorization**: IAM, Cognito, Lambda authorizer, API key (chỉ rate limit, không secure).
- **Throttling**: 10k req/s mặc định.
- **Caching**: tới 1GB, theo stage.
- **Stages**: dev/prod, canary deployment.
- **Endpoint type**: Edge-Optimized, Regional, Private.

### Step Functions
- **Workflow** orchestrate Lambda, ECS, batch…
- **Standard** (tới 1 năm) vs **Express** (tới 5 phút, throughput cao).
- Visual workflow (ASL JSON).

### AppSync
- Managed **GraphQL** + **Pub/Sub**.
- Real-time data, offline sync.

---

## XII. Containers

### ECS (Elastic Container Service)
- **Launch types**:
  - **EC2**: bạn quản lý EC2 cluster.
  - **Fargate**: serverless, không quản lý server.
- **Task Definition**: blueprint container (image, CPU, RAM, IAM role).
- **Service**: chạy nhiều task, tích hợp ALB.
- **Task Role**: IAM role gán cho task.

### EKS (Elastic Kubernetes Service)
- Managed Kubernetes control plane.
- Worker node: EC2 hoặc Fargate.
- Hỗ trợ **EBS CSI**, **EFS CSI** driver.

### ECR
- Container registry private, tích hợp ECS/EKS.
- Hỗ trợ image scan, lifecycle policy.

### AWS App Runner
- Deploy web app/API từ source code hoặc image, không quản lý hạ tầng.

---

## XIII. Messaging & Streaming

### SQS (Simple Queue Service)
- Message queue, **decoupling**.
- **Standard**: throughput không giới hạn, **at-least-once**, có thể out-of-order.
- **FIFO**: 300 msg/s (3000 với batch), **exactly-once**, **in-order**, group ID.
- Retention 1 phút – 14 ngày (mặc định 4 ngày).
- Max message size: 256KB (có thể dùng SQS Extended Client + S3 cho msg lớn).
- **Visibility timeout**: 30s mặc định, tối đa 12h.
- **Long polling**: tới 20s, giảm chi phí.
- **DLQ (Dead Letter Queue)**: chứa msg fail.
- **Delay queue**: delay msg tới 15 phút.

### SNS (Simple Notification Service)
- Pub/Sub, **1 → many**.
- Subscribers: HTTP/S, Email, SMS, SQS, Lambda, Mobile Push, Firehose.
- **Fan-out pattern**: SNS → nhiều SQS.
- **Message Filtering**: subscriber chọn lọc.
- **FIFO topic**: với FIFO SQS.

### EventBridge (formerly CloudWatch Events)
- **Event bus**: default, partner, custom.
- Rule match event → target (Lambda, SQS, SNS, Step Functions, Kinesis…).
- **Schema Registry**: schema event tự động.
- **Pipes**: source → filter → enrich → target (point-to-point).
- **Scheduler**: cron job, thay cho CloudWatch Events.

### Kinesis
- **Kinesis Data Streams**:
  - Real-time stream, retention 1–365 ngày.
  - **Shard** quyết định throughput (1MB/s in, 2MB/s out per shard).
  - **On-Demand** (auto scale) vs **Provisioned**.
  - Producer: SDK, KPL, Kinesis Agent. Consumer: SDK, KCL, Lambda, Firehose.
- **Kinesis Data Firehose**:
  - Near real-time (buffer tối thiểu 60s hoặc 1MB).
  - Đích: S3, Redshift, OpenSearch, HTTP, Splunk, partner.
  - Transform bằng Lambda, convert format (Parquet/ORC).
  - **Fully managed**, không có shard.
- **Kinesis Data Analytics**: SQL/Apache Flink trên stream (đã rename thành Amazon Managed Service for Apache Flink).
- **Kinesis Video Streams**: cho video.

### MSK (Managed Kafka)
- Kafka managed, dùng khi đã có hệ sinh thái Kafka.
- **MSK Serverless**: auto-scale.

### Amazon MQ
- Managed ActiveMQ, RabbitMQ. Migrate từ on-prem dễ hơn SQS/SNS.

---

## XIV. Migration & Transfer

- **AWS Migration Hub**: dashboard tổng quan.
- **Application Migration Service (MGN)**: lift-and-shift server.
- **Database Migration Service (DMS)**:
  - Homogeneous (Oracle → Oracle) và heterogeneous (Oracle → Aurora).
  - **Schema Conversion Tool (SCT)** cho khác engine.
  - Tasks: full load, CDC (change data capture), full + CDC.
- **DataSync**: copy data on-prem ↔ AWS (S3, EFS, FSx). Schedule, incremental.
- **Storage Gateway**:
  - **File Gateway**: NFS/SMB cache → S3.
  - **Volume Gateway**: iSCSI volume, cached/stored.
  - **Tape Gateway**: virtual tape → Glacier.
- **Snow Family**:
  - **Snowcone**: 8TB, edge.
  - **Snowball Edge**: 80TB (Storage), 39.5TB usable + compute (Compute).
  - **Snowmobile**: 100PB (đã ngừng).
- **AWS Transfer Family**: SFTP/FTPS/FTP/AS2 vào S3/EFS.

---

## XV. Analytics

- **Athena**: query SQL trực tiếp lên S3 (Presto). Serverless, trả theo TB scan. Giảm chi phí bằng **partition + columnar (Parquet/ORC) + compress**.
- **Glue**: ETL serverless (Spark). **Glue Data Catalog** = metastore cho Athena, Redshift Spectrum, EMR.
- **Glue DataBrew**: chuẩn hóa dữ liệu visual.
- **Redshift**:
  - Data warehouse, columnar, PB scale.
  - **Redshift Spectrum**: query S3 không load vào cluster.
  - **RA3 node**: tách compute và storage.
  - **Redshift Serverless**.
- **EMR**: Hadoop, Spark, Hive, HBase, Presto. Chạy trên EC2/EKS.
- **OpenSearch (Elasticsearch)**: search, log analytics, kèm Dashboards.
- **QuickSight**: BI, dashboard, ML insight, SPICE in-memory.
- **Lake Formation**: build data lake, quản lý quyền dữ liệu.
- **MSK, Kinesis**: streaming (đã liệt kê).

---

## XVI. Bảo mật (Security & Compliance)

- **KMS**:
  - Managed encryption key, dùng FIPS 140-2.
  - **AWS managed key** (free) vs **Customer managed key** ($1/month + API call).
  - **Symmetric (AES-256)** mặc định, **Asymmetric** cho sign/verify.
  - **Key rotation** tự động hằng năm cho symmetric.
  - **Multi-Region keys**: replicate key cùng material.
  - **Envelope encryption**: data key mã hóa data, KMS key mã hóa data key.
- **CloudHSM**: HSM phần cứng dedicated, FIPS 140-2 Level 3. Bạn quản lý key hoàn toàn.
- **Secrets Manager**: lưu secret, **tự rotate** (Lambda).
- **Systems Manager Parameter Store**: lưu config/secret, miễn phí cho Standard tier.
- **Certificate Manager (ACM)**: SSL/TLS cert miễn phí cho ALB/CloudFront/API GW, auto-renew.
- **WAF (Web Application Firewall)**:
  - Layer 7, bảo vệ ALB/CloudFront/API GW/AppSync.
  - Rules: IP, geo, size, SQLi, XSS, rate-based, managed rule.
- **Shield**:
  - **Shield Standard**: free, DDoS L3/L4.
  - **Shield Advanced**: $3000/tháng, L7, cost protection, DRT.
- **GuardDuty**: threat detection bằng ML, phân tích VPC Flow Logs, DNS Logs, CloudTrail, S3 data event, EKS audit log, RDS login, Lambda, EBS malware.
- **Macie**: phát hiện PII trong S3.
- **Inspector**: scan vulnerability EC2, ECR image, Lambda.
- **Detective**: phân tích root cause sự cố security.
- **Security Hub**: tổng hợp findings từ GuardDuty/Inspector/Macie/3rd party.
- **AWS Config**: track thay đổi config, compliance rule.
- **CloudTrail**: log API call (mặc định 90 ngày event history). Lưu S3 + CloudWatch Logs.
- **CloudTrail Lake**: query log bằng SQL.
- **AWS Organizations**: multi-account, SCP, consolidated billing.
- **Control Tower**: setup landing zone multi-account theo best practice.
- **IAM Access Analyzer**: tìm resource share ra ngoài account.
- **AWS Artifact**: tải compliance report (SOC, ISO, PCI…).
- **AWS Audit Manager**: hỗ trợ audit.

---

## XVII. Monitoring

- **CloudWatch Metrics**: free 5 phút, **detailed monitoring** 1 phút (có phí). Custom metric tới 1s.
- **CloudWatch Logs**: tập trung log, retention từ 1 ngày đến forever.
- **CloudWatch Logs Insights**: query log SQL-like.
- **CloudWatch Alarms**: trigger action (SNS, ASG, EC2 action).
- **CloudWatch Synthetics**: canary HTTP, UI test.
- **CloudWatch RUM**: real user monitoring (browser).
- **CloudWatch Application Signals**: APM mới.
- **X-Ray**: distributed tracing.
- **AWS Health Dashboard**: tình trạng AWS service.
- **AWS Trusted Advisor**: gợi ý cost, performance, security, fault tolerance, service limit. Đầy đủ với Business/Enterprise support.

---

## XVIII. Tối ưu chi phí

- **Right sizing**: chọn instance phù hợp (Compute Optimizer gợi ý).
- **Reserved / Savings Plans**: workload ổn định.
- **Spot**: stateless, fault-tolerant.
- **S3 lifecycle + Intelligent-Tiering** cho data ít dùng.
- **EBS**: snapshot và xóa volume không dùng; gp3 thường rẻ hơn gp2 cùng IOPS.
- **NAT GW** đắt → cân nhắc VPC Endpoint cho S3/DynamoDB.
- **Data transfer**:
  - In: free.
  - Out Internet: tính tiền.
  - Cross-AZ: tính tiền 2 chiều.
  - Same AZ qua **private IP**: free; qua public IP/Elastic IP: tính tiền.
- **CloudFront** giảm chi phí egress so với S3/EC2 trực tiếp.
- **Cost Explorer**: phân tích chi phí.
- **AWS Budgets**: alert chi phí.
- **Cost Allocation Tags**: phân loại resource.
- **Compute Optimizer**: ML khuyến nghị instance type, EBS, Lambda.
- **Savings Plans Recommendations**.

---

## XIX. Disaster Recovery Strategies

| Strategy | RTO | RPO | Chi phí |
|---|---|---|---|
| **Backup & Restore** | Giờ – ngày | Giờ | Thấp |
| **Pilot Light** | 10s phút | Phút | Trung bình |
| **Warm Standby** | Phút | Giây – phút | Cao |
| **Multi-Site (Hot)** | Gần 0 | Gần 0 | Cao nhất |

Công cụ: **AWS Backup**, **AWS Elastic Disaster Recovery (DRS)**, RDS snapshot/cross-region, S3 CRR, Route 53 failover, Aurora Global Database.

---

## XX. Decoupling & Patterns thường gặp

- **3-tier**: ALB → Web tier (ASG) → App tier (ASG) → RDS Multi-AZ + ElastiCache.
- **Serverless web**: CloudFront → S3 (static) + API Gateway → Lambda → DynamoDB.
- **Async processing**: API GW → SQS → Lambda/ECS → DB.
- **Fan-out**: SNS → nhiều SQS → nhiều consumer.
- **Event-driven**: EventBridge rule → Lambda.
- **Streaming analytics**: Kinesis Data Streams → Firehose → S3 + Athena/QuickSight.
- **Hybrid**: Direct Connect + VPN backup + Transit Gateway.
- **Static website + CDN**: S3 + CloudFront + ACM + Route 53.
- **Microservices**: ECS/EKS + Service Discovery + ALB + App Mesh.

---

## XXI. Một số "bẫy" hay gặp trong đề thi

1. **S3 → DynamoDB/S3**: Gateway endpoint (không tốn phí, không qua NAT GW).
2. **Multi-AZ vs Read Replica**: Multi-AZ = HA, Read Replica = scale read.
3. **EFS chỉ cho Linux**, **FSx for Windows** cho Windows.
4. **Aurora Global Database** cho DR cross-region < 1 phút RTO.
5. **CloudFront + S3**: dùng **OAC**, KHÔNG để bucket public.
6. **NLB**: static IP / Elastic IP. **ALB**: chỉ DNS, không static IP (nếu cần dùng Global Accelerator phía trước).
7. **SQS FIFO** giới hạn 300 msg/s (3000 với batching), hỏi throughput cao → Standard hoặc Kinesis.
8. **Spot** cho batch, **Reserved/Savings Plans** cho steady state.
9. **DynamoDB DAX** chỉ tương thích DynamoDB (không phải Redis).
10. **Kinesis Data Streams**: real-time, retention dài, có shard.  
    **Firehose**: near-real-time, no shard, đích tới sẵn.
11. **Lambda timeout 15 phút** → workload dài hơn cần ECS Fargate/Batch.
12. **Storage Gateway File Gateway** cho NFS/SMB tới S3 (không phải DataSync).
13. **DataSync** cho **one-time/periodic migration**, không phải truy cập real-time.
14. **Direct Connect** mất vài tuần setup → nếu hỏi "ngay lập tức", chọn Site-to-Site VPN.
15. **Encrypted snapshot share**: phải share cả KMS key.
16. **RDS Read Replica**: tối đa 15. **Aurora Replica**: 15. **DynamoDB Global Table**: replicate cross-region.
17. **S3 cross-region replication**: yêu cầu **versioning bật ở cả 2 bucket**.
18. **EBS** chỉ trong 1 AZ; muốn cross-AZ → **snapshot** rồi tạo volume mới.
19. **NAT Gateway**: trong 1 AZ → cần đặt **mỗi AZ một cái** để HA.
20. **Security Group** không cho phép rule Deny, chỉ NACL có.

---

## XXII. Identity bổ sung (Cognito, Directory Service, RAM)

### Amazon Cognito
- Quản lý **đăng nhập cho ứng dụng web/mobile** (khác IAM — IAM cho người dùng AWS nội bộ).
- **User Pool**: thư mục người dùng, xử lý **authentication** (đăng ký, đăng nhập, MFA, social login Google/Facebook, SAML/OIDC). Trả về **JWT token**. Dùng làm **authorizer cho API Gateway**.
- **Identity Pool (Federated Identities)**: cấp **credentials AWS tạm thời** (qua STS) để app truy cập trực tiếp service AWS (S3, DynamoDB). Xử lý **authorization**.
- Mẹo thi: "authenticate users của web/mobile app" → User Pool. "cho phép app gọi thẳng service AWS" → Identity Pool.

### AWS Directory Service
- **AWS Managed Microsoft AD**: AD thật chạy trên AWS, hỗ trợ trust với on-prem AD, group policy.
- **AD Connector**: proxy, chuyển yêu cầu auth về **on-prem AD** (không lưu data trên AWS).
- **Simple AD**: AD-compatible nhỏ, rẻ (Samba), không hỗ trợ trust/MFA nâng cao.
- Mẹo: cần dùng on-prem AD hiện có để đăng nhập → **AD Connector**; cần AD độc lập trên cloud → Managed Microsoft AD.

### Federation
- **SAML 2.0**: liên kết IdP doanh nghiệp (ADFS) với AWS → IAM role. Dùng cho > vài trăm user thay vì tạo IAM user.
- **IAM Identity Center**: cách hiện đại để SSO nhiều account + ứng dụng (đã nêu mục II).
- **Custom identity broker**: khi IdP **không hỗ trợ SAML**, tự viết broker gọi STS lấy credential tạm.

### AWS Resource Access Manager (RAM)
- Chia sẻ tài nguyên **cross-account** trong Organizations: subnet, Transit Gateway, prefix list, Route 53 Resolver rule, License Manager.
- Mẹo: chia sẻ prefix list / subnet giữa các account → RAM.

---

## XXIII. Compute bổ sung

### Elastic Beanstalk
- **PaaS**: deploy app (Java, .NET, PHP, Node, Python, Go, Docker) — AWS tự lo EC2, ALB, ASG, health.
- Bạn vẫn sở hữu và thấy được tài nguyên bên dưới.
- **Deployment policies**: All-at-once, Rolling, Rolling with additional batch, Immutable, **Blue/Green** (swap URL).
- Mẹo: deploy nhanh app truyền thống, ít thay đổi kiến trúc → Beanstalk.

### AWS Batch
- Chạy **batch job** quy mô lớn (hàng loạt), tự provision EC2/Fargate theo nhu cầu.
- Hợp với job dài > 15 phút (vượt giới hạn Lambda) và workload tính toán hàng loạt.

### Edge & Hybrid
- **AWS Outposts**: rack phần cứng AWS đặt **tại data center khách hàng** — chạy EC2, EBS, ECS, EKS, RDS on-prem với API AWS.
- **AWS Local Zones**: hạ tầng AWS đặt gần thành phố lớn — latency **single-digit ms** cho người dùng khu vực đó.
- **AWS Wavelength**: nhúng compute vào mạng **5G** của telco — latency cực thấp cho mobile.
- **ECS Anywhere / EKS Anywhere**: chạy container trên hạ tầng on-prem, quản lý từ AWS.

### Amazon Lightsail
- VPS đơn giản, giá cố định/tháng. Dùng cho website nhỏ, người mới, không cần linh hoạt như EC2.

### EC2 Auto Scaling — chi tiết bổ sung
- **Warm pools**: giữ sẵn instance đã khởi tạo (stopped) để scale-out nhanh, giảm cold start.
- **Instance Refresh**: thay dần instance khi đổi launch template/AMI.
- **Mixed instances policy**: kết hợp On-Demand + Spot, nhiều loại instance trong 1 ASG.

---

## XXIV. Databases chuyên biệt (purpose-built)

| Database | Loại | Use case điển hình |
|---|---|---|
| **Neptune** | Graph | Mạng xã hội, recommendation, fraud detection, knowledge graph |
| **DocumentDB** | Document (MongoDB-compatible) | Workload MongoDB cần managed |
| **Keyspaces** | Wide-column (Cassandra-compatible) | Workload Cassandra, serverless |
| **Timestream** | Time-series | Dữ liệu IoT, metric, telemetry theo thời gian |
| **QLDB** | Ledger | Lịch sử thay đổi **immutable, cryptographically verifiable** — kế toán, audit |
| **MemoryDB for Redis** | In-memory durable | DB chính tốc độ microsecond, bền (khác ElastiCache là cache) |

- Mẹo: "immutable verifiable log" → **QLDB**. "graph/relationship" → **Neptune**. "time-series IoT" → **Timestream**.

---

## XXV. AI/ML Services (thường gặp trong tình huống)

- **Rekognition**: phân tích ảnh/video — nhận diện vật thể, khuôn mặt, **kiểm duyệt nội dung không phù hợp**.
- **Textract**: trích xuất **text/dữ liệu từ tài liệu scan**, form, bảng.
- **Comprehend**: NLP — phân tích **sentiment**, entity, ngôn ngữ, key phrase. **Comprehend Medical** cho thông tin y tế (PHI).
- **Transcribe**: speech-to-text. Có **PII redaction** (che thông tin nhạy cảm trong transcript).
- **Translate**: dịch ngôn ngữ tự động.
- **Polly**: text-to-speech.
- **Forecast**: dự báo time-series (nhu cầu, tồn kho) — **không cần kinh nghiệm ML**.
- **Kendra**: enterprise search thông minh.
- **SageMaker**: build/train/deploy mô hình ML đầy đủ — khi cần model tùy biến.
- **Personalize**: gợi ý cá nhân hóa real-time.
- Mẹo thi: "không có kinh nghiệm ML / không train model" → chọn service AI dựng sẵn (Rekognition, Comprehend, Forecast…), tránh SageMaker.

---

## XXVI. Management & Governance

### CloudFormation
- **Infrastructure as Code** — template JSON/YAML, tạo/cập nhật/xóa tài nguyên có thứ tự.
- **Stack**: tập hợp tài nguyên. **Change Sets**: xem trước thay đổi.
- **StackSets**: deploy 1 template ra **nhiều account và nhiều region** cùng lúc (qua Organizations).
- **Drift detection**: phát hiện thay đổi thủ công lệch khỏi template.
- Mẹo: deploy hạ tầng lặp lại, nhiều account → CloudFormation/StackSets.

### AWS Systems Manager (SSM)
- **Session Manager**: SSH/RDP vào EC2 **không cần bastion host, không cần mở port, không cần key** — chỉ cần IAM. Có log.
- **Patch Manager**: vá OS hàng loạt theo lịch (maintenance window).
- **Run Command**: chạy lệnh trên nhiều instance cùng lúc.
- **Parameter Store**: lưu config/secret (Standard miễn phí). SecureString dùng KMS.
- **Automation**: runbook tự động hóa tác vụ vận hành.
- **State Manager / Inventory**: giữ cấu hình mong muốn, kiểm kê phần mềm.
- Mẹo: "kết nối EC2 an toàn không bastion" → Session Manager; "vá hàng trăm EC2" → Patch Manager.

### Khác
- **AWS Service Catalog**: danh mục sản phẩm IT được duyệt sẵn cho người dùng tự phục vụ (self-service) trong giới hạn.
- **AWS AppConfig**: quản lý và triển khai cấu hình ứng dụng có kiểm soát (feature flag).
- **AWS Proton**: tự động hóa deploy cho container/serverless ở quy mô tổ chức.
- **AWS Control Tower**: dựng landing zone multi-account theo best practice (đã nêu mục XVI).
- **AWS License Manager**: quản lý license phần mềm (BYOL).

---

## XXVII. AWS Backup & bảo vệ dữ liệu

- **AWS Backup**: dịch vụ backup **tập trung** cho EBS, EC2, RDS, Aurora, DynamoDB, EFS, FSx, Storage Gateway, S3…
  - **Backup plan**: lịch + retention. **Backup vault**: nơi lưu.
  - **Vault Lock**:
    - **Governance mode**: user có quyền đặc biệt vẫn xóa được.
    - **Compliance mode**: **không ai xóa/sửa được** tới hết retention (kể cả root) — dùng cho compliance.
  - Hỗ trợ **cross-region** và **cross-account** backup.
- **Amazon Data Lifecycle Manager (DLM)**: tự động tạo/xóa **EBS snapshot và AMI** theo lịch.
- **Recycle Bin**: khôi phục **EBS snapshot và AMI** đã xóa nhầm trong thời gian retention.
- **DynamoDB**: PITR (35 ngày) + on-demand backup.
- **RDS/Aurora**: automated backup (1–35 ngày) + manual snapshot (giữ mãi).
- Mẹo: "ngăn xóa nhầm AMI/snapshot" → Recycle Bin; "backup tập trung nhiều service" → AWS Backup; "WORM không ai xóa được" → Vault Lock compliance mode hoặc S3 Object Lock compliance mode.

---

## XXVIII. Kiến thức bổ sung (Global Infrastructure & dịch vụ khác)

### AWS Global Infrastructure
- **Region**: vùng địa lý độc lập (vd `us-east-1`, `ap-southeast-1`). Mỗi Region tách biệt, dữ liệu không tự rời Region.
- **Availability Zone (AZ)**: 1 hoặc nhiều data center trong 1 Region, cách ly lỗi nhau, nối bằng mạng latency thấp. Mỗi Region có **3+ AZ**. Triển khai multi-AZ = HA.
- **Edge Location / Point of Presence**: điểm CDN (CloudFront, Route 53, Global Accelerator) — hàng trăm, gần người dùng hơn Region.
- **Local Zones / Wavelength / Outposts**: hạ tầng AWS đặt gần người dùng hoặc on-prem (đã nêu mục XXIII).
- **Chọn Region dựa trên**:
  1. **Compliance** — luật yêu cầu dữ liệu nằm trong quốc gia.
  2. **Latency** — gần người dùng cuối.
  3. **Service availability** — không phải Region nào cũng có đủ service mới.
  4. **Pricing** — giá khác nhau giữa các Region.

### S3 CORS (Cross-Origin Resource Sharing)
- Cho phép web ở **origin (domain) này** gọi tài nguyên S3 ở **origin khác**.
- Cấu hình bằng **CORS rule** (JSON) trên bucket: allowed origins, methods, headers.
- Tình huống thi: trang web tải asset (font, ảnh, JS) từ S3 bucket khác domain → bị trình duyệt chặn → **bật CORS trên bucket S3**.

### End-User Computing
- **Amazon WorkSpaces**: Desktop-as-a-Service — máy ảo Windows/Linux trên cloud cho nhân viên truy cập từ xa.
- **Amazon AppStream 2.0**: stream **ứng dụng** (không phải cả desktop) tới trình duyệt người dùng.
- **Amazon WorkDocs**: lưu trữ và chia sẻ tài liệu (đã ngừng nhận khách mới — ít gặp trong đề mới).

### Developer & CI/CD
- **AWS Amplify**: nền tảng build + host **web/mobile app full-stack** nhanh (frontend hosting, auth qua Cognito, API, CI/CD tích hợp).
- **AWS CodeCommit**: Git repo managed (đang dần ngừng cho khách mới).
- **AWS CodeBuild**: build và test code managed.
- **AWS CodeDeploy**: tự động deploy lên EC2/Lambda/ECS.
- **AWS CodePipeline**: orchestrate pipeline CI/CD (source → build → deploy).
- **AWS SAM (Serverless Application Model)**: framework + CLI để định nghĩa và deploy ứng dụng **serverless** (mở rộng của CloudFormation, cú pháp ngắn gọn cho Lambda/API Gateway/DynamoDB).

> Các dịch vụ mục này có **trọng số thấp** trong SAA-C03 — biết khái niệm và use case là đủ, không cần đi sâu.

---

## XXIX. Hands-on Labs (thực hành trên AWS Free Tier)

> Làm tay từng lab giúp nhớ lâu hơn đọc lý thuyết. Mỗi lab nêu **mục tiêu → các bước → học được gì**.

### Lab 1 — Tạo VPC với public + private subnet
**Mục tiêu**: hiểu mạng nền tảng.
1. VPC console → **Create VPC** → chọn "VPC and more" → CIDR `10.0.0.0/16`.
2. Chọn 2 AZ, 2 public subnet, 2 private subnet.
3. Để wizard tạo sẵn **Internet Gateway** và **1 NAT Gateway**.
4. Xem **Route Tables**: public subnet có route `0.0.0.0/0 → IGW`; private subnet có `0.0.0.0/0 → NAT`.
**Học được**: subnet gắn 1 AZ, public/private khác nhau ở route ra IGW, NAT cho private ra Internet 1 chiều.

### Lab 2 — Launch EC2 + Security Group + Session Manager
**Mục tiêu**: chạy server, kết nối an toàn không cần key.
1. EC2 → **Launch instance** → Amazon Linux, `t2.micro` (free tier).
2. Tạo **Security Group**: chỉ mở port 443 từ `0.0.0.0/0` (KHÔNG mở 22).
3. Gắn **IAM role** có policy `AmazonSSMManagedInstanceCore`.
4. Sau khi chạy → **Connect → Session Manager**.
**Học được**: Session Manager kết nối không cần bastion/port 22/SSH key; SG stateful, chỉ Allow.

### Lab 3 — ALB + Auto Scaling Group
**Mục tiêu**: HA và scale ngang.
1. Tạo **Launch Template** từ AMI Amazon Linux + user data cài web server.
2. Tạo **Target Group** (HTTP, health check `/`).
3. Tạo **Application Load Balancer** ở 2 public subnet, gắn target group.
4. Tạo **Auto Scaling Group**: min 2 / desired 2 / max 4, trải 2 AZ, gắn ALB target group.
5. Thêm **Target Tracking policy**: giữ CPU 50%.
**Học được**: ALB phân phối tải, ASG tự thay instance lỗi và scale theo CPU, multi-AZ = HA.

### Lab 4 — S3: versioning + lifecycle + static website
**Mục tiêu**: object storage, tối ưu chi phí.
1. Tạo bucket, bật **Versioning**.
2. Upload `index.html` → **Properties → Static website hosting** → enable.
3. **Management → Lifecycle rule**: chuyển object sang Standard-IA sau 30 ngày, Glacier sau 90 ngày.
4. Thử bật **Block Public Access** và quan sát truy cập bị chặn.
**Học được**: versioning chống ghi đè/xóa nhầm, lifecycle tự hạ tier giảm giá, Block Public Access mặc định bật.

### Lab 5 — IAM role cho EC2 truy cập S3
**Mục tiêu**: cấp quyền không dùng access key.
1. IAM → **Create role** → trusted entity = EC2.
2. Gắn policy `AmazonS3ReadOnlyAccess` (hoặc policy custom giới hạn 1 bucket).
3. Gán role vào EC2 (Actions → Security → Modify IAM role).
4. SSH/Session vào instance, chạy `aws s3 ls` — chạy được mà không cấu hình key.
**Học được**: role cấp credential tạm qua STS, không nhúng secret; nguyên tắc least privilege.

### Lab 6 — RDS Multi-AZ + Read Replica
**Mục tiêu**: HA và scale đọc cho database.
1. Tạo **RDS MySQL** → bật **Multi-AZ deployment**.
2. Bật **encryption at rest** (KMS) ngay lúc tạo.
3. Sau khi running → **Actions → Create read replica**.
4. Quan sát: Multi-AZ standby không nhận đọc; read replica có endpoint riêng để đọc.
**Học được**: Multi-AZ = availability (sync, failover tự động), Read Replica = scale đọc (async).

### Lab 7 — Serverless: Lambda + API Gateway
**Mục tiêu**: chạy code không cần server.
1. Lambda → **Create function** → runtime Python, viết hàm trả JSON.
2. API Gateway → tạo **REST API** → method GET → Integration = Lambda.
3. **Deploy** API ra stage `prod` → lấy URL → gọi thử bằng trình duyệt.
4. (Tùy chọn) thêm **Cognito authorizer** để bảo vệ method.
**Học được**: Lambda chạy theo event, API Gateway là HTTPS endpoint, kết hợp = serverless API.

### Lab 8 — CloudFront + S3 với OAC
**Mục tiêu**: CDN, bảo vệ bucket.
1. Tạo bucket S3 chứa nội dung tĩnh, **KHÔNG** mở public.
2. Tạo **CloudFront distribution**, origin = bucket S3.
3. Tạo **Origin Access Control (OAC)** → CloudFront tự cập nhật bucket policy.
4. Truy cập qua URL CloudFront chạy được; truy cập thẳng URL S3 bị từ chối.
**Học được**: CloudFront cache ở edge giảm latency; OAC đảm bảo chỉ CloudFront đọc được S3.

### Lab 9 — VPC Gateway Endpoint cho S3
**Mục tiêu**: truy cập S3 riêng tư, tiết kiệm chi phí.
1. VPC → **Endpoints → Create endpoint** → service `com.amazonaws.<region>.s3` → loại **Gateway**.
2. Gắn endpoint vào route table của private subnet.
3. Từ EC2 ở private subnet, chạy `aws s3 ls` — traffic đi qua endpoint, không qua NAT/Internet.
**Học được**: Gateway endpoint miễn phí, giữ traffic trong mạng AWS, tránh phí NAT Gateway.

---

## XXX. Gợi ý ôn thi

1. Đọc qua tài liệu này 2–3 lượt.
2. Xem khóa Stéphane Maarek hoặc Adrian Cantrill (lý thuyết sâu).
3. Làm **AWS Skill Builder Official Practice Question Set** (miễn phí).
4. Làm bộ đề **Tutorials Dojo** (sát đề thật nhất).
5. Đọc kỹ **Whitepapers**: Well-Architected, Disaster Recovery, Security Best Practices.
6. Lab AWS Free Tier để có "cảm giác" thật: tạo VPC, EC2, S3, RDS, Lambda…
7. Trước thi 1 tuần: làm lại các câu sai, xem flashcard service đặc trưng.

> Chúc bạn thi pass với điểm cao! 🚀
