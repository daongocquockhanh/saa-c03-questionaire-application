## Section 3: Managing Data for Generative AI

### Key topics
- Data lifecycle for GenAI: ingest, transform, store, index, retrieve, monitor.
- Structured vs unstructured data handling (text, PDF, audio, video, images).
- Vector embeddings + semantic search for RAG.
- Data quality, bias detection, PII redaction, governance.
- Encryption at rest (SSE-S3, SSE-KMS, SSE-C, DSSE-KMS) and in transit (TLS).
- IAM least privilege, VPC endpoints, resource policies, Lake Formation permissions.
- Cost-optimized storage tiering + lifecycle policies.
- Monitoring, logging, alerting for data pipelines.

### Services / features
- Amazon S3 — object store, canonical GenAI data lake. Storage classes: Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant/Flexible/Deep Archive. Lifecycle rules move objects. Versioning + Object Lock for immutability. Encryption: SSE-S3 (AES-256), SSE-KMS, DSSE-KMS (double), SSE-C. Bedrock KBs + Bedrock Data Automation source from S3.
- Amazon Bedrock Data Automation (BDA) — managed multimodal ETL. Extracts text, tables, entities from documents/images/audio/video. Outputs structured JSON to S3. Blueprints define custom extraction schemas; standard output for common types. Feeds RAG + KBs.
- Amazon Bedrock Knowledge Bases — managed RAG. Ingests S3 sources, chunks (fixed/hierarchical/semantic), embeds via Titan/Cohere, writes to vector store (OpenSearch Serverless default, Aurora pgvector, Pinecone, Redis, MongoDB Atlas). RetrieveAndGenerate API.
- Amazon SageMaker Data Wrangler — visual data prep. 300+ built-in transforms, joins, feature engineering, bias detection (via Clarify integration), imports from S3/Athena/Redshift/Snowflake. Exports to S3, Feature Store, Pipelines, or notebook code. Reduces prep time for training/fine-tuning datasets.
- SageMaker Feature Store — online (low-latency) + offline (S3 Parquet) feature reuse across training + inference.
- SageMaker Ground Truth — human labeling for fine-tuning + RLHF datasets.
- Amazon Transcribe — speech-to-text. Streaming + batch. Custom vocabulary, custom language models, speaker diarization, PII redaction, Call Analytics. Output JSON to S3, feed to Bedrock/Comprehend.
- Amazon Comprehend — NLP. Entity/key phrase/sentiment/language detection, PII detection + redaction (DetectPiiEntities, ContainsPiiEntities), topic modeling, custom classification/entity recognition. Pre-clean data before embedding.
- Amazon Textract — OCR for forms/tables/documents. Complements BDA for structured extraction.
- Amazon Rekognition — image/video labels, moderation, faces. Used to filter/label multimodal datasets.
- AWS Glue — serverless ETL/ELT. Glue Crawlers populate Data Catalog. Glue Studio visual jobs, PySpark/Scala. Glue DataBrew: no-code prep, 250+ transforms, PII masking recipes. Glue Data Quality (DQDL rules). Job Bookmarks for incremental loads. Integrates Lake Formation for row/column security.
- AWS Lake Formation — central permissions on S3 data lake; LF-tags, row/column/cell filters. Governs GenAI training data access.
- Amazon OpenSearch Service + OpenSearch Serverless — vector engine for k-NN / semantic search. Engines: nmslib, faiss, lucene. Metrics: L2, cosine, inner product. Serverless "vectorsearch" collection type; default KB target. Hybrid (BM25 + vector) search.
- Amazon Aurora PostgreSQL — pgvector extension, HNSW/IVFFlat indexes, cosine/L2/inner product. Aurora Serverless v2 supported as Bedrock KB vector store.
- Amazon RDS for PostgreSQL — pgvector supported; classic managed RDBMS for structured metadata alongside vectors.
- Amazon DynamoDB — NoSQL key-value. Session state, chat history, agent memory, conversation context. On-demand + provisioned. Streams + TTL. Encryption at rest default (AWS-owned/managed/CMK KMS). Global Tables for multi-region.
- Amazon MemoryDB / ElastiCache (Redis) — vector search + low-latency cache for embeddings/session.
- Amazon Neptune — graph DB; Neptune Analytics offers vector similarity on graph nodes for GraphRAG.
- Amazon Kendra — managed enterprise semantic search; usable as Bedrock KB retriever alt.
- AWS DMS / Kinesis Data Streams / MSK — streaming ingestion into S3/OpenSearch for near-real-time RAG updates.
- Amazon CloudWatch — Logs, Metrics, Alarms, Dashboards. Bedrock model invocation logs -> CloudWatch/S3. Custom metrics for token usage, latency, error rate. CloudWatch Logs Insights queries. Alarms trigger SNS.
- AWS CloudTrail — API audit trail (Bedrock, S3, KMS) for governance.
- AWS KMS — CMKs for envelope encryption; grants; key policies; multi-Region keys.
- Amazon Macie — S3 PII/sensitive data discovery. Pre-training scrub.
- AWS PrivateLink / VPC endpoints — private access to Bedrock, S3, SageMaker; keeps data off internet.

### Must-know for exam
- Bedrock KB default vector store = OpenSearch Serverless; alternatives: Aurora pgvector, Pinecone, Redis Enterprise, MongoDB Atlas.
- Chunking strategies: fixed-size, hierarchical, semantic — pick semantic for context-preserving RAG.
- Embeddings: Titan Text Embeddings v2, Cohere Embed. Dimension must match vector index.
- BDA vs Textract: BDA multimodal + GenAI-ready JSON; Textract for pure OCR/forms.
- Comprehend + Transcribe = redact PII before storing/embedding.
- Data Wrangler = fastest path to prep training data with bias/quality checks; exports to Feature Store.
- Glue DataBrew for no-code PII masking; Glue Data Quality for DQDL rules.
- S3 encryption default: SSE-S3; use SSE-KMS for auditable key usage; DSSE-KMS when compliance mandates double-layer.
- DynamoDB stores conversation history for Bedrock Agents.
- OpenSearch k-NN: choose faiss (HNSW) for large-scale, low-latency ANN; cosine similarity typical for text embeddings.
- Lake Formation LF-tags = scalable fine-grained access on training corpora.
- Enable Bedrock model invocation logging to CloudWatch + S3 for audit + drift analysis.
- Use VPC endpoints + KMS CMKs + IAM least privilege = baseline for regulated GenAI data.
- Lifecycle to Glacier Deep Archive for cold training snapshots; Intelligent-Tiering when access unknown.


