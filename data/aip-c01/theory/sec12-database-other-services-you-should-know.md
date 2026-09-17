## Section 12: Database (Other Services You Should Know)

### Services / features
- Amazon RDS — managed relational DB service. Engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2. Handles patching, backups, replication, failover. Not serverless by default. Use for structured GenAI metadata, transactional workloads, storing embeddings via pgvector (PostgreSQL).
- Amazon Aurora — MySQL/PostgreSQL-compatible managed relational DB. Up to 5x MySQL / 3x PostgreSQL performance. Storage auto-scales to 128 TiB. 6-way replication across 3 AZs. Aurora Serverless v2 auto-scales capacity. Aurora PostgreSQL supports pgvector for vector embeddings — common Bedrock Knowledge Base vector store.
- Amazon DynamoDB — fully managed serverless NoSQL key-value + document DB. Single-digit ms latency at any scale. On-demand or provisioned capacity. Global Tables for multi-region active-active. DAX for microsecond cache. Use for chat session state, user profiles, agent memory, high-throughput GenAI app data. Zero-ETL to OpenSearch for vector/semantic search.
- Amazon DocumentDB — managed MongoDB-compatible document DB (JSON). Supports vector search natively (up to 2000 dimensions). Use for storing embeddings + JSON documents together for RAG.
- Amazon Neptune — managed graph DB. Supports property graph (Gremlin, openCypher) and RDF (SPARQL). Neptune Analytics for in-memory graph analytics with vector search. Use for GraphRAG, knowledge graphs, recommendation, fraud detection, entity relationships enhancing LLM context.
- Amazon ElastiCache — managed in-memory cache. Engines: Redis OSS, Valkey, Memcached. Sub-millisecond latency. Redis/Valkey support vector search. Use for prompt caching, session store, LLM response caching, semantic caching to cut Bedrock costs/latency.
- Amazon Timestream — managed time-series DB. Two flavors: Timestream for LiveAnalytics and Timestream for InfluxDB. Auto-scales, tiered storage (memory + magnetic). Use for IoT, metrics, model monitoring telemetry, GenAI observability data.
- Amazon Keyspaces — managed Apache Cassandra-compatible wide-column DB. Serverless, single-digit ms latency. CQL API. Use when lifting Cassandra workloads or high-scale wide-column needs.
- Amazon MemoryDB — Redis/Valkey-compatible durable in-memory DB. Multi-AZ transactional log for durability (unlike ElastiCache which is cache-only). Vector search supported. Ultra-fast primary DB for GenAI apps needing durability + microsecond reads + vector similarity.

### Must-know for exam
- Vector store options on AWS: Aurora PostgreSQL (pgvector), RDS PostgreSQL (pgvector), OpenSearch Service/Serverless, DocumentDB, Neptune Analytics, MemoryDB, Redis/Valkey ElastiCache. Bedrock Knowledge Bases integrates with Aurora, OpenSearch Serverless, Neptune Analytics, MongoDB Atlas, Pinecone, Redis Enterprise Cloud.
- MemoryDB vs ElastiCache: MemoryDB = durable primary DB; ElastiCache = cache (data loss possible).
- Aurora Serverless v2 = auto-scaling capacity, pay per ACU.
- DynamoDB = serverless NoSQL, no vector search natively — pair with OpenSearch via zero-ETL.
- Neptune Analytics = graph + vectors for GraphRAG.
- DocumentDB = MongoDB-compatible with built-in vector search.
- Timestream best for time-series/model monitoring, not general OLTP.
- Keyspaces = Cassandra-compatible, wide-column.
- Choose relational (RDS/Aurora) for structured metadata; NoSQL (DynamoDB) for flexible schema/high scale; graph (Neptune) for relationships; in-memory (ElastiCache/MemoryDB) for latency-critical caching or session state.


