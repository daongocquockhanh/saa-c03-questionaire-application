## Section 10: Analytics (Other Services You Should Know)

### Services / features
- **Amazon Athena** — serverless interactive SQL query on S3 data. No infra. Pay-per-query (data scanned). Supports CSV, JSON, Parquet, ORC, Avro. Federated queries via connectors. Athena for Apache Spark = notebooks. Exam: query S3 data directly, no ETL, use Glue Data Catalog for schema.
- **Amazon EMR** — managed Hadoop/Spark/Presto/Hive/HBase cluster. Big data processing at scale. EC2/EKS/Serverless deployment. EMR Notebooks for interactive dev. Exam: heavy batch ML preprocessing, Spark training pipelines, distributed data prep for SageMaker.
- **Apache Hadoop (on EMR)** — HDFS + MapReduce. Batch processing framework.
- **Apache Spark (on EMR)** — in-memory distributed processing. MLlib for ML. Faster than MapReduce. Common for feature engineering at scale.
- **Presto/Trino (on EMR)** — distributed SQL query engine across data sources.
- **Amazon Kinesis Data Streams (KDS)** — real-time streaming ingestion. Shards, retention 24h–365d. Producer/consumer model. Exam: real-time inference input pipeline, sub-second latency.
- **Amazon Kinesis Data Firehose** — managed delivery stream to S3/Redshift/OpenSearch/Splunk. Near-real-time (buffer sec/MB). Auto-scales. Can invoke Lambda for transform. No shard mgmt. Exam: easiest way to land streaming data in S3 for ML.
- **Amazon Kinesis Data Analytics** — now **Managed Service for Apache Flink**. SQL/Flink on streams. Real-time anomaly detection (RANDOM_CUT_FOREST built-in).
- **Amazon Kinesis Video Streams** — ingest video for ML (Rekognition Video, custom CV models).
- **Amazon Redshift** — petabyte-scale columnar data warehouse. MPP. Redshift Spectrum queries S3. Redshift ML = create SageMaker models via SQL (`CREATE MODEL`). Exam: SQL analysts building ML from warehouse data without leaving Redshift.
- **Amazon QuickSight** — serverless BI/dashboards. ML Insights: anomaly detection, forecasting, auto-narratives. Q = NLQ (natural language questions). Generative BI with Amazon Q in QuickSight. Exam: visualize ML outputs, business dashboards over SageMaker predictions.
- **AWS Glue** — serverless ETL. Glue Data Catalog = central metastore (used by Athena/EMR/Redshift Spectrum). Crawlers auto-infer schema. Glue Studio visual ETL. Glue DataBrew = no-code data prep (250+ transforms) for ML. Glue Jobs run PySpark/Scala. Exam: ETL for ML training data, catalog for S3 datasets.
- **AWS Data Pipeline** — legacy orchestration for data movement. Largely superseded by Glue Workflows/Step Functions/MWAA. Exam: recognize as legacy.
- **Amazon MSK (Managed Streaming for Apache Kafka)** — managed Kafka clusters. MSK Serverless option. Exam: alternative to Kinesis when Kafka API/ecosystem required, hybrid streaming.
- **Amazon OpenSearch Service** — search + analytics. Successor to Elasticsearch. **k-NN plugin** for vector search → RAG/semantic search. OpenSearch Serverless supports vector engine. OpenSearch Dashboards (Kibana). Exam: vector DB option for embeddings, log analytics feeding ML.
- **AWS Lake Formation** — data lake governance, fine-grained permissions on Glue Catalog resources.
- **Amazon MWAA (Managed Workflows for Apache Airflow)** — orchestrate ML/ETL DAGs.

### Must-know for exam
- Athena = serverless SQL on S3. Pair with Glue Catalog. Cheap ad-hoc exploration before training.
- Glue = default ETL/data prep for ML. DataBrew = no-code prep. Data Catalog is shared metadata layer.
- EMR = when you need Spark/Hadoop distributed compute at scale for feature engineering.
- Kinesis Data Streams = real-time low-latency; Firehose = near-real-time to S3/Redshift (buffered, managed); Managed Flink = stream analytics/anomaly detection.
- MSK = Kafka-compatible alternative to Kinesis.
- Redshift ML = SQL `CREATE MODEL` invokes SageMaker Autopilot; good for analysts.
- QuickSight ML Insights + Amazon Q = anomaly detection, forecasting, NLQ dashboards, generative BI.
- OpenSearch = vector search (k-NN) for RAG/embeddings retrieval; also log analytics.
- Streaming ML pattern: Kinesis/MSK → Lambda/Firehose → S3 → SageMaker; or → Managed Flink for inline scoring.
- Batch ML pattern: S3 → Glue/EMR → S3 → SageMaker Training.
- Data Pipeline = legacy; prefer Step Functions, Glue Workflows, or MWAA.
- Lake Formation controls row/column-level access for ML datasets.


