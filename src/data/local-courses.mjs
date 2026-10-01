/**
 * Courses that exist only on this site, not in WordPress/LearnPress. scripts/build-data.mjs adds
 * them to the generated course data (courses-index.json, courses/<slug>.json, categories.json), so
 * they get a course page, a card in the /courses/ archive and their category, and a sitemap entry,
 * exactly like the courses synced from WordPress. Run `node scripts/build-data.mjs` after editing.
 *
 * WordPress does not know these courses, so their pages have no LearnPress enrolment, reviews or
 * comments: the sidebar button opens the student registration form instead.
 *
 *   slug          URL: /courses/<slug>/
 *   title         course name
 *   category      slug of an existing course category (src/data/raw/categories.json)
 *   duration, level
 *   about         paragraphs of the "About" section
 *   learn         bullet points of "What You Will Learn"
 *   prerequisites bullet points of "Prerequisites For Learning ..."
 *   sections      curriculum: [{ title, items: [lesson titles] }]
 *   image         { title, subtitle }: text of the course image (`npm run gen:course-images`)
 *
 * Listed in the order they appear at the top of the /courses/ archive and their category.
 * The card and page image public/images/courses/<slug>.webp is drawn from `image` by
 * `npm run gen:course-images` (scripts/course-images.mjs): re-run it after adding a course.
 */
export const PUBLISHED = '2026-09-30T00:00:00+00:00';

