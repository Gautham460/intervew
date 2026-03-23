/**
 * Seed Data for Company-Specific Interview Questions
 * Contains 10 questions per category across 8 categories
 * Total: 80 questions for popular tech companies
 */

import { db } from "@/config/firebase.config";
import { collection, addDoc, getDocs } from "firebase/firestore";
import type { CompanyQuestion } from "./company-questions";

export const COMPANY_QUESTIONS_SEED_DATA: CompanyQuestion[] = [
  // ============= BEHAVIORAL QUESTIONS (10) =============
  {
    company: "Google",
    role: "Software Engineer",
    question: "Tell me about a time when you had to work with a difficult team member.",
    category: "Behavioral", 
    difficulty: "medium",
    tips: [
      "Use STAR method (Situation, Task, Action, Result)",
      "Show empathy and listening skills",
      "Demonstrate conflict resolution abilities",
      "Focus on the positive outcome",
    ],
    exampleAnswer:
      "In my previous role, I worked with a developer who was resistant to code reviews. I scheduled a 1-on-1 to understand their concerns, acknowledged their perspective, and suggested a collaborative approach. We established a peer review process that improved code quality and strengthened our working relationship.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Meta",
    role: "Senior Engineer",
    question: "Describe a situation where you had to influence someone without authority.",
    category: "Behavioral",
    difficulty: "medium",
    tips: [
      "Highlight persuasion and communication skills",
      "Show understanding of different perspectives",
      "Demonstrate persistence and diplomacy",
      "Explain the positive outcome achieved",
    ],
    exampleAnswer:
      "I proposed a new testing framework to the team. Since I wasn't the tech lead, I created documentation, ran a demo, and addressed concerns. Within two weeks, the team adopted it, reducing bug detection time by 40%.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Apple",
    role: "Product Engineer",
    question: "Tell me about a project where you failed. How did you handle it?",
    category: "Behavioral",
    difficulty: "hard",
    tips: [
      "Be honest about the failure",
      "Show accountability and learning",
      "Explain what you'd do differently",
      "Highlight growth from the experience",
    ],
    exampleAnswer:
      "I led a project that missed the deadline by two weeks. I failed to account for integration complexities. I took ownership, worked extra hours to resolve issues, and implemented better estimation practices. The next project succeeded on time.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Microsoft",
    role: "Cloud Developer",
    question: "Give an example of when you had to learn something new quickly.",
    category: "Behavioral",
    difficulty: "easy",
    tips: [
      "Show initiative and passion for learning",
      "Explain your learning process",
      "Demonstrate how you applied the knowledge",
      "Mention the impact of your learning",
    ],
    exampleAnswer:
      "When assigned a Kubernetes project, I had never used it before. I took online courses, built a test environment, and practiced for a week. I successfully deployed our microservices on Kubernetes, improving deployment speed by 50%.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Amazon",
    role: "Senior SDE",
    question: "Describe a time you had to make a decision with incomplete information.",
    category: "Behavioral",
    difficulty: "hard",
    tips: [
      "Show decision-making framework",
      "Explain reasoning and assumptions",
      "Discuss risk management",
      "Highlight successful outcome or learning",
    ],
    exampleAnswer:
      "We needed to migrate to a new database system with limited data on performance impact. I gathered available metrics, consulted experts, and proposed a phased approach with rollback plans. The migration succeeded with minimal downtime.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Netflix",
    role: "Backend Engineer",
    question: "Tell me about your proudest technical achievement.",
    category: "Behavioral",
    difficulty: "easy",
    tips: [
      "Choose a significant and measurable achievement",
      "Explain your specific contribution",
      "Quantify the impact if possible",
      "Show technical depth and business value",
    ],
    exampleAnswer:
      "I designed a caching layer that reduced API response time from 500ms to 50ms and decreased server load by 60%. The solution handled 10 million requests daily and improved user experience across all regions.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Tesla",
    role: "Full Stack Engineer",
    question: "Describe a time when priorities shifted and you had to adapt.",
    category: "Behavioral",
    difficulty: "medium",
    tips: [
      "Show flexibility and adaptability",
      "Explain your response to change",
      "Demonstrate communication",
      "Highlight successful outcome",
    ],
    exampleAnswer:
      "Our sprint priorities changed when a critical production bug emerged. I quickly shifted focus, debugged the issue, and deployed a fix within 4 hours while ensuring my previous tasks could still be completed.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Stripe",
    role: "Software Engineer",
    question: "Tell me about a time you improved something that wasn't working.",
    category: "Behavioral",
    difficulty: "medium",
    tips: [
      "Show problem-solving initiative",
      "Explain identification and analysis",
      "Demonstrate implementation skills",
      "Quantify improvements made",
    ],
    exampleAnswer:
      "I noticed our onboarding process had a 40% drop-off rate. I analyzed user journey, simplified the signup flow, and reduced required fields by 30%. This increased conversion by 25%.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Airbnb",
    role: "Senior Product Engineer",
    question: "Describe a time when you had to deliver feedback to someone senior.",
    category: "Behavioral",
    difficulty: "hard",
    tips: [
      "Show courage and professionalism",
      "Explain tactful communication",
      "Demonstrate respect for hierarchy",
      "Highlight positive outcome",
    ],
    exampleAnswer:
      "I respectfully suggested to my director that our proposed approach had scalability issues. I provided data, alternatives, and spoke privately first. She appreciated the input, and we adopted a better solution together.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "LinkedIn",
    role: "Engineer",
    question: "Tell me about a time you collaborated across teams.",
    category: "Behavioral",
    difficulty: "medium",
    tips: [
      "Show teamwork and communication",
      "Explain different perspectives",
      "Demonstrate compromise and collaboration",
      "Highlight joint success",
    ],
    exampleAnswer:
      "I worked with the design team on a new feature. We had different opinions on implementation. I organized discussions, understood their constraints, and proposed a solution that satisfied both technical and design requirements.",
    frequency: 0,
    addedBy: "admin",
  },

  // ============= TECHNICAL QUESTIONS (10) =============
  {
    company: "Google",
    role: "Software Engineer",
    question: "Explain how you would implement a rate limiter.",
    category: "Technical",
    difficulty: "medium",
    tips: [
      "Discuss different strategies (token bucket, sliding window)",
      "Consider edge cases",
      "Explain time/space complexity",
      "Mention distributed scenarios",
    ],
    exampleAnswer:
      "A token bucket approach works well. Tokens are added at a fixed rate, requests consume tokens. When empty, requests are denied. For distributed systems, use Redis to maintain global state. Time complexity: O(1), Space: O(1) per user.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Meta",
    role: "Backend Engineer",
    question: "How would you design a URL shortening service like bit.ly?",
    category: "Technical",
    difficulty: "hard",
    tips: [
      "Discuss database design",
      "Consider scalability and performance",
      "Explain hashing/encoding strategy",
      "Address edge cases and analytics",
    ],
    exampleAnswer:
      "Use a hash table (NoSQL like MongoDB) with short_code as key. Generate short codes using base62 encoding of auto-increment IDs. Cache popular shortened URLs. Replicate for fault tolerance. Support 100K requests/sec.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Apple",
    role: "iOS Developer",
    question: "Explain how memory management works in Swift.",
    category: "Technical",
    difficulty: "medium",
    tips: [
      "Discuss ARC (Automatic Reference Counting)",
      "Explain strong vs weak references",
      "Mention retain cycles and solutions",
      "Discuss weak and unowned keywords",
    ],
    exampleAnswer:
      "Swift uses ARC to manage memory. Each reference increments a retain count. When count reaches 0, memory is deallocated. Weak references don't increment count, breaking retain cycles. Use weak for delegates and parent references.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Microsoft",
    role: "Cloud Solutions Architect",
    question: "How would you migrate a monolithic application to microservices?",
    category: "Technical",
    difficulty: "hard",
    tips: [
      "Discuss decomposition strategy",
      "Address communication between services",
      "Consider data consistency",
      "Mention monitoring and deployment challenges",
    ],
    exampleAnswer:
      "Start by identifying bounded contexts using domain-driven design. Extract services incrementally. Use APIs for communication, event-driven for async. Maintain data consistency with sagas. Use containers and orchestration for deployment.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Amazon",
    role: "SDE",
    question: "Explain database indexing and when to use it.",
    category: "Technical",
    difficulty: "medium",
    tips: [
      "Discuss B-tree and hash indexes",
      "Explain time/space tradeoffs",
      "Address composite indexes",
      "Mention index maintenance costs",
    ],
    exampleAnswer:
      "Indexes create lookup structures, reducing query time from O(n) to O(log n). Use them on frequently searched columns. Hash indexes for equality, B-tree for range queries. Tradeoff: slower writes. Monitor index usage.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Netflix",
    role: "Streaming Systems Engineer",
    question: "How would you implement a video streaming service?",
    category: "Technical",
    difficulty: "hard",
    tips: [
      "Discuss CDN and edge computing",
      "Explain adaptive bitrate streaming",
      "Address buffering and latency",
      "Mention DRM and licensing",
    ],
    exampleAnswer:
      "Use CDNs to distribute content geographically. Implement adaptive bitrate (DASH/HLS) based on bandwidth. Cache content at edges. Use DRM for licensing. Monitor quality metrics and adjust bitrate dynamically.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Tesla",
    role: "Embedded Systems Engineer",
    question: "How would you optimize code for resource-constrained environments?",
    category: "Technical",
    difficulty: "medium",
    tips: [
      "Discuss memory profiling",
      "Explain algorithm optimization",
      "Address compiler optimizations",
      "Mention hardware-specific techniques",
    ],
    exampleAnswer:
      "Use efficient data structures (arrays vs linked lists). Minimize allocations. Use bitwise operations. Leverage compiler optimizations. Profile memory and CPU usage. Consider hardware acceleration. Avoid recursion for stack constraints.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Stripe",
    role: "Payment Systems Engineer",
    question: "How would you handle payment processing securely?",
    category: "Technical",
    difficulty: "hard",
    tips: [
      "Discuss PCI-DSS compliance",
      "Explain tokenization and encryption",
      "Address fraud detection",
      "Mention audit logging",
    ],
    exampleAnswer:
      "Never store raw card data. Use tokenization and PCI-compliant gateways. Encrypt data in transit (TLS). Implement fraud detection with machine learning. Log all transactions for audit. Use HSM for key management.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Airbnb",
    role: "Data Engineer",
    question: "How would you design a data pipeline for real-time analytics?",
    category: "Technical",
    difficulty: "hard",
    tips: [
      "Discuss stream processing frameworks",
      "Explain event sourcing",
      "Address latency vs accuracy",
      "Mention fault tolerance",
    ],
    exampleAnswer:
      "Use Kafka for event streaming, Spark/Flink for processing. Implement Lambda architecture for accuracy. Use columnar databases for analytics. Ensure idempotent processing for fault tolerance. Monitor end-to-end latency.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "LinkedIn",
    role: "Systems Engineer",
    question: "Explain how you would design a distributed cache.",
    category: "Technical",
    difficulty: "hard",
    tips: [
      "Discuss consistent hashing",
      "Explain eviction policies",
      "Address cache invalidation",
      "Mention replication and failover",
    ],
    exampleAnswer:
      "Use consistent hashing for even key distribution. Implement LRU eviction. Use write-through or write-back strategies. Replicate data across nodes. Use Redis Cluster for automatic failover and sharding.",
    frequency: 0,
    addedBy: "admin",
  },

  // ============= SYSTEM DESIGN QUESTIONS (10) =============
  {
    company: "Google",
    role: "Senior Software Engineer",
    question: "Design a real-time collaborative document editor like Google Docs.",
    category: "System Design",
    difficulty: "hard",
    tips: [
      "Discuss operational transformation or CRDT",
      "Address conflict resolution",
      "Explain WebSocket communication",
      "Consider version control and offline support",
    ],
    exampleAnswer:
      "Use CRDT (Conflict-free Replicated Data Type) for concurrent edits. WebSockets for real-time sync. Store operations on server, replay for newcomers. Implement undo/redo with operation history. Cache frequently edited docs.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Meta",
    role: "Backend Engineer",
    question: "Design a large-scale recommendation engine for social networks.",
    category: "System Design",
    difficulty: "hard",
    tips: [
      "Discuss collaborative filtering",
      "Explain ranking algorithms",
      "Address latency and scalability",
      "Mention feedback loops",
    ],
    exampleAnswer:
      "Use collaborative filtering with matrix factorization. Train models on offline data, serve via low-latency services. Implement ranking pipeline considering engagement metrics. Use A/B testing. Update models periodically.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Apple",
    role: "Platform Engineer",
    question: "Design a system for handling app store payments across 50+ currencies.",
    category: "System Design",
    difficulty: "hard",
    tips: [
      "Discuss exchange rate management",
      "Address fraud prevention",
      "Explain regional compliance",
      "Mention transaction reconciliation",
    ],
    exampleAnswer:
      "Cache exchange rates with hourly updates. Fraud detect with ML models. Ensure PCI compliance per region. Store transactions in distributed DB. Implement reconciliation jobs. Handle chargebacks with dispute resolution.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Microsoft",
    role: "Cloud Architect",
    question: "Design a system for Azure resource provisioning and management.",
    category: "System Design",
    difficulty: "hard",
    tips: [
      "Discuss IaC (Infrastructure as Code)",
      "Explain auto-scaling",
      "Address multi-tenancy",
      "Mention monitoring and cost optimization",
    ],
    exampleAnswer:
      "Implement IaC with Terraform/ARM templates. Auto-scale based on metrics. Use resource groups for organization. Implement RBAC for access control. Monitor with Azure Monitor. Tag resources for cost tracking.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Amazon",
    role: "Principal Architect",
    question: "Design AWS infrastructure for a high-traffic e-commerce platform.",
    category: "System Design",
    difficulty: "hard",
    tips: [
      "Discuss multi-region deployment",
      "Address database scaling",
      "Explain caching strategy",
      "Mention disaster recovery",
    ],
    exampleAnswer:
      "Multi-region with Route53 failover. RDS with read replicas, Elasticache for caching. ALB for load balancing. S3 + CloudFront for static content. DynamoDB for real-time data. Cross-region replication for DR.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Netflix",
    role: "Systems Engineer",
    question: "Design a system for content encoding and optimization at scale.",
    category: "System Design",
    difficulty: "hard",
    tips: [
      "Discuss encoding formats",
      "Address parallelization",
      "Explain quality optimization",
      "Mention cost optimization",
    ],
    exampleAnswer:
      "Distributed encoding workers using Kubernetes. Generate multiple quality levels (480p to 4K). Cache encoded versions. Use ML for quality prediction. Prioritize based on device capabilities. Monitor encoding time and costs.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Tesla",
    role: "Backend Engineer",
    question: "Design a system for real-time vehicle telemetry and diagnostics.",
    category: "System Design",
    difficulty: "hard",
    tips: [
      "Discuss data ingestion at scale",
      "Address latency requirements",
      "Explain anomaly detection",
      "Mention security and privacy",
    ],
    exampleAnswer:
      "Use message queues (Kafka) for telemetry ingestion. Stream processing for real-time anomaly detection. Time-series DB for storage. MQTT for vehicular communication. Encrypt and secure sensitive data. Real-time dashboards for monitoring.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Stripe",
    role: "Core Platform Engineer",
    question: "Design a ledger system for financial transactions.",
    category: "System Design",
    difficulty: "hard",
    tips: [
      "Discuss ACID compliance",
      "Address double-entry accounting",
      "Explain audit trails",
      "Mention dispute resolution",
    ],
    exampleAnswer:
      "Implement double-entry ledger system. Use distributed transactions for atomicity. Store in immutable log. Version all records. Implement audit trails. Support multi-currency with settlement. Handle disputes with reversals.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Airbnb",
    role: "Data Systems Engineer",
    question: "Design a system for managing inventory and availability across millions of listings.",
    category: "System Design",
    difficulty: "hard",
    tips: [
      "Discuss real-time updates",
      "Address consistency",
      "Explain caching strategy",
      "Mention search indexing",
    ],
    exampleAnswer:
      "Event-driven updates with Kafka. Use eventual consistency model. Cache availability in Redis. Elasticsearch for search. Implement overbooking protection. Real-time search index updates. Batch processing for analytics.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "LinkedIn",
    role: "Staff Engineer",
    question: "Design a system for user feed generation at scale.",
    category: "System Design",
    difficulty: "hard",
    tips: [
      "Discuss ranking algorithms",
      "Address latency targets",
      "Explain caching strategy",
      "Mention personalization",
    ],
    exampleAnswer:
      "Fanout feed generation with Redis. Rank content using ML models. Cache personalized feeds. Update via async jobs. Support 500ms latency target. Implement carousel for multi-media. Handle billions of feed request/day.",
    frequency: 0,
    addedBy: "admin",
  },

  // ============= DATA STRUCTURES QUESTIONS (10) =============
  {
    company: "Google",
    role: "Software Engineer",
    question: "Implement a LRU (Least Recently Used) cache.",
    category: "Data Structures",
    difficulty: "medium",
    tips: [
      "Use HashMap + Doubly Linked List",
      "Maintain insertion/access order",
      "Achieve O(1) for get/put operations",
      "Handle capacity and eviction",
    ],
    exampleAnswer:
      "Use HashMap for O(1) lookup and DLL for order tracking. On access, move node to head. On put with full capacity, remove tail. Both get and put run in O(1) with O(capacity) space.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Meta",
    role: "Software Engineer",
    question: "Design and implement a Trie data structure for autocomplete.",
    category: "Data Structures",
    difficulty: "medium",
    tips: [
      "Structure for prefix matching",
      "Store word frequency",
      "Implement DFS for suggestions",
      "Optimize with pruning",
    ],
    exampleAnswer:
      "TreeNode contains children map and frequency. Insert words by traversing/creating nodes. Search via DFS collecting nodes by frequency. Return top K results. Space: O(total chars), Time: O(word length) insert/search.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Apple",
    role: "Software Engineer",
    question: "Implement a Binary Search Tree with insert, delete, and search.",
    category: "Data Structures",
    difficulty: "medium",
    tips: [
      "Handle left/right subtree properties",
      "Manage node deletion cases",
      "Maintain balance for performance",
      "Consider duplicate handling",
    ],
    exampleAnswer:
      "Insert: traverse left/right based on comparison. Delete: handle 3 cases (leaf, 1 child, 2 children). Search: O(log n) avg, O(n) worst. For balance, use AVL or Red-Black trees to maintain height property.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Microsoft",
    role: "Software Engineer",
    question: "Implement a Min Heap and support heapify operations.",
    category: "Data Structures",
    difficulty: "medium",
    tips: [
      "Use array-based representation",
      "Maintain heap property",
      "Implement bubble up and bubble down",
      "Support dynamic sizing",
    ],
    exampleAnswer:
      "Use array where parent is at i, children at 2i+1 and 2i+2. Insert at end, bubble up. Delete root, move end to root, bubble down. Both O(log n). Heapify: O(n) bottom-up approach.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Amazon",
    role: "Software Engineer",
    question: "Implement a Union-Find (Disjoint Set Union) data structure.",
    category: "Data Structures",
    difficulty: "medium",
    tips: [
      "Support union and find operations",
      "Implement path compression",
      "Use union by rank",
      "Achieve almost O(1) amortized",
    ],
    exampleAnswer:
      "Each element points to parent. Find: traverse to root with path compression. Union: connect roots by rank. With optimizations, operations run in O(α(n)) ~ O(1). Useful for cycle detection and connected components.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Netflix",
    role: "Software Engineer",
    question: "Design a thread-safe queue data structure.",
    category: "Data Structures",
    difficulty: "medium",
    tips: [
      "Handle concurrent access",
      "Prevent race conditions",
      "Use locks or atomic operations",
      "Support blocking operations",
    ],
    exampleAnswer:
      "Use LinkedList with ReentrantLock for synchronization. Maintain front/rear pointers. Implement enqueue (add to rear) and dequeue (remove from front). Blocking: wait/notify for empty queue. O(1) operations.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Tesla",
    role: "Software Engineer",
    question: "Implement a circular buffer with fixed size.",
    category: "Data Structures",
    difficulty: "easy",
    tips: [
      "Use modulo arithmetic",
      "Handle wraparound",
      "Track capacity and size",
      "Support efficient memory usage",
    ],
    exampleAnswer:
      "Use array with head/tail pointers. Size = (tail - head) % capacity. Add: buffer[tail] = value, tail = (tail+1)%cap. Remove: head = (head+1)%cap. Useful for bounded queues and ring buffers.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Stripe",
    role: "Software Engineer",
    question: "Implement a Segment Tree for range query operations.",
    category: "Data Structures",
    difficulty: "hard",
    tips: [
      "Build tree structure for ranges",
      "Support efficient range queries",
      "Implement lazy propagation for updates",
      "Handle point updates",
    ],
    exampleAnswer:
      "Build tree where each node represents range sum. Query: combine left/right subtree sums. Update: modify leaf, propagate up. Lazy propagation defers updates. Time: O(log n) both, Space: O(n).",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Airbnb",
    role: "Software Engineer",
    question: "Implement a Graph with adjacency list and BFS/DFS traversal.",
    category: "Data Structures",
    difficulty: "medium",
    tips: [
      "Support directed/undirected graphs",
      "Implement BFS and DFS",
      "Track visited nodes",
      "Handle disconnected components",
    ],
    exampleAnswer:
      "Use HashMap of node to List of neighbors. BFS: queue for level-order. DFS: recursion or stack. Both O(V+E). Support weighted graphs by storing edge objects. Useful for connectivity and shortest path problems.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "LinkedIn",
    role: "Software Engineer",
    question: "Implement a Hash Table from scratch with collision handling.",
    category: "Data Structures",
    difficulty: "medium",
    tips: [
      "Handle collisions with chaining or open addressing",
      "Implement dynamic resizing",
      "Maintain good load factor",
      "Achieve O(1) average case",
    ],
    exampleAnswer:
      "Array of buckets with linked lists for chaining. Hash function distributes keys. Resize when load factor > 0.7. Rehash all entries. Supports get/put/delete in O(1) average time.",
    frequency: 0,
    addedBy: "admin",
  },

  // ============= ALGORITHMS QUESTIONS (10) =============
  {
    company: "Google",
    role: "Software Engineer",
    question: "Implement binary search and explain when to use it.",
    category: "Algorithms",
    difficulty: "easy",
    tips: [
      "Requires sorted array",
      "Divide and conquer approach",
      "Time complexity O(log n)",
      "Handle edge cases carefully",
    ],
    exampleAnswer:
      "Divide array in half, compare target with mid. Go left if smaller, right if larger. Repeat until found or not found. O(log n) time, O(1) space. Use when data is sorted and searching frequently.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Meta",
    role: "Software Engineer",
    question: "Implement quicksort and explain its complexity.",
    category: "Algorithms",
    difficulty: "medium",
    tips: [
      "Choose pivot carefully",
      "Partition array",
      "Recursive sorting",
      "Discuss best/worst cases",
    ],
    exampleAnswer:
      "Pick pivot, partition into smaller and larger. Recursively sort partitions. Average case O(n log n), worst case O(n²). Space O(log n) for recursion. In-place sorting. Choose random pivot to avoid worst case.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Apple",
    role: "Software Engineer",
    question: "Solve the longest common subsequence (LCS) problem.",
    category: "Algorithms",
    difficulty: "medium",
    tips: [
      "Use dynamic programming",
      "Build 2D matrix",
      "Track matching characters",
      "Reconstruct solution",
    ],
    exampleAnswer:
      "DP table where dp[i][j] = LCS of first i and j characters. If match, dp[i][j] = dp[i-1][j-1] + 1. Else, dp[i][j] = max(dp[i-1][j], dp[i][j-1]). Time: O(m*n), Space: O(m*n).",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Microsoft",
    role: "Software Engineer",
    question: "Implement Dijkstra's algorithm for shortest path.",
    category: "Algorithms",
    difficulty: "hard",
    tips: [
      "Handles weighted graphs",
      "Greedy approach",
      "Use priority queue",
      "Handle negative weights discussion",
    ],
    exampleAnswer:
      "Initialize distances to infinity except source (0). Use min-heap. Extract min, update neighbors. Time: O((V+E) log V) with heap. Space: O(V). Can't handle negative weights. Use Bellman-Ford for negatives.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Amazon",
    role: "Software Engineer",
    question: "Solve the coin change problem using dynamic programming.",
    category: "Algorithms",
    difficulty: "medium",
    tips: [
      "Minimize number of coins",
      "Build DP array",
      "Iterate through coins",
      "Reconstruct solution",
    ],
    exampleAnswer:
      "DP array where dp[i] = min coins for amount i. For each coin, update dp[amount] = min(dp[amount], dp[amount-coin] + 1). Time: O(amount * coins), Space: O(amount).",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Netflix",
    role: "Software Engineer",
    question: "Implement merge sort and analyze its properties.",
    category: "Algorithms",
    difficulty: "medium",
    tips: [
      "Divide and conquer",
      "Stable sort",
      "Guaranteed O(n log n)",
      "External sorting capability",
    ],
    exampleAnswer:
      "Divide array in half, recursively sort, merge sorted halves. Time: O(n log n) always. Space: O(n). Stable because maintains relative order. Good for linked lists and external sorting.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Tesla",
    role: "Software Engineer",
    question: "Solve the N-Queens problem using backtracking.",
    category: "Algorithms",
    difficulty: "hard",
    tips: [
      "Place queens in safe positions",
      "Use backtracking",
      "Track columns and diagonals",
      "All N solutions",
    ],
    exampleAnswer:
      "Use backtracking to place queens row by row. Track occupied columns and diagonals using sets. If valid position, place and recurse. If row == N, found solution. Backtrack if dead end. O(N!) time.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Stripe",
    role: "Software Engineer",
    question: "Implement topological sort for DAG.",
    category: "Algorithms",
    difficulty: "medium",
    tips: [
      "Works for DAGs only",
      "DFS or Kahn's algorithm",
      "Process nodes by dependencies",
      "Useful for task scheduling",
    ],
    exampleAnswer:
      "DFS approach: visit nodes, track visited, add to stack after exploring neighbors. Reverse stack for order. Kahn's approach: use in-degree, process nodes with in-degree 0. Both O(V+E).",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Airbnb",
    role: "Software Engineer",
    question: "Implement Floyd-Warshall algorithm for all-pairs shortest path.",
    category: "Algorithms",
    difficulty: "hard",
    tips: [
      "Handles negative weights",
      "All pairs shortest path",
      "DP approach",
      "O(V³) complexity",
    ],
    exampleAnswer:
      "Initialize distances from direct edges. For each intermediate vertex k, update all pairs via k. dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j]). Time: O(V³), Space: O(V²).",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "LinkedIn",
    role: "Software Engineer",
    question: "Solve the knapsack problem using dynamic programming.",
    category: "Algorithms",
    difficulty: "medium",
    tips: [
      "Maximize value with weight limit",
      "DP table approach",
      "Item selection tracking",
      "0/1 vs unbounded variants",
    ],
    exampleAnswer:
      "DP table dp[i][w] = max value with first i items and weight w. If item i fits, dp[i][w] = max(dp[i-1][w], value[i] + dp[i-1][w-weight[i]]). Time: O(n*W), Space: O(n*W).",
    frequency: 0,
    addedBy: "admin",
  },

  // ============= PROBLEM SOLVING QUESTIONS (10) =============
  {
    company: "Google",
    role: "Software Engineer",
    question: "How would you approach debugging a production outage?",
    category: "Problem Solving",
    difficulty: "medium",
    tips: [
      "Structured approach to debugging",
      "Minimize impact first",
      "Reproduce issue",
      "Root cause analysis",
    ],
    exampleAnswer:
      "Immediately reduce blast radius (rollback, failover). Reproduce the issue isolated. Check logs, metrics, recent changes. Form hypothesis, test systematically. Fix root cause, not symptom. Document incident. Implement monitoring to prevent recurrence.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Meta",
    role: "Software Engineer",
    question: "How would you identify performance bottlenecks in an application?",
    category: "Problem Solving",
    difficulty: "medium",
    tips: [
      "Profiling tools",
      "Identify hotspots",
      "Database query analysis",
      "Benchmark before/after",
    ],
    exampleAnswer:
      "Use profilers (APM tools, flame graphs). Identify functions consuming CPU/memory. Analyze database queries with EXPLAIN. Check network latency. Profile under production-like load. Optimize hottest paths first. Measure impact of changes.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Apple",
    role: "Software Engineer",
    question: "How would you handle a situation where code review feedback contradicts your approach?",
    category: "Problem Solving",
    difficulty: "medium",
    tips: [
      "Listen actively",
      "Ask clarifying questions",
      "Evaluate both approaches objectively",
      "Consider trade-offs",
      "Make data-driven decision",
    ],
    exampleAnswer:
      "I'd ask why they prefer their approach. Understand their perspective fully. Compare approaches objectively on metrics (readability, performance, maintainability). If they have good reasons, adopt it. If mine is better, explain with data.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Microsoft",
    role: "Software Engineer",
    question: "How would you design a solution if you have multiple viable approaches?",
    category: "Problem Solving",
    difficulty: "medium",
    tips: [
      "List trade-offs",
      "Consider requirements",
      "Evaluate complexity",
      "Think about scalability",
      "Future maintenance",
    ],
    exampleAnswer:
      "List all viable approaches with pros/cons. Evaluate against functional and non-functional requirements. Consider team expertise, tooling, maintenance burden. Prototype risky parts. Choose approach with best overall balance. Document decision rationale.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Amazon",
    role: "Software Engineer",
    question: "How would you approach estimating complexity of a new feature?",
    category: "Problem Solving",
    difficulty: "medium",
    tips: [
      "Break down into tasks",
      "Research unknowns",
      "Consider integration",
      "Add buffer for unknowns",
      "Regular updates",
    ],
    exampleAnswer:
      "Break feature into cohesive tasks. Estimate each task independently. Spike on technical unknowns. Add 30% buffer for unknowns. Consider integration and testing. Review estimates with team. Revisit as information improves.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Netflix",
    role: "Software Engineer",
    question: "How would you approach learning a new technology quickly?",
    category: "Problem Solving",
    difficulty: "easy",
    tips: [
      "Read official docs",
      "Build small projects",
      "Learn by doing",
      "Study existing code",
      "Connect with experts",
    ],
    exampleAnswer:
      "Start with official documentation and tutorials. Build a small POC. Study how it's used in existing projects. Read source code if needed. Join community forums. Build progressively complex projects. Teach others to deepen understanding.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Tesla",
    role: "Software Engineer",
    question: "How would you handle a breaking change in a critical dependency?",
    category: "Problem Solving",
    difficulty: "medium",
    tips: [
      "Assess impact",
      "Version pinning",
      "Gradual migration",
      "Parallel implementation",
      "Testing strategy",
    ],
    exampleAnswer:
      "Assess affected code areas. Pin to stable version. Plan migration in phases. Implement new pattern in new code. Gradually refactor old code. Extensive testing with regression suite. Communicate timeline to stakeholders. Have rollback plan.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Stripe",
    role: "Software Engineer",
    question: "How would you approach designing an API that's easy to use and integrate with?",
    category: "Problem Solving",
    difficulty: "medium",
    tips: [
      "Define clear contracts",
      "Consistent naming",
      "Error handling",
      "Documentation",
      "Versioning strategy",
    ],
    exampleAnswer:
      "Design clear, predictable REST endpoints. Use consistent naming and structure. Comprehensive error responses with details. Excellent documentation with examples. Version for backward compatibility. Provide SDKs in popular languages. Gather user feedback.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Airbnb",
    role: "Software Engineer",
    question: "How would you approach mentoring a junior developer?",
    category: "Problem Solving",
    difficulty: "easy",
    tips: [
      "Set clear expectations",
      "Daily check-ins",
      "Code review feedback",
      "Pair programming",
      "Encourage questions",
    ],
    exampleAnswer:
      "Start with small, well-scoped tasks. Regular check-ins to unblock. Pair programming on complex features. Constructive code review feedback. Encourage questions, no stupid questions. Share domain knowledge. Identify and support growth areas. Lead by example.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "LinkedIn",
    role: "Software Engineer",
    question: "How would you approach making a critical decision with incomplete information?",
    category: "Problem Solving",
    difficulty: "hard",
    tips: [
      "Gather available information",
      "Identify key unknowns",
      "Consult experts",
      "Evaluate risk",
      "Plan for adjustment",
    ],
    exampleAnswer:
      "Gather all available data. Identify critical unknowns and their impact. Consult domain experts. Evaluate risks and likelihood. Choose path with best expected value. Implement monitoring for assumption validation. Build flexibility for course correction if needed.",
    frequency: 0,
    addedBy: "admin",
  },

  // ============= LEADERSHIP QUESTIONS (10) =============
  {
    company: "Google",
    role: "Engineering Manager",
    question: "How do you balance team productivity with long-term technical health?",
    category: "Leadership",
    difficulty: "hard",
    tips: [
      "Show understanding of trade-offs",
      "Explain communication with leadership",
      "Advocate for technical health",
      "Measure impact",
    ],
    exampleAnswer:
      "Allocate 20% of sprint for tech debt. Demonstrate cost of technical debt with metrics. Link quality to team velocity and retention. Set standards but be pragmatic. Gradually improve systems. Show leadership long-term productivity gains from health improvements.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Meta",
    role: "Tech Lead",
    question: "How do you handle disagreements in your team about technical direction?",
    category: "Leadership",
    difficulty: "hard",
    tips: [
      "Listen to all perspectives",
      "Facilitate discussion",
      "Make data-driven decision",
      "Ensure team alignment",
      "Document rationale",
    ],
    exampleAnswer:
      "Facilitate discussion where everyone can be heard. Request supporting analysis from both sides. Evaluate on criteria important to team. Make decision considering all input. Document rationale. Ensure loser agrees to execute well. Reassess periodically.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Apple",
    role: "Engineering Lead",
    question: "How do you ensure code quality and knowledge sharing in your team?",
    category: "Leadership",
    difficulty: "medium",
    tips: [
      "Establish code standards",
      "Code review culture",
      "Documentation",
      "Knowledge sharing sessions",
      "Mentorship",
    ],
    exampleAnswer:
      "Establish and enforce coding standards. Create code review checklist. Regular design discussions. Pair programming for complex features. Document decisions in README/wiki. Lunch-and-learns on interesting tech. Cross-training to prevent silos.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Microsoft",
    role: "Engineering Manager",
    question: "How do you motivate your team and keep them engaged?",
    category: "Leadership",
    difficulty: "medium",
    tips: [
      "Understand individual goals",
      "Provide growth opportunities",
      "Recognize contributions",
      "Clear career path",
      "Autonomy",
    ],
    exampleAnswer:
      "1-on-1s to understand career aspirations. Provide challenging projects aligned with growth goals. Recognize achievements publicly. Create clear promotion criteria. Empower decision-making. Remove blockers. Invest in learning opportunities. Celebrate team wins.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Amazon",
    role: "Senior Manager",
    question: "How do you handle a situation where team misses deadlines repeatedly?",
    category: "Leadership",
    difficulty: "hard",
    tips: [
      "Root cause analysis",
      "Address blockers",
      "Adjust processes",
      "Individual conversations",
      "Clear expectations",
    ],
    exampleAnswer:
      "Analyze why misses happen (scope, estimation, capacity, blockers). Address systematic issues first. Review estimation practices. Adjust capacity expectations if unrealistic. 1-on-1s with underperformers. Provide support/coaching. Clear about expectations going forward.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Netflix",
    role: "Tech Lead",
    question: "How do you scale a team from 3 to 12 people?",
    category: "Leadership",
    difficulty: "hard",
    tips: [
      "Organizational structure",
      "Processes and standards",
      "Communication channels",
      "Knowledge documentation",
      "Culture preservation",
    ],
    exampleAnswer:
      "Define clear organizational structure with sub-teams. Document all processes and standards before scaling. Establish regular communication cadence. Pair new hires with mentors. Invest in onboarding. Maintain culture through deliberate effort. Regular feedback loops.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Tesla",
    role: "Engineering Manager",
    question: "How do you handle conflict between team members?",
    category: "Leadership",
    difficulty: "medium",
    tips: [
      "Private conversations",
      "Understand both perspectives",
      "Focus on common goals",
      "Facilitate resolution",
      "Follow up",
    ],
    exampleAnswer:
      "Have separate 1-on-1s to understand each perspective. Acknowledge concerns. Facilitate conversation focusing on shared goals. Help find mutually acceptable solutions. If needed, make decision. Follow up to ensure improvement. Document if performance issue.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Stripe",
    role: "Director",
    question: "How do you make hiring and staffing decisions for critical projects?",
    category: "Leadership",
    difficulty: "hard",
    tips: [
      "Assess project requirements",
      "Team capabilities analysis",
      "Risk management",
      "Growth opportunities",
      "Communicate rationale",
    ],
    exampleAnswer:
      "Assess project criticality and complexity. Evaluate team capabilities and growth opportunities. Balance between safe hands and growth opportunities. Consider timeline and risk. Pair junior with senior on critical work. Communicate decisions explaining rationale.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Airbnb",
    role: "Engineering Lead",
    question: "How do you align your team with company strategy?",
    category: "Leadership",
    difficulty: "medium",
    tips: [
      "Understand company strategy",
      "Break down into team goals",
      "Regular communication",
      "Adjust as needed",
      "Celebrate alignment wins",
    ],
    exampleAnswer:
      "Deeply understand company strategy and OKRs. Translate into team-level goals and projects. Regular communication of how work connects to strategy. Adjust backlog to maintain alignment. Celebrate wins that advance strategy. Empower team to find solutions.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "LinkedIn",
    role: "Senior Manager",
    question: "How do you develop future leaders in your organization?",
    category: "Leadership",
    difficulty: "hard",
    tips: [
      "Identify potential",
      "Stretch assignments",
      "Mentorship",
      "Leadership training",
      "Regular feedback",
    ],
    exampleAnswer:
      "Identify high-potential individuals. Give leadership responsibilities gradually (team lead, project ownership). Mentor and coach. Provide leadership training. Include in planning/decision meetings. Request feedback from others. Challenge appropriately while supporting.",
    frequency: 0,
    addedBy: "admin",
  },

  // ============= COMMUNICATION QUESTIONS (10) =============
  {
    company: "Google",
    role: "Software Engineer",
    question: "How would you explain a complex technical concept to non-technical stakeholders?",
    category: "Communication",
    difficulty: "medium",
    tips: [
      "Avoid jargon",
      "Use analogies",
      "Focus on business impact",
      "Tailor to audience",
      "Use visuals",
    ],
    exampleAnswer:
      "Skip technical details. Use analogies they understand. Focus on business impact (cost, speed, risk). Use simple visuals or diagrams. Check understanding. Adjust explanation if needed. Give concrete examples. Avoid jargon.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Meta",
    role: "Software Engineer",
    question: "How do you communicate bad news or a failure to your manager?",
    category: "Communication",
    difficulty: "medium",
    tips: [
      "Early communication",
      "Accountability",
      "Proposed solutions",
      "Impact assessment",
      "Prevention steps",
    ],
    exampleAnswer:
      "Communicate early, don't hide. Take responsibility, no excuses. Explain what happened and impact. Propose solutions. Outline prevention steps. Answer questions directly. Provide regular updates on resolution. Learn from the failure.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Apple",
    role: "Senior Engineer",
    question: "How do you write documentation that developers actually read?",
    category: "Communication",
    difficulty: "medium",
    tips: [
      "Start with why",
      "Provide examples",
      "Keep it updated",
      "Visual aids",
      "Address common questions",
    ],
    exampleAnswer:
      "Start with overview of why it matters. Provide copy-paste examples. Keep it concise and updated. Use diagrams for complexity. Address FAQs. Link to related docs. Organize in logical structure. Make it searchable.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Microsoft",
    role: "Software Engineer",
    question: "How do you provide constructive code review feedback?",
    category: "Communication",
    difficulty: "medium",
    tips: [
      "Be specific",
      "Highlight positives",
      "Explain reasoning",
      "Suggest alternatives",
      "Encourage questions",
    ],
    exampleAnswer:
      "Start by praising good aspects. Be specific about improvements. Explain why (performance, maintainability, etc.). Suggest alternatives or ask questions. Offer to pair to discuss. Keep tone collaborative. Respond to questions.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Amazon",
    role: "Senior Engineer",
    question: "How do you communicate across teams and time zones effectively?",
    category: "Communication",
    difficulty: "medium",
    tips: [
      "Use async communication",
      "Document decisions",
      "Clear communication",
      "Scheduled syncs",
      "Overcommunicate",
    ],
    exampleAnswer:
      "Write things down (design docs, decisions, progress). Use email for important decisions. Schedule syncs at rotating times. Provide context and background. Ask for feedback explicitly. Summarize decisions in accessible format. Have escalation path.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Netflix",
    role: "Tech Lead",
    question: "How do you present technical proposals to get buy-in?",
    category: "Communication",
    difficulty: "medium",
    tips: [
      "Clear problem statement",
      "Multiple options",
      "Trade-off analysis",
      "Implementation plan",
      "Risk assessment",
    ],
    exampleAnswer:
      "Start with clear problem and impact. Present multiple approaches with trade-offs. Recommend one with justification. Detail implementation plan and timeline. Identify risks and mitigation. Invite feedback. Answer questions directly.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Tesla",
    role: "Engineering Lead",
    question: "How do you handle giving critical feedback to a colleague?",
    category: "Communication",
    difficulty: "medium",
    tips: [
      "Private setting",
      "Specific examples",
      "Collaborative tone",
      "Actions to improve",
      "Follow up",
    ],
    exampleAnswer:
      "Meet privately. Use specific examples, not generalizations. Explain impact on team. Mention positive aspects. Collaborative problem-solving. Suggest actions to improve. Offer support. Follow up regularly. Document if performance issue.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Stripe",
    role: "Senior Engineer",
    question: "How do you ensure clarity when discussing architecture or design?",
    category: "Communication",
    difficulty: "medium",
    tips: [
      "Visual diagrams",
      "Key tradeoffs",
      "Design patterns",
      "Ask clarifying questions",
      "Document decisions",
    ],
    exampleAnswer:
      "Draw architecture diagrams for clarity. Explain key components and interactions. Discuss trade-offs explicitly. Use familiar design patterns. Ask if anyone disagrees. Document decision and rationale. Provide reference for future discussions.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "Airbnb",
    role: "Product Engineer",
    question: "How do you communicate with product managers about technical constraints?",
    category: "Communication",
    difficulty: "medium",
    tips: [
      "Explain in business terms",
      "Trade-off options",
      "Timeline impact",
      "Risk explanation",
      "Propose solutions",
    ],
    exampleAnswer:
      "Frame in business impact (cost, timeline, risk). Explain constraint without jargon. Provide options with trade-offs. Be honest about effort. Propose workarounds or solutions. Collaborate on timeline. Regular updates.",
    frequency: 0,
    addedBy: "admin",
  },
  {
    company: "LinkedIn",
    role: "Engineering Manager",
    question: "How do you give positive feedback effectively?",
    category: "Communication",
    difficulty: "easy",
    tips: [
      "Be specific",
      "Timely feedback",
      "Public recognition",
      "Connect to values",
      "Encourage more of it",
    ],
    exampleAnswer:
      "Specific praise beats generic compliments. Mention exactly what they did and impact. Give soon after the action. Public for team wins, private for development. Connect to company values. Encourage them to keep it up. Share with leadership if relevant.",
    frequency: 0,
    addedBy: "admin",
  },
];

/**
 * Seed the company questions database
 */
export const seedCompanyQuestionsDatabase = async () => {
  try {
    const questionsRef = collection(db, "company_questions");

    // Check if already seeded
    const existingData = await getDocs(questionsRef);
    if (existingData.size > 0) {
      console.log("Company questions database already seeded");
      return;
    }

    // Add all seed data
    for (const question of COMPANY_QUESTIONS_SEED_DATA) {
      await addDoc(questionsRef, question);
    }

    console.log(`Successfully seeded ${COMPANY_QUESTIONS_SEED_DATA.length} company interview questions`);
  } catch (error) {
    console.error("Error seeding company questions database:", error);
    throw error;
  }
};
