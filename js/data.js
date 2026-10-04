// Content data for the portfolio. Moved verbatim from the original index.html;
// edit text here, the page renders from these objects.

export const contributionData = {

    // ---- Backend ----
    backend: [
        {
            title: 'Concurrent API Batching',
            summary: 'Refactored a sequential retrieval of 300 records into batched requests of 30, run concurrently under asyncio.Semaphore limits, cutting a legacy processing pipeline from 25 minutes to 3 seconds.',
            tags: ['asyncio', 'Semaphore', 'request batching', 'concurrency limits']
        },
        {
            title: 'Lifecycle Monitoring & Admin Dashboards',
            summary: 'Normalized the database schema with real-time lifecycle status monitoring and built custom Django admin dashboards for day-to-day operations.',
            tags: ['schema normalization', 'Django admin', 'status monitoring']
        },
        {
            title: 'Recommendation Engine',
            summary: 'Built end-to-end personalized action plan pipeline with top-N ranking, fallback randomization, and dismissal-aware re-recommendation. Replaced M2M with PostgreSQL ArrayField + GIN indexing, eliminating N+1 queries throughout.',
            tags: ['GIN indexing', 'ranking algorithm', 'N+1 elimination', 'service layer', 'Pydantic']
        },
        {
            title: 'Survey Platform Overhaul',
            summary: 'Redesigned the entire survey system — unified data model with bundle architecture and rollback semantics, self-service deployment, QA gates, and metaclass-enforced exception handling. Resolved a race condition in concurrent submissions.',
            tags: ['bundle architecture', 'Django Ninja', 'metaclass pattern', 'race condition fix']
        },
        {
            title: 'Data Privacy & Anonymization Engine',
            summary: 'Built threshold-based anonymization for demographic data, distinguishing true absence from suppression. Handled partial responses, zero-score buckets, and multi-select edge cases with privacy-by-design principles.',
            tags: ['threshold anonymization', 'statistical bucketing', 'privacy-by-design', 'CSV export']
        },
        {
            title: 'Alerting & Risk APIs',
            summary: 'Built second-gen alerting system surfacing risk-ranked data points, embedded chart payloads, and drill-down views. Introduced priority-ordered subtypes so the most critical alerts surface first.',
            tags: ['risk scoring', 'priority ranking', 'nested API composition', 'Django Ninja']
        },
        {
            title: 'Admin Safety & Audit Framework',
            summary: 'Built a confirmation mixin for all side-effect admin actions, field-level diff audit logger with PII masking and Slack alerts, and PostgreSQL-native change tracking via pghistory with thread-safe UUID context.',
            tags: ['Django admin mixins', 'pghistory', 'PII masking', 'XSS prevention', 'Slack alerts']
        },
        {
            title: 'Authentication Suite',
            summary: 'Shipped Google OAuth, email auth, SSO multi-domain support, 2FA with configurable grace periods, JWT payload optimization, and header-based multi-tenant request scoping with lru_cache resolution.',
            tags: ['OAuth 2.0', 'TOTP 2FA', 'multi-tenant', 'JWT optimization', 'SSO multi-domain']
        },
        {
            title: 'User Impersonation System',
            summary: 'Built full impersonation system for support teams — scoped Knox tokens (read-only for certain roles), rate limiting, session cleanup on logout, and a complete audit trail.',
            tags: ['Knox tokens', 'rate limiting', 'scoped permissions', 'audit logging']
        },
        {
            title: 'Catalog & Resource Library',
            summary: 'Replaced 3+ legacy tables with a unified S3-backed resource library — polymorphic metadata models, dynamic filtering APIs, data migration scripts, and automated cloud storage file sync.',
            tags: ['polymorphic models', 'S3 integration', 'dynamic filtering', 'data migration']
        },
        {
            title: 'Large-Scale Schema Migrations',
            summary: 'Led three major migrations: transformed legacy demographic data into a modernised granular taxonomy (touching every endpoint and serializer), zero-downtime removal of 10+ legacy tables, and a cross-environment analytical data migration with drift-detection tooling.',
            tags: ['phased migration', 'zero-downtime', 'taxonomy modernisation', 'drift detection']
        },
        {
            title: 'Query & Performance Optimization',
            summary: 'Systematically eliminated N+1 queries across API and admin layers using select_related, prefetch_related, GIN indexes, lru_cache, and autocomplete_fields on large relational datasets.',
            tags: ['select_related', 'prefetch_related', 'GIN indexing', 'lru_cache', 'autocomplete_fields']
        },
        {
            title: 'Analytics APIs',
            summary: 'Built analytics filter API with session-persistent state, KPI score metadata with industry-specific benchmarks, contextual tooltips, and server-side Mixpanel event tracking from backend endpoints.',
            tags: ['session persistence', 'industry benchmarking', 'Mixpanel', 'DRF mixin']
        },
        {
            title: 'Pulse Survey Platform',
            summary: 'Designed the Pulse Survey platform from scratch — data models, DB schema, and full API layer with Django Ninja + Pydantic schemas. Integrated with SurveyMonkey to create surveys programmatically; handled SM webhooks for automatic response syncing with DB-level locking to prevent duplicate writes from concurrent webhook deliveries.',
            tags: ['Django Ninja', 'Pydantic', 'SurveyMonkey', 'webhook processing', 'DB locking', 'Knox auth', 'rate throttling']
        },
        {
            title: 'ETL & Data Pipeline',
            summary: 'Authored 30+ ETL scripts handling multilingual survey data (RU/JP/KR/FR), PII detection and redaction, response remapping, deduplication, and benchmark data pipeline improvements with year-quarter grouping.',
            tags: ['ETL scripting', 'i18n processing', 'PII redaction', 'idempotent transforms']
        },
        {
            title: 'Third-Party Integrations',
            summary: 'Built Eventbrite webhook ingestion to sync event creation and updates, SurveyMonkey webhook handling with respondent-level DB locks preventing duplicate processing, and programmatic dashboard provisioning via third-party APIs with DRF rate-limit exception handling.',
            tags: ['Eventbrite', 'SurveyMonkey', 'DB locking', 'webhook validation', 'programmatic provisioning', 'idempotent processing']
        },
        {
            title: 'Caching Architecture & Background Jobs',
            summary: 'Implemented cache-aside pattern with Redis using proper eviction policies and a reconciliation strategy via rq-scheduler cron jobs. Built reusable thread-safe hot-key caches with LRU and TTL strategies, backed by RLock-based thread isolation.',
            tags: ['Redis', 'cache-aside', 'rq-scheduler', 'LRU cache', 'TTL cache', 'RLocks', 'thread safety']
        },
        {
            title: 'Platform & Dev Tooling',
            summary: 'Migrated to Poetry, built streaming CSV export for large datasets, added threaded comments API with polymorphic content types, login attribution tracking, and sandboxed scheduled job execution with safety guards.',
            tags: ['Poetry', 'StreamingHttpResponse', 'polymorphic content types', 'attribution tracking']
        }
    ],

    // ---- Frontend ----
    frontend: [
        {
            title: 'Workflow Orchestration Platform',
            summary: 'Architected a platform on Django, FastAPI, React, TypeScript and Tailwind CSS that automates file orchestration and API retries under SLA constraints.',
            tags: ['Django', 'FastAPI', 'React', 'TypeScript', 'Tailwind CSS', 'SLA']
        },
        {
            title: 'Top-N Analytics Feature',
            summary: 'Extended a fixed single-item view to configurable top-N analysis with interactive toggle and collapsible UI. API layer with backward-compatible schema fallback preventing deployment coupling; 57-test suite with shared test infrastructure.',
            tags: ['React Query', 'backward-compatible API', 'React Testing Library', 'Vitest']
        },
        {
            title: 'Data Privacy State Management',
            summary: 'Replaced ambiguous sentinel values with a type-safe data classification system across analytics dashboard components. Fixed type coercion bugs and standardized conditional rendering across heatmaps, progress bars, and time-series charts.',
            tags: ['TypeScript type guards', 'shared constants', 'conditional rendering', 'React']
        },
        {
            title: 'Auth Flow Enhancement',
            summary: 'Extended login and password reset flows to support both username and email-based auth with SSO-specific Redux Saga error interception and i18n updates across English and German.',
            tags: ['Redux Saga', 'Yup validation', 'i18n', 'SSO compatibility']
        },
        {
            title: 'Code Review & Release Management',
            summary: 'Served as gatekeeper across two frontend codebases — reviewed and merged 31 PRs spanning analytics visualization, catalog UI migration to React Query with infinite scroll, 2FA, and multiple production releases.',
            tags: ['code review', 'release management', 'React Query', 'infinite scroll']
        },
        {
            title: 'Build Tooling & API Cleanup',
            summary: 'Migrated from deprecated node-sass to dart-sass resolving Node.js compatibility issues, and trimmed unnecessary payload data from file upload and validation API calls.',
            tags: ['dart-sass migration', 'API payload optimization', 'dependency modernization']
        }
    ],

    // ---- AI & ML ----
    aiml: [
        {
            title: 'AI-Assisted Development Workflows',
            summary: 'Accelerated AI-assisted development with reusable agent skills and structured workflows for AI coding tools.',
            tags: ['agent skills', 'structured workflows', 'AI coding tools']
        },
        {
            title: 'Agent-Driven Validation Pipelines',
            summary: 'Engineered step-strict automated validation pipelines for enterprise workflows, driven by custom AI agents inside internal chat platforms.',
            tags: ['AI agents', 'validation pipelines', 'enterprise workflows']
        },
        {
            title: 'AI Hackathon — Multi-Agent System',
            summary: 'Replaced Flask with PydanticAI graph routing — 20–30% faster, 50% less routing code. MCP integration with 3-way intelligent routing (database, external API, failsafe); 74+ tests; real-time dashboards with Mermaid diagram visualization.',
            tags: ['PydanticAI', 'MCP', 'graph routing', 'Django Ninja', 'Mermaid']
        },
        {
            title: 'AI Agent Skill Plugins',
            summary: 'Designed 3 developer workflow plugins for Claude Code and OpenAI Codex — analytics audit with P0–P3 severity tagging, login attribution implementation guide, and an interactive code review processor with dry-run and auto-fix modes.',
            tags: ['Claude Code', 'OpenAI Codex', 'severity-tagged audit', 'interactive CLI']
        },
        {
            title: 'MCP / RAG Prototype',
            summary: 'Prototyped an MCP server with PydanticAI graph routing, retry logic, and state management. Designed a cost-optimized RAG architecture using FAISS-CPU and sentence-transformers targeting sub-200ms response times.',
            tags: ['MCP server', 'PydanticAI', 'FAISS-CPU', 'RAG architecture', 'sentence-transformers']
        }
    ],

    // ---- DevOps ----
    devops: [
        {
            title: 'Developer Environment & Commit Quality',
            summary: 'Standardized the developer environment on uv, enforcing automated linting, comprehensive docstrings and strict commit-quality checks through prek, a Rust-based git hook manager.',
            tags: ['uv', 'prek', 'git hooks', 'linting', 'docstrings']
        },
        {
            title: 'Module Internalization',
            summary: 'Brought external modules in-house, eliminating cross-repo dependencies and making the system easier to maintain.',
            tags: ['dependency management', 'cross-repo cleanup', 'maintainability']
        },
        {
            title: 'AI-Powered Test Coordinator Agent',
            summary: 'Architected a ~4,700-line pytest orchestrator with parallel batch execution, automated failure triage by root cause, real-time progress tracking, and structured test reports.',
            tags: ['multi-agent orchestration', 'parallel batch execution', 'automated triage', 'structured reporting']
        },
        {
            title: 'CI/CD & Dev Automation',
            summary: 'Built GitHub Actions Slack notifications for main branch updates, automated .env provisioning for git worktrees, extended migration generation scripts, and hardened database snapshot tooling with structured error messages.',
            tags: ['GitHub Actions', 'Slack webhooks', 'git worktrees', 'developer experience']
        },
        {
            title: 'Multi-Region Cloud Secrets Management',
            summary: 'Configured application secrets across staging and production spanning multi-region AWS deployments — ECS task definitions, Secrets Manager configurations, and targeted rollbacks for environment consistency.',
            tags: ['AWS Secrets Manager', 'ECS', 'multi-region', 'Terraform']
        }
    ],

    // ---- Data Engineering ----
    data: [
        {
            title: 'Data Processing Toolkit',
            summary: 'Rebuilt the core data processing pipeline with email-based respondent filtering, duplicate detection, and multi-select header transformation. Added internationalisation support to normalise survey responses from non-English speakers (RU/JP/KR/FR) — stripping HTML tags from translated choice values and fuzzy-matching them back to canonical English labels for consistent analysis. Includes dry-run preview mode. Migrated tooling from pip to UV.',
            tags: ['ETL pipeline', 'duplicate detection', 'i18n normalisation', 'multilingual data', 'UV package management']
        }
    ]
};

