/**
 * Sample Seed Data for Skill Questions Database
 * 
 * Copy this data to your Firestore database in the "skillQuestions" collection.
 * Each document should have the following structure:
 * 
 * {
 *   skill: "skillName",
 *   questions: [
 *     { question: "...", expectedAnswer: "..." }
 *   ]
 * }
 */

export const SKILL_QUESTIONS_SEED_DATA = [
  {
    skill: "React",
    questions: [
      {
        question: "What is the difference between state and props in React?",
        expectedAnswer:
          "Props are immutable data passed from parent to child components, while state is mutable data managed within a component. Props are read-only, whereas state can be updated using setState or hooks.",
      },
      {
        question: "Explain how React hooks work and provide an example use case.",
        expectedAnswer:
          "Hooks are functions that let you use state and other React features in functional components. Common examples include useState for state management and useEffect for side effects. Hooks simplify component logic compared to class components.",
      },
    ],
  },
  {
    skill: "TypeScript",
    questions: [
      {
        question: "How does TypeScript help catch errors early in development?",
        expectedAnswer:
          "TypeScript provides static type checking at compile time, catching type mismatches before runtime. It uses interfaces and type annotations to enforce data structure contracts, preventing common bugs.",
      },
      {
        question: "What are generics in TypeScript and why are they useful?",
        expectedAnswer:
          "Generics allow you to create reusable components that work with multiple data types. They provide type safety while maintaining flexibility, enabling you to write functions and classes that work with various types without losing type information.",
      },
    ],
  },
  {
    skill: "Node.js",
    questions: [
      {
        question: "How does the event-driven architecture work in Node.js?",
        expectedAnswer:
          "Node.js uses an event-driven, non-blocking I/O model. The event loop continuously checks for events and executes callbacks. This allows handling many concurrent connections efficiently without blocking operations.",
      },
      {
        question: "Explain the concept of middleware in Express.js",
        expectedAnswer:
          "Middleware functions in Express handle requests and responses. They can modify request/response objects, end the request, or pass control to the next middleware. Middleware runs in order and is useful for authentication, logging, and error handling.",
      },
    ],
  },
  {
    skill: "Python",
    questions: [
      {
        question: "What are the advantages of Python for backend development?",
        expectedAnswer:
          "Python offers readable, clean syntax that reduces development time. It has extensive libraries (Django, Flask), strong community support, rapid prototyping capabilities, and excellent data processing tools. It's also highly scalable and maintainable.",
      },
      {
        question: "Explain the concept of decorators in Python",
        expectedAnswer:
          "Decorators are functions that modify other functions or classes. They wrap a function, allowing you to execute code before/after the wrapped function. Common uses include authentication, logging, and caching.",
      },
    ],
  },
  {
    skill: "JavaScript",
    questions: [
      {
        question: "What is the difference between var, let, and const?",
        expectedAnswer:
          "var is function-scoped and hoisted. let and const are block-scoped. const prevents reassignment but doesn't prevent mutation of objects. Use const by default, let for variables that change, and avoid var.",
      },
      {
        question: "Explain event delegation in JavaScript",
        expectedAnswer:
          "Event delegation is attaching a single event listener to a parent element to handle events on its children. Events bubble up the DOM, so a parent can capture and handle events from descendants, reducing the number of listeners needed.",
      },
    ],
  },
  {
    skill: "AWS",
    questions: [
      {
        question: "What are the key services you've used in AWS?",
        expectedAnswer:
          "Common services include EC2 for compute, S3 for storage, Lambda for serverless functions, RDS for databases, CloudFront for CDN, and IAM for access management. The choice depends on the application architecture and requirements.",
      },
      {
        question: "How would you design a scalable application on AWS?",
        expectedAnswer:
          "Use Auto Scaling for dynamic capacity, load balancers for traffic distribution, managed services like RDS, S3 for storage, CloudFront for caching, and implement proper monitoring with CloudWatch. Use microservices and separate concerns.",
      },
    ],
  },
  {
    skill: "Docker",
    questions: [
      {
        question: "How does containerization help in application deployment?",
        expectedAnswer:
          "Containers package applications with dependencies in isolated environments. They ensure consistency across development, testing, and production. Containers are lightweight, fast to deploy, and enable easy scaling and microservices architecture.",
      },
      {
        question: "What is the difference between Docker images and containers?",
        expectedAnswer:
          "Docker images are immutable blueprints that define the application and dependencies. Containers are running instances of images. Images are templates, containers are the actual running processes.",
      },
    ],
  },
  {
    skill: "MongoDB",
    questions: [
      {
        question: "What are the advantages of using MongoDB over relational databases?",
        expectedAnswer:
          "MongoDB uses flexible JSON-like documents instead of rigid schemas, allowing dynamic data structures. It scales horizontally, handles unstructured data well, and supports rapid prototyping. However, it trades ACID compliance for flexibility.",
      },
      {
        question: "How do you structure documents in MongoDB?",
        expectedAnswer:
          "MongoDB documents contain key-value pairs similar to JSON. You can embed related data in a single document or use references to other documents. Good design balances denormalization (embedding) for performance with normalization for simplicity.",
      },
    ],
  },
  {
    skill: "SQL",
    questions: [
      {
        question: "What are the different types of joins in SQL?",
        expectedAnswer:
          "INNER JOIN returns matching records, LEFT JOIN includes unmatched left table records, RIGHT JOIN includes unmatched right records, and FULL OUTER JOIN includes unmatched records from both tables. Each join type serves different data retrieval needs.",
      },
      {
        question: "How do you optimize slow SQL queries?",
        expectedAnswer:
          "Use EXPLAIN to identify bottlenecks, add appropriate indexes on frequently searched columns, optimize WHERE clauses, avoid SELECT *, use query hints, consider denormalization, and ensure proper table relationships.",
      },
    ],
  },
  {
    skill: "Vue",
    questions: [
      {
        question: "What are the key differences between Vue and React?",
        expectedAnswer:
          "Vue uses templates (HTML-based), while React uses JSX. Vue has less boilerplate and gentler learning curve. Both are component-based and reactive. Vue 3 uses Composition API similar to React hooks.",
      },
      {
        question: "Explain Vue's reactivity system",
        expectedAnswer:
          "Vue tracks property changes using getters/setters or Proxies. When data changes, Vue automatically updates the DOM. This two-way binding simplifies state management compared to frameworks requiring manual updates.",
      },
    ],
  },
  {
    skill: "Angular",
    questions: [
      {
        question: "What is dependency injection in Angular?",
        expectedAnswer:
          "Dependency injection is a design pattern where components receive their dependencies rather than creating them. Angular's injector manages instances, making code more testable and loosely coupled.",
      },
      {
        question: "Explain Angular services and how they're used",
        expectedAnswer:
          "Services are classes that contain reusable logic. They're injected into components to provide functionality like API calls or data sharing. Services promote code reuse and separation of concerns.",
      },
    ],
  },
  {
    skill: "Kubernetes",
    questions: [
      {
        question: "What is Kubernetes and what problems does it solve?",
        expectedAnswer:
          "Kubernetes is a container orchestration platform that automates deployment, scaling, and management of containerized applications. It handles load balancing, rolling updates, and self-healing across clusters.",
      },
      {
        question: "Explain the concept of pods in Kubernetes",
        expectedAnswer:
          "Pods are the smallest deployable units in Kubernetes, containing one or more containers (usually one). They share network namespace, allowing containers to communicate via localhost. Pods are ephemeral and created/destroyed as needed.",
      },
    ],
  },
  {
    skill: "Git",
    questions: [
      {
        question: "Explain the difference between git merge and git rebase",
        expectedAnswer:
          "Merge combines two branches by creating a merge commit, preserving history. Rebase replays commits on top of another branch, creating a linear history. Merge is safer for shared branches, rebase for local branches.",
      },
      {
        question: "What is a git branch strategy and why is it important?",
        expectedAnswer:
          "Branch strategies like Git Flow or trunk-based development organize workflow. They prevent conflicts, maintain code quality, enable parallel development, and provide clear release processes.",
      },
    ],
  },
  {
    skill: "Firebase",
    questions: [
      {
        question: "What are the main services provided by Firebase?",
        expectedAnswer:
          "Firebase offers Firestore (database), Authentication, Hosting, Cloud Functions, Storage, and Analytics. It provides backend infrastructure without managing servers, ideal for rapid development.",
      },
      {
        question: "How do you structure Firestore collections for optimal queries?",
        expectedAnswer:
          "Design collections based on query patterns. Denormalize data when necessary, use subcollections for hierarchical data, and avoid deeply nested structures. Plan collections around how data will be queried.",
      },
    ],
  },
  {
    skill: "HTML",
    questions: [
      {
        question: "What is semantic HTML and why is it important?",
        expectedAnswer:
          "Semantic HTML uses tags that describe content meaning (<header>, <nav>, <article>). It improves accessibility for screen readers, helps SEO, makes code more readable, and follows web standards.",
      },
      {
        question: "Explain the difference between block and inline elements",
        expectedAnswer:
          "Block elements (div, p, h1) take full width and start on new lines. Inline elements (span, a) only take necessary width and flow within text. Inline-block combines both behaviors.",
      },
    ],
  },
  {
    skill: "CSS",
    questions: [
      {
        question: "Explain CSS specificity and how to manage it",
        expectedAnswer:
          "Specificity is the priority given to CSS rules. Inline styles (1000) > IDs (100) > classes (10) > elements (1). Use low specificity for flexibility, avoid !important, and follow BEM naming for maintainability.",
      },
      {
        question: "What is the CSS box model and how does it work?",
        expectedAnswer:
          "The box model consists of content, padding, border, and margin. Box-sizing: content-box (default) or border-box affects how width/height are calculated. Understanding this is crucial for layout.",
      },
    ],
  },
  {
    skill: "Tailwind CSS",
    questions: [
      {
        question: "What are the advantages of using Tailwind CSS?",
        expectedAnswer:
          "Tailwind provides utility classes for rapid development, smaller production files through PurgeCSS, consistent styling, and customization options. It encourages composition over inheritance.",
      },
      {
        question: "How do you create custom components in Tailwind?",
        expectedAnswer:
          "Use @apply directive to combine utilities into custom classes, create component layers in CSS, or build reusable component templates. Tailwind recommends extracting repeated patterns into components.",
      },
    ],
  },
  {
    skill: "C#",
    questions: [
      {
        question: "What is LINQ and what problems does it solve?",
        expectedAnswer:
          "LINQ (Language Integrated Query) provides a unified syntax for querying data sources. It simplifies data access, improves readability, and allows consistent querying across databases, collections, and APIs.",
      },
      {
        question: "Explain async/await in C#",
        expectedAnswer:
          "Async/await enables asynchronous programming without callbacks. The async keyword marks methods as asynchronous, and await suspends execution until the async operation completes, improving responsiveness.",
      },
    ],
  },
  {
    skill: "Java",
    questions: [
      {
        question: "What is the difference between abstract classes and interfaces?",
        expectedAnswer:
          "Abstract classes can have state and implement methods, but a class can only extend one. Interfaces define contracts with no state or implementation (Java 8+ allows defaults). Use interfaces for contracts, abstract classes for shared behavior.",
      },
      {
        question: "Explain the concept of generics in Java",
        expectedAnswer:
          "Generics enable types to be specified as parameters, allowing type-safe collections and functions. They prevent casting errors at compile time and improve code reusability while maintaining type safety.",
      },
    ],
  },
  {
    skill: "REST API",
    questions: [
      {
        question: "What are REST principles and HTTP methods?",
        expectedAnswer:
          "REST uses standard HTTP methods: GET (retrieve), POST (create), PUT (update), DELETE (remove). Resources are identified by URLs. REST principles include statelessness, cacheability, and client-server separation.",
      },
      {
        question: "How do you design a RESTful API?",
        expectedAnswer:
          "Use nouns for resources (not verbs), leverage HTTP methods, maintain statelessness, use proper status codes, version your API, and provide clear documentation. Follow naming conventions and consider pagination for large datasets.",
      },
    ],
  },
];