export const LOCAL_COURSES = [
  {
    slug: 'data-analytics-online-training',
    image: { title: 'Data Analytics', subtitle: 'SQL Server · Tableau · Power BI · Snowflake' },
    title: 'Data Analytics Online Training',
    category: 'bi',
    duration: '10 Weeks',
    level: 'All levels',
    about: [
      'Data Analytics Online Training is a complete, job-oriented program that takes you from querying raw data to publishing interactive dashboards. It covers the four tools most requested in data analyst roles today: Microsoft SQL Server, Snowflake, Microsoft Power BI and Tableau.',
      'You start with SQL, the foundation of every analytics role, and learn to query, join, aggregate and prepare data in SQL Server. You then work with Snowflake, the cloud data platform, to load, store and analyse data at scale.',
      'In the reporting part of the course you build data models, DAX measures and interactive reports in Power BI, and design visual analyses and dashboards in Tableau. Every module is taught by a real-time consultant with hands-on exercises, and the course ends with an end-to-end project that uses all four tools.',
    ],
    learn: [
      'Write T-SQL queries with joins, subqueries, CTEs and window functions in SQL Server',
      'Create views, stored procedures and functions, and understand indexes and query performance',
      'Load, transform and analyse data in Snowflake using stages, virtual warehouses and SQL',
      'Prepare data with Power Query, build data models and write DAX measures in Power BI',
      'Design charts, calculated fields, LOD expressions and dashboards in Tableau',
      'Publish, share and refresh reports in the Power BI Service and Tableau Server/Cloud',
    ],
    prerequisites: ['Basic computer skills and familiarity with Microsoft Excel', 'No prior programming or database experience is required'],
    sections: [
      {
        title: 'SQL Server',
        items: [
          'Database and RDBMS Concepts, SQL Server Management Studio',
          'Querying Data: SELECT, Filtering, Sorting and Joins',
          'Aggregations, GROUP BY, Subqueries and Common Table Expressions',
          'Window Functions for Analytics',
          'Views, Stored Procedures, Functions and Indexes',
        ],
      },
      {
        title: 'Snowflake',
        items: [
          'Snowflake Architecture: Storage, Compute and Cloud Services',
          'Virtual Warehouses, Databases, Schemas and Tables',
          'Loading Data: Stages, COPY INTO and Snowpipe',
          'Time Travel, Zero-Copy Cloning and Secure Data Sharing',
          'Semi-Structured Data (JSON) and Role-Based Access Control',
        ],
      },
      {
        title: 'Power BI',
        items: [
          'Power BI Desktop and Connecting to Data Sources',
          'Data Preparation with Power Query',
          'Data Modelling and Relationships',
          'DAX: Calculated Columns and Measures',
          'Reports, Dashboards and the Power BI Service (Publishing, Refresh, Row-Level Security)',
        ],
      },
      {
        title: 'Tableau',
        items: [
          'Tableau Desktop and Connecting to Data',
          'Dimensions, Measures, Calculated Fields and LOD Expressions',
          'Charts, Maps, Filters and Parameters',
          'Dashboards and Stories',
          'Publishing to Tableau Server / Tableau Cloud',
        ],
      },
      {
        title: 'Capstone Project',
        items: ['End-to-End Analytics Project with SQL Server, Snowflake, Power BI and Tableau'],
      },
    ],
  },
  {
    slug: 'ibm-mq-online-training',
    image: { title: 'IBM MQ', subtitle: 'Enterprise Messaging Middleware' },
    title: 'IBM MQ Online Training',
    category: 'etl-tools',
    duration: '10 Weeks',
    level: 'All levels',
    about: [
      'IBM MQ Online Training prepares you to install, configure and administer IBM MQ, the enterprise messaging middleware that banks, insurers and large enterprises use to move business-critical messages reliably between applications and systems.',
      'The course explains how message-oriented middleware works and then goes hands-on with queue managers, queues and channels. You learn to connect queue managers with distributed queuing and clusters, secure your MQ network with channel authentication and TLS, and keep it running with monitoring, backup, recovery and high-availability configurations.',
      'The training is delivered by a real-time consultant who works on IBM MQ implementation and support projects, with practical exercises for every topic.',
    ],
    learn: [
      'Install IBM MQ and create, start and manage queue managers',
      'Administer MQ objects with MQSC commands, MQ Explorer and the MQ Web Console',
      'Configure local, remote, alias, model and transmission queues',
      'Set up distributed queuing, client connections and queue manager clusters',
      'Secure IBM MQ with channel authentication records, TLS and object authorities',
      'Troubleshoot problems and configure high availability',
    ],
    prerequisites: ['Basic knowledge of Linux/UNIX or Windows administration', 'Understanding of networking fundamentals (TCP/IP)'],
    sections: [
      {
        title: 'IBM MQ Online Training Course Content',
        items: [
          'Introduction to Messaging and Message-Oriented Middleware',
          'IBM MQ Architecture: Queue Managers, Queues, Channels and Listeners',
          'Installing IBM MQ and Creating Queue Managers',
          'Administration with MQSC, MQ Explorer and the MQ Web Console',
          'Working with Local, Remote, Alias, Model and Transmission Queues',
          'Distributed Queuing: Sender, Receiver and Server-Connection Channels',
          'Queue Manager Clusters and Workload Balancing',
          'Publish/Subscribe Messaging',
          'Security: Channel Authentication, TLS and Object Authority Manager',
          'Logging, Backup, Recovery and Troubleshooting',
          'High Availability: Multi-Instance Queue Managers and Native HA',
        ],
      },
    ],
  },
  {
    slug: 'edmcs-online-training',
    image: { title: 'EDMCS', subtitle: 'Enterprise Data Management Cloud Service' },
    title: 'EDMCS Online Training',
    category: 'hyperion',
    duration: '10 Weeks',
    level: 'All levels',
    about: [
      'EDMCS Online Training covers Oracle Enterprise Data Management Cloud Service (Oracle Enterprise Data Management), the Oracle EPM Cloud service for managing and governing master data such as charts of accounts, entities, products and hierarchies across applications.',
      'You learn how EDMCS organises data in applications, views and viewpoints, how to register and connect Oracle EPM Cloud, Oracle Financials Cloud and other applications, and how to import, maintain and export dimensions. The course explains how requests and approval workflows keep every change controlled and audited, and how to compare, align and map hierarchies between applications.',
      'The course is useful for Hyperion DRM professionals moving to the cloud and for EPM consultants who manage metadata. It is taught by a real-time consultant with hands-on practice.',
    ],
    learn: [
      'Understand EDMCS applications, dimensions, views, viewpoints and data chains',
      'Register Planning, Financial Consolidation, Oracle Financials Cloud and custom applications',
      'Import and export dimensions and maintain hierarchies with requests',
      'Compare, align, map and synchronise viewpoints across applications',
      'Configure properties, validations, policies and approval workflows',
      'Automate EDMCS with EPM Automate and REST APIs',
    ],
    prerequisites: ['Knowledge of Oracle EPM, Hyperion or ERP master data (dimensions and hierarchies)', 'Hyperion DRM experience is helpful but not required'],
    sections: [
      {
        title: 'EDMCS Online Training Course Content',
        items: [
          'Introduction to Enterprise Data Management and Master Data Governance',
          'Applications, Dimensions, Views and Viewpoints',
          'Node Types, Hierarchy Sets, Node Sets and Data Chains',
          'Registering Applications: Planning, Financial Consolidation, Oracle Financials Cloud and Universal Applications',
          'Importing and Exporting Dimensions',
          'Interactive and Bulk Requests',
          'Comparing, Aligning and Mapping Viewpoints',
          'Properties, Validations and Expressions',
          'Policies, Approval Workflows and Notifications',
          'Security, Permissions and Auditing',
          'Automation with EPM Automate and REST APIs, and Migrating from Hyperion DRM',
        ],
      },
    ],
  },
  {
    slug: 'pcmcs-online-training',
    image: { title: 'PCMCS', subtitle: 'Profitability and Cost Management Cloud Service' },
    title: 'PCMCS Online Training',
    category: 'hyperion',
    duration: '10 Weeks',
    level: 'All levels',
    about: [
      'PCMCS Online Training covers Oracle Profitability and Cost Management Cloud Service, the Oracle EPM Cloud application that calculates the true cost and profitability of products, customers, channels and business units through configurable allocation rules.',
      'You learn to design a profitability application, load metadata and data, and build rule sets and allocation rules that distribute costs and revenues across the business. The course shows how to calculate and validate a model with rule balancing and allocation tracing, and how to analyse the results with analysis views, profit curves, Smart View and reports.',
      'The course also introduces Oracle Enterprise Profitability and Cost Management, the newer Oracle EPM Cloud business process for profitability, so you are ready for both. It is taught by a real-time consultant with hands-on exercises.',
    ],
    learn: [
      'Design profitability applications, dimensions and points of view (POVs)',
      'Load metadata and data with Data Integration',
      'Build rule sets and driver-based allocation rules',
      'Calculate models and validate them with rule balancing and allocation tracing',
      'Analyse profitability with analysis views, profit curves, Smart View and reports',
      'Automate jobs with EPM Automate and understand Enterprise Profitability and Cost Management',
    ],
    prerequisites: ['Knowledge of finance, costing or management accounting', 'Basic knowledge of Oracle EPM or Hyperion Essbase is helpful'],
    sections: [
      {
        title: 'PCMCS Online Training Course Content',
        items: [
          'Introduction to Oracle EPM Cloud and Profitability and Cost Management',
          'Application Design: Dimensions, Points of View and Model Structure',
          'Creating Applications and Loading Metadata',
          'Loading Data with Data Integration',
          'Rule Sets and Allocation Rules',
          'Calculating the Model, Rule Balancing and Allocation Tracing',
          'Model Views, Queries and Data Grants',
          'Analysis Views, Profit Curves and Key Performance Indicators',
          'Reporting with Smart View and Financial Reports',
          'Automation with EPM Automate',
          'Introduction to Enterprise Profitability and Cost Management',
        ],
      },
    ],
  },
  {
    slug: 'narrative-reporting-online-training',
    image: { title: 'Narrative Reporting', subtitle: 'Oracle EPM Cloud Reporting' },
    title: 'Narrative Reporting Online Training',
    category: 'hyperion',
    duration: '10 Weeks',
    level: 'All levels',
    about: [
      'Narrative Reporting Online Training covers Oracle EPM Narrative Reporting, the Oracle EPM Cloud service for creating, reviewing and publishing management, financial and regulatory reports that combine financial data with narrative text.',
      'You learn how report packages divide a report into doclets that different authors prepare in parallel, and how the author, review and sign-off phases give the process a controlled workflow. The course covers authoring doclets in Microsoft Office with Oracle Smart View, building management reports and books with data from Oracle EPM Cloud and Essbase sources, and managing the library, security and administration.',
      'The course is ideal for finance and EPM professionals who prepare board packs, financial statements and management reports. It is taught by a real-time consultant with hands-on practice.',
    ],
    learn: [
      'Create report packages with sections, doclets and reference doclets',
      'Manage the author, review and sign-off phases',
      'Author doclets in Microsoft Word, Excel and PowerPoint with Oracle Smart View',
      'Build management reports with grids, charts and text from Oracle EPM Cloud and Essbase data',
      'Create books and distribute reports',
      'Administer the library, folders, security and audit',
    ],
    prerequisites: ['Basic knowledge of financial reporting', 'Familiarity with Microsoft Office; Oracle EPM Cloud experience is helpful'],
    sections: [
      {
        title: 'Narrative Reporting Online Training Course Content',
        items: [
          'Introduction to Oracle EPM Narrative Reporting',
          'Report Packages: Structure, Sections and Doclets',
          'Reference Doclets and Supplemental Documents',
          'Author, Review and Sign-Off Phases',
          'Working in Microsoft Office with Oracle Smart View',
          'Data Sources and Connections to Oracle EPM Cloud and Essbase',
          'Management Reports: Grids, Charts, Text and Formulas',
          'Books and Report Distribution',
          'Library, Folders and Security',
          'Administration, Audit and Migration',
        ],
      },
    ],
  },
];
