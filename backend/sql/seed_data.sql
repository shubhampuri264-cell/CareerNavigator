-- ============================================================
-- CAREER NAVIGATOR — ROLE RESOURCES SEED DATA
-- Run this AFTER schema.sql in Supabase SQL Editor
-- 5 resources per role (20 total), varied types and difficulties
-- ============================================================

-- Clear existing seed data before re-seeding (safe to re-run)
TRUNCATE TABLE public.role_resources;

INSERT INTO public.role_resources (role, title, url, description, resource_type, difficulty) VALUES

-- ── PM Resources ──────────────────────────────────────────────────────────
(
    'PM',
    'Inspired: How to Create Tech Products Customers Love',
    'https://www.svpg.com/inspired-how-to-create-tech-products-customers-love/',
    'Marty Cagan''s definitive guide to modern product management. Covers discovery, delivery, and product strategy. Essential reading for aspiring PMs.',
    'book',
    'beginner'
),
(
    'PM',
    'Product School — Free PM Curriculum',
    'https://productschool.com/resources/ebook/the-product-book',
    'Free introductory resource covering the PM role, roadmapping, stakeholder management, and working with engineering teams.',
    'course',
    'beginner'
),
(
    'PM',
    'Lenny''s Newsletter — Product Management',
    'https://www.lennysnewsletter.com',
    'Weekly deep dives on PM craft, metrics, career growth, and case studies from PMs at top companies. Highly practical.',
    'article',
    'intermediate'
),
(
    'PM',
    'Shreyas Doshi on PM Frameworks',
    'https://twitter.com/shreyas/status/1263454807093198849',
    'Curated thread collection on mental models every PM should know. Battle-tested frameworks for prioritization, influence, and strategy.',
    'article',
    'intermediate'
),
(
    'PM',
    'Reforge — Advanced Product Management',
    'https://www.reforge.com/product-strategy',
    'Advanced cohort-based program covering growth, product strategy, and experimentation at scale. Used by PMs at top tech companies.',
    'course',
    'advanced'
),

-- ── SWE Resources ─────────────────────────────────────────────────────────
(
    'SWE',
    'CS50: Introduction to Computer Science',
    'https://cs50.harvard.edu/x/',
    'Harvard''s free intro CS course. Covers C, Python, algorithms, web development, and SQL fundamentals. Best starting point for CS fundamentals.',
    'course',
    'beginner'
),
(
    'SWE',
    'roadmap.sh — Backend Developer Roadmap',
    'https://roadmap.sh/backend',
    'Community-curated visual roadmap for backend engineering skills. Covers databases, APIs, caching, messaging, and deployment.',
    'article',
    'beginner'
),
(
    'SWE',
    'NeetCode — LeetCode Patterns',
    'https://neetcode.io',
    'Curated LeetCode problems organized by pattern (sliding window, two pointers, trees, graphs) with video explanations. Essential for interview prep.',
    'course',
    'intermediate'
),
(
    'SWE',
    'The Pragmatic Programmer',
    'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/',
    'Classic software engineering book covering code quality, career development, and professional practices. Every SWE should read this.',
    'book',
    'intermediate'
),
(
    'SWE',
    'System Design Primer',
    'https://github.com/donnemartin/system-design-primer',
    'Comprehensive open-source guide to designing large-scale distributed systems. Covers load balancing, caching, databases, and real system examples.',
    'article',
    'advanced'
),

-- ── ML Resources ──────────────────────────────────────────────────────────
(
    'ML',
    'fast.ai — Practical Deep Learning for Coders',
    'https://course.fast.ai',
    'Top-down hands-on deep learning course. Build real models before diving into theory. Free. Best practical ML starting point for coders.',
    'course',
    'beginner'
),
(
    'ML',
    'Andrew Ng — Machine Learning Specialization',
    'https://www.coursera.org/specializations/machine-learning-introduction',
    'The classic ML course, updated with modern Python. Covers supervised learning, unsupervised learning, and neural networks. Audit for free.',
    'course',
    'beginner'
),
(
    'ML',
    'Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow',
    'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/',
    'Aurélien Géron''s practical ML book. The single best resource for applied ML engineering — covers the full pipeline from data to deployment.',
    'book',
    'intermediate'
),
(
    'ML',
    'Stanford CS229 — Machine Learning',
    'https://cs229.stanford.edu',
    'Stanford''s graduate ML course with full lecture notes. Rigorous mathematical foundations covering optimization, generalization, and advanced models.',
    'course',
    'advanced'
),
(
    'ML',
    'Papers With Code',
    'https://paperswithcode.com',
    'Browse state-of-the-art ML research with linked implementations. Track benchmarks, discover new methods, and explore reproducible research.',
    'article',
    'advanced'
),

-- ── Data Resources ────────────────────────────────────────────────────────
(
    'Data',
    'Mode Analytics SQL Tutorial',
    'https://mode.com/sql-tutorial/',
    'Hands-on SQL tutorial from beginner to advanced, running in-browser against real datasets. Covers aggregations, joins, window functions, and subqueries.',
    'course',
    'beginner'
),
(
    'Data',
    'Kaggle — Data Science Courses',
    'https://www.kaggle.com/learn',
    'Free micro-courses in Python, Pandas, SQL, and data visualization. Directly applicable to Kaggle competitions and real-world data problems.',
    'course',
    'beginner'
),
(
    'Data',
    'Storytelling with Data',
    'https://www.storytellingwithdata.com/book',
    'Cole Nussbaumer Knaflic''s guide to data visualization and communicating insights effectively to non-technical audiences. Highly practical.',
    'book',
    'intermediate'
),
(
    'Data',
    'Towards Data Science — Medium',
    'https://towardsdatascience.com',
    'Curated articles on data analysis, visualization, Python, SQL, and analytics engineering. Great for staying current with the field.',
    'article',
    'intermediate'
),
(
    'Data',
    'dbt — Analytics Engineering Fundamentals',
    'https://courses.getdbt.com/courses/fundamentals',
    'Free course on modern data transformation using dbt. Industry-standard tool for analytics engineering — covers models, tests, and documentation.',
    'course',
    'advanced'
);
