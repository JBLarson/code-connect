# code-connect

Code Connect is a platform that matches idea generators with student developers and early-career programmers who want to build impressive portfolio projects. It enables collaboration on real open source work while helping developers gain practical experience and legitimate GitHub contributions.

```mermaid
graph TD
    subgraph "Frontend (React + TypeScript)"
        A[Vite Dev Server<br/>:5173]
        B[React Components]
        C[Auth Context<br/>Supabase Client]
        D[API Service<br/>Axios + JWT]
    end
    
    subgraph "Backend (Flask + Python)"
        E[Flask API<br/>:5000]
        F[Auth Middleware<br/>JWT Verification]
        G[Route Blueprints<br/>Profile, Projects]
        H[SQLAlchemy Models<br/>User, Project, Interest]
    end
    
    subgraph "Database & Auth"
        I[(PostgreSQL<br/>Supabase)]
        J[Supabase Auth<br/>User Management]
    end
    
    B --> C
    C --> D
    D -->|HTTP + JWT| E
    E --> F
    F --> G
    G --> H
    H --> I
    C --> J
    J --> I
    
    style A fill:#61dafb,stroke:#20232a,stroke-width:2px,color:#20232a
    style E fill:#000,stroke:#fff,stroke-width:2px,color:#fff
    style I fill:#3ecf8e,stroke:#1a1a1a,stroke-width:2px,color:#1a1a1a
    style J fill:#3ecf8e,stroke:#1a1a1a,stroke-width:2px,color:#1a1a1a
```
