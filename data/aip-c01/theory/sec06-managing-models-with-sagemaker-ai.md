## Section 6: Managing Models with SageMaker AI

### Key topics
- End-to-end ML workflow: fetch/clean/prep data → train/evaluate → deploy/monitor.
- Architecture: S3 (training data + model artifacts), ECR (training + inference code images), SageMaker Endpoint, client app.
- Data prep, training, deployment, monitoring, MLOps pipelines, edge deployment, unified workspace.

### Services / features
- Notebook Instances — EC2-backed notebooks spun from console; S3 data access; scikit-learn, Spark, TensorFlow; built-in models; launch training + deploy from notebook.
- Data ingestion — S3 primary; also Athena, EMR, Redshift, Amazon Keyspaces DB; Apache Spark integrates; scikit-learn/numpy/pandas in notebook.
- RecordIO / Protobuf — common ideal training format for built-in algos.
- Processing Jobs — copy S3 data → run processing container (built-in or user) → write processed data back to S3.
- Persistent Endpoint — on-demand individual predictions.
- Batch Transform — predictions over entire dataset, no persistent endpoint.
- Inference Pipelines — chain complex processing.
- SageMaker Neo — "train once, run anywhere"; compiler + runtime; targets ARM/Intel/Nvidia edge; supports TensorFlow, MXNet, PyTorch, ONNX, XGBoost, DarkNet, Keras. Neo-compiled models deploy to HTTPS endpoint on C5/M5/M4/P3/P2 (same instance type as compilation) OR IoT Greengrass with Lambda inference apps.
- Elastic Inference — accelerator for deep learning inference.
- Automatic Scaling — scales endpoint count.
- Shadow Testing — new model runs alongside prod; monitor in console; promote when ready.
- Deployment Guardrails — async/real-time endpoints; blue/green (all-at-once, canary, linear); auto-rollbacks.
- Multi-model / multi-container endpoints — deployment guardrails, VPC, network isolation. Inference Components give each model its own scaling policy.
- Bedrock Custom Model Import — train/tune in SageMaker AI, deploy through Bedrock (serverless inference).
- Model servers — TorchServe, DJL Serving (Amazon-built, likely on exam), Triton Inference Server.
- Async inference — SageMaker async endpoints, or roll your own with SNS/SQS when latency not critical.
- Model compression — Quantization, Pruning, Knowledge Distillation (small model trained from larger).
- Studio — single web IDE hub: Notebooks, Experiments, Debugger, Autopilot, Model Monitor, Automatic Model Tuning.
- Autopilot — AutoML.
- JumpStart — one-click 150+ open source models (NLP, object detection, image classification).
- Data Wrangler — import/transform/analyze/export in Studio.
- Feature Store — find/share features; Online (low-latency) or Offline (training/batch); organized into Feature Groups.
- Edge Manager — agent for edge; models optimized via Neo; samples data for monitoring/retraining.
- Ground Truth — human labeling (Mechanical Turk, internal team, pro vendors); learning model routes only ambiguous images to humans (up to 70% cost reduction). Ground Truth Plus = turnkey AWS-managed labeling.
- Rekognition / Comprehend — pre-trained image/text labeling helpers.
- Clarify — bias detection (Class Imbalance CI, DPL, KL/JS divergence, Lp-norm, TVD, KS, CDD); model explainability (feature attribution).
- Model Monitor — data drift, model quality drift, bias drift, feature attribution drift (NDCG); scheduled monitoring jobs; metrics to CloudWatch; no code; integrates Clarify, TensorBoard, QuickSight, Tableau.
- Model Registry — catalog models, versions, metadata, approval status, CI/CD deploy, Model Registry Collections.
- ML Lineage Tracking — MLOps history, audit/compliance; entities: Trial Component, Trial, Experiment, Context, Action, Artifact, Association (ContributedTo/AssociatedWith/DerivedFrom/Produced/SameAs); LineageQuery API in SageMaker Python SDK; cross-account via AWS RAM + AddAssociation API.
- Pipelines — DAG for ML workflows; visual designer or JSON; integrated with Unified Studio + SageMaker AI.
- SageMaker Unified Studio — single interface for data, analytics, AI, ML; includes Bedrock, Q, QuickSight, notebooks; build/deploy/execute/monitor; team domains connect users/assets/projects; VS Code connectable.
- Cross-region inference profiles — for Bedrock endpoints. EC2 Auto Scaling Groups can load balance in front of SageMaker AI endpoints.

### Must-know for exam
- RecordIO/Protobuf = preferred built-in algo format.
- Persistent endpoint vs Batch Transform (dataset-wide, no live endpoint).
- Neo: compile once → C5/M5/M4/P3/P2 endpoint OR IoT Greengrass; must match compile instance type.
- Deployment Guardrails modes: all-at-once, canary, linear + auto-rollback; Shadow Test = compare, human promote.
- Bedrock Custom Model Import brings SageMaker-trained model to serverless Bedrock inference.
- DJL Serving is Amazon-created → exam favorite among model servers.
- Feature Store: Online (low latency serving) vs Offline (training/batch).
- Clarify = bias + explainability; Model Monitor consumes Clarify for bias drift alerts via CloudWatch.
- Ground Truth active learning cuts labeling ~70%; Ground Truth Plus is fully managed.
- Model compression trio: Quantization, Pruning, Knowledge Distillation.
- Pipelines = DAG (visual or JSON) for MLOps; Lineage entities and Associations for audit.
- Unified Studio = single pane across Bedrock/Q/QuickSight/SageMaker; domain-based team access.


