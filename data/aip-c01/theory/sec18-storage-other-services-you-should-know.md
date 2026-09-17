## Section 18: Storage (Other Services You Should Know)

### Services / features
- **Amazon S3** — object storage, 11 9s durability, unlimited scale. Foundation for GenAI: training data lake, model artifacts, RAG source docs, Bedrock KB backing store.
- **S3 Storage Classes** — Standard (hot), Standard-IA (infrequent), One Zone-IA (single AZ, cheaper), Intelligent-Tiering (auto-moves by access pattern), Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive (cheapest, 12hr retrieval). Pick by access frequency + retrieval latency.
- **S3 Lifecycle Policies** — auto-transition objects between classes or expire. Cost optimization for stale training data.
- **Amazon S3 Vectors** — native vector storage in S3. Purpose-built for embeddings, up to 90% cheaper than dedicated vector DBs. Sub-second query. Integrates with Bedrock Knowledge Bases + OpenSearch. Use for large-scale, cost-sensitive vector workloads where sub-ms latency NOT required.
- **S3 Encryption** — SSE-S3 (AWS-managed keys, AES-256), SSE-KMS (KMS keys, audit via CloudTrail), SSE-C (customer-provided keys), DSSE-KMS (dual-layer), client-side encryption. Default = SSE-S3 on all new buckets.
- **S3 Access Control** — bucket policies, IAM policies, ACLs (legacy), Access Points, Block Public Access (default on).
- **Amazon EBS** — block storage for EC2, single-AZ, attaches to one instance (io2 multi-attach exception). Types: gp3 (general SSD), io2 (high IOPS), st1 (throughput HDD), sc1 (cold HDD). Use for SageMaker notebook volumes, EC2-hosted models.
- **Amazon EFS** — managed NFS, multi-AZ, elastic, POSIX. Shared file access across many EC2/SageMaker instances. Use for shared training datasets, distributed training, multi-instance notebooks.
- **Amazon FSx** — managed file systems. Variants:
  - **FSx for Lustre** — HPC/ML, high-throughput parallel FS, S3 integration. Best for large-scale ML training with S3 data.
  - **FSx for Windows File Server** — SMB, AD integration.
  - **FSx for NetApp ONTAP** — enterprise features, multi-protocol.
  - **FSx for OpenZFS** — Linux workloads.
- **AWS Storage Gateway** — hybrid cloud storage bridge on-prem <-> AWS. Types: File Gateway (NFS/SMB to S3), Volume Gateway (iSCSI to EBS snapshots), Tape Gateway (VTL to Glacier). Use to migrate on-prem data into S3 for GenAI ingestion.

### Must-know for exam
- **S3 = default GenAI storage** for training data, RAG sources, model artifacts. Bedrock Knowledge Bases ingest from S3.
- **S3 Vectors vs OpenSearch Serverless vs Aurora pgvector vs Kendra**:
  - **S3 Vectors** — cheapest, large scale, sub-second (not sub-ms), cost-first.
  - **OpenSearch Serverless** — low-latency prod vector search, Bedrock KB default.
  - **Aurora/RDS pgvector** — already using Postgres, transactional + vector combo.
  - **Amazon Kendra** — fully managed intelligent search, natural-language, connectors to SharePoint/Confluence/etc. Use when you want managed search WITHOUT building embedding pipeline.
  - **Bedrock Knowledge Bases** — managed RAG orchestration; ingests S3, chunks, embeds, stores in chosen vector DB, retrieves. Use when you want end-to-end RAG without wiring components.
- **Kendra vs Knowledge Bases** — Kendra = search product with GenAI Retrieval API; KB = RAG pipeline builder. KB cheaper + more control; Kendra better for enterprise multi-source search out of box.
- **FSx for Lustre** — the exam answer for high-throughput ML training FS linked to S3.
- **EFS** — shared file system across multiple SageMaker training instances / notebooks.
- **EBS** — single-instance block storage, notebook root volume.
- **Encryption defaults** — S3 encrypts by default (SSE-S3); use SSE-KMS when you need audit trail / customer-managed keys / cross-account key control.
- **Storage Gateway** — on-prem to cloud data migration path for GenAI training corpora.
- **Decision tree cues**:
  - "cheapest vector storage at scale" -> S3 Vectors.
  - "sub-millisecond vector search" -> OpenSearch Serverless.
  - "managed enterprise search with connectors" -> Kendra.
  - "managed RAG pipeline" -> Bedrock Knowledge Bases.
  - "shared FS for distributed training" -> EFS or FSx for Lustre (Lustre if HPC throughput).
  - "hybrid on-prem to S3" -> Storage Gateway (File Gateway).
  - "archive rarely-accessed training data" -> S3 Glacier Deep Archive via lifecycle policy.