export const certData = [
    {
        icon: 'i-spark',
        title: 'AWS Certified AI Practitioner',
        issuer: 'Amazon Web Services',
        badge: 'Perfect score',
        badgeTone: 'good',
        description: 'Validates foundational knowledge of AI, machine learning and generative AI, responsible AI practices, and the AWS services used to build with them.'
    },
    {
        icon: 'i-cloud',
        title: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        badge: 'Active · Valid thru 2028',
        badgeTone: 'good',
        description: 'Validates foundational knowledge of AWS Cloud services, security, architecture, pricing, and support. Issued July 2024.',
        verifyUrl: 'https://cp.certmetrics.com/amazon/en/public/verify/credential/f71ecc275b044d1a9319a0ebab86a5f7'
    },
    {
        icon: 'i-box',
        title: 'Docker Mastery: Kubernetes + Swarm',
        issuer: 'Udemy · Bret Fisher (Docker Captain Program)',
        badge: 'Completed · 23 hrs',
        badgeTone: 'neutral',
        description: 'Comprehensive 23-hour course covering Docker, Kubernetes orchestration, and Swarm — taught by an official Docker Captain.',
        verifyUrl: 'https://www.udemy.com/certificate/UC-8f421066-4c61-4d88-8f09-f20ff5a63baf/'
    }
];
