// 12-module SAA-C03 study system. Theory content + quiz keyword tags.
// Diagrams are rendered by moduleDiagrams() in app.js (hand-built SVG).

export const MODULES = [
  {
    id: 'M1',
    title: 'Tổng quan & AWS Global Infrastructure',
    theory: `
      <p>AWS tổ chức hạ tầng theo nhiều cấp. Hiểu rõ từng cấp giúp trả lời đúng nhóm câu hỏi "đặt tài nguyên ở đâu để đạt HA / DR / latency thấp".</p>
      <h4>Region</h4>
      <p><strong>Region</strong> là một vùng địa lý (ví dụ ap-southeast-1 Singapore, us-east-1 N. Virginia). Mỗi Region hoàn toàn tách biệt nhau — dữ liệu không tự động rời Region trừ khi bạn cấu hình. Khi chọn Region cân nhắc 4 yếu tố: <strong>tuân thủ pháp lý</strong> (dữ liệu phải nằm trong quốc gia), <strong>độ trễ tới người dùng</strong>, <strong>giá</strong> (mỗi Region giá khác nhau), và <strong>service availability</strong> (service mới ra thường có ở us-east-1 trước).</p>
      <h4>Availability Zone (AZ)</h4>
      <p>Mỗi Region có tối thiểu 3 <strong>AZ</strong>. Mỗi AZ là một hoặc nhiều data center độc lập về điện, làm mát, mạng, cách nhau vài km nhưng nối bằng đường mạng tốc độ cao độ trễ thấp. AZ là đơn vị <strong>cách ly lỗi</strong>: một AZ chết thì AZ khác vẫn chạy. Đây là lý do mọi thiết kế HA đều "trải qua nhiều AZ".</p>
      <h4>Edge Location & hạ tầng lai</h4>
      <ul>
        <li><strong>Edge Location</strong> — hơn 450 điểm CDN của CloudFront, cache nội dung gần người dùng.</li>
        <li><strong>Regional Edge Cache</strong> — tầng cache lớn hơn giữa edge và origin.</li>
        <li><strong>Local Zones</strong> — đặt compute/storage sát thành phố lớn, cho latency single-digit ms khi Region quá xa.</li>
        <li><strong>Wavelength Zones</strong> — nhúng hạ tầng AWS vào mạng 5G của nhà mạng cho ứng dụng siêu thấp trễ.</li>
        <li><strong>Outposts</strong> — rack phần cứng AWS đặt ngay trong data center của khách, dùng khi data <em>bắt buộc</em> ở on-premises.</li>
      </ul>
      <h4>Nguyên tắc thiết kế cốt lõi</h4>
      <p>Muốn <strong>high availability</strong> trong một Region → triển khai trên <strong>nhiều AZ</strong>. Muốn <strong>disaster recovery</strong> hoặc phục vụ người dùng toàn cầu với latency thấp → cân nhắc <strong>nhiều Region</strong>. Câu hỏi nói "một AZ" hoặc "single point of failure" → đáp án gần như luôn là "trải nhiều AZ".</p>
      <h4>Well-Architected Framework — 6 trụ cột</h4>
      <ul>
        <li>Operational Excellence — vận hành tốt, tự động hóa, infrastructure as code</li>
        <li>Security — bảo vệ dữ liệu và hệ thống, least privilege</li>
        <li>Reliability — khôi phục sau lỗi, tự scale, không có single point of failure</li>
        <li>Performance Efficiency — chọn đúng tài nguyên, dùng serverless khi hợp</li>
        <li>Cost Optimization — trả đúng cái dùng, dừng cái thừa</li>
        <li>Sustainability — giảm tác động môi trường</li>
      </ul>
      <h4>Shared Responsibility Model</h4>
      <p>AWS lo bảo mật <strong>CỦA</strong> đám mây (phần cứng, hạ tầng vật lý, ảo hóa). Khách hàng lo bảo mật <strong>TRONG</strong> đám mây. Ranh giới <em>dịch chuyển theo loại service</em>:</p>
      <ul>
        <li><strong>EC2</strong> (IaaS) — khách lo nhiều nhất: patch OS, cấu hình firewall, mã hóa.</li>
        <li><strong>RDS</strong> (managed) — AWS lo patch OS/DB engine; khách lo cấu hình, IAM, mã hóa, network.</li>
        <li><strong>S3 / Lambda / DynamoDB</strong> (serverless) — khách chỉ lo dữ liệu, quyền truy cập, mã hóa.</li>
      </ul>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>"single AZ" / "single point of failure" trong đề → đáp án có "Multi-AZ".</li>
        <li>"toàn cầu" + "DR" → multi-Region; "toàn cầu" + "latency tải nội dung" → CloudFront/edge.</li>
        <li>"data phải ở on-premises" nhưng vẫn cần dịch vụ AWS → <strong>Outposts</strong>.</li>
        <li>"latency single-digit ms" mà Region quá xa → <strong>Local Zones</strong>.</li>
        <li>Patch OS: EC2 = khách; RDS = AWS. Hỏi "ai chịu trách nhiệm" → xác định loại service trước.</li>
      </ul>
    `,
    quizKw: ['Availability Zone', 'multiple AWS Regions', 'edge location', 'Well-Architected', 'shared responsib', 'disaster recovery', 'highly available'],
  },
  {
    id: 'M2',
    title: 'IAM & Identity',
    theory: `
      <p><strong>IAM</strong> (Identity and Access Management) là dịch vụ <strong>global</strong>, miễn phí, kiểm soát ai được làm gì trên tài nguyên AWS. Đây là nhóm câu hỏi chiếm tỷ trọng lớn nhất trong domain Secure.</p>
      <h4>Các thực thể IAM</h4>
      <ul>
        <li><strong>User</strong> — đại diện một con người hoặc một ứng dụng cố định, có credentials lâu dài (password, access key). Hạn chế dùng access key cho ứng dụng.</li>
        <li><strong>Group</strong> — thùng chứa user, cấp quyền hàng loạt bằng cách attach policy. <em>Không</em> attach role vào group, <em>không</em> lồng group trong group.</li>
        <li><strong>Role</strong> — danh tính được <em>assume</em> (đóng vai) tạm thời. Dùng cho: AWS service (EC2, Lambda) truy cập service khác; truy cập cross-account; identity federation. Role nhận <strong>credentials tạm thời từ STS</strong>, không có mật khẩu cố định → an toàn hơn access key.</li>
        <li><strong>Policy</strong> — tài liệu JSON, là thứ <em>duy nhất</em> thực sự cấp/giới hạn quyền. Gồm Effect (Allow/Deny), Action, Resource, Condition.</li>
      </ul>
      <h4>Quy tắc đánh giá quyền (rất hay ra đề)</h4>
      <ol>
        <li>Mặc định mọi request bị <strong>DENY ngầm</strong>.</li>
        <li>Một <strong>explicit Allow</strong> ở bất kỳ policy nào sẽ cho phép.</li>
        <li>Một <strong>explicit Deny</strong> ở bất kỳ policy nào sẽ chặn — <strong>Deny luôn thắng Allow</strong>.</li>
      </ol>
      <p>Quyền thực tế = (policy cấp) ∩ (Permission Boundary) ∩ (SCP) ∩ (session policy). Thiếu một mắt xích → không có quyền.</p>
      <h4>Bốn loại policy</h4>
      <ul>
        <li><strong>Identity-based</strong> — gắn vào user/group/role.</li>
        <li><strong>Resource-based</strong> — gắn trực tiếp vào resource (S3 bucket policy, SQS access policy, KMS key policy). Cho phép truy cập cross-account mà không cần assume role.</li>
        <li><strong>Permission Boundary</strong> — đặt <em>trần</em> quyền tối đa của một user/role.</li>
        <li><strong>SCP (Service Control Policy)</strong> — đặt trần quyền cho cả account trong AWS Organizations.</li>
      </ul>
      <blockquote>Permission Boundary và SCP <strong>chỉ giới hạn</strong>, KHÔNG tự cấp quyền. SCP áp được cả lên root user của member account.</blockquote>
      <h4>Identity Federation — không tạo IAM user mới</h4>
      <ul>
        <li><strong>SAML 2.0</strong> — liên kết với Active Directory / IdP doanh nghiệp đã có.</li>
        <li><strong>Web Identity / Cognito</strong> — đăng nhập bằng Google/Facebook cho ứng dụng web/mobile công khai.</li>
        <li><strong>IAM Identity Center</strong> (trước là AWS SSO) — quản lý đăng nhập tập trung cho <em>nhiều account</em> trong Organizations; tích hợp IdP ngoài; dùng permission set thay vì IAM user.</li>
      </ul>
      <h4>STS & best practice</h4>
      <p><strong>STS</strong> cấp credentials tạm thời (15 phút – 12 giờ). Luôn ưu tiên role + STS hơn access key cố định. Bảo vệ root user: tạo IAM user cho việc hằng ngày, bật <strong>MFA</strong> cho root, không tạo access key cho root, đăng ký nhiều MFA device để khỏi mất quyền.</p>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>EC2/Lambda cần truy cập service khác → luôn là <strong>IAM Role</strong>, không bao giờ nhúng access key.</li>
        <li>Đăng nhập bằng danh tính doanh nghiệp đã có → SAML federation / IAM Identity Center. Người dùng app công khai → Cognito.</li>
        <li>Cấp quyền cross-account → IAM role (assume role) HOẶC resource-based policy.</li>
        <li>Chặn cả root của member account → <strong>SCP</strong> (chỉ SCP làm được).</li>
        <li>"Explicit Deny" xuất hiện trong đề → kết quả luôn là bị chặn.</li>
        <li>Câu hỏi 403 dù policy có Allow → kiểm tra <strong>Condition</strong> (IP, MFA, Region).</li>
      </ul>
    `,
    quizKw: ['IAM role', 'IAM policy', 'IAM user', 'least privilege', 'AssumeRole', 'permission boundary', 'service control polic', 'federation', 'IAM Identity Center'],
  },
  {
    id: 'M3',
    title: 'VPC & Networking',
    theory: `
      <p><strong>VPC</strong> (Virtual Private Cloud) là mạng riêng ảo của bạn trong một Region, định nghĩa bằng một dải <strong>CIDR</strong> (ví dụ 10.0.0.0/16). VPC có thể thêm tối đa 4 secondary CIDR block khi hết IP.</p>
      <h4>Subnet & Route Table</h4>
      <p>VPC chia thành <strong>Subnet</strong>, mỗi subnet nằm trong <strong>đúng 1 AZ</strong>. Mỗi subnet gắn một <strong>route table</strong> quyết định lưu lượng đi đâu.</p>
      <ul>
        <li><strong>Public subnet</strong> — route table có đường tới <strong>Internet Gateway (IGW)</strong>.</li>
        <li><strong>Private subnet</strong> — không có đường trực tiếp tới IGW; ra Internet qua <strong>NAT Gateway</strong>.</li>
      </ul>
      <h4>Các cổng ra Internet</h4>
      <ul>
        <li><strong>Internet Gateway</strong> — cho lưu lượng 2 chiều của public subnet.</li>
        <li><strong>NAT Gateway</strong> — managed, cho instance private đi <em>ra</em> Internet (1 chiều), không cho ngoài kết nối vào. NAT GW nằm trong <strong>1 AZ</strong> → muốn HA phải đặt mỗi AZ một cái.</li>
        <li><strong>Egress-only Internet Gateway</strong> — bản NAT dành cho <strong>IPv6</strong>: cho ra, chặn vào.</li>
      </ul>
      <h4>VPC Endpoint — truy cập service AWS không qua Internet</h4>
      <ul>
        <li><strong>Gateway Endpoint</strong> — <em>miễn phí</em>, chỉ hỗ trợ <strong>S3 và DynamoDB</strong>, thêm vào route table.</li>
        <li><strong>Interface Endpoint</strong> (PrivateLink) — cho hầu hết service khác, tạo ENI trong subnet, tính phí.</li>
      </ul>
      <h4>Kết nối VPC với VPC / on-premises</h4>
      <ul>
        <li><strong>VPC Peering</strong> — nối 1-1, <em>không transitive</em>, CIDR không được trùng.</li>
        <li><strong>Transit Gateway</strong> — hub trung tâm nối nhiều VPC + VPN + DX, <em>transitive</em>, đơn giản hóa mạng quy mô lớn.</li>
        <li><strong>Site-to-Site VPN</strong> — đường hầm mã hóa qua Internet, dựng trong vài phút, latency phụ thuộc Internet.</li>
        <li><strong>Direct Connect (DX)</strong> — đường cáp riêng tới AWS, latency thấp ổn định, băng thông cao; setup mất nhiều tuần. <strong>DX Gateway</strong> nối một DX tới nhiều VPC ở nhiều Region.</li>
      </ul>
      <p>Tình huống thường gặp: cần <em>ngay và mã hóa</em> → VPN; cần <em>ổn định, hiệu năng cao lâu dài</em> → DX; muốn an toàn tối đa → DX + VPN chạy trên DX.</p>
      <h4>Security Group vs Network ACL</h4>
      <ul>
        <li><strong>Security Group</strong> — tường lửa mức <em>instance</em>, <strong>stateful</strong> (cho vào thì tự cho ra), <em>chỉ có rule Allow</em>. Có thể tham chiếu SG khác.</li>
        <li><strong>Network ACL</strong> — tường lửa mức <em>subnet</em>, <strong>stateless</strong> (phải mở cả chiều vào lẫn ra), có cả rule <strong>Allow và Deny</strong> → dùng để chặn IP cụ thể.</li>
      </ul>
      <h4>Giám sát</h4>
      <p><strong>VPC Flow Logs</strong> ghi lại lưu lượng IP đi/đến các network interface — dùng để gỡ lỗi kết nối và phân tích bảo mật. Bastion host / Session Manager để quản trị instance private.</p>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>Cần <strong>chặn một IP độc hại</strong> → NACL (Deny rule); Security Group không chặn được.</li>
        <li>EC2 ↔ S3/DynamoDB không qua Internet, miễn phí → <strong>Gateway Endpoint</strong>.</li>
        <li>EC2 ↔ service khác không qua Internet → <strong>Interface Endpoint / PrivateLink</strong>.</li>
        <li>Nhiều VPC nối nhau, ít quản trị → <strong>Transit Gateway</strong>; chỉ 2 VPC → Peering.</li>
        <li>NAT Gateway HA → mỗi AZ một cái. IPv6 ra Internet một chiều → egress-only IGW.</li>
        <li>VPC hết IP → thêm secondary CIDR block.</li>
      </ul>
    `,
    quizKw: ['VPC', 'subnet', 'NAT gateway', 'internet gateway', 'VPC peering', 'Transit Gateway', 'VPC endpoint', 'security group', 'network ACL', 'Direct Connect', 'PrivateLink'],
  },
  {
    id: 'M4',
    title: 'EC2, Auto Scaling & Load Balancing',
    theory: `
      <p>EC2 là dịch vụ máy ảo. Đề thi xoay quanh 3 trục: <strong>chọn mô hình giá đúng</strong>, <strong>chọn loại load balancer đúng</strong>, và <strong>cấu hình auto scaling</strong>.</p>
      <h4>Mô hình giá EC2</h4>
      <ul>
        <li><strong>On-Demand</strong> — trả theo giây/giờ, linh hoạt nhất, đắt nhất. Cho workload ngắn, không đoán trước.</li>
        <li><strong>Reserved Instances (RI)</strong> — cam kết 1–3 năm, giảm tới ~72%. Cho workload <em>ổn định, chạy liên tục</em>.</li>
        <li><strong>Savings Plans</strong> — cam kết mức chi tiêu $/giờ trong 1–3 năm. <em>Compute</em> Savings Plan linh hoạt nhất (đổi cả family, Region, dùng được cho Fargate/Lambda).</li>
        <li><strong>Spot Instances</strong> — giảm tới 90%, nhưng AWS thu hồi với <strong>2 phút báo trước</strong>. Chỉ cho workload <em>fault-tolerant, gián đoạn được</em> (batch, xử lý ảnh, CI).</li>
        <li><strong>Dedicated Host / Dedicated Instance</strong> — phần cứng riêng, cho yêu cầu license BYOL hoặc tuân thủ.</li>
        <li><strong>Capacity Reservation</strong> — đảm bảo <em>có chỗ</em> chạy EC2 ở một AZ (RI/Savings Plan chỉ giảm giá, KHÔNG giữ chỗ).</li>
      </ul>
      <h4>Elastic Load Balancer</h4>
      <ul>
        <li><strong>ALB (Application LB)</strong> — Layer 7, HTTP/HTTPS, routing theo path/host/header, hỗ trợ container & Lambda target. Không có IP tĩnh.</li>
        <li><strong>NLB (Network LB)</strong> — Layer 4, TCP/UDP, latency cực thấp, chịu hàng triệu request/giây, có <strong>IP tĩnh / Elastic IP</strong>.</li>
        <li><strong>GLB (Gateway LB)</strong> — Layer 3, đứng trước các thiết bị bảo mật ảo (firewall, IDS/IPS).</li>
      </ul>
      <p>Tính năng ELB: health check, <strong>sticky session</strong> (session affinity — tắt nó nếu traffic dồn vào một instance), connection draining, cross-zone load balancing, thuật toán <em>least outstanding requests</em>.</p>
      <h4>Auto Scaling Group (ASG)</h4>
      <p>ASG giữ số instance giữa <strong>Min – Desired – Max</strong>, tự thay instance hỏng, trải instance qua nhiều AZ. Dùng <strong>Launch Template</strong> để định nghĩa cấu hình instance.</p>
      <p>Chính sách scaling:</p>
      <ul>
        <li><strong>Target Tracking</strong> — giữ một chỉ số ở mức X (ví dụ CPU = 50%). Đơn giản nhất, hay được chọn.</li>
        <li><strong>Step / Simple Scaling</strong> — thêm/bớt instance theo ngưỡng alarm.</li>
        <li><strong>Scheduled Scaling</strong> — scale theo <em>lịch cố định biết trước</em> (ví dụ mỗi thứ Sáu).</li>
        <li><strong>Predictive Scaling</strong> — ML dự báo theo xu hướng lịch sử, scale <em>trước</em>.</li>
      </ul>
      <p><strong>Warm pool</strong> giữ sẵn instance đã khởi động trước cho app khởi động chậm. <strong>Lifecycle hook</strong> chèn hành động lúc instance launch/terminate.</p>
      <h4>Placement Group</h4>
      <ul>
        <li><strong>Cluster</strong> — gom instance sát nhau, latency thấp, throughput cao (HPC).</li>
        <li><strong>Spread</strong> — tách instance ra phần cứng khác nhau, giảm rủi ro hỏng đồng loạt.</li>
        <li><strong>Partition</strong> — chia nhóm phần cứng riêng, cho Hadoop/Kafka quy mô lớn.</li>
      </ul>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>Workload chạy 24/7 ổn định → RI/Savings Plan. Gián đoạn được, rẻ → Spot. Không đoán trước, ngắn → On-Demand.</li>
        <li>Cần <strong>đảm bảo có capacity</strong> (DR) → Capacity Reservation, không phải RI.</li>
        <li>UDP hoặc cần IP tĩnh → <strong>NLB</strong>. Routing theo URL/host → <strong>ALB</strong>.</li>
        <li>Spike <em>lặp theo lịch</em> → Scheduled. Spike <em>theo xu hướng</em> → Predictive. Spike <em>ngẫu nhiên</em> → Target Tracking/Dynamic.</li>
        <li>Traffic dồn vào 1 instance → tắt sticky sessions.</li>
        <li>App khởi động chậm → warm pool.</li>
      </ul>
    `,
    quizKw: ['EC2 instance', 'Auto Scaling', 'Load Balancer', 'Spot Instance', 'Reserved Instance', 'Savings Plan', 'placement group', 'On-Demand Instance'],
  },
  {
    id: 'M5',
    title: 'Storage: EBS, EFS, FSx, S3',
    theory: `
      <p>Chọn đúng storage là kỹ năng cốt lõi. Hỏi "block hay file hay object?", "một instance hay nhiều?", "nóng hay lạnh?".</p>
      <h4>EBS — block storage</h4>
      <p><strong>EBS</strong> là ổ đĩa block gắn vào EC2, <strong>bound trong đúng 1 AZ</strong>. Muốn chuyển sang AZ khác phải tạo <strong>snapshot</strong> (lưu ở S3) rồi tạo volume mới từ snapshot. Loại volume:</p>
      <ul>
        <li><strong>gp3 / gp2</strong> — SSD đa dụng. gp3 cho phép <em>chỉnh IOPS độc lập với dung lượng</em> (tới 16.000 IOPS) và rẻ hơn gp2.</li>
        <li><strong>io1 / io2</strong> — SSD Provisioned IOPS, cho DB đòi hỏi IOPS rất cao, latency ổn định. <strong>io1/io2 hỗ trợ Multi-Attach</strong> (nhiều EC2 cùng gắn 1 volume).</li>
        <li><strong>st1</strong> — HDD throughput cao (big data, log). <strong>sc1</strong> — HDD lạnh, rẻ nhất.</li>
      </ul>
      <p><strong>Instance Store</strong> — ổ vật lý gắn trực tiếp host, nhanh nhất nhưng <em>ephemeral</em>: mất dữ liệu khi stop/terminate.</p>
      <h4>EFS — file system NFS dùng chung</h4>
      <p><strong>EFS</strong> là file system NFS, <strong>nhiều EC2 ở nhiều AZ mount đồng thời</strong>, tự co giãn dung lượng, chỉ cho Linux. Storage class: Standard, Infrequent Access (IA), Archive; có lifecycle tự chuyển. Hỗ trợ EFS Replication cross-Region cho DR.</p>
      <h4>FSx — file system hiệu năng cao</h4>
      <ul>
        <li><strong>FSx for Windows File Server</strong> — SMB, tích hợp Active Directory, cho ứng dụng Windows.</li>
        <li><strong>FSx for Lustre</strong> — HPC, latency sub-ms, throughput rất cao, liên kết được với S3.</li>
        <li><strong>FSx for NetApp ONTAP</strong> — đa giao thức NFS + SMB + iSCSI, có SnapMirror để DR.</li>
        <li><strong>FSx for OpenZFS</strong> — NFS, di chuyển workload ZFS.</li>
      </ul>
      <h4>S3 — object storage</h4>
      <p><strong>S3</strong> lưu object trong bucket, độ bền 11 số 9, dung lượng không giới hạn. Storage class theo tần suất truy cập:</p>
      <ul>
        <li><strong>S3 Standard</strong> — truy cập thường xuyên.</li>
        <li><strong>S3 Intelligent-Tiering</strong> — tự chuyển tier khi <em>không đoán được</em> pattern truy cập.</li>
        <li><strong>S3 Standard-IA / One Zone-IA</strong> — truy cập không thường xuyên (One Zone rẻ hơn nhưng chỉ 1 AZ).</li>
        <li><strong>S3 Glacier Instant Retrieval</strong> — lưu trữ, lấy <em>tức thì</em>.</li>
        <li><strong>S3 Glacier Flexible Retrieval</strong> — lấy trong vài phút (Expedited) tới giờ.</li>
        <li><strong>S3 Glacier Deep Archive</strong> — rẻ nhất, lấy trong ~12 giờ.</li>
      </ul>
      <p>Tính năng S3 quan trọng: <strong>Lifecycle policy</strong> tự chuyển tier/xóa; <strong>Versioning</strong>; <strong>Replication</strong> CRR (cross-Region) / SRR (same-Region) — <em>bắt buộc bật versioning cả 2 bucket</em>; <strong>Object Lock</strong> (WORM, compliance mode bất biến); <strong>Transfer Acceleration</strong> (upload nhanh toàn cầu qua edge); <strong>Multi-Region Access Point</strong>; <strong>presigned URL</strong> (cấp truy cập tạm thời); <strong>Event Notification</strong> (trigger Lambda/SQS/SNS).</p>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>Nhiều EC2 cùng đọc/ghi một file system → <strong>EFS</strong> (Linux) hoặc FSx for Windows (SMB).</li>
        <li>Nhiều EC2 cùng gắn một <em>block</em> volume → io1/io2 + <strong>EBS Multi-Attach</strong>.</li>
        <li>IOPS độc lập dung lượng, rẻ → <strong>gp3</strong>. IOPS cực cao ổn định → io2.</li>
        <li>Access pattern không đoán được → S3 Intelligent-Tiering.</li>
        <li>Giữ data bất biến theo luật → S3 Object Lock compliance mode.</li>
        <li>Upload file lớn toàn cầu nhanh → S3 Transfer Acceleration.</li>
        <li>HPC, latency sub-ms → FSx for Lustre.</li>
      </ul>
    `,
    quizKw: ['Amazon S3', 'S3 bucket', 'Amazon EBS', 'Amazon EFS', 'FSx', 'S3 Glacier', 'S3 Lifecycle', 'S3 Standard', 'Elastic Block Store', 'Elastic File System'],
  },
  {
    id: 'M6',
    title: 'Databases: RDS, Aurora, DynamoDB, ElastiCache',
    theory: `
      <p>Câu hỏi DB thường yêu cầu chọn giữa <em>relational vs NoSQL</em>, và phân biệt <em>availability vs scale read</em>.</p>
      <h4>RDS — relational managed</h4>
      <p><strong>RDS</strong> chạy MySQL, PostgreSQL, MariaDB, Oracle, SQL Server. AWS lo patch, backup, OS.</p>
      <ul>
        <li><strong>Multi-AZ</strong> — một standby <em>đồng bộ</em> ở AZ khác, failover tự động khi primary chết. Mục đích: <strong>high availability</strong>. KHÔNG dùng để scale read (standby instance không phục vụ đọc).</li>
        <li><strong>Read Replica</strong> — bản sao <em>bất đồng bộ</em>, tối đa 15, có thể cross-Region. Mục đích: <strong>scale read</strong>, tách tải báo cáo khỏi DB chính.</li>
        <li><strong>RDS Proxy</strong> — gom (pool) connection, giảm quá tải connection khi Lambda gọi nhiều, giảm thời gian failover.</li>
        <li><strong>RDS Custom</strong> — cho Oracle/SQL Server cần quyền OS-level / tính năng bên thứ ba.</li>
        <li><strong>Blue/Green Deployment</strong> — nâng cấp engine an toàn, test rồi switch.</li>
      </ul>
      <h4>Aurora</h4>
      <p><strong>Aurora</strong> tương thích MySQL/PostgreSQL, hiệu năng cao gấp nhiều lần RDS thường. Storage tự scale tới 128 TB, lưu 6 bản qua 3 AZ. <strong>Aurora Serverless v2</strong> tự co giãn compute theo tải (rất hợp workload bất định, chạy ngắt quãng). <strong>Aurora Global Database</strong> sao chép cross-Region với latency <1s cho DR.</p>
      <h4>DynamoDB — NoSQL serverless</h4>
      <p>Key-value/document, latency mili-giây, không quản server. Hai chế độ capacity: <strong>On-Demand</strong> (traffic bất định) và <strong>Provisioned</strong> (biết trước, rẻ hơn). Tính năng:</p>
      <ul>
        <li><strong>DAX</strong> — cache in-memory, đưa đọc xuống micro-giây; <em>chỉ dùng cho DynamoDB</em>.</li>
        <li><strong>Global Tables</strong> — multi-Region, multi-active.</li>
        <li><strong>Streams</strong> — bắt thay đổi, trigger Lambda.</li>
        <li><strong>Point-in-Time Recovery (PITR)</strong> — khôi phục về bất kỳ giây nào trong 35 ngày.</li>
        <li>Đọc mặc định <em>eventually consistent</em>; cần dữ liệu mới nhất → yêu cầu <strong>strongly consistent read</strong>.</li>
      </ul>
      <h4>ElastiCache & các DB chuyên dụng</h4>
      <ul>
        <li><strong>ElastiCache Redis</strong> — có replication, persistence, Multi-AZ → cho session store, leaderboard, giảm tải đọc DB. <strong>Memcached</strong> — đơn giản, không bền.</li>
        <li><strong>Redshift</strong> — data warehouse, phân tích petabyte (OLAP).</li>
        <li><strong>Neptune</strong> — graph database (quan hệ, đề xuất).</li>
        <li><strong>QLDB</strong> — ledger bất biến, xác minh mật mã (kế toán, audit).</li>
        <li><strong>DocumentDB</strong> — tương thích MongoDB. <strong>Keyspaces</strong> — tương thích Cassandra.</li>
      </ul>
      <p>Chiến lược cache: <strong>lazy loading</strong> (chỉ cache khi đọc trượt) vs <strong>write-through</strong> (ghi DB rồi cập nhật cache ngay — cache luôn khớp DB).</p>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li><strong>Bẫy kinh điển:</strong> Multi-AZ = <em>availability</em>, KHÔNG scale read. Scale read = <strong>Read Replica</strong>.</li>
        <li>Workload DB bất định / chạy ngắt quãng → <strong>Aurora Serverless v2</strong>.</li>
        <li>DB toàn cầu, cập nhật latency thấp → DynamoDB Global Tables hoặc Aurora Global Database.</li>
        <li>Đọc DynamoDB không ra dữ liệu mới nhất → bật strongly consistent read.</li>
        <li>Cần cache → ElastiCache (chung) hoặc DAX (riêng cho DynamoDB).</li>
        <li>Lambda làm quá tải connection RDS → RDS Proxy.</li>
        <li>Log bất biến + xác minh → QLDB; phân tích kho dữ liệu lớn → Redshift; quan hệ đồ thị → Neptune.</li>
      </ul>
    `,
    quizKw: ['Amazon RDS', 'Amazon Aurora', 'DynamoDB', 'ElastiCache', 'read replica', 'Multi-AZ', 'DynamoDB Accelerator'],
  },
  {
    id: 'M7',
    title: 'Serverless: Lambda, API Gateway, Step Functions',
    theory: `
      <p>Serverless = không quản server, trả tiền theo lượng dùng, tự scale. Đề thi chọn serverless khi thấy "least operational overhead", "unpredictable traffic", "event-driven".</p>
      <h4>AWS Lambda</h4>
      <p>Chạy code theo <strong>event</strong>. Giới hạn cần thuộc: <strong>tối đa 15 phút mỗi lần chạy</strong>, RAM tới 10 GB, ephemeral storage tới 10 GB. Workload dài hơn 15 phút → dùng <strong>ECS Fargate</strong> hoặc AWS Batch.</p>
      <ul>
        <li><strong>Cold start</strong> — độ trễ lần gọi đầu. Giảm bằng <strong>Provisioned Concurrency</strong> (giữ sẵn instance) hoặc <strong>SnapStart</strong> (cho Java, miễn phí).</li>
        <li>Lambda + RDS → dùng <strong>RDS Proxy</strong> để gom connection.</li>
        <li>Lambda truy cập tài nguyên private trong VPC → cấu hình Lambda chạy trong VPC.</li>
        <li>Mã hóa biến môi trường → dùng KMS + encryption helpers.</li>
        <li>Cho bên thứ ba gọi trực tiếp → <strong>Lambda function URL</strong> (endpoint HTTPS).</li>
      </ul>
      <h4>API Gateway</h4>
      <p>Cổng quản lý API: REST API, HTTP API (rẻ/nhanh hơn), WebSocket API. Tính năng: throttling, caching, stage, <strong>canary release</strong>. Phương thức ủy quyền: IAM, <strong>Cognito authorizer</strong>, Lambda authorizer. Loại endpoint: <strong>Edge-optimized</strong> (người dùng phân tán toàn cầu), Regional, Private. Tới backend trong VPC private → dùng <strong>VPC Link</strong>.</p>
      <h4>Step Functions</h4>
      <p>Điều phối (orchestrate) workflow nhiều bước bằng state machine — tự lo retry, error handling, state. <strong>Standard</strong> (chạy tới 1 năm) vs <strong>Express</strong> (tới 5 phút, throughput rất cao). <strong>Map state ở Distributed mode</strong> xử lý song song hàng nghìn item.</p>
      <h4>AppSync</h4>
      <p>Managed GraphQL — cho ứng dụng mobile cần đồng bộ dữ liệu, real-time.</p>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>Job chạy > 15 phút → KHÔNG phải Lambda → ECS Fargate / AWS Batch.</li>
        <li>Job ngắn theo lịch → Lambda + EventBridge scheduled rule.</li>
        <li>Cold start Java → SnapStart (free); cần latency ổn định lúc peak → Provisioned Concurrency + scheduled scaling.</li>
        <li>Bên thứ ba gọi webhook → Lambda function URL.</li>
        <li>Người dùng toàn cầu gọi API → endpoint Edge-optimized.</li>
        <li>Điều phối nhiều bước, cần retry/error handling tự động → Step Functions.</li>
        <li>Xử lý song song hàng nghìn item serverless → Step Functions Map (Distributed).</li>
      </ul>
    `,
    quizKw: ['AWS Lambda', 'API Gateway', 'Step Functions', 'serverless', 'AppSync', 'RDS Proxy'],
  },
  {
    id: 'M8',
    title: 'Decoupling & Messaging: SQS, SNS, EventBridge, Kinesis',
    theory: `
      <p>Decoupling (tách rời các thành phần) giúp hệ thống chịu lỗi và scale độc lập. Đề thấy "process orders không kịp", "spike traffic", "tách tier" → nghĩ tới hàng đợi/message.</p>
      <h4>Amazon SQS — hàng đợi message</h4>
      <p>Producer đẩy message vào queue, consumer kéo ra xử lý. Đệm tải khi traffic tăng đột biến.</p>
      <ul>
        <li><strong>Standard queue</strong> — throughput không giới hạn, có thể trùng/đảo thứ tự, "at-least-once".</li>
        <li><strong>FIFO queue</strong> — đúng thứ tự, <strong>exactly-once</strong>, ~300 msg/s (3.000 với batch). Cho thanh toán, giao dịch cần thứ tự.</li>
        <li><strong>Visibility timeout</strong> — thời gian message bị ẩn sau khi một consumer lấy.</li>
        <li><strong>Dead-Letter Queue (DLQ)</strong> — chứa message xử lý lỗi nhiều lần để điều tra.</li>
        <li><strong>Long polling</strong> — giảm số request rỗng. Retention tối đa 14 ngày.</li>
      </ul>
      <h4>Amazon SNS — pub/sub</h4>
      <p>Một message <strong>publish</strong> tới topic được đẩy tới <em>nhiều subscriber</em> (fan-out): SQS, Lambda, HTTP endpoint, email, SMS. <strong>Subscription filter policy</strong> cho mỗi subscriber chỉ nhận message nó cần. <strong>Fan-out pattern</strong> kinh điển: SNS → nhiều SQS.</p>
      <h4>Amazon EventBridge</h4>
      <p>Event bus định tuyến event theo <strong>rule</strong>, tích hợp sâu với hàng trăm service AWS và SaaS. Có <strong>Scheduler</strong> thay cho cron. Bắt sự kiện như "EC2 bị terminate", "object tạo trong S3".</p>
      <h4>Amazon Kinesis</h4>
      <ul>
        <li><strong>Kinesis Data Streams</strong> — streaming real-time, dữ liệu chia theo <strong>shard</strong>, <em>giữ được thứ tự</em>, retention tới 365 ngày, consumer tự xử lý.</li>
        <li><strong>Kinesis Data Firehose</strong> — near-real-time, không quản shard, <em>tự nạp</em> vào S3/Redshift/OpenSearch, có transform.</li>
        <li><strong>Kinesis Data Analytics</strong> — chạy SQL real-time trên luồng.</li>
      </ul>
      <h4>Amazon MQ</h4>
      <p>Message broker managed cho giao thức chuẩn (ActiveMQ, RabbitMQ — JMS, AMQP, MQTT). Chọn MQ khi <em>migrate ứng dụng cũ đang dùng giao thức message chuẩn</em>; ứng dụng mới trên AWS thì dùng SQS/SNS.</p>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>Đệm tải, xử lý không kịp → SQS. Cần đúng thứ tự / exactly-once → SQS <strong>FIFO</strong>.</li>
        <li>Một message → nhiều đích → SNS (fan-out). Mỗi đích chỉ lấy phần cần → filter policy.</li>
        <li>Streaming real-time, giữ thứ tự, nhiều consumer → Kinesis Data Streams.</li>
        <li>Chỉ cần "nuốt" stream rồi đổ vào S3/Redshift → Kinesis Data Firehose.</li>
        <li>Đề nhắc "giao thức message chuẩn" / migrate broker cũ → Amazon MQ.</li>
        <li>Bắt sự kiện service AWS, định tuyến theo rule → EventBridge.</li>
      </ul>
    `,
    quizKw: ['Amazon SQS', 'Amazon SNS', 'EventBridge', 'Kinesis', 'message queue', 'decoupl', 'Amazon MQ'],
  },
  {
    id: 'M9',
    title: 'Edge & Content Delivery: CloudFront, Route 53, Global Accelerator',
    theory: `
      <p>Nhóm dịch vụ "edge" giảm latency cho người dùng toàn cầu và tăng tính sẵn sàng.</p>
      <h4>Amazon CloudFront — CDN</h4>
      <p>Cache nội dung tại hơn 450 edge location gần người dùng. Origin có thể là S3, ALB, EC2, hoặc bất kỳ HTTP server nào.</p>
      <ul>
        <li><strong>Origin Access Control (OAC)</strong> — chỉ CloudFront được đọc bucket S3, giữ bucket private (không bao giờ để bucket public).</li>
        <li><strong>Signed URL / Signed Cookie</strong> — cấp truy cập có thời hạn cho nội dung trả phí. Signed URL cho từng file (thuê phim); signed cookie cho nhiều file.</li>
        <li><strong>Geo Restriction</strong> — cho/chặn truy cập theo quốc gia (bản quyền nội dung).</li>
        <li><strong>Lambda@Edge / CloudFront Functions</strong> — chạy code ngay tại edge (viết lại request, A/B test, xác thực nhẹ).</li>
        <li>Tích hợp <strong>AWS WAF</strong> và <strong>Shield</strong> để bảo vệ ở biên.</li>
      </ul>
      <h4>Amazon Route 53 — DNS managed</h4>
      <p>DNS có độ sẵn sàng cao, hỗ trợ <strong>health check</strong>. Các routing policy:</p>
      <ul>
        <li><strong>Simple</strong> — một bản ghi.</li>
        <li><strong>Weighted</strong> — chia traffic theo tỷ lệ (canary, A/B).</li>
        <li><strong>Latency</strong> — gửi user tới Region có độ trễ thấp nhất.</li>
        <li><strong>Failover</strong> — active/passive, dựa trên health check.</li>
        <li><strong>Geolocation</strong> — định tuyến theo <em>vị trí người dùng</em> (bản quyền, ngôn ngữ).</li>
        <li><strong>Geoproximity</strong> — theo khoảng cách tới tài nguyên, có bias.</li>
        <li><strong>Multivalue Answer</strong> — trả nhiều IP kèm health check.</li>
      </ul>
      <p><strong>Alias record</strong> trỏ tới tài nguyên AWS (ALB, CloudFront, S3) miễn phí. <strong>Route 53 Resolver</strong> (inbound/outbound endpoint) cho phép DNS lai giữa VPC và on-premises.</p>
      <h4>AWS Global Accelerator</h4>
      <p>Cấp <strong>2 IP tĩnh anycast</strong>, đưa traffic vào backbone AWS từ edge gần nhất, failover Region tự động. Khác CloudFront: GA <em>không cache</em>, hợp cho ứng dụng <strong>non-HTTP</strong> (TCP/UDP), gaming, VoIP, IoT, và khi cần IP tĩnh.</p>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>Tăng tốc <em>tải nội dung tĩnh/HTTP</em>, có cache → <strong>CloudFront</strong>.</li>
        <li>Tăng tốc <em>TCP/UDP, gaming, cần IP tĩnh</em>, không cache → <strong>Global Accelerator</strong>.</li>
        <li>Định tuyến theo vị trí người dùng (bản quyền) → Geolocation policy.</li>
        <li>Active/passive DR theo health check → Failover policy.</li>
        <li>Chọn Region gần nhất cho hiệu năng → Latency policy.</li>
        <li>Giữ S3 bucket private sau CloudFront → OAC.</li>
        <li>Migrate DNS sang AWS nhanh → Route 53 hosted zone + import zone file.</li>
      </ul>
    `,
    quizKw: ['CloudFront', 'Route 53', 'Global Accelerator', 'edge location', 'routing policy', 'origin access'],
  },
  {
    id: 'M10',
    title: 'Security Services',
    theory: `
      <p>Domain Secure chiếm tỷ trọng lớn nhất kỳ thi. Cần nhớ <em>service nào làm việc gì</em>.</p>
      <h4>Mã hóa & quản lý khóa</h4>
      <ul>
        <li><strong>KMS</strong> — quản lý khóa mã hóa, dùng <strong>envelope encryption</strong>. Khóa: AWS-managed, customer-managed (kiểm soát rotation, key policy), hoặc imported. <strong>Multi-Region key</strong> cho dữ liệu replicate. <strong>External key store</strong> giữ khóa ngoài AWS cho yêu cầu tuân thủ.</li>
        <li><strong>CloudHSM</strong> — hardware security module dành riêng, khi cần kiểm soát khóa tuyệt đối.</li>
        <li><strong>Secrets Manager</strong> — lưu secret (mật khẩu DB, API key), <strong>tự rotate</strong>, tích hợp sẵn với RDS.</li>
        <li><strong>Systems Manager Parameter Store</strong> — lưu config & secret; tier Standard miễn phí; <em>không tự rotate</em>.</li>
        <li><strong>ACM</strong> — cấp & tự gia hạn chứng chỉ TLS/SSL miễn phí cho ALB/CloudFront/API Gateway.</li>
      </ul>
      <h4>Bảo vệ ứng dụng & mạng</h4>
      <ul>
        <li><strong>WAF</strong> — tường lửa Layer 7, chặn SQL injection, XSS, rule rate-limiting; gắn vào ALB/CloudFront/API Gateway.</li>
        <li><strong>Shield</strong> — chống DDoS. Standard miễn phí (tự động); <strong>Advanced</strong> trả phí, bảo vệ L7, có đội DDoS Response Team (DRT), bồi hoàn chi phí.</li>
        <li><strong>AWS Network Firewall</strong> — tường lửa stateful mức VPC. <strong>Firewall Manager</strong> — quản lý WAF/Shield/SG tập trung qua Organizations.</li>
      </ul>
      <h4>Phát hiện & tuân thủ</h4>
      <ul>
        <li><strong>GuardDuty</strong> — phát hiện mối đe dọa bằng ML từ CloudTrail/VPC Flow Logs/DNS logs (có RDS Protection, EKS Protection).</li>
        <li><strong>Macie</strong> — phát hiện dữ liệu nhạy cảm/PII trong S3.</li>
        <li><strong>Inspector</strong> — quét lỗ hổng EC2/ECR/Lambda.</li>
        <li><strong>Detective</strong> — điều tra sâu nguyên nhân sự cố bảo mật.</li>
        <li><strong>Security Hub</strong> — gom phát hiện từ nhiều service, kiểm tra theo chuẩn (FSBP, CIS).</li>
      </ul>
      <h4>Audit & theo dõi cấu hình</h4>
      <ul>
        <li><strong>CloudTrail</strong> — ghi lại <em>mọi API call</em> (ai làm gì, khi nào). Phân tích lỗi Access Denied.</li>
        <li><strong>AWS Config</strong> — theo dõi <em>thay đổi cấu hình</em> tài nguyên theo thời gian và đánh giá compliance bằng rule (ví dụ restricted-ssh, encrypted-volumes).</li>
      </ul>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>Tự xoay mật khẩu/secret → <strong>Secrets Manager</strong> (Parameter Store không tự rotate).</li>
        <li>Chặn SQLi/XSS → <strong>WAF</strong>. Chống DDoS nâng cao + DRT → Shield Advanced.</li>
        <li>Tìm PII trong S3 → <strong>Macie</strong>. Quét lỗ hổng phần mềm → <strong>Inspector</strong>. Phát hiện hành vi độc hại → <strong>GuardDuty</strong>.</li>
        <li>"Ai đã gọi API" → <strong>CloudTrail</strong>. "Cấu hình đã thay đổi gì / có tuân thủ không" → <strong>AWS Config</strong>.</li>
        <li>Chứng chỉ TLS tự gia hạn → ACM.</li>
        <li>Toàn quyền tạo/xoay/disable khóa → KMS customer-managed key.</li>
      </ul>
    `,
    quizKw: ['AWS KMS', 'Secrets Manager', 'AWS WAF', 'AWS Shield', 'GuardDuty', 'Amazon Macie', 'Amazon Inspector', 'CloudTrail', 'AWS Config', 'encrypt'],
  },
  {
    id: 'M11',
    title: 'Migration, Hybrid & Cost Optimization',
    theory: `
      <h4>Di chuyển dữ liệu</h4>
      <ul>
        <li><strong>DataSync</strong> — chuyển <em>file/object</em> on-prem ↔ AWS (S3, EFS, FSx) qua mạng, một lần hoặc định kỳ; tự kiểm tra tính toàn vẹn dữ liệu; giữ được metadata/permission.</li>
        <li><strong>Storage Gateway</strong> — cho on-prem dùng AWS storage liên tục: <em>File Gateway</em> (NFS/SMB → S3), <em>Volume Gateway</em> (iSCSI block, chế độ cached giữ data nóng tại chỗ), <em>Tape Gateway</em> (VTL thay băng từ vật lý).</li>
        <li><strong>Snow Family</strong> — thiết bị vật lý chuyển khối lượng lớn khi mạng không đủ: Snowcone (nhỏ), Snowball Edge (hàng chục TB), dùng khi link mạng quá chậm so với deadline.</li>
        <li><strong>Transfer Family</strong> — server SFTP/FTPS/FTP/AS2 managed, lưu thẳng vào S3/EFS.</li>
      </ul>
      <h4>Di chuyển database & ứng dụng</h4>
      <ul>
        <li><strong>DMS</strong> — Database Migration Service, di chuyển DB với downtime tối thiểu; <strong>CDC</strong> (change data capture) sao chép các thay đổi <em>trong lúc</em> migrate.</li>
        <li><strong>SCT</strong> — Schema Conversion Tool, chuyển schema khi đổi engine (Oracle → PostgreSQL).</li>
        <li><strong>Application Discovery Service + Migration Hub</strong> — thu thập dữ liệu server on-prem và theo dõi tiến độ migrate.</li>
      </ul>
      <h4>Công cụ tối ưu chi phí</h4>
      <ul>
        <li><strong>Cost Explorer</strong> — xem & dự báo chi phí (có API).</li>
        <li><strong>AWS Budgets</strong> — đặt ngân sách, cảnh báo theo ngưỡng, có budget action để chặn provision.</li>
        <li><strong>Cost Anomaly Detection</strong> — ML phát hiện chi tiêu bất thường.</li>
        <li><strong>Cost and Usage Report (CUR)</strong> — báo cáo chi tiết nhất, đổ vào S3 + phân tích bằng Athena.</li>
        <li><strong>Compute Optimizer</strong> — gợi ý right-sizing. <strong>Trusted Advisor</strong> — kiểm tra cost/security/performance.</li>
        <li><strong>Cost allocation tags</strong> — gắn nhãn tài nguyên để bóc tách chi phí theo phòng ban.</li>
      </ul>
      <p>Mẹo giảm chi phí: Savings Plans/RI cho workload ổn định; Spot cho batch; S3 Lifecycle + Intelligent-Tiering; thay NAT Gateway bằng VPC Endpoint cho S3/DynamoDB; CloudFront giảm phí egress; xóa snapshot/EBS không dùng. Data transfer: <em>vào miễn phí</em>, ra Internet và cross-AZ tính phí.</p>
      <h4>Disaster Recovery — 4 chiến lược (RTO/RPO tăng giá dần)</h4>
      <ol>
        <li><strong>Backup &amp; Restore</strong> — rẻ nhất, RTO/RPO hàng giờ.</li>
        <li><strong>Pilot Light</strong> — phần lõi (DB) chạy sẵn ở Region DR, phần còn lại tắt.</li>
        <li><strong>Warm Standby</strong> — bản thu nhỏ chạy sẵn, scale lên khi cần.</li>
        <li><strong>Multi-Site Active/Active</strong> — chạy đầy đủ ở nhiều Region, RTO/RPO gần 0, đắt nhất.</li>
      </ol>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>Mạng không kịp deadline / khối lượng rất lớn (PB) → <strong>Snow Family</strong>.</li>
        <li>Chuyển file qua mạng, một lần/định kỳ → <strong>DataSync</strong>. On-prem dùng storage liên tục → <strong>Storage Gateway</strong>.</li>
        <li>Bỏ băng từ vật lý → Tape Gateway. Giữ data nóng tại chỗ + sao lưu cloud → Volume Gateway cached.</li>
        <li>Migrate DB + sao chép thay đổi trong lúc chuyển → DMS + CDC; đổi engine → thêm SCT.</li>
        <li>Cảnh báo vượt ngân sách → AWS Budgets. Chi tiêu bất thường → Cost Anomaly Detection.</li>
        <li>RTO/RPO gần 0 → Multi-Site; rẻ nhất → Backup &amp; Restore.</li>
      </ul>
    `,
    quizKw: ['DataSync', 'Storage Gateway', 'Snowball', 'Database Migration Service', 'disaster recovery', 'cost-effective', 'Savings Plan', 'RTO', 'RPO', 'migrate'],
  },
  {
    id: 'M12',
    title: 'Kiến trúc tham chiếu & các "bẫy" thường gặp',
    theory: `
      <p>Module này tổng hợp những "luật bất biến" và bẫy hay khiến chọn sai đáp án. Thuộc lòng phần này giúp loại nhanh đáp án sai.</p>
      <h4>Luật bất biến cần thuộc</h4>
      <ul>
        <li>EBS chỉ tồn tại trong <strong>1 AZ</strong>; muốn sang AZ khác phải qua snapshot.</li>
        <li>S3 Cross-Region Replication <strong>bắt buộc bật versioning</strong> ở cả 2 bucket.</li>
        <li>NAT Gateway nằm trong <strong>1 AZ</strong> → HA phải đặt mỗi AZ một cái.</li>
        <li>ALB <strong>không có IP tĩnh</strong>; NLB và Global Accelerator thì có.</li>
        <li>Lambda chạy <strong>tối đa 15 phút</strong>; dài hơn → Fargate/Batch.</li>
        <li>Security Group <strong>không có rule Deny</strong>; chỉ NACL mới chặn IP cụ thể được.</li>
        <li><strong>Multi-AZ ≠ scale read</strong> — scale read là việc của Read Replica.</li>
        <li>Gateway Endpoint chỉ hỗ trợ <strong>S3 và DynamoDB</strong>; service khác dùng Interface Endpoint.</li>
        <li><strong>DAX chỉ dùng cho DynamoDB</strong>; cache chung là ElastiCache.</li>
        <li>Chia sẻ <strong>encrypted snapshot</strong> phải chia sẻ kèm <strong>KMS key</strong>.</li>
        <li>RI/Savings Plan <strong>chỉ giảm giá, không giữ chỗ</strong>; giữ chỗ là Capacity Reservation.</li>
        <li>VPC Peering <strong>không transitive</strong>; cần transitive → Transit Gateway.</li>
        <li>ALB hỗ trợ HTTP/HTTPS; <strong>UDP</strong> phải dùng NLB.</li>
        <li>SCP <strong>chỉ giới hạn</strong>, không cấp quyền; áp được cả root member account.</li>
      </ul>
      <h4>Từ khóa → service (đọc đề là biết hướng)</h4>
      <ul>
        <li>"least operational overhead" / "fully managed" → ưu tiên serverless / managed service.</li>
        <li>"decouple" / "process not fast enough" → SQS.</li>
        <li>"unpredictable / spiky traffic" → on-demand, serverless, auto scaling.</li>
        <li>"real-time streaming" → Kinesis. "near-real-time → S3" → Firehose.</li>
        <li>"không qua public internet" → VPC Endpoint / PrivateLink.</li>
        <li>"sub-millisecond" → DAX (DynamoDB) hoặc ElastiCache hoặc FSx for Lustre.</li>
        <li>"audit / who called API" → CloudTrail. "configuration change" → AWS Config.</li>
      </ul>
      <h4>Kiến trúc 3-tier điển hình (web HA)</h4>
      <p>Route 53 → CloudFront → ALB (public subnet) → <strong>Web tier</strong> (ASG nhiều AZ, private) → <strong>App tier</strong> (ASG nhiều AZ, private) → ElastiCache + <strong>RDS Multi-AZ</strong> (private subnet). Mỗi tier có Security Group riêng, tier sau chỉ nhận traffic từ SG của tier trước.</p>
      <h4>🧠 Mẹo thi nhớ nhanh</h4>
      <ul>
        <li>Đọc kỹ từ <strong>nhấn mạnh</strong> trong đề: MOST cost-effective, LEAST operational overhead, MOST secure — đáp án phải tối ưu đúng tiêu chí đó.</li>
        <li>Loại trước các đáp án vi phạm "luật bất biến" ở trên — thường loại được 2/4 ngay.</li>
        <li>Hai đáp án "đúng kỹ thuật" → chọn cái ít vận hành hơn / managed hơn.</li>
        <li>Đáp án có "tự dựng / tự quản server" thường sai khi đề hỏi "least operational overhead".</li>
        <li>Câu nhiều lựa chọn (Choose two/three) → mỗi lựa chọn giải quyết một phần yêu cầu khác nhau.</li>
      </ul>
    `,
    quizKw: ['highly available', 'high availability', 'three-tier', 'fault tolerant', 'most cost-effective', 'least operational overhead'],
  },
];