/**
 * Instructions for seeding data to Firestore:
 *
 * Option 1: Manual via Firebase Console
 * 1. Go to Firebase Console → Firestore Database
 * 2. Create collection named "skillQuestions"
 * 3. For each item in SKILL_QUESTIONS_SEED_DATA, add a new document
 * 4. Set skill as a field and add the questions array
 *
 * Option 2: Using Firebase Admin SDK (Node.js script)
 * ```typescript
 * import admin from 'firebase-admin';
 *
 * admin.initializeApp();
 * const db = admin.firestore();
 *
 * async function seedDatabase() {
 *   for (const skillData of SKILL_QUESTIONS_SEED_DATA) {
 *     await db.collection('skillQuestions').add(skillData);
 *   }
 *   console.log('Database seeded successfully!');
 * }
 *
 * seedDatabase().catch(console.error);
 * ```
 *
 * Option 3: Using client-side (in your app initialization)
 * Call the seedDatabase function defined below
 */

import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase.config";

/**
 * Seed the database with sample questions
 * Call this once during setup (not in production)
 */
export const seedSkillQuestionsDatabase = async () => {
  try {
    const questionsRef = collection(db, "skillQuestions");

    // Check if already seeded
    const existingData = await getDocs(questionsRef);
    if (existingData.size > 0) {
      console.log("Database already seeded");
      return;
    }

    // Add all seed data
    for (const skillData of SKILL_QUESTIONS_SEED_DATA) {
      await addDoc(questionsRef, skillData);
    }

    console.log(`Successfully seeded ${SKILL_QUESTIONS_SEED_DATA.length} skills with questions`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
