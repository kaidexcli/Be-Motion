# BeMotion

<div align="center">
  <p><strong>A modern, streamlined habit tracking companion for consistent movement.</strong></p>
  <p>Built with Next.js 16, React 19, Tailwind CSS v4, and Supabase.</p>
</div>

---

## 🚀 Overview

**BeMotion** is a sophisticated personal wellness and movement companion designed to build, monitor, and maintain consistent daily movement habits. By leveraging a high-performance, real-time-ready architecture, BeMotion empowers users to define, track, and visualize their progress towards personal fitness goals.

The application features a robust **"Graceful Degradation" architecture**: it functions as a feature-complete local-first application using `localStorage` for state persistence, while seamlessly upgrading to full cloud-synchronized persistence via Supabase when credentials are provided.

## ✨ Key Capabilities

*   **Integrated Daily Dashboard**: A unified view of current intentions, active sessions, and daily progress against goals.
*   **Structured Habit Planning**: Manage weekly movement plans with a flexible template-based engine.
*   **Actionable Metrics**: Real-time monitoring for Hydration, Step count, and Weekly Workout target achievement.
*   **Progress Analytics**: Visual snapshots of consistency to motivate sustained behavioral change.
*   **Cloud & Local Persistence**:
    *   *Local Sandbox*: Immediate usability with no configuration required.
    *   *Cloud-Synced*: Secure, cross-session data persistence using Supabase Auth and database capabilities.

## 🏗️ Enterprise Architecture

BeMotion is engineered for performance, maintainability, and scalability using modern web standards:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org) | Server-side rendering, routing, and optimization. |
| **UI Engine** | [React 19](https://react.dev) | Modern component-based declarative UI development. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) | Rapid, maintainable utility-first styling system. |
| **Database/Auth** | [Supabase](https://supabase.com) | Authentication, user management, and data persistence. |
| **Language** | [TypeScript](https://typescriptlang.org) | Static type safety across the entire stack. |

## 🛠️ Getting Started

### Prerequisites

*   **Node.js**: v20 or higher.
*   **Package Manager**: `npm`, `yarn`, `pnpm`, or `bun`.

### Installation

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd be-motion
npm install
```

2. Configure environment variables (Optional):

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 🧪 Development Workflow

### Scripts

*   `npm run dev`: Starts the development server with hot-module replacement.
*   `npm run build`: Compiles the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Executes ESLint for code quality and standards enforcement.

### Linting & Type Checking

To ensure code quality, always run the linter and the TypeScript compiler before committing:

```bash
npm run lint
npx tsc --noEmit
```

## 🔐 Security & Compliance

*   **Secret Management**: Never commit credentials to version control. Use `.env.local` (ignored by git).
*   **Data Integrity**: Data persistence is handled securely. When Supabase is configured, user sessions are managed via persistent, auto-refreshing JWT tokens.
*   **Compliance**: Built on industry-standard security principles for web applications.

## 🤝 Contribution & Governance

Contributions to BeMotion are welcome. Please ensure that all pull requests maintain the established coding standards:

1.  Follow the existing component structure and architectural patterns defined in `app/components/` and `app/lib/`.
2.  Add tests where applicable for new features or bug fixes.
3.  Ensure `npm run lint` passes before submission.
4.  Reference this document in your PR descriptions if you are introducing major architectural changes.

## 📜 License

This project is licensed under the **GNU Affero General Public License v3.0** - see the [LICENSE](LICENSE) file for details.
