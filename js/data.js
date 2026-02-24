/* ============================================================
   LINKEDIN REDESIGN — MOCK DATA
   ============================================================ */
window.LinkedInData = (function() {

  const avatarColors = ['#0A66C2','#057642','#8F5849','#915907','#6B46C1','#DD2590','#E67E22','#16A085','#2C3E50','#7F8C8D'];
  function getColor(name) { let h=0; for(let c of name) h+=c.charCodeAt(0); return avatarColors[h % avatarColors.length]; }
  function initials(name) { return name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

  // ── CURRENT USER ────────────────────────────────────────────
  const currentUser = {
    id: 1,
    name: "Alex Johnson",
    firstName: "Alex",
    lastName: "Johnson",
    pronouns: "he/him",
    headline: "Senior Software Engineer at Google | Full Stack Developer | Open Source Enthusiast",
    location: "San Francisco Bay Area",
    industry: "Technology",
    connections: 847,
    followers: 1203,
    profileViews: 234,
    postImpressions: 1891,
    avatarColor: '#0A66C2',
    coverGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    about: "Passionate software engineer with 8+ years of experience building scalable web applications and distributed systems. I specialize in full-stack development with expertise in React, Node.js, and cloud infrastructure.\n\nCurrently at Google, I work on developer tools that help millions of engineers ship better code faster. Previously built fintech platforms at Stripe and Airbnb.\n\nI'm deeply passionate about open source, contributing to projects like React and VS Code. When I'm not coding, I mentor junior engineers and speak at tech conferences.\n\n💡 Always open to connecting with fellow engineers, founders, and innovators.",
    openToWork: true,
    openToWorkTypes: ["Full-time", "Remote", "Hybrid"],
    isPremium: true,
    email: "alex.johnson@gmail.com",
    phone: "+1 (415) 234-5678",
    website: "https://alexjohnson.dev",
    birthday: "March 15",
    experience: [
      { id: 1, title: "Senior Software Engineer", company: "Google", companyLogo: "🔵", location: "Mountain View, CA", type: "Full-time", startDate: "Jan 2022", endDate: null, current: true, description: "Leading the development of developer productivity tools used by 50,000+ engineers internally. Architected a new CI/CD pipeline system that reduced build times by 40%. Mentoring a team of 4 junior engineers.", skills: "React, TypeScript, Go, Kubernetes, GCP" },
      { id: 2, title: "Software Engineer II", company: "Stripe", companyLogo: "💜", location: "San Francisco, CA", type: "Full-time", startDate: "Jun 2019", endDate: "Dec 2021", current: false, description: "Built core payment processing features handling $100B+ in transactions annually. Led the migration of legacy PHP services to Go microservices. Improved payment success rates by 3% through ML-based routing.", skills: "Go, Python, React, PostgreSQL, Kafka" },
      { id: 3, title: "Frontend Engineer", company: "Airbnb", companyLogo: "🏠", location: "San Francisco, CA", type: "Full-time", startDate: "Aug 2017", endDate: "May 2019", current: false, description: "Developed new host dashboard features serving 4M+ hosts worldwide. Implemented performance optimizations reducing page load time by 60%. Built the accessibility features bringing the site to WCAG 2.1 AA compliance.", skills: "React, JavaScript, CSS, GraphQL" },
      { id: 4, title: "Software Engineering Intern", company: "Microsoft", companyLogo: "🪟", location: "Redmond, WA", type: "Internship", startDate: "Jun 2016", endDate: "Aug 2016", current: false, description: "Built features for Azure DevOps used by enterprise customers.", skills: "C#, .NET, Azure" }
    ],
    education: [
      { id: 1, school: "Massachusetts Institute of Technology", degree: "Bachelor of Science", field: "Computer Science and Engineering", startYear: "2013", endYear: "2017", grade: "3.9 GPA", activities: "ACM, HackMIT organizer, Robotics Club", description: "Thesis: Distributed Systems for Real-time Collaborative Editing" },
      { id: 2, school: "Harvard Extension School", degree: "Certificate", field: "Data Science", startYear: "2020", endYear: "2021", grade: null, activities: null, description: null }
    ],
    skills: [
      { name: "React.js", endorsements: 87, category: "Frontend" },
      { name: "TypeScript", endorsements: 72, category: "Languages" },
      { name: "Node.js", endorsements: 65, category: "Backend" },
      { name: "Go", endorsements: 54, category: "Languages" },
      { name: "Kubernetes", endorsements: 48, category: "DevOps" },
      { name: "System Design", endorsements: 91, category: "Engineering" },
      { name: "Python", endorsements: 63, category: "Languages" },
      { name: "GraphQL", endorsements: 41, category: "Backend" },
      { name: "PostgreSQL", endorsements: 38, category: "Databases" },
      { name: "AWS", endorsements: 55, category: "Cloud" },
      { name: "Redis", endorsements: 33, category: "Databases" },
      { name: "Docker", endorsements: 59, category: "DevOps" }
    ],
    certifications: [
      { name: "AWS Solutions Architect Professional", org: "Amazon Web Services", issueDate: "Mar 2023", expDate: "Mar 2026", credentialId: "AWS-SAP-2023-AJ" },
      { name: "Certified Kubernetes Administrator", org: "CNCF", issueDate: "Jan 2022", expDate: "Jan 2025", credentialId: "CKA-2022-001" },
      { name: "Google Professional Cloud Developer", org: "Google Cloud", issueDate: "Sep 2022", expDate: "Sep 2024", credentialId: "GCP-PCD-AJ-22" }
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "Spanish", proficiency: "Professional working proficiency" },
      { name: "Mandarin", proficiency: "Elementary proficiency" }
    ],
    recommendations: [
      { id: 1, author: { id: 3, name: "Sarah Chen", headline: "VP of Engineering at Stripe", avatarColor: '#E67E22' }, relationship: "Sarah managed Alex directly", date: "November 2021", text: "Alex is one of the most talented engineers I've had the pleasure of managing. His technical depth is remarkable — he could debug the most complex distributed systems issues with ease. But what truly sets him apart is his ability to communicate complex ideas simply and his genuine care for his teammates' growth. He would be an asset to any engineering organization." },
      { id: 2, author: { id: 7, name: "Marcus Williams", headline: "Senior SWE at Meta", avatarColor: '#2C3E50' }, relationship: "Marcus worked with Alex on the same team", date: "January 2022", text: "I worked with Alex for 2+ years at Stripe and can wholeheartedly recommend him. He's the person everyone wants reviewing their code — thorough, constructive, and always finding the elegant solution. His work on the payment routing system was genuinely impressive and had measurable impact on conversion rates company-wide." }
    ],
    accomplishments: {
      courses: ["Machine Learning by Stanford", "Distributed Systems", "Advanced Algorithms"],
      projects: [
        { name: "OpenCodeReview", description: "Open source AI-powered code review tool with 8K GitHub stars", url: "https://github.com/alexj/opencodereview" },
        { name: "DistributedCache", description: "High-performance distributed caching library for Go", url: "https://github.com/alexj/distcache" }
      ],
      publications: [
        { title: "Scaling Microservices at Stripe", publication: "InfoQ", date: "2021" }
      ],
      honors: [
        { title: "Google Spot Award", issuer: "Google", date: "2023", description: "For outstanding contribution to developer productivity" },
        { title: "Stripe Hack Week Winner", issuer: "Stripe", date: "2020" }
      ],
      testScores: [{ name: "GRE", score: "340/340", date: "2017" }],
      organizations: [{ name: "IEEE Computer Society", role: "Member" }]
    },
    interests: {
      companies: [3, 4, 5, 6],
      groups: [1, 2, 4],
      schools: ["MIT", "Stanford"],
      newsletters: ["Software Engineering Daily", "The Pragmatic Engineer"]
    }
  };

  // ── USERS ───────────────────────────────────────────────────
  const users = [
    { id: 2, name: "Priya Patel", headline: "Product Manager at Meta | Former Consultant | MBA Wharton", location: "New York, NY", industry: "Technology", connections: 1203, mutualConnections: 23, isConnected: true, isPending: false, isFollowing: true, isPremium: false, avatarColor: '#E67E22', about: "Product leader with 6+ years building consumer products at scale. Passionate about user research and data-driven decision making.", experience: [{ title: "Senior PM", company: "Meta", startDate: "2021", current: true }], skills: ["Product Strategy", "User Research", "SQL", "Roadmapping"] },
    { id: 3, name: "Sarah Chen", headline: "VP of Engineering at Stripe | ex-Google | Speaker | Author", location: "San Francisco, CA", industry: "Technology", connections: 4521, mutualConnections: 45, isConnected: true, isPending: false, isFollowing: true, isPremium: true, avatarColor: '#E67E22', about: "Engineering leader with 15+ years building high-scale systems.", experience: [{ title: "VP Engineering", company: "Stripe", startDate: "2020", current: true }], skills: ["Engineering Management", "System Design", "Go", "Distributed Systems"] },
    { id: 4, name: "David Kim", headline: "Data Scientist at Netflix | ML Researcher | PhD Stanford", location: "Los Gatos, CA", industry: "Technology", connections: 892, mutualConnections: 12, isConnected: false, isPending: true, isFollowing: false, isPremium: true, avatarColor: '#16A085', about: "Machine learning engineer specializing in recommendation systems and NLP.", experience: [{ title: "Senior Data Scientist", company: "Netflix", startDate: "2020", current: true }], skills: ["Python", "TensorFlow", "PyTorch", "SQL", "Statistics"] },
    { id: 5, name: "Michelle Rodriguez", headline: "UX Design Lead at Apple | Human-Centered Design | Speaker", location: "Cupertino, CA", industry: "Technology", connections: 2341, mutualConnections: 8, isConnected: false, isPending: false, isFollowing: true, isPremium: false, avatarColor: '#DD2590', about: "Design leader passionate about creating intuitive and accessible experiences for everyone.", experience: [{ title: "Design Lead", company: "Apple", startDate: "2019", current: true }], skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"] },
    { id: 6, name: "James Thompson", headline: "Engineering Manager at Amazon | AWS | 3x Founder | Investor", location: "Seattle, WA", industry: "Technology", connections: 3102, mutualConnections: 17, isConnected: false, isPending: false, isFollowing: false, isPremium: true, avatarColor: '#2C3E50', about: "Technical leader with 12 years experience in distributed systems and cloud infrastructure.", experience: [{ title: "Engineering Manager", company: "Amazon", startDate: "2018", current: true }], skills: ["AWS", "Java", "Microservices", "Team Leadership"] },
    { id: 7, name: "Marcus Williams", headline: "Senior Software Engineer at Meta | React Core Team", location: "Menlo Park, CA", industry: "Technology", connections: 1876, mutualConnections: 34, isConnected: true, isPending: false, isFollowing: true, isPremium: false, avatarColor: '#2C3E50', about: "Open source enthusiast and React contributor. Building the future of web.", experience: [{ title: "Senior SWE", company: "Meta", startDate: "2020", current: true }], skills: ["React", "JavaScript", "Open Source", "TypeScript"] },
    { id: 8, name: "Aisha Okafor", headline: "Startup Founder & CEO | Forbes 30 Under 30 | Building EdTech", location: "Austin, TX", industry: "Education Technology", connections: 5430, mutualConnections: 9, isConnected: false, isPending: false, isFollowing: true, isPremium: true, avatarColor: '#915907', about: "Serial entrepreneur building tools to democratize quality education globally.", experience: [{ title: "CEO & Co-Founder", company: "EduAI", startDate: "2021", current: true }], skills: ["Entrepreneurship", "Product", "Fundraising", "EdTech"] },
    { id: 9, name: "Ryan Park", headline: "DevOps Engineer at Spotify | Kubernetes | Terraform | CI/CD", location: "Stockholm, Sweden", industry: "Technology", connections: 743, mutualConnections: 6, isConnected: false, isPending: false, isFollowing: false, isPremium: false, avatarColor: '#6B46C1', about: "Infrastructure engineer passionate about reliability and developer experience.", experience: [{ title: "Senior DevOps Engineer", company: "Spotify", startDate: "2021", current: true }], skills: ["Kubernetes", "Terraform", "AWS", "Docker", "Python"] },
    { id: 10, name: "Lisa Zhang", headline: "Product Designer at Figma | Ex-Dropbox | Design Systems Expert", location: "San Francisco, CA", industry: "Technology", connections: 1654, mutualConnections: 21, isConnected: false, isPending: false, isFollowing: true, isPremium: false, avatarColor: '#8F5849', about: "Designing products that help teams collaborate and create better together.", experience: [{ title: "Product Designer", company: "Figma", startDate: "2022", current: true }], skills: ["Design Systems", "Figma", "UI/UX", "User Testing"] },
    { id: 11, name: "Carlos Mendez", headline: "Head of Growth at Notion | Previously HubSpot | Growth Hacker", location: "San Francisco, CA", industry: "Technology", connections: 2890, mutualConnections: 14, isConnected: false, isPending: false, isFollowing: false, isPremium: true, avatarColor: '#E67E22', about: "Growth marketing professional helping B2B SaaS companies scale from 0 to 100M+ users.", experience: [{ title: "Head of Growth", company: "Notion", startDate: "2021", current: true }], skills: ["Growth Marketing", "SEO", "Analytics", "Product-Led Growth"] },
    { id: 12, name: "Emma Wilson", headline: "Software Engineer at Shopify | Ruby | E-commerce | Remote", location: "Toronto, Canada", industry: "Technology", connections: 623, mutualConnections: 5, isConnected: false, isPending: false, isFollowing: false, isPremium: false, avatarColor: '#16A085', about: "Backend engineer specializing in scalable e-commerce platforms.", experience: [{ title: "Software Engineer", company: "Shopify", startDate: "2020", current: true }], skills: ["Ruby", "Rails", "PostgreSQL", "React"] },
    { id: 13, name: "Raj Gupta", headline: "CTO at FinTech Startup | ex-Goldman Sachs | Blockchain Pioneer", location: "New York, NY", industry: "Financial Services", connections: 3421, mutualConnections: 11, isConnected: false, isPending: false, isFollowing: true, isPremium: true, avatarColor: '#0A66C2', about: "Building the next generation of financial infrastructure on blockchain.", experience: [{ title: "CTO", company: "CryptoFinance Inc.", startDate: "2022", current: true }], skills: ["Blockchain", "Solidity", "DeFi", "System Architecture"] },
    { id: 14, name: "Sophie Martin", headline: "Data Engineer at Databricks | Apache Spark | MLOps", location: "Amsterdam, Netherlands", industry: "Technology", connections: 912, mutualConnections: 7, isConnected: false, isPending: false, isFollowing: false, isPremium: false, avatarColor: '#DD2590', about: "Building data pipelines that power ML at scale.", experience: [{ title: "Senior Data Engineer", company: "Databricks", startDate: "2021", current: true }], skills: ["Apache Spark", "Python", "SQL", "MLOps", "Airflow"] },
    { id: 15, name: "Tyler Brooks", headline: "Frontend Architect at Vercel | Next.js Core | Web Performance", location: "Remote", industry: "Technology", connections: 4102, mutualConnections: 28, isConnected: false, isPending: false, isFollowing: true, isPremium: false, avatarColor: '#2C3E50', about: "Working on the edge of web performance. Next.js contributor.", experience: [{ title: "Frontend Architect", company: "Vercel", startDate: "2021", current: true }], skills: ["Next.js", "React", "Web Performance", "TypeScript", "Edge Computing"] },
    { id: 16, name: "Nina Kowalski", headline: "Security Engineer at CrowdStrike | Ethical Hacker | Bug Bounty", location: "Warsaw, Poland", industry: "Cybersecurity", connections: 1543, mutualConnections: 4, isConnected: false, isPending: false, isFollowing: false, isPremium: false, avatarColor: '#6B46C1', about: "Defending organizations from cyber threats through offensive security.", experience: [{ title: "Senior Security Engineer", company: "CrowdStrike", startDate: "2020", current: true }], skills: ["Penetration Testing", "Python", "OSCP", "Cloud Security"] },
    { id: 17, name: "Kevin O'Brien", headline: "Recruiter at LinkedIn | Connecting Top Tech Talent | ex-Google Recruiter", location: "New York, NY", industry: "Staffing & Recruiting", connections: 7823, mutualConnections: 31, isConnected: true, isPending: false, isFollowing: true, isPremium: true, avatarColor: '#915907', about: "Passionate about connecting great people with great opportunities in tech.", experience: [{ title: "Senior Technical Recruiter", company: "LinkedIn", startDate: "2022", current: true }], skills: ["Technical Recruiting", "Sourcing", "LinkedIn Recruiter"] },
    { id: 18, name: "Ana Souza", headline: "ML Engineer at OpenAI | NLP Research | LLMs | Author", location: "San Francisco, CA", industry: "Artificial Intelligence", connections: 8902, mutualConnections: 19, isConnected: false, isPending: false, isFollowing: true, isPremium: true, avatarColor: '#DD2590', about: "Working on aligning large language models with human values. Researcher and engineer.", experience: [{ title: "ML Engineer", company: "OpenAI", startDate: "2022", current: true }], skills: ["Python", "PyTorch", "NLP", "Transformers", "RLHF"] },
    { id: 19, name: "Jake Anderson", headline: "iOS Engineer at Uber | Swift | Mobile Architecture | ex-Lyft", location: "San Francisco, CA", industry: "Technology", connections: 934, mutualConnections: 16, isConnected: false, isPending: false, isFollowing: false, isPremium: false, avatarColor: '#E67E22', about: "Mobile engineer building apps used by millions of riders and drivers daily.", experience: [{ title: "Senior iOS Engineer", company: "Uber", startDate: "2021", current: true }], skills: ["Swift", "iOS", "UIKit", "SwiftUI", "Xcode"] },
    { id: 20, name: "Patricia Moore", headline: "VP Product at Salesforce | Ex-Oracle | Enterprise Software | Speaker", location: "San Francisco, CA", industry: "Technology", connections: 5671, mutualConnections: 22, isConnected: false, isPending: false, isFollowing: false, isPremium: true, avatarColor: '#16A085', about: "Building enterprise software that helps businesses grow and operate efficiently.", experience: [{ title: "VP Product Management", company: "Salesforce", startDate: "2019", current: true }], skills: ["Product Management", "Enterprise Software", "CRM", "Salesforce Platform"] },
    { id: 21, name: "Hiroshi Tanaka", headline: "Principal Engineer at Sony | Embedded Systems | C++ | Robotics", location: "Tokyo, Japan", industry: "Technology", connections: 1231, mutualConnections: 3, isConnected: false, isPending: false, isFollowing: false, isPremium: false, avatarColor: '#915907', about: "Building intelligent systems at the hardware-software boundary.", experience: [{ title: "Principal Software Engineer", company: "Sony", startDate: "2017", current: true }], skills: ["C++", "Embedded Systems", "Robotics", "RTOS", "Computer Vision"] }
  ];

  // ── COMPANIES ──────────────────────────────────────────────
  const companies = [
    { id: 1, name: "Google", logo: "🔵", industry: "Technology", size: "10,001+ employees", followers: 29400000, description: "Google's mission is to organize the world's information and make it universally accessible and useful.", website: "google.com", headquarters: "Mountain View, CA", founded: "1998", specialties: ["Search", "Cloud Computing", "AI/ML", "Advertising", "Developer Tools"] },
    { id: 2, name: "Stripe", logo: "💜", industry: "Financial Technology", size: "5,001-10,000 employees", followers: 1200000, description: "Stripe builds financial infrastructure for the internet. Businesses of all sizes use Stripe to accept payments.", website: "stripe.com", headquarters: "San Francisco, CA", founded: "2010", specialties: ["Payments", "FinTech", "APIs", "Commerce Infrastructure"] },
    { id: 3, name: "Meta", logo: "🔷", industry: "Technology", size: "10,001+ employees", followers: 18700000, description: "Meta builds technologies that help people connect with friends and family, find communities, and grow businesses.", website: "meta.com", headquarters: "Menlo Park, CA", founded: "2004", specialties: ["Social Media", "VR/AR", "Advertising", "AI Research"] },
    { id: 4, name: "Apple", logo: "🍎", industry: "Technology", size: "10,001+ employees", followers: 32100000, description: "Apple is where individual imaginations gather together, committing to the values that lead to great work.", website: "apple.com", headquarters: "Cupertino, CA", founded: "1976", specialties: ["Consumer Electronics", "Software", "Services", "Retail"] },
    { id: 5, name: "Netflix", logo: "🔴", industry: "Entertainment Technology", size: "5,001-10,000 employees", followers: 8900000, description: "Netflix is the world's leading streaming entertainment service with 232M+ members worldwide.", website: "netflix.com", headquarters: "Los Gatos, CA", founded: "1997", specialties: ["Streaming", "Content Creation", "Technology Platform", "AI Personalization"] },
    { id: 6, name: "OpenAI", logo: "⬛", industry: "Artificial Intelligence", size: "501-1,000 employees", followers: 4500000, description: "OpenAI is an AI safety company building AGI for the benefit of all of humanity.", website: "openai.com", headquarters: "San Francisco, CA", founded: "2015", specialties: ["AI Research", "LLMs", "Safety", "Machine Learning"] },
    { id: 7, name: "Airbnb", logo: "🏠", industry: "Technology", size: "5,001-10,000 employees", followers: 3200000, description: "Airbnb is a community based on connection and belonging. We create a world where anyone can belong anywhere.", website: "airbnb.com", headquarters: "San Francisco, CA", founded: "2008", specialties: ["Travel", "Marketplace", "Hospitality", "Community"] },
    { id: 8, name: "Figma", logo: "🎨", industry: "Technology", size: "1,001-5,000 employees", followers: 1800000, description: "Figma connects everyone in the design process so teams can deliver better products, faster.", website: "figma.com", headquarters: "San Francisco, CA", founded: "2012", specialties: ["Design Tools", "Collaboration", "UI/UX", "Prototyping"] },
    { id: 9, name: "Vercel", logo: "▲", industry: "Cloud Infrastructure", size: "201-500 employees", followers: 980000, description: "Vercel's Frontend Cloud gives developers the frameworks, workflows, and infrastructure to build a faster, more personalized Web.", website: "vercel.com", headquarters: "San Francisco, CA", founded: "2015", specialties: ["Frontend Cloud", "Next.js", "Edge Computing", "CI/CD"] },
    { id: 10, name: "Databricks", logo: "🧱", industry: "Technology", size: "5,001-10,000 employees", followers: 890000, description: "Databricks helps data and AI teams collaborate more effectively, from exploratory analytics to machine learning.", website: "databricks.com", headquarters: "San Francisco, CA", founded: "2013", specialties: ["Data Engineering", "Apache Spark", "MLOps", "Lakehouse"] }
  ];

  // ── POSTS ──────────────────────────────────────────────────
  const posts = [
    {
      id: 1,
      author: users[0], // Priya
      content: "Excited to share that I've just been promoted to Senior Product Manager at Meta! 🎉\n\nThis journey has been incredible — from presenting to the C-suite to shipping features used by 3 billion people.\n\nA few things I've learned:\n✅ Data tells you WHAT, users tell you WHY\n✅ The best roadmaps have as much strategy as features\n✅ Alignment is a superpower\n\nThank you to my amazing team and mentors who believed in me. Can't wait for what's next!\n\n#ProductManagement #CareerGrowth #Meta #Promotion",
      timestamp: new Date(Date.now() - 2*3600000),
      reactions: { like: 324, celebrate: 189, love: 67, support: 12, insightful: 34, funny: 3 },
      totalReactions: 629,
      comments: 78,
      reposts: 34,
      isLiked: true,
      isSaved: false,
      reactionType: "celebrate",
      type: "text",
      tags: ["ProductManagement", "CareerGrowth", "Meta"]
    },
    {
      id: 2,
      author: users[14], // Tyler Brooks
      content: "I just shipped a blog post on Web Performance Optimization in 2024 that took me 3 weeks to research and write.\n\nHere are the 10 most impactful techniques I found:\n\n1. 🖼️ Use modern image formats (AVIF > WebP > JPEG)\n2. 📦 Reduce JavaScript bundle size with tree-shaking\n3. ⚡ Implement Streaming SSR with React 18\n4. 🗜️ Enable Brotli compression (30% better than gzip)\n5. 🌊 Use Partial Prerendering for dynamic pages\n6. 🚀 Preconnect to third-party origins\n7. 📱 Optimize Core Web Vitals (LCP < 2.5s)\n8. 💾 Implement aggressive caching strategies\n9. 🔄 Use React Query for smart data fetching\n10. 📊 Measure everything with Real User Monitoring\n\nThe companies doing this right are seeing 20-40% improvement in conversion rates.\n\nLink in comments 👇\n\n#WebPerformance #JavaScript #NextJS #WebDev",
      timestamp: new Date(Date.now() - 4*3600000),
      reactions: { like: 892, insightful: 341, love: 78, celebrate: 45, support: 23, funny: 12 },
      totalReactions: 1391,
      comments: 156,
      reposts: 234,
      isLiked: false,
      isSaved: true,
      reactionType: null,
      type: "text",
      tags: ["WebPerformance", "JavaScript", "NextJS"]
    },
    {
      id: 3,
      author: { id: 18, name: "Ana Souza", headline: "ML Engineer at OpenAI | NLP Research | LLMs | Author", avatarColor: '#DD2590' },
      content: "Hot take: The way we evaluate LLMs is fundamentally broken.\n\nWe keep benchmarking on tests that models have already seen in training data. It's like grading a student on the exact same questions they studied.\n\nWhat we actually need:\n• Real-world task completion rates\n• Calibration metrics (does the model know what it doesn't know?)\n• Adversarial robustness beyond simple jailbreaks\n• Long-context coherence over hours of conversation\n• Multi-step reasoning with verifiable intermediate steps\n\nThe field is optimizing for metrics, not for intelligence. And the gap between benchmark performance and real-world usefulness is growing.\n\nThoughts? Would love to hear from other ML researchers and practitioners.\n\n#AI #MachineLearning #LLMs #OpenAI #Research",
      timestamp: new Date(Date.now() - 6*3600000),
      reactions: { like: 2341, insightful: 1234, love: 234, celebrate: 89, support: 156, funny: 45 },
      totalReactions: 4099,
      comments: 423,
      reposts: 789,
      isLiked: false,
      isSaved: false,
      reactionType: null,
      type: "text",
      tags: ["AI", "MachineLearning", "LLMs"]
    },
    {
      id: 4,
      author: { id: 8, name: "Aisha Okafor", headline: "Startup Founder & CEO | Forbes 30 Under 30 | Building EdTech", avatarColor: '#915907' },
      content: "We just closed our Series A — $12M led by Andreessen Horowitz! 🚀\n\nWhen I started EduAI 18 months ago in my apartment with $0 and a laptop, people told me:\n❌ \"EdTech is a graveyard post-COVID\"\n❌ \"You're too young to raise from top VCs\"\n❌ \"The market is too crowded\"\n\nToday we have:\n✅ 850,000 students using our platform\n✅ Partnerships with 200+ schools in 15 countries\n✅ 4.8/5 satisfaction rating\n✅ A team of 23 incredible people\n\nThe lesson? Timing, focus, and relentless execution beat conventional wisdom every time.\n\nWe're hiring engineers, product managers, and educators. Drop me a DM if you want to change how the next generation learns!\n\n#Startup #FundingAnnouncement #EdTech #SeriesA #a16z",
      timestamp: new Date(Date.now() - 8*3600000),
      reactions: { celebrate: 4231, like: 1892, love: 567, support: 234, insightful: 123, funny: 34 },
      totalReactions: 7081,
      comments: 891,
      reposts: 1234,
      isLiked: true,
      isSaved: true,
      reactionType: "celebrate",
      type: "text",
      tags: ["Startup", "EdTech", "SeriesA"]
    },
    {
      id: 5,
      author: users[1], // Sarah Chen
      content: "I interviewed 200 engineers over the past year. Here's what separates the top 5% from everyone else:\n\n1. Communication > technical skill\nThe best engineers I've hired explain complex ideas in simple terms. They know their audience.\n\n2. They ask WHY before HOW\nTop performers question requirements, understand business goals, then solve the right problem.\n\n3. They've failed spectacularly and learned from it\nThe best interview stories involve a project that burned down. What matters is what they did next.\n\n4. They make their colleagues faster\nThey write documentation, review code thoughtfully, and share knowledge freely.\n\n5. They have strong opinions, weakly held\nConviction + humility = the ideal engineer mindset.\n\nSave this if you're preparing for senior/staff engineering interviews.\n\n#EngineeringLeadership #SoftwareEngineering #CareerAdvice #InterviewTips",
      timestamp: new Date(Date.now() - 12*3600000),
      reactions: { like: 5621, insightful: 2341, love: 456, support: 234, celebrate: 123, funny: 78 },
      totalReactions: 8853,
      comments: 1234,
      reposts: 2341,
      isLiked: false,
      isSaved: true,
      reactionType: null,
      type: "text",
      tags: ["EngineeringLeadership", "CareerAdvice"]
    },
    {
      id: 6,
      author: { id: 5, name: "Michelle Rodriguez", headline: "UX Design Lead at Apple | Human-Centered Design | Speaker", avatarColor: '#DD2590' },
      content: "3 UX principles I wish someone had told me earlier:\n\n📐 White space is not empty space — it's breathing room for your user's eyes.\n\n🎯 If your user needs a tutorial, your design has already failed. The best interfaces are self-evident.\n\n🔄 Every click costs emotional energy. Ruthlessly eliminate unnecessary steps.\n\nWhat UX principle changed how you work?",
      timestamp: new Date(Date.now() - 18*3600000),
      reactions: { like: 3421, insightful: 1234, love: 567, celebrate: 89, support: 45, funny: 23 },
      totalReactions: 5379,
      comments: 567,
      reposts: 892,
      isLiked: true,
      isSaved: false,
      reactionType: "like",
      type: "text",
      tags: ["UXDesign", "Design", "ProductDesign"]
    },
    {
      id: 7,
      author: currentUser,
      content: "Just published my deep dive on building scalable React applications in 2024.\n\nKey architecture decisions that made our team 40% faster:\n\n🏗️ Feature-based folder structure > layer-based\n⚛️ React Query for server state, Zustand for client state\n🧪 Testing pyramid: 70% unit, 20% integration, 10% e2e\n🚀 Module Federation for micro-frontend architecture\n📊 Performance budget enforced in CI/CD pipeline\n\nWhat patterns have worked for your team?\n\n#React #JavaScript #SoftwareEngineering #WebDev",
      timestamp: new Date(Date.now() - 24*3600000),
      reactions: { like: 892, insightful: 456, love: 123, celebrate: 67, support: 34, funny: 12 },
      totalReactions: 1584,
      comments: 234,
      reposts: 178,
      isLiked: false,
      isSaved: false,
      reactionType: null,
      type: "text",
      tags: ["React", "JavaScript", "WebDev"]
    },
    {
      id: 8,
      author: users[3], // David Kim
      content: "The Netflix recommendation algorithm just got a major upgrade and I'm on the team that built it. 🎬\n\nWe moved from collaborative filtering to a transformer-based approach:\n\nOld system: \"Users who watched X also watched Y\"\nNew system: Understands sequential viewing patterns, time-of-day preferences, mood signals, and social context simultaneously.\n\nResults from A/B test:\n• +23% completion rate\n• +31% discovery of non-mainstream content\n• +18% weekly active streaming time\n\nThe model processes 1B+ events per day in real-time.\n\nFull technical writeup on the Netflix Tech Blog: link in comments!\n\n#MachineLearning #Netflix #RecommendationSystems #AI #DataScience",
      timestamp: new Date(Date.now() - 2*24*3600000),
      reactions: { like: 4231, insightful: 2891, love: 456, celebrate: 234, support: 123, funny: 45 },
      totalReactions: 7980,
      comments: 789,
      reposts: 1567,
      isLiked: false,
      isSaved: true,
      reactionType: null,
      type: "text",
      tags: ["MachineLearning", "Netflix", "AI"]
    },
    {
      id: 9,
      author: users[10], // Carlos
      content: "I asked 50 marketing leaders what growth channel they regret ignoring. The answer was unanimous: LinkedIn organic.\n\nHere's why most B2B companies are leaving 70% of their pipeline on the table:\n\n❌ They treat LinkedIn like Twitter (broadcast, not conversation)\n❌ They post company updates instead of insights\n❌ They're afraid to have opinions\n❌ They chase viral instead of valuable\n\nWhat actually works:\n✅ Founder-led content on personal profiles\n✅ Controversial but researched takes\n✅ Behind-the-scenes of building the company\n✅ Specific, actionable frameworks\n✅ Consistency over 90 days minimum\n\nLinkedIn's algorithm rewards dwell time, not clicks. Write things people read, not just like.\n\n#B2BMarketing #GrowthHacking #ContentMarketing #LinkedIn",
      timestamp: new Date(Date.now() - 3*24*3600000),
      reactions: { like: 2341, insightful: 1456, love: 234, celebrate: 89, support: 67, funny: 34 },
      totalReactions: 4221,
      comments: 456,
      reposts: 678,
      isLiked: false,
      isSaved: false,
      reactionType: null,
      type: "text",
      tags: ["B2BMarketing", "GrowthHacking", "LinkedIn"]
    },
    {
      id: 10,
      author: users[6], // Marcus Williams
      content: "React 19 is finally here and the DX improvements are insane.\n\nGame changers:\n\n🪝 use() hook — read any resource (promises, context) directly in components\n🎬 useOptimistic — built-in optimistic updates, no more boilerplate\n📋 Form Actions — server mutations with zero client JS\n🏃 useFormStatus — pending states without prop drilling\n🔄 useTransition upgrades — start transitions from async functions\n\nThe server/client mental model is finally clicking. Components can be async by default and you only add 'use client' where you actually need interactivity.\n\nMigration guide in comments. Who's upgrading this weekend? 👇\n\n#React #JavaScript #WebDevelopment #Frontend",
      timestamp: new Date(Date.now() - 4*24*3600000),
      reactions: { like: 3421, insightful: 1892, love: 567, celebrate: 234, support: 89, funny: 23 },
      totalReactions: 6226,
      comments: 892,
      reposts: 1234,
      isLiked: true,
      isSaved: true,
      reactionType: "insightful",
      type: "text",
      tags: ["React", "JavaScript", "Frontend"]
    }
  ];

  // Add comments to first few posts
  posts[0].commentsList = [
    { id: 1, author: users[1], text: "Huge congrats Priya!! So well deserved! 🎊", timestamp: "1h", likes: 23 },
    { id: 2, author: currentUser, text: "Amazing news! Meta is lucky to have you as a Senior PM 🚀", timestamp: "2h", likes: 15 },
    { id: 3, author: users[6], text: "The point about data telling you WHAT but users telling you WHY is gold. Sharing this with my team!", timestamp: "3h", likes: 45 }
  ];
  posts[4].commentsList = [
    { id: 1, author: currentUser, text: "Point #2 is underrated. So many engineers dive into HOW without understanding WHY. This has changed how I approach design docs.", timestamp: "2h", likes: 67 },
    { id: 2, author: users[5], text: "The 'failed spectacularly' point resonates. I now specifically ask candidates about their biggest failure before their biggest success.", timestamp: "4h", likes: 34 }
  ];

  // ── JOBS ──────────────────────────────────────────────────
  const jobs = [
    { id: 1, title: "Senior Software Engineer, Frontend", company: "Google", companyId: 1, companyLogo: "🔵", location: "Mountain View, CA (Hybrid)", type: "Full-time", level: "Senior", remote: false, postedDays: 2, applicants: "Over 200", easyApply: false, salary: "$180,000 - $240,000/yr", industry: "Technology", isSaved: false, isApplied: false, matchScore: 95, skills: ["React", "TypeScript", "JavaScript", "CSS", "Performance"], description: "<h3>About the Role</h3><p>We're looking for a Senior Frontend Engineer to join our Developer Experience team. You'll work on internal tools used by 50,000+ Googlers and contribute to open source projects that shape the future of the web.</p><h3>Responsibilities</h3><ul><li>Design and implement high-impact frontend features at massive scale</li><li>Lead technical design reviews and mentor junior engineers</li><li>Drive cross-functional collaboration with Product, Design, and Data</li><li>Contribute to open source projects including Angular, Web Vitals</li><li>Define and uphold engineering best practices across the team</li></ul><h3>Requirements</h3><ul><li>5+ years of software engineering experience</li><li>Deep expertise in JavaScript, TypeScript, and modern frameworks</li><li>Experience with performance optimization and Core Web Vitals</li><li>Strong computer science fundamentals</li><li>Excellent communication and collaboration skills</li></ul><h3>Benefits</h3><ul><li>Competitive salary + equity</li><li>Free meals, snacks, and beverages</li><li>On-site fitness centers and wellness programs</li><li>Generous parental leave</li><li>Annual $1,000 learning budget</li></ul>" },
    { id: 2, title: "Machine Learning Engineer", company: "OpenAI", companyId: 6, companyLogo: "⬛", location: "San Francisco, CA (On-site)", type: "Full-time", level: "Mid-Senior", remote: false, postedDays: 1, applicants: "Over 500", easyApply: false, salary: "$200,000 - $300,000/yr", industry: "AI Research", isSaved: true, isApplied: false, matchScore: 78, skills: ["Python", "PyTorch", "Machine Learning", "NLP", "Transformers"], description: "<h3>About OpenAI</h3><p>OpenAI is an AI safety company building safe AGI. We believe in deploying AI responsibly and ensuring it benefits all of humanity.</p><h3>What You'll Do</h3><ul><li>Train and fine-tune large language models at unprecedented scale</li><li>Research novel training techniques including RLHF and Constitutional AI</li><li>Build and maintain ML training infrastructure on thousands of GPUs</li><li>Collaborate with research scientists to productionize cutting-edge research</li></ul><h3>Requirements</h3><ul><li>Strong Python skills and experience with PyTorch or JAX</li><li>Deep understanding of transformer architectures</li><li>Experience training models with 1B+ parameters</li><li>Publication record at top ML venues (NeurIPS, ICML, ICLR) preferred</li></ul>" },
    { id: 3, title: "Product Manager, Growth", company: "Notion", companyId: 8, companyLogo: "📋", location: "San Francisco, CA", type: "Full-time", level: "Senior", remote: false, postedDays: 3, applicants: "150", easyApply: true, salary: "$150,000 - $180,000/yr", industry: "SaaS", isSaved: false, isApplied: false, matchScore: 65, skills: ["Product Management", "Growth", "Analytics", "SQL"], description: "<h3>About Notion</h3><p>Notion is on a mission to make toolmaking ubiquitous. We're building a new kind of software for the AI age.</p><h3>The Role</h3><p>As a PM on the Growth team, you'll own the metrics and strategy for turning new users into habitual ones. You'll work across the funnel from acquisition to activation to retention.</p><h3>Requirements</h3><ul><li>4+ years of product management experience</li><li>Track record of shipping features that drive measurable growth</li><li>Strong analytical skills — comfortable with SQL and A/B testing</li><li>Experience with PLG (product-led growth) companies preferred</li></ul>" },
    { id: 4, title: "Staff Software Engineer, Backend", company: "Stripe", companyId: 2, companyLogo: "💜", location: "Remote (US)", type: "Full-time", level: "Staff", remote: true, postedDays: 5, applicants: "300", easyApply: false, salary: "$220,000 - $290,000/yr", industry: "FinTech", isSaved: true, isApplied: false, matchScore: 88, skills: ["Go", "Ruby", "Distributed Systems", "PostgreSQL", "Kafka"], description: "<h3>About Stripe</h3><p>Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size use Stripe's software to accept payments and manage their businesses online.</p><h3>What You'll Work On</h3><ul><li>Core payment processing infrastructure handling $1T+ in payments annually</li><li>Reliability and scalability of mission-critical financial systems</li><li>API design and developer experience for millions of developers</li></ul>" },
    { id: 5, title: "UX Designer", company: "Airbnb", companyId: 7, companyLogo: "🏠", location: "San Francisco, CA", type: "Full-time", level: "Mid", remote: false, postedDays: 7, applicants: "250", easyApply: true, salary: "$130,000 - $160,000/yr", industry: "Travel Technology", isSaved: false, isApplied: false, matchScore: 42, skills: ["Figma", "User Research", "Prototyping", "Design Systems"], description: "<h3>About Airbnb Design</h3><p>Airbnb's design team creates the experiences that help hosts and guests around the world connect meaningfully.</p>" },
    { id: 6, title: "DevOps Engineer, Platform", company: "Spotify", companyId: 9, companyLogo: "🎵", location: "Remote (Europe)", type: "Full-time", level: "Senior", remote: true, postedDays: 4, applicants: "180", easyApply: true, salary: "€80,000 - €110,000/yr", industry: "Music Technology", isSaved: false, isApplied: true, matchScore: 71, skills: ["Kubernetes", "Terraform", "AWS", "Docker", "Python"], description: "<h3>About the Team</h3><p>The Platform Engineering team owns Spotify's developer infrastructure — the tools and systems that 5,000+ engineers use to build and deploy the Spotify experience.</p>" },
    { id: 7, title: "Data Engineer", company: "Databricks", companyId: 10, companyLogo: "🧱", location: "Amsterdam, Netherlands", type: "Full-time", level: "Senior", remote: false, postedDays: 2, applicants: "120", easyApply: false, salary: "€90,000 - €120,000/yr", industry: "Data & Analytics", isSaved: false, isApplied: false, matchScore: 67, skills: ["Apache Spark", "Python", "SQL", "Scala", "Delta Lake"], description: "<h3>About Databricks</h3><p>Databricks enables data engineering, analytics, and machine learning at scale through the world's first and only lakehouse platform.</p>" },
    { id: 8, title: "Engineering Manager, Infrastructure", company: "Netflix", companyId: 5, companyLogo: "🔴", location: "Los Gatos, CA", type: "Full-time", level: "Manager", remote: false, postedDays: 10, applicants: "Over 200", easyApply: false, salary: "$250,000 - $320,000/yr", industry: "Entertainment Technology", isSaved: false, isApplied: false, matchScore: 55, skills: ["Engineering Management", "Distributed Systems", "Java", "Cloud Infrastructure"], description: "<h3>About Netflix Engineering</h3><p>Netflix's engineering team is behind the systems delivering 250M+ hours of entertainment every single day. Join us to work on problems at extraordinary scale.</p>" },
    { id: 9, title: "Security Engineer", company: "CrowdStrike", companyId: 11, companyLogo: "🦅", location: "Remote (US)", type: "Full-time", level: "Senior", remote: true, postedDays: 6, applicants: "90", easyApply: true, salary: "$160,000 - $200,000/yr", industry: "Cybersecurity", isSaved: false, isApplied: false, matchScore: 38, skills: ["Penetration Testing", "Python", "Threat Intelligence", "Cloud Security"], description: "<h3>About the Role</h3><p>Join CrowdStrike's elite security team to help organizations stay ahead of sophisticated cyber threats. You'll combine offensive and defensive security skills to protect Fortune 500 clients.</p>" },
    { id: 10, title: "Frontend Developer", company: "Vercel", companyId: 9, companyLogo: "▲", location: "Remote (Worldwide)", type: "Full-time", level: "Mid", remote: true, postedDays: 3, applicants: "Over 400", easyApply: false, salary: "$120,000 - $160,000/yr", industry: "Cloud Infrastructure", isSaved: true, isApplied: false, matchScore: 82, skills: ["Next.js", "React", "TypeScript", "CSS", "Web Performance"], description: "<h3>About Vercel</h3><p>Vercel's mission is to enable the world to ship the best products. We do this by providing developers with the tools and infrastructure needed to build and deploy the next-generation web.</p>" },
    { id: 11, title: "iOS Engineer", company: "Uber", companyId: 12, companyLogo: "🚗", location: "San Francisco, CA", type: "Full-time", level: "Senior", remote: false, postedDays: 8, applicants: "200", easyApply: true, salary: "$170,000 - $220,000/yr", industry: "Transportation Technology", isSaved: false, isApplied: false, matchScore: 45, skills: ["Swift", "iOS", "SwiftUI", "Xcode", "Mobile Performance"], description: "<h3>About Uber Engineering</h3><p>Uber's iOS team builds the apps used by millions of riders, drivers, and delivery couriers around the world. We're committed to creating the best mobile experience in the transportation industry.</p>" },
    { id: 12, title: "Technical Recruiter", company: "LinkedIn", companyId: 13, companyLogo: "🔷", location: "New York, NY", type: "Full-time", level: "Senior", remote: false, postedDays: 1, applicants: "150", easyApply: true, salary: "$100,000 - $130,000/yr", industry: "Internet", isSaved: false, isApplied: false, matchScore: 28, skills: ["Recruiting", "Sourcing", "LinkedIn Recruiter", "Technical Screening"], description: "<h3>About LinkedIn</h3><p>LinkedIn's mission is to connect the world's professionals to make them more productive and successful. We're looking for a Technical Recruiter to help us build the teams that build LinkedIn.</p>" }
  ];

  // ── CONVERSATIONS ──────────────────────────────────────────
  const conversations = [
    {
      id: 1,
      participant: users[1], // Sarah
      unreadCount: 2,
      lastMessage: "That sounds like a great approach! Let me know how the interview goes",
      lastTimestamp: new Date(Date.now() - 30*60000),
      isOnline: true,
      messages: [
        { id: 1, senderId: 3, text: "Hi Alex! Congrats on the System Design talk at GopherCon — really impressive presentation!", timestamp: new Date(Date.now() - 3*3600000), isRead: true },
        { id: 2, senderId: 1, text: "Thank you Sarah! That means a lot coming from you. Your work on distributed transactions at Stripe was a big inspiration.", timestamp: new Date(Date.now() - 2.5*3600000), isRead: true },
        { id: 3, senderId: 3, text: "We're actually looking for a Staff Engineer on my team. Your background is exactly what we need. Would you be open to a conversation?", timestamp: new Date(Date.now() - 2*3600000), isRead: true },
        { id: 4, senderId: 1, text: "I'd be very interested! Though I should mention I'm currently happy at Google, I'm always open to hearing about great opportunities.", timestamp: new Date(Date.now() - 90*60000), isRead: true },
        { id: 5, senderId: 3, text: "Totally understandable. I think once you hear about what we're building you'll be excited. Can we set up a 30-min call this week?", timestamp: new Date(Date.now() - 60*60000), isRead: true },
        { id: 6, senderId: 1, text: "Sure! I'm free Thursday afternoon or Friday morning.", timestamp: new Date(Date.now() - 45*60000), isRead: true },
        { id: 7, senderId: 3, text: "Thursday 3pm PT works. I'll send a calendar invite. In the meantime, here's a rough idea of what the role involves: leading our API infrastructure team (12 engineers), defining the technical roadmap for next-gen payment rails, and working closely with the CTO.", timestamp: new Date(Date.now() - 35*60000), isRead: false },
        { id: 8, senderId: 3, text: "That sounds like a great approach! Let me know how the interview goes", timestamp: new Date(Date.now() - 30*60000), isRead: false }
      ]
    },
    {
      id: 2,
      participant: users[0], // Priya
      unreadCount: 0,
      lastMessage: "Will do! Thanks for the feedback on the PRD 🙏",
      lastTimestamp: new Date(Date.now() - 2*3600000),
      isOnline: false,
      messages: [
        { id: 1, senderId: 2, text: "Hey Alex! Congrats on your latest article — it went viral 🚀", timestamp: new Date(Date.now() - 5*3600000), isRead: true },
        { id: 2, senderId: 1, text: "Haha thanks! I was surprised. People seem to really resonate with the scalability patterns.", timestamp: new Date(Date.now() - 4.5*3600000), isRead: true },
        { id: 3, senderId: 2, text: "Could I get your eyes on a PRD I'm writing? It's about improving our API developer experience and I think you'd have great input.", timestamp: new Date(Date.now() - 4*3600000), isRead: true },
        { id: 4, senderId: 1, text: "Of course! Send it over.", timestamp: new Date(Date.now() - 3.5*3600000), isRead: true },
        { id: 5, senderId: 2, text: "Will do! Thanks for the feedback on the PRD 🙏", timestamp: new Date(Date.now() - 2*3600000), isRead: true }
      ]
    },
    {
      id: 3,
      participant: users[16], // Kevin O'Brien (Recruiter)
      unreadCount: 1,
      lastMessage: "The package is $280K base + $150K RSU/year. Open to discussion!",
      lastTimestamp: new Date(Date.now() - 4*3600000),
      isOnline: true,
      messages: [
        { id: 1, senderId: 17, text: "Hi Alex! I'm a recruiter at LinkedIn and I came across your profile. We're hiring a Staff Engineer for our Feed Ranking team and you'd be a perfect fit.", timestamp: new Date(Date.now() - 6*3600000), isRead: true },
        { id: 2, senderId: 1, text: "Thanks Kevin! What's the role focused on?", timestamp: new Date(Date.now() - 5.5*3600000), isRead: true },
        { id: 3, senderId: 17, text: "Great question! The Feed Ranking team owns the algorithm that determines what 900M members see in their feed. You'd be working on ML-driven ranking, A/B experimentation at massive scale, and real-time personalization.", timestamp: new Date(Date.now() - 5*3600000), isRead: true },
        { id: 4, senderId: 17, text: "The package is $280K base + $150K RSU/year. Open to discussion!", timestamp: new Date(Date.now() - 4*3600000), isRead: false }
      ]
    },
    {
      id: 4,
      participant: users[6], // Marcus Williams
      unreadCount: 0,
      lastMessage: "I'll open a PR tomorrow. Excited to collaborate!",
      lastTimestamp: new Date(Date.now() - 1*24*3600000),
      isOnline: false,
      messages: [
        { id: 1, senderId: 7, text: "Alex! I'm working on a React RFC for a new concurrent rendering pattern and I'd love to co-author it with you given your work on the Google performance tools.", timestamp: new Date(Date.now() - 2*24*3600000), isRead: true },
        { id: 2, senderId: 1, text: "That sounds awesome! I've been thinking about similar patterns for large component trees. What's your current approach?", timestamp: new Date(Date.now() - 1.5*24*3600000), isRead: true },
        { id: 3, senderId: 7, text: "I'll open a PR tomorrow. Excited to collaborate!", timestamp: new Date(Date.now() - 1*24*3600000), isRead: true }
      ]
    },
    {
      id: 5,
      participant: users[17], // Ana Souza
      unreadCount: 3,
      lastMessage: "Would you want to do a podcast episode on this? I think the audience would love it",
      lastTimestamp: new Date(Date.now() - 45*60000),
      isOnline: true,
      messages: [
        { id: 1, senderId: 18, text: "Alex, your comment on my post about LLM evaluation was so well-articulated. Have you published anything on this topic?", timestamp: new Date(Date.now() - 3*3600000), isRead: true },
        { id: 2, senderId: 1, text: "Not yet but it's been on my mind. The gap between benchmark performance and real-world utility is something I encounter constantly building with LLMs.", timestamp: new Date(Date.now() - 2.5*3600000), isRead: true },
        { id: 3, senderId: 18, text: "Would you want to do a podcast episode on this? I think the audience would love it", timestamp: new Date(Date.now() - 45*60000), isRead: false }
      ]
    }
  ];

  // ── NOTIFICATIONS ─────────────────────────────────────────
  const notifications = [
    { id: 1, type: "reaction", actor: users[1], content: "Sarah Chen reacted to your post: \"I interviewed 200 engineers...\"", timestamp: "2m", isRead: false, reactionType: "insightful" },
    { id: 2, type: "comment", actor: users[5], content: "Marcus Williams commented on your post: \"This architecture pattern changed how I think about...\"", timestamp: "15m", isRead: false },
    { id: 3, type: "connect", actor: users[2], content: "David Kim accepted your connection request", timestamp: "1h", isRead: false },
    { id: 4, type: "mention", actor: users[3], content: "Michelle Rodriguez mentioned you in a post: \"@Alex Johnson's take on design systems is exactly right...\"", timestamp: "2h", isRead: false },
    { id: 5, type: "job", actor: null, content: "New job alert: 12 new Senior Software Engineer jobs matching your preferences", timestamp: "3h", isRead: false },
    { id: 6, type: "view", actor: null, content: "You appeared in 47 searches this week — up 23% from last week", timestamp: "5h", isRead: true },
    { id: 7, type: "reaction", actor: users[6], content: "Aisha Okafor and 234 others reacted to your article", timestamp: "6h", isRead: true },
    { id: 8, type: "anniversary", actor: null, content: "Congratulations on your 2-year work anniversary at Google! 🎉", timestamp: "8h", isRead: true },
    { id: 9, type: "connect", actor: users[12], content: "Sophie Martin wants to connect with you", timestamp: "1d", isRead: true, isPending: true },
    { id: 10, type: "connect", actor: users[17], content: "Jake Anderson wants to connect with you", timestamp: "1d", isRead: true, isPending: true },
    { id: 11, type: "birthday", actor: users[0], content: "Priya Patel has a birthday today 🎂", timestamp: "1d", isRead: true },
    { id: 12, type: "reaction", actor: users[8], content: "Lisa Zhang loved your comment on Tyler's post", timestamp: "2d", isRead: true },
    { id: 13, type: "comment", actor: users[14], content: "Nina Kowalski replied to your comment on Ana's AI post", timestamp: "2d", isRead: true },
    { id: 14, type: "job", actor: null, content: "Staff Software Engineer at Stripe — matches 88% of your skills. 300 applicants", timestamp: "2d", isRead: true },
    { id: 15, type: "view", actor: users[1], content: "Sarah Chen viewed your profile", timestamp: "3d", isRead: true }
  ];

  // ── EVENTS ────────────────────────────────────────────────
  const events = [
    { id: 1, title: "AI & Machine Learning Summit 2024", organizer: "TechCrunch", date: new Date(Date.now() + 7*24*3600000), time: "9:00 AM - 6:00 PM PST", location: "San Francisco, CA", isVirtual: false, attendees: 2341, interested: 4521, coverGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", description: "The premier AI conference bringing together researchers, engineers, and product leaders to explore the future of artificial intelligence.", isAttending: false, isInterested: true, type: "Conference" },
    { id: 2, title: "React Summit: Advanced Patterns Workshop", organizer: "React Community", date: new Date(Date.now() + 3*24*3600000), time: "2:00 PM - 4:00 PM EST", location: "Online", isVirtual: true, attendees: 892, interested: 1234, coverGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", description: "Deep dive into React 19's new patterns: use(), useOptimistic, and Server Actions. Hands-on workshop with live coding.", isAttending: true, isInterested: false, type: "Workshop" },
    { id: 3, title: "Startup Founders Meetup: SF", organizer: "YCombinator", date: new Date(Date.now() + 14*24*3600000), time: "6:30 PM - 9:00 PM PST", location: "San Francisco, CA", isVirtual: false, attendees: 156, interested: 342, coverGradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)", description: "Monthly meetup for YC founders and alumni. Share learnings, make connections, and hear a fireside chat from a successful founder.", isAttending: false, isInterested: false, type: "Networking" },
    { id: 4, title: "Women in Tech Leadership Forum", organizer: "Lean In", date: new Date(Date.now() + 21*24*3600000), time: "9:00 AM - 5:00 PM EST", location: "New York, NY", isVirtual: false, attendees: 823, interested: 1542, coverGradient: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)", description: "Annual forum for women in technology leadership. Features keynotes, workshops, and networking with leaders from Fortune 500 companies.", isAttending: false, isInterested: true, type: "Conference" },
    { id: 5, title: "Open Source Contributor Day", organizer: "GitHub", date: new Date(Date.now() + 5*24*3600000), time: "All day", location: "Online (GitHub)", isVirtual: true, attendees: 4231, interested: 8932, coverGradient: "linear-gradient(135deg, #2d3436 0%, #636e72 100%)", description: "Global day of open source contributions. GitHub will provide dedicated support, prizes for PRs merged, and help for first-time contributors.", isAttending: true, isInterested: false, type: "Online Event" },
    { id: 6, title: "Google I/O Extended: San Francisco", organizer: "Google Developer Groups", date: new Date(Date.now() + 45*24*3600000), time: "10:00 AM - 4:00 PM PST", location: "Google Developer Space, SF", isVirtual: false, attendees: 312, interested: 678, coverGradient: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)", description: "Community watch party and hands-on labs for Google I/O. Includes workshops on AI, Android, Web, and Cloud technologies.", isAttending: false, isInterested: false, type: "Tech Event" }
  ];

  // ── GROUPS ────────────────────────────────────────────────
  const groups = [
    { id: 1, name: "Software Architects Network", privacy: "Public", members: 234521, posts: 5431, description: "A community for software architects to discuss system design, best practices, and emerging technologies.", coverGradient: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)", isJoined: true, category: "Technology", unread: 12, logo: "🏗️" },
    { id: 2, name: "JavaScript & TypeScript Developers", privacy: "Public", members: 892341, posts: 23451, description: "The largest JavaScript and TypeScript community on LinkedIn. Share tips, ask questions, find jobs.", coverGradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)", isJoined: true, category: "Technology", unread: 5, logo: "🟨" },
    { id: 3, name: "YC Alumni Network", privacy: "Private", members: 12431, posts: 2341, description: "For Y Combinator founders and alumni to connect, share, and support each other.", coverGradient: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)", isJoined: false, category: "Entrepreneurship", unread: 0, logo: "🚀" },
    { id: 4, name: "MIT Alumni in Tech", privacy: "Private", members: 45231, posts: 3421, description: "Network for MIT alumni working in technology companies worldwide.", coverGradient: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)", isJoined: true, category: "Alumni", unread: 3, logo: "🦫" },
    { id: 5, name: "Machine Learning Practitioners", privacy: "Public", members: 567234, posts: 12341, description: "Practical ML, applied AI, and MLOps. Share your experiments and learn from others.", coverGradient: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)", isJoined: false, category: "Technology", unread: 0, logo: "🤖" },
    { id: 6, name: "Remote Work & Digital Nomads", privacy: "Public", members: 1231432, posts: 45231, description: "For professionals who work remotely or aspire to. Tips, tools, and community.", coverGradient: "linear-gradient(135deg, #023e8a 0%, #0096c7 100%)", isJoined: false, category: "Lifestyle", unread: 0, logo: "💻" },
    { id: 7, name: "Product Management Community", privacy: "Public", members: 456789, posts: 9823, description: "For product managers to connect, share best practices, and discuss the craft of product.", coverGradient: "linear-gradient(135deg, #7209b7 0%, #a855f7 100%)", isJoined: false, category: "Product", unread: 0, logo: "📱" }
  ];

  // ── COURSES ───────────────────────────────────────────────
  const courses = [
    { id: 1, title: "System Design Interview Prep", instructor: "Alex Xu", duration: "8h 30m", level: "Advanced", rating: 4.8, reviews: 12341, emoji: "🏗️", coverGradient: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)", skills: ["System Design", "Distributed Systems", "Architecture"], isInProgress: true, progress: 65, isCompleted: false, isSaved: false, category: "Engineering" },
    { id: 2, title: "React 19 & Next.js 14: The Complete Guide", instructor: "Maximilian Schwarzmüller", duration: "52h", level: "Intermediate", rating: 4.9, reviews: 45231, emoji: "⚛️", coverGradient: "linear-gradient(135deg, #61dafb 0%, #21b6d5 100%)", skills: ["React", "Next.js", "TypeScript"], isInProgress: true, progress: 23, isCompleted: false, isSaved: false, category: "Frontend" },
    { id: 3, title: "AWS Solutions Architect Professional", instructor: "Stephane Maarek", duration: "27h", level: "Advanced", rating: 4.8, reviews: 23451, emoji: "☁️", coverGradient: "linear-gradient(135deg, #f7971e 0%, #e68310 100%)", skills: ["AWS", "Cloud Architecture", "DevOps"], isInProgress: false, progress: 100, isCompleted: true, isSaved: false, category: "Cloud" },
    { id: 4, title: "Machine Learning A-Z", instructor: "Kirill Eremenko & Hadelin de Ponteves", duration: "44h", level: "Beginner", rating: 4.5, reviews: 89234, emoji: "🤖", coverGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", skills: ["Python", "Machine Learning", "Statistics"], isInProgress: false, progress: 100, isCompleted: true, isSaved: false, category: "AI/ML" },
    { id: 5, title: "Go Programming Language: The Complete Developer's Guide", instructor: "Stephen Grider", duration: "21h", level: "Intermediate", rating: 4.7, reviews: 8923, emoji: "🐹", coverGradient: "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)", skills: ["Go", "Microservices", "Concurrency"], isInProgress: false, progress: 0, isCompleted: false, isSaved: true, category: "Backend" },
    { id: 6, title: "Kubernetes for Developers", instructor: "Mumshad Mannambeth", duration: "18h", level: "Intermediate", rating: 4.8, reviews: 31234, emoji: "⚙️", coverGradient: "linear-gradient(135deg, #326CE5 0%, #1A5EC8 100%)", skills: ["Kubernetes", "Docker", "DevOps"], isInProgress: false, progress: 0, isCompleted: false, isSaved: true, category: "DevOps" },
    { id: 7, title: "TypeScript Deep Dive", instructor: "Basarat Ali Syed", duration: "14h", level: "Intermediate", rating: 4.6, reviews: 5621, emoji: "🔷", coverGradient: "linear-gradient(135deg, #3178c6 0%, #235a97 100%)", skills: ["TypeScript", "JavaScript", "Type Systems"], isInProgress: false, progress: 0, isCompleted: false, isSaved: false, category: "Frontend" },
    { id: 8, title: "Product Management 101: Zero to PM", instructor: "Cole Mercer", duration: "6h", level: "Beginner", rating: 4.4, reviews: 12341, emoji: "📋", coverGradient: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)", skills: ["Product Management", "User Research", "Roadmapping"], isInProgress: false, progress: 0, isCompleted: false, isSaved: false, category: "Product" }
  ];

  // ── NEWS ──────────────────────────────────────────────────
  const news = [
    { id: 1, headline: "OpenAI's GPT-5 reportedly achieves PhD-level reasoning", readers: "34,291 readers", timeAgo: "2h ago", category: "Technology" },
    { id: 2, headline: "Federal Reserve signals potential rate cuts in 2024 Q3", readers: "89,421 readers", timeAgo: "4h ago", category: "Finance" },
    { id: 3, headline: "Apple Vision Pro sales exceed analyst expectations in first quarter", readers: "45,123 readers", timeAgo: "5h ago", category: "Technology" },
    { id: 4, headline: "Remote work policies: Companies split on return-to-office mandates", readers: "123,432 readers", timeAgo: "7h ago", category: "Work Trends" },
    { id: 5, headline: "Google's DeepMind AlphaFold 3 predicts drug interactions", readers: "28,912 readers", timeAgo: "9h ago", category: "Science" },
    { id: 6, headline: "LinkedIn adds AI-powered career coaching to premium plans", readers: "67,234 readers", timeAgo: "11h ago", category: "Technology" },
    { id: 7, headline: "Tech layoffs slow as companies stabilize headcount for 2024", readers: "91,234 readers", timeAgo: "1d ago", category: "Work Trends" }
  ];

  // ── PENDING INVITATIONS ────────────────────────────────────
  const invitations = [
    { id: 1, user: users[13], note: "Hi Alex! I'm a big fan of your work on distributed systems. Would love to connect and learn from you.", mutualCount: 7 },
    { id: 2, user: users[18], note: "", mutualCount: 3 },
    { id: 3, user: { id: 22, name: "Tom Harrison", headline: "Engineering Director at Dropbox", avatarColor: '#16A085' }, note: "We met at the GopherCon afterparty! Would love to stay in touch.", mutualCount: 15 }
  ];

  // ── HASHTAG SUGGESTIONS ───────────────────────────────────
  const hashtags = [
    { name: "SoftwareEngineering", followers: 2341231 },
    { name: "MachineLearning", followers: 1892341 },
    { name: "JavaScript", followers: 3421234 },
    { name: "ProductManagement", followers: 892341 },
    { name: "Startup", followers: 4231234 },
    { name: "CareerAdvice", followers: 2891234 },
    { name: "OpenSource", followers: 1231234 },
    { name: "AI", followers: 5432123 },
    { name: "WebDev", followers: 2341234 },
    { name: "Leadership", followers: 3892341 }
  ];

  return {
    currentUser,
    users,
    companies,
    posts,
    jobs,
    conversations,
    notifications,
    events,
    groups,
    courses,
    news,
    invitations,
    hashtags,
    // Helpers
    getUserById: (id) => id === 1 ? currentUser : users.find(u => u.id === id),
    getCompanyById: (id) => companies.find(c => c.id === id),
    getJobById: (id) => jobs.find(j => j.id === id),
    getGroupById: (id) => groups.find(g => g.id === id),
    getConversationById: (id) => conversations.find(c => c.id === parseInt(id)),
    getInitials: (name) => initials(name),
    getAvatarColor: (name) => getColor(name)
  };
})();
