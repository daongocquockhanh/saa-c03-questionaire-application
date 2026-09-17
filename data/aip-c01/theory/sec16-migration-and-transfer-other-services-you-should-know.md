## Section 16: Migration and Transfer (Other Services You Should Know)

### Services / features
- **AWS DataSync** — Move large data on-prem/other cloud to AWS (NFS, SMB, HDFS, S3 API) via agent; AWS-to-AWS no agent. Syncs to Amazon S3 (any class incl. Glacier), Amazon EFS, Amazon FSx (Windows, Lustre, NetApp, OpenZFS). Scheduled hourly/daily/weekly. Preserves file permissions/metadata (NFS POSIX, SMB). One agent task = 10 Gbps, bandwidth cap configurable. TLS in transit. Exam: preferred for scheduled bulk file transfers preserving metadata; picks between S3/EFS/FSx targets.
- **AWS Transfer Family** — Fully-managed FTP/FTPS/SFTP into/out of Amazon S3 or Amazon EFS. Multi-AZ, scalable. Pay per provisioned endpoint/hour + GB. Store creds in-service or integrate MS Active Directory, LDAP, Okta, Amazon Cognito, custom. FTP only within VPC. Exam: legacy FTP clients needing S3/EFS backend; keyword = SFTP/FTPS.
- **AWS Database Migration Service (DMS)** — Migrate databases to AWS with source DB live during migration. Homogeneous (Oracle-to-Oracle) and heterogeneous (SQL Server-to-Aurora, via AWS Schema Conversion Tool / SCT). Continuous data replication via CDC. Exam: DB migration keyword; SCT for schema conversion across engines.
- **AWS Snow Family** — Offline edge/data-transfer devices for petabyte-scale when network too slow.
  - **AWS Snowcone / Snowcone SSD** — Smallest, 8 TB HDD / 14 TB SSD, portable, edge computing, works with DataSync pre-installed.
  - **AWS Snowball Edge** — Storage Optimized (80 TB) / Compute Optimized; petabyte transfer, edge compute with EC2/Lambda.
  - **AWS Snowmobile** — Exabyte-scale (up to 100 PB per truck); use when >10 PB. Note: retired in 2024 but may still appear on exam.
  - Rule of thumb: >10 TB & slow network → Snow family; else DataSync/Direct Connect.
- **AWS Application Migration Service (MGN)** — Lift-and-shift (rehost) physical/virtual/cloud servers to AWS EC2. Continuous block-level replication, minimal cutover downtime. Replaces Server Migration Service (SMS).
- **AWS Migration Hub** — Single pane to track application migrations across tools (MGN, DMS, partner tools). Migration Hub Refactor Spaces = incremental app refactoring to microservices. Migration Hub Strategy Recommendations = assess portfolio.

### Must-know for exam
- DataSync = scheduled file sync (NFS/SMB/HDFS/S3) preserving metadata; agent on-prem, none AWS-to-AWS.
- Transfer Family = managed SFTP/FTPS/FTP to S3/EFS.
- DMS + SCT = live DB migration; SCT for heterogeneous schema conversion.
- Snowcone < Snowball Edge < Snowmobile by capacity; pick when network transfer impractical.
- Application Migration Service = rehost servers to EC2.
- Migration Hub = central tracking dashboard across migration services.


