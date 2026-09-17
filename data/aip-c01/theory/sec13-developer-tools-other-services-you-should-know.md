## Section 13: Developer Tools (Other Services You Should Know)

### Services / features
- AWS CDK (Cloud Development Kit) — define cloud infra as code in familiar languages (Python, TS, Java, C#, Go). Synthesizes to CloudFormation templates. Deploy via `cdk deploy`. Contains constructs (L1/L2/L3) for AWS resources. Exam: IaC in real programming language, compiles to CloudFormation.
- AWS CloudFormation — declarative IaC using JSON/YAML templates. Manages resource stacks, supports rollback, change sets, drift detection, StackSets (multi-account/region). Exam: foundational IaC service; CDK synthesizes to it; supports version control of infra.
- AWS SAM (Serverless Application Model) — framework for serverless apps. YAML-based, transforms to CloudFormation. `sam init`, `sam build`, `sam deploy`, `sam local` for local Lambda/API Gateway testing. Exam: simplified syntax for Lambda + API Gateway + DynamoDB serverless stacks; integrates with CodeDeploy for canary/linear Lambda deployments.
- AWS CodeCommit — private Git repo hosting on AWS. Fully managed, encrypted, IAM-controlled. Exam: source control step in CI/CD; note AWS deprecated new customer access — legacy exam topic.
- AWS CodeBuild — fully managed build service. Compiles source, runs tests, produces artifacts. Uses `buildspec.yml`. Scales automatically, pay-per-minute. Exam: build/test stage of pipeline; outputs artifacts to S3.
- AWS CodeDeploy — automates deployments to EC2, on-prem, Lambda, ECS. Deployment strategies: in-place, blue/green, canary, linear, all-at-once. Uses `appspec.yml`. Exam: know deployment types especially for Lambda (canary/linear) and ECS blue/green.
- AWS CodePipeline — orchestrates CI/CD workflow. Connects source (CodeCommit/GitHub/S3) → build (CodeBuild) → deploy (CodeDeploy/CloudFormation/ECS). Stages, actions, approval gates. Exam: end-to-end pipeline orchestration; integrates all Code* services.
- AWS CodeArtifact — managed artifact repository. Supports npm, PyPI, Maven, NuGet, Gradle. Proxies public repos (npmjs, PyPI). IAM-controlled access. Exam: secure dependency storage; used to host ML/GenAI Python packages internally.
- AWS Cloud9 — cloud-based IDE in browser. Pre-configured with AWS CLI/SDK, collaborative editing, terminal access. Runs on EC2. Exam: know as browser IDE for AWS dev; being phased out for new customers but appears on exam.
- AWS X-Ray — distributed tracing service. Visualizes request flow across microservices, Lambda, API Gateway. Service map, trace analytics, annotations/metadata. SDK instruments code. Exam: debugging/performance for distributed GenAI apps; identifies bottlenecks in multi-service Bedrock/Lambda chains.
- Amazon Rekognition — pre-trained computer vision service. Image/video analysis: object detection, face detection/comparison, celebrity recognition, text-in-image (OCR), content moderation, PPE detection, custom labels. Exam: managed CV alternative to building custom models; complements GenAI multimodal workflows; content moderation for user-uploaded media in GenAI apps.

### Must-know for exam
- IaC hierarchy: CDK (code) → synthesizes → CloudFormation (YAML/JSON) → deploys stacks. SAM = CloudFormation extension for serverless.
- Full CI/CD chain: CodeCommit (source) → CodeBuild (build) → CodeDeploy (deploy) → CodePipeline (orchestrate) → CodeArtifact (dependencies).
- CodeDeploy Lambda strategies: canary (shift %, wait, shift rest), linear (equal % over intervals), all-at-once. Blue/green for ECS.
- Buildspec.yml = CodeBuild instructions; appspec.yml = CodeDeploy instructions.
- X-Ray for tracing distributed GenAI apps across Lambda, Bedrock, API Gateway — service map + annotations key concept.
- Rekognition = pre-trained CV, no training needed for standard tasks; Custom Labels for domain-specific. Common pairing with GenAI for multimodal content pipelines and moderation.
- Cloud9 and CodeCommit: legacy but still referenced on AIP-C01 exam despite deprecation for new customers.
- CDK constructs: L1 (raw CFN), L2 (curated), L3 (patterns) — higher = more abstraction.
- CloudFormation change sets preview updates before applying; StackSets deploy across accounts/regions.
- SAM local enables offline Lambda testing before deploy.


