## Section 14: Machine Learning (Other Services You Should Know)

### Services / features
- Amazon Rekognition — image/video analysis. Detect objects, scenes, faces, text, celebrities, unsafe content. Face compare + search. Custom Labels for domain-specific objects.
- Amazon Textract — OCR + document extraction. Pulls text, forms (key-value), tables from scanned PDFs/images. Beats plain OCR by preserving structure. Handles handwriting.
- Amazon Polly — text-to-speech. Neural TTS voices, SSML support, lexicons for pronunciation, speech marks for lip-sync. Outputs MP3/OGG/PCM.
- Amazon Transcribe — speech-to-text. Automatic language ID, speaker diarization, custom vocabulary, PII redaction, medical variant (Transcribe Medical). Streaming + batch.
- Amazon Translate — neural machine translation. 75+ languages. Custom terminology, active custom translation, real-time + batch.
- Amazon Comprehend — NLP. Entities, key phrases, sentiment, language detection, topic modeling, PII detection. Comprehend Medical for clinical text (ICD-10, RxNorm).
- Amazon Lex — conversational bots. Same tech as Alexa. ASR + NLU. Intents, slots, fulfillment via Lambda. Powers chatbots/IVR.
- Amazon Personalize — real-time recommendations. Same tech Amazon.com uses. Recipes: USER_PERSONALIZATION, SIMS, PERSONALIZED_RANKING. Needs interactions/users/items datasets.
- Amazon Forecast — time-series forecasting. AutoML picks algo (ARIMA, DeepAR+, Prophet, NPTS, ETS, CNN-QR). Retail, inventory, workforce, financial planning. Deprecated for new customers — check exam framing.
- Amazon Kendra — enterprise intelligent search. Natural-language Q&A over docs (S3, SharePoint, Salesforce, Confluence). Semantic search, incremental learning. Common RAG retriever.
- Amazon Fraud Detector — ML fraud detection. Pre-built models: Online Fraud Insights, Transaction Fraud Insights, Account Takeover Insights. No ML expertise needed.
- AWS DeepRacer — 1/18 scale autonomous car. Learn reinforcement learning via racing league. Educational only.
- Amazon CodeGuru — code quality + performance. CodeGuru Reviewer: automated code review (security, best practices). CodeGuru Profiler: runtime performance/cost. Java + Python.

### Must-know for exam
- Pick pre-built service over building custom model when it fits — cheaper, faster, no training.
- Rekognition = images/video. Textract = documents. Transcribe = audio-to-text. Polly = text-to-audio. Translate = languages. Comprehend = NLP.
- Textract vs Rekognition Text — Textract preserves forms/tables/structure; Rekognition just detects text presence.
- Comprehend Medical + Transcribe Medical = HIPAA-eligible clinical variants.
- Lex = chatbots (text/voice); pair with Polly for voice out, Comprehend for sentiment, Lambda for backend.
- Personalize = real-time recs; Forecast = time-series predictions. Both no-ML-expertise required.
- Kendra = enterprise search / RAG retriever. Often paired with Bedrock in RAG questions vs OpenSearch (Kendra = managed, semantic; OpenSearch = vector DB you configure).
- Fraud Detector = fraud without building models.
- DeepRacer = RL learning tool only, not production.
- CodeGuru Reviewer = static analysis; Profiler = runtime. Java/Python.
- All these services expose APIs — callable from Lambda/SageMaker/Bedrock agents as tools.
- Data stays in region; most are HIPAA/PCI/SOC eligible.
- For multilingual chatbot: Lex + Translate + Polly + Comprehend chain.
- For document processing pipeline: Textract → Comprehend → store in S3/OpenSearch → Kendra/Bedrock for Q&A.


