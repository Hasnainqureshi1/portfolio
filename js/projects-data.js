window.projectsData = [
  {
    id: "ai-pr-reviewer",
    title: "AI PR Reviewer - Automated GitHub Code Reviews",
    description: "Analyzes GitHub pull requests for bugs, security risks, and code quality issues, with actionable PR comments that help teams fix problems before merging to production.",
    excerpt: "AI-powered pull request reviews that surface risks early and save senior developers review time.",
    link: "https://git-reviewer-bot.vercel.app/",
    media: ["./asset/ai-pr-reviewer.png"],
    problem: "Senior developers spend valuable time checking feature pull requests for security risks, bugs, and maintainability issues before approving a merge.",
    solution: "Built a GitHub-integrated review tool that uses signed webhooks and Gemini to analyze changed code, flag findings by severity, and provide fix suggestions through PR comments and a review dashboard.",
    tech: "Gemini / GitHub OAuth / GitHub Webhooks / AI Code Review",
    impact: [
      "Earlier visibility into potential bugs and security risks",
      "Actionable fix suggestions within GitHub pull requests",
      "Less repetitive review work for senior developers and managers",
      "Human control over findings and the final merge decision"
    ],
    tags: ["Gemini", "GitHub", "OAuth", "Webhooks", "AI Integration", "Code Review", "Security Analysis", "Developer Tools"]
  },
  {
    id: "chatknot",
    title: "ChatKnot - Conversational Lead Management Platform",
    description: "Multi-tenant platform that turns website chats into structured sales-ready leads.",
    excerpt: "Multi-tenant platform that turns website chats into structured sales-ready leads.",
    link: "https://chatknot.com",
    media: ["./asset/chatknot-1.png", "./asset/chatknot-2.jpg"],
    problem: "Businesses lose leads due to unstructured website chats.",
    solution: "Built a multi-tenant conversational lead management system that converts chats into structured, trackable leads.",
    tech: "React / Next.js / Node.js / Socket.io / MongoDB",
    impact: [
      "Reliable chat-to-sales handoff",
      "Scalable multi-brand architecture",
      "AI-ready foundation"
    ],
    tags: ["React", "Next.js", "Node.js", "Socket.io", "MongoDB", "Saas", "Multi-Tenant", "AI Integration", "WebSocket", "Lead Management", "CRM", "Real-time Communication", "Chatbot"]
  },
  {
    id: "vurks",
    title: "Vurks - Services Marketplace Platform",
    description: "Two-sided platform connecting consumers with verified providers for web, app, and professional services, with a React Native mobile app and a client-friendly dashboard.",
    excerpt: "Marketplace platform with web dashboard and React Native mobile app for service discovery.",
    link: "https://vurks.com",
    media: [
      "./asset/vurks-dashboard.png",
      "./asset/vurks-lead.png",
      "./asset/vurks-app-1.webp",
      "./asset/vurks-app-2.webp",
      "./asset/vurks-app.webp"
    ],
    problem: "Clients needed a faster, trusted way to find service providers and compare quotes across many categories.",
    solution: "Built a marketplace experience with guided service selection, instant quote requests, reviews, a modern dashboard, and a companion React Native app.",
    tech: "React / Next.js / React Query / Redux / React Native / API Integration",
    impact: [
      "Clear service discovery across dozens of categories",
      "Up to 5 free estimations per project request",
      "Faster hiring with trusted reviews and comparisons",
      "Mobile access to service requests and updates"
    ],
    tags: ["React", "Next.js", "React Query", "Redux", "React Native","STRIPE","Saas" ,"API Integration"]
  },
  
  
  {
    id: "cambridge-park",
    title: "Cambridge Research Park - University Campus Website",
    description: "Modern campus website showcasing research, community, and amenities with fully dynamic pages powered by a headless CMS.",
    excerpt: "Headless WordPress campus site with fully editable components and rich storytelling.",
    link: "https://crp-steel.vercel.app",
    media: ["./asset/cambridge-1.png", "./asset/cambridge.png", "./asset/cambridge park.png", "./asset/cambridge-2.png"],
    problem: "The campus needed a modern, content-rich website where teams could update every section without developer support.",
    solution: "Built a fully dynamic Next.js experience using WordPress ACF components and GraphQL so any section can be managed from the CMS.",
    tech: "Next.js / GraphQL / WordPress / ACF / Headless CMS",
    impact: [
      "Fully editable page sections from the CMS",
      "Faster content publishing without developer help",
      "Modern campus storytelling for research and community"
    ],
    tags: ["Next.js", "GraphQL", "WordPress", "ACF", "Headless CMS", "Dynamic Content", "Campus Website", "Content Management", "SEO Optimization", "Responsive Design"]
  }
];
