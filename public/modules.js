// 12-module SAA-C03 study system. Theory content + quiz keyword tags.
// Diagrams are rendered by moduleDiagrams() in app.js (hand-built SVG).

export const MODULES = [
  {
    id: 'M1',
    title: 'Tổng quan & AWS Global Infrastructure',
    theory: `
      <p>AWS tổ chức hạ tầng theo 3 cấp: <strong>Region</strong> (vùng địa lý, ví dụ ap-southeast-1 Singapore), <strong>Availability Zone (AZ)</strong> (một hoặc nhiều data center độc lập trong region, cách ly lỗi), và <strong>Edge Location</strong> (điểm CDN của CloudFront, hơn 450 điểm toàn cầu).</p>
      <p>Nguyên tắc thiết kế cốt lõi: muốn <strong>high availability</strong> thì triển khai trên <strong>nhiều AZ</strong>; muốn <strong>disaster recovery / latency thấp toàn cầu</strong> thì cân nhắc <strong>nhiều Region</strong>.</p>
      <h4>Well-Architected Framework — 6 trụ cột</h4>
      <ul>
        <li>Operational Excellence — vận hành tốt, tự động hóa</li>
        <li>Security — bảo vệ dữ liệu, hệ thống</li>
        <li>Reliability — khôi phục sau lỗi, scale</li>
        <li>Performance Efficiency — dùng tài nguyên hiệu quả</li>
        <li>Cost Optimization — tối ưu chi phí</li>
        <li>Sustainability — giảm tác động môi trường</li>
      </ul>
      <h4>Shared Responsibility Model</h4>
      <p>AWS lo bảo mật <strong>của</strong> đám mây (phần cứng, hạ tầng vật lý). Khách hàng lo bảo mật <strong>trong</strong> đám mây (dữ liệu, IAM, patch OS của EC2, cấu hình service).</p>
    `,
    quizKw: ['Availability Zone', 'multiple AWS Regions', 'edge location', 'Well-Architected', 'shared responsib', 'disaster recovery', 'highly available'],
  },
  {
    id: 'M2',
    title: 'IAM & Identity',
    theory: `
      <p><strong>IAM</strong> là dịch vụ global, miễn phí, quản lý danh tính và phân quyền.</p>
      <ul>
        <li><strong>User</strong>: đại diện một người, có credentials.</li>
        <li><strong>Group</strong>: thùng chứa user; cấp quyền bằng cách attach IAM policy. Không attach role vào group được.</li>
        <li><strong>Role</strong>: danh tính được assume (đóng vai), dùng cho AWS service hoặc cross-account. Nhận STS token tạm thời, không có credentials cố định.</li>
        <li><strong>Policy</strong>: file JSON — thứ duy nhất thực sự cấp quyền. Gồm Effect, Action, Resource, Condition.</li>
      </ul>
      <p><strong>Quy tắc đánh giá quyền</strong>: mặc định Deny. Explicit Deny luôn thắng explicit Allow.</p>
      <h4>Loại policy</h4>
      <ul>
        <li>Identity-based — gắn user/group/role</li>
        <li>Resource-based — gắn vào resource (S3 bucket policy)</li>
        <li>Permission Boundary — giới hạn trần quyền của 1 user/role</li>
        <li>SCP — giới hạn trần quyền cấp account trong Organizations</li>
      </ul>
      <blockquote>Permission Boundary và SCP <strong>chỉ giới hạn</strong>, KHÔNG cấp quyền. Quyền thực tế = (policy cấp) ∩ (boundary) ∩ (SCP).</blockquote>
      <p><strong>STS</strong>: cấp credentials tạm thời (15 phút–12 giờ).</p>
    `,
    quizKw: ['IAM role', 'IAM policy', 'IAM user', 'least privilege', 'AssumeRole', 'permission boundary', 'service control polic', 'federation', 'IAM Identity Center'],
  },
  {
    id: 'M3',
    title: 'VPC & Networking',
    theory: `
      <p><strong>VPC</strong> là mạng riêng ảo trong một Region, định nghĩa bằng dải CIDR, chia thành <strong>Subnet</strong> (mỗi subnet thuộc 1 AZ).</p>
      <ul>
        <li><strong>Public subnet</strong>: route table có đường ra Internet Gateway (IGW).</li>
        <li><strong>Private subnet</strong>: ra ngoài qua NAT Gateway (1 chiều, managed, trong 1 AZ → đặt mỗi AZ một cái để HA).</li>
        <li><strong>VPC Endpoint</strong>: Gateway Endpoint miễn phí, chỉ cho S3 + DynamoDB. Interface Endpoint (PrivateLink) cho service khác, tính phí.</li>
      </ul>
      <h4>Kết nối VPC</h4>
      <ul>
        <li>VPC Peering — 1-1, không transitive</li>
        <li>Transit Gateway — hub nhiều VPC, transitive</li>
        <li>Site-to-Site VPN — qua Internet, nhanh setup</li>
        <li>Direct Connect — đường riêng, latency thấp, setup vài tuần</li>
      </ul>
      <p><strong>Bảo mật</strong>: Security Group (stateful, mức instance, chỉ Allow); NACL (stateless, mức subnet, có cả Allow và Deny).</p>
    `,
    quizKw: ['VPC', 'subnet', 'NAT gateway', 'internet gateway', 'VPC peering', 'Transit Gateway', 'VPC endpoint', 'security group', 'network ACL', 'Direct Connect', 'PrivateLink'],
  },
  {
    id: 'M4',
    title: 'EC2, Auto Scaling & Load Balancing',
    theory: `
      <h4>EC2 pricing</h4>
      <ul>
        <li>On-Demand — linh hoạt, đắt nhất</li>
        <li>Reserved Instances / Savings Plans — cam kết 1–3 năm, giảm tới ~72%, cho workload ổn định</li>
        <li>Spot — giảm tới 90%, AWS thu hồi với 2 phút báo trước, cho batch/fault-tolerant</li>
        <li>Dedicated Host — license BYOL</li>
      </ul>
      <h4>Elastic Load Balancer</h4>
      <ul>
        <li><strong>ALB</strong> — Layer 7, HTTP/HTTPS, routing path/host/header, không có static IP</li>
        <li><strong>NLB</strong> — Layer 4, TCP/UDP, latency cực thấp, có static IP / Elastic IP</li>
        <li><strong>GLB</strong> — Layer 3, cho firewall ảo / IDS/IPS</li>
      </ul>
      <h4>Auto Scaling Group</h4>
      <p>Min / Desired / Max capacity. Scaling policy: Target Tracking (giữ CPU = X%), Step, Simple, Scheduled, Predictive. Health check dùng EC2 hoặc ELB.</p>
    `,
    quizKw: ['EC2 instance', 'Auto Scaling', 'Load Balancer', 'Spot Instance', 'Reserved Instance', 'Savings Plan', 'placement group', 'On-Demand Instance'],
  },
  {
    id: 'M5',
    title: 'Storage: EBS, EFS, FSx, S3',
    theory: `
      <ul>
        <li><strong>EBS</strong> — block storage, gắn 1 EC2, bound trong 1 AZ. Cross-AZ phải tạo snapshot rồi tạo volume mới. Loại: gp3/gp2, io1/io2, st1, sc1.</li>
        <li><strong>Instance Store</strong> — ổ vật lý gắn host, ephemeral, mất khi stop/terminate.</li>
        <li><strong>EFS</strong> — file system NFS, chia sẻ nhiều EC2 nhiều AZ, Linux only, tự scale.</li>
        <li><strong>FSx for Windows</strong> — file share SMB. <strong>FSx for Lustre</strong> — HPC.</li>
        <li><strong>S3</strong> — object storage. Class: Standard → Standard-IA → Glacier Instant/Flexible → Glacier Deep Archive (rẻ nhất). Lifecycle policy tự chuyển/xóa. Cross-region replication yêu cầu bật versioning ở cả 2 bucket.</li>
      </ul>
    `,
    quizKw: ['Amazon S3', 'S3 bucket', 'Amazon EBS', 'Amazon EFS', 'FSx', 'S3 Glacier', 'S3 Lifecycle', 'S3 Standard', 'Elastic Block Store', 'Elastic File System'],
  },
  {
    id: 'M6',
    title: 'Databases: RDS, Aurora, DynamoDB, ElastiCache',
    theory: `
      <ul>
        <li><strong>RDS</strong> — relational managed. <strong>Multi-AZ</strong> = standby đồng bộ, failover tự động → tăng availability (KHÔNG scale read). <strong>Read Replica</strong> = bản sao bất đồng bộ, tối đa 15, để scale read.</li>
        <li><strong>Aurora</strong> — tương thích MySQL/PostgreSQL, hiệu năng cao, storage tự scale tới 128TB, 6 bản qua 3 AZ. Aurora Serverless tự scale. Aurora Global Database cho DR cross-region.</li>
        <li><strong>DynamoDB</strong> — NoSQL serverless, latency mili-giây. DAX = cache in-memory (chỉ cho DynamoDB). Global Tables = multi-region. Streams = bắt thay đổi trigger Lambda.</li>
        <li><strong>ElastiCache</strong> — Redis (replication, persistence) hoặc Memcached (đơn giản). Cho session store, leaderboard, giảm tải đọc DB.</li>
      </ul>
      <blockquote>Bẫy hay gặp: Multi-AZ ≠ scale read. Scale read là việc của Read Replica.</blockquote>
    `,
    quizKw: ['Amazon RDS', 'Amazon Aurora', 'DynamoDB', 'ElastiCache', 'read replica', 'Multi-AZ', 'DynamoDB Accelerator'],
  },
  {
    id: 'M7',
    title: 'Serverless: Lambda, API Gateway, Step Functions',
    theory: `
      <ul>
        <li><strong>Lambda</strong> — chạy code theo event, tối đa <strong>15 phút/lần</strong>, 10GB RAM. Workload dài hơn → ECS Fargate hoặc AWS Batch. Cold start giảm bằng Provisioned Concurrency. Lambda + RDS nên dùng RDS Proxy gom connection.</li>
        <li><strong>API Gateway</strong> — cổng API (REST / HTTP / WebSocket). Authorization: IAM, Cognito, Lambda authorizer. Có caching, throttling, stages.</li>
        <li><strong>Step Functions</strong> — orchestrate workflow nhiều bước. Standard (tới 1 năm) vs Express (tới 5 phút, throughput cao).</li>
      </ul>
    `,
    quizKw: ['AWS Lambda', 'API Gateway', 'Step Functions', 'serverless', 'AppSync', 'RDS Proxy'],
  },
  {
    id: 'M8',
    title: 'Decoupling & Messaging: SQS, SNS, EventBridge, Kinesis',
    theory: `
      <ul>
        <li><strong>SQS</strong> — hàng đợi message để decouple. Standard (throughput không giới hạn, có thể out-of-order) vs FIFO (đúng thứ tự, exactly-once, 300 msg/s, 3000 với batch).</li>
        <li><strong>SNS</strong> — pub/sub, 1 → nhiều subscriber. Fan-out pattern: SNS → nhiều SQS.</li>
        <li><strong>EventBridge</strong> — event bus, định tuyến event theo rule; có Scheduler thay cron.</li>
        <li><strong>Kinesis Data Streams</strong> — streaming real-time, có shard, retention dài. <strong>Firehose</strong> — near-real-time, không shard, tự nạp vào S3/Redshift/OpenSearch.</li>
      </ul>
    `,
    quizKw: ['Amazon SQS', 'Amazon SNS', 'EventBridge', 'Kinesis', 'message queue', 'decoupl', 'Amazon MQ'],
  },
  {
    id: 'M9',
    title: 'Edge & Content Delivery: CloudFront, Route 53, Global Accelerator',
    theory: `
      <ul>
        <li><strong>CloudFront</strong> — CDN, cache nội dung ở edge location, giảm latency toàn cầu. Dùng OAC để chỉ CloudFront đọc được S3 (không để bucket public). Signed URL/Cookie bảo vệ nội dung trả phí.</li>
        <li><strong>Route 53</strong> — DNS managed. Routing policy: Simple, Weighted, Latency, Failover (kèm health check), Geolocation, Geoproximity, Multivalue.</li>
        <li><strong>Global Accelerator</strong> — Anycast IP qua backbone AWS, cho ứng dụng non-HTTP, gaming, IoT; static IP, failover region tự động.</li>
      </ul>
    `,
    quizKw: ['CloudFront', 'Route 53', 'Global Accelerator', 'edge location', 'routing policy', 'origin access'],
  },
  {
    id: 'M10',
    title: 'Security Services',
    theory: `
      <ul>
        <li><strong>KMS</strong> — quản lý khóa mã hóa, envelope encryption, multi-Region keys.</li>
        <li><strong>Secrets Manager</strong> — lưu secret, tự rotate. Parameter Store — lưu config/secret (Standard miễn phí).</li>
        <li><strong>WAF</strong> — firewall Layer 7 (chặn SQLi, XSS, rate-based) cho ALB/CloudFront/API GW.</li>
        <li><strong>Shield</strong> — chống DDoS: Standard (free), Advanced (trả phí, L7).</li>
        <li><strong>GuardDuty</strong> — phát hiện mối đe dọa bằng ML. <strong>Macie</strong> — phát hiện PII trong S3. <strong>Inspector</strong> — quét lỗ hổng EC2/ECR/Lambda.</li>
        <li><strong>CloudTrail</strong> — log mọi API call. <strong>AWS Config</strong> — theo dõi thay đổi cấu hình & compliance.</li>
      </ul>
    `,
    quizKw: ['AWS KMS', 'Secrets Manager', 'AWS WAF', 'AWS Shield', 'GuardDuty', 'Amazon Macie', 'Amazon Inspector', 'CloudTrail', 'AWS Config', 'encrypt'],
  },
  {
    id: 'M11',
    title: 'Migration, Hybrid & Cost Optimization',
    theory: `
      <ul>
        <li><strong>DataSync</strong> — chuyển dữ liệu on-prem ↔ AWS, migration một lần hoặc định kỳ.</li>
        <li><strong>Storage Gateway</strong> — on-prem truy cập file liên tục vào S3 (File / Volume / Tape Gateway).</li>
        <li><strong>DMS</strong> — migrate database; SCT cho khác engine.</li>
        <li><strong>Snow Family</strong> — chuyển khối lượng lớn khi mạng hạn chế.</li>
      </ul>
      <h4>Tối ưu chi phí</h4>
      <p>Savings Plans/RI cho workload ổn định; Spot cho batch; S3 lifecycle + Intelligent-Tiering; thay NAT Gateway bằng VPC Endpoint cho S3/DynamoDB; CloudFront giảm chi phí egress. Data transfer: vào miễn phí, ra Internet và cross-AZ tính phí.</p>
      <h4>Disaster Recovery — 4 chiến lược</h4>
      <p>Backup &amp; Restore (rẻ, RTO giờ) → Pilot Light → Warm Standby → Multi-Site Active-Active (RTO gần 0, đắt nhất).</p>
    `,
    quizKw: ['DataSync', 'Storage Gateway', 'Snowball', 'Database Migration Service', 'disaster recovery', 'cost-effective', 'Savings Plan', 'RTO', 'RPO', 'migrate'],
  },
  {
    id: 'M12',
    title: 'Kiến trúc tham chiếu & các "bẫy" thường gặp',
    theory: `
      <h4>Luật bất biến cần thuộc</h4>
      <ul>
        <li>EBS chỉ trong 1 AZ; cross-AZ phải qua snapshot.</li>
        <li>S3 cross-region replication bắt buộc bật versioning cả 2 bucket.</li>
        <li>NAT Gateway nằm trong 1 AZ → HA phải đặt mỗi AZ một cái.</li>
        <li>ALB không có static IP; NLB thì có.</li>
        <li>Lambda tối đa 15 phút.</li>
        <li>Security Group không có rule Deny; chỉ NACL có.</li>
        <li>Multi-AZ ≠ scale read (đó là việc của Read Replica).</li>
        <li>Gateway Endpoint chỉ cho S3 và DynamoDB.</li>
        <li>DAX chỉ dùng cho DynamoDB.</li>
        <li>Encrypted snapshot khi share phải share cả KMS key.</li>
      </ul>
      <h4>Kiến trúc 3-tier điển hình</h4>
      <p>Route 53 → CloudFront → ALB → Web tier (ASG nhiều AZ) → App tier (ASG nhiều AZ) → ElastiCache + RDS Multi-AZ.</p>
    `,
    quizKw: ['highly available', 'high availability', 'three-tier', 'fault tolerant', 'most cost-effective', 'least operational overhead'],
  },
];
