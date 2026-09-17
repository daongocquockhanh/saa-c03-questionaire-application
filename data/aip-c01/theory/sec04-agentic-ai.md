## Section 4: Agentic AI

### Key topics
- LLM agents = FM + memory + planning + tools; tools are functions via tools API, guided by prompts
- Multi-agent workflow patterns: orchestrator-workers, router, parallelization (sectioning/voting), prompt chaining, evaluator-optimizer
- When to go multi-agent: too many tools for one agent, complex conditional logic
- Memory tiers: short-term (chat/session, in-mem, ElastiCache, MemoryDB, DynamoDB) vs long-term (extracted insights, Memory Records, Strategies; DynamoDB/SQLite/RDS/Aurora, AgentCore Memory, Mem0, KBs)
- Agent frameworks: Strands Agents, Agent Squad, OpenAI Agents SDK, CrewAI, LangGraph, Google ADK
- MCP protocol, OpenAPI schemas for tools
- Human-in-the-loop patterns
- Amazon Q family (Business, Apps, Developer, Quick/Quick Suite)

### Services / features
- Bedrock Agents (Classic) — deprecated for new customers; AWS recommends migrate to AgentCore. Uses Action Groups (Lambda tools), Knowledge Bases (agentic RAG), optional Code Interpreter, guardrails. Deploy via alias (snapshot), ODT or Provisioned Throughput, InvokeAgent API. Import via `agentcore create --type import` generates Strands/LangChain code.
- Strands Agents — Amazon open-source Python agents SDK. `@tool` decorator, `Agent(tools=[...])`. Multimodal (text/speech/images/video), MCP support, works with non-AWS models too. Built-ins: calculator, current_time, python_repl, file/shell tools, Polly speech, swarms, Mem0 memory.
- Agent Squad (awslabs/agent-squad) — multi-agent orchestrator, intent classification/routing, Python + TypeScript, shared context, Supervisor Agent. Focus: routing (vs Strands = tool use in single loop). Integrates Bedrock Agents / Flows.
- AgentCore Runtime — serverless agent hosting; framework-agnostic (Strands, LangGraph, CrewAI, OpenAI SDK). `agentcore` CLI deploys via CodeBuild to ECR. Multiple endpoints. Observability via CloudWatch GenAI Observability.
- AgentCore Memory — managed short-term (Sessions containing Events) + long-term (Memory Records, Strategies: user preferences, semantic facts, session summaries). Serverless alternative to SQLite.
- AgentCore Gateways — turns APIs (OpenAPI/REST), Smithy models, Lambdas into MCP tools. Semantic tool selection. Manages OAuth credentials.
- AgentCore Identity — agent identity store (like Cognito user pool for agents). OAuth 2.0 with Google, GitHub, Slack, Salesforce, Atlassian. Secure credential storage.
- AgentCore Policies — Cedar language policies (also NLP/form). Deny by default, contextual validation (OAuth sub-claims, tool args), Enforce vs Log-only modes. Evaluated outside agent code via Gateways.
- AgentCore Observability — evaluates task performance, edge cases, consistency. Integrates Strands, LangGraph, OpenTelemetry, OpenInference. Cross-region inference (data resident to origin region, encrypted in transit). CloudWatch dashboards.
- AgentCore Evaluations — LLM-as-judge; metrics: correctness, helpfulness, conciseness, instruction following, faithfulness, response relevance, coherence, refusal, goal success rate, tool selection/parameter accuracy, harmfulness, stereotyping. Session/trace/tool-call level.
- AgentCore Browser Tool — controls browser to interact with web.
- AgentCore Code Interpreter — runs Python/JS/TypeScript in isolated container.
- MCP (Model Context Protocol) — "USB-C for AI apps" (Anthropic). JSON-RPC 2.0 over stdio or HTTP streaming. Servers expose tools, resources, prompts. AWS deploy patterns: Lambda (stateless), ECS/Fargate (complex), API Gateway, or AgentCore.
- OpenAPI (Swagger) — defines FM-to-tool interfaces. Upload schema to S3 for Bedrock action groups.
- Human-in-the-loop — augmentation pattern; API Gateway + Lambda + DynamoDB for feedback capture; confidence-score-based escalation.
- Amazon Q Business — managed GenAI assistant on Bedrock (FM not user-selectable). 40+ Data Connectors (S3, RDS, Aurora, WorkDocs, M365, Salesforce, GDrive, Slack, SharePoint). Plugins (Jira, ServiceNow, Zendesk, Salesforce, custom). IAM Identity Center auth (with external IdPs). Admin controls = guardrails; block topics/words; global + topic-level.
- Amazon Q Apps — no-code GenAI apps from natural language, uses company data + plugins.
- Amazon Q Developer — coding assistant.
- Amazon Quick Suite (evolved from QuickSight) — AI assistant: chat, research, BI, automation, no-code apps. Five layers: Chat, Agents, Spaces, Integrations, Features. Open standards MCP + OpenAPI. Web/desktop/Chrome/Slack/Teams/M365.
  - Quick Agents — instructions + knowledge sources + tools; System "My assistant" vs Custom chat agents. Scoped to user's permissions.
  - Quick Spaces — team/domain-scoped resource collection. Max 20 resources per type, no nesting. Sharing space does not grant asset access.
  - Quick Index / Knowledge Bases — indexed for AI retrieval. 25 GB Pro, 50 GB Enterprise. Bring your own Q Business index or Bedrock KB.
  - Quick Flows — no-code, all plans; short tasks.
  - Quick Automate — Enterprise-only, long-running enterprise processes, HITL, custom code.
  - Quick Research — deep multi-source cited reports; also a Flows step.
  - Quick Applications — conversational app builder.
  - Security: IAM/Identity Center/SAML 2.0/MFA/RBAC/SSO; VPC/Direct Connect/S2S VPN; TLS 1.2, SPICE encryption, KMS CMKs; row-level security; CloudTrail.
  - Pricing tiers: Free $0, Plus $20 (no AWS account), Professional $20 + AWS account, Enterprise $40. $250/account/month infra fee (Pro/Ent). Agent hours $3, research hours $6, overage $5/GB.

### Must-know for exam
- Bedrock Agents Classic deprecated -> migrate to AgentCore (`agentcore create --type import`).
- Match workflow pattern to task: router = single classification; orchestrator-workers = complex delegation + synthesizer; parallelization (sectioning/voting) = independent subtasks or ensemble; prompt chaining = known linear steps with gates; evaluator-optimizer = iterative refinement with feedback loop.
- Strands = single-agent loop with tools; Agent Squad = multi-agent routing.
- AgentCore is framework-agnostic serverless runtime — not tied to Strands or Bedrock.
- AgentCore Policies use Cedar language, deny-by-default, Enforce vs Log-only.
- MCP = JSON-RPC 2.0 over stdio/HTTP streaming; standardizes tool interface.
- OpenAPI schemas define Bedrock action group tools; upload to S3.
- Memory: short-term = session/chat; long-term = Memory Records with Strategies.
- Q Business auth via IAM Identity Center (federatable to Google/AD); users only see docs they can access.
- Q Business admin controls = guardrails (block topics, internal-only responses).
- Quick Automate is Enterprise-only; Flows is all-plans no-code.
- HITL pattern: API Gateway -> Lambda -> DynamoDB for feedback.
- Cross-region inference keeps data resident to origin, encrypted for transit.


