import bcrypt from 'bcrypt';
import { sequelize } from '../config/database';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentEducation } from '../models/student-education.model';
import { StudentSkill } from '../models/student-skill.model';
import { StudentCareerInterest } from '../models/student-career-interest.model';
import { SkillCategory } from '../models/skill-category.model';
import { Skill } from '../models/skill.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { AssessmentAttempt } from '../models/assessment-attempt.model';
import { AssessmentAnswer } from '../models/assessment-answer.model';
import { SkillGap } from '../models/skill-gap.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { IndustryContact } from '../models/industry-contact.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import { AcademicInstitutionAssociation } from '../models/academic-institution-association.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { LearningProgram } from '../models/learning-program.model';
import { LearningRecommendation } from '../models/learning-recommendation.model';
import { Application } from '../models/application.model';
import { ApplicationStatusHistory } from '../models/application-status-history.model';
import { OpportunityMatch } from '../models/opportunity-match.model';
import { Mentor } from '../models/mentor.model';
import { Collaboration } from '../models/collaboration.model';
import { Workshop } from '../models/workshop.model';
import { Notification } from '../models/notification.model';
import { UserRole } from '../constants/roles';
import {
  StudentSkillLevel,
  SkillGapPriority,
  SkillGapStatus,
  ApplicationStatus,
  AssessmentQuestionType,
  AssessmentAttemptStatus,
  OpportunityStatus,
  WorkplaceType,
  EmploymentType,
  CollaborationType,
  CollaborationStatus,
  NotificationType,
} from '../constants/enums';

export async function runR5Seed() {
  console.log('================================================================');
  console.log('  R5 — REALISTIC DEMO DATA POPULATION (SIH PROBLEM STATEMENT 44)');
  console.log('================================================================\n');

  await sequelize.authenticate();
  console.log('✓ Database connection authenticated successfully.');

  const DEMO_PASSWORD = 'DemoPassword123!';
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ============================================================================
  // 1. INSTITUTIONS & DEPARTMENTS (8 Institutions)
  // ============================================================================
  console.log('\n[1/12] Seeding Institutions and Departments...');

  const institutionsData = [
    {
      name: 'National Institute of Technology Karnataka',
      aishe: 'U-0237',
      type: 'National Importance',
      city: 'Surathkal',
      state: 'Karnataka',
      accreditation: 'NAAC A++',
      website: 'https://www.nitk.ac.in',
      email: 'demo.institution@sih.gov.in',
      userFirst: 'NITK',
      userLast: 'Surathkal',
    },
    {
      name: 'Indian Institute of Technology Bombay',
      aishe: 'U-0306',
      type: 'Institute of National Importance',
      city: 'Mumbai',
      state: 'Maharashtra',
      accreditation: 'NAAC A++',
      website: 'https://www.iitb.ac.in',
      email: 'admin.iitb@sih.gov.in',
      userFirst: 'IITB',
      userLast: 'Admin',
    },
    {
      name: 'Indian Institute of Technology Madras',
      aishe: 'U-0456',
      type: 'Institute of National Importance',
      city: 'Chennai',
      state: 'Tamil Nadu',
      accreditation: 'NAAC A++',
      website: 'https://www.iitm.ac.in',
      email: 'admin.iitm@sih.gov.in',
      userFirst: 'IITM',
      userLast: 'Admin',
    },
    {
      name: 'Delhi Technological University',
      aishe: 'U-0098',
      type: 'State University',
      city: 'New Delhi',
      state: 'Delhi',
      accreditation: 'NAAC A',
      website: 'https://www.dtu.ac.in',
      email: 'admin.dtu@sih.gov.in',
      userFirst: 'DTU',
      userLast: 'Admin',
    },
    {
      name: 'Birla Institute of Technology and Science, Pilani',
      aishe: 'U-0388',
      type: 'Deemed University',
      city: 'Pilani',
      state: 'Rajasthan',
      accreditation: 'NAAC A',
      website: 'https://www.bits-pilani.ac.in',
      email: 'admin.bits@sih.gov.in',
      userFirst: 'BITS',
      userLast: 'Pilani',
    },
    {
      name: 'COEP Technological University Pune',
      aishe: 'U-0315',
      type: 'State University',
      city: 'Pune',
      state: 'Maharashtra',
      accreditation: 'NAAC A+',
      website: 'https://www.coep.org.in',
      email: 'admin.coep@sih.gov.in',
      userFirst: 'COEP',
      userLast: 'Admin',
    },
    {
      name: 'International Institute of Information Technology Hyderabad',
      aishe: 'U-0012',
      type: 'Autonomous Institute',
      city: 'Hyderabad',
      state: 'Telangana',
      accreditation: 'NAAC A++',
      website: 'https://www.iiit.ac.in',
      email: 'admin.iiith@sih.gov.in',
      userFirst: 'IIITH',
      userLast: 'Admin',
    },
    {
      name: 'Jadavpur University',
      aishe: 'U-0570',
      type: 'State University',
      city: 'Kolkata',
      state: 'West Bengal',
      accreditation: 'NAAC A',
      website: 'https://www.jaduniv.edu.in',
      email: 'admin.ju@sih.gov.in',
      userFirst: 'JU',
      userLast: 'Admin',
    },
  ];

  const seededInstitutions: InstitutionProfile[] = [];

  for (const inst of institutionsData) {
    const [user] = await User.findOrCreate({
      where: { email: inst.email },
      defaults: {
        firstName: inst.userFirst,
        lastName: inst.userLast,
        email: inst.email,
        passwordHash,
        role: UserRole.INSTITUTION,
        isVerified: true,
        isActive: true,
      },
    });

    const [profile] = await InstitutionProfile.findOrCreate({
      where: { userId: user.id },
      defaults: {
        userId: user.id,
        institutionName: inst.name,
        aisheCode: inst.aishe,
        institutionType: inst.type,
        accreditation: inst.accreditation,
        websiteUrl: inst.website,
        location: `${inst.city}, ${inst.state}, India`,
        city: inst.city,
        state: inst.state,
        country: 'India',
        description: `Premier technological institution providing world-class education and pioneering industry collaboration.`,
        verified: true,
      },
    });

    seededInstitutions.push(profile);

    const depts = [
      { name: 'Computer Science & Engineering', code: 'CSE' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Electronics & Communication', code: 'ECE' },
      { name: 'Artificial Intelligence & Data Science', code: 'AI-DS' },
    ];

    for (const d of depts) {
      await InstitutionDepartment.findOrCreate({
        where: { institutionId: profile.id, departmentCode: d.code },
        defaults: {
          institutionId: profile.id,
          departmentName: d.name,
          departmentCode: d.code,
          hodName: `Dr. Head of ${d.code}`,
          email: `hod.${d.code.toLowerCase()}@${inst.city.toLowerCase().replace(/[^a-z]/g, '')}.edu.in`,
          phone: '+91-9876543210',
        },
      });
    }
  }

  console.log(`  ✓ Seeded ${seededInstitutions.length} Institutions with departments`);

  // ============================================================================
  // 2. INDUSTRIES & COMPANIES (20 Industry Profiles)
  // ============================================================================
  console.log('\n[2/12] Seeding Industry Companies...');

  const industriesData = [
    { name: 'Apex Cloud Systems', type: 'Cloud Infrastructure', city: 'Bengaluru', email: 'demo.industry@sih.gov.in', contact: 'Rajesh Varma' },
    { name: 'FinScale Technologies', type: 'Fintech & Payments', city: 'Mumbai', email: 'finscale@sih.gov.in', contact: 'Vikram Merchant' },
    { name: 'Bharat AI Labs', type: 'AI & Machine Learning', city: 'Bengaluru', email: 'bharatai@sih.gov.in', contact: 'Pooja Bhatt' },
    { name: 'CyberDefend Security', type: 'Cybersecurity', city: 'Hyderabad', email: 'cyberdefend@sih.gov.in', contact: 'Karthik Rao' },
    { name: 'HealthPulse Digital', type: 'Digital Health', city: 'Pune', email: 'healthpulse@sih.gov.in', contact: 'Dr. Neha Kulkarni' },
    { name: 'EduSpark Innovations', type: 'EdTech', city: 'Noida', email: 'eduspark@sih.gov.in', contact: 'Sameer Singhania' },
    { name: 'Nexus Mobility', type: 'Automotive IoT & EV', city: 'Chennai', email: 'nexus@sih.gov.in', contact: 'Suresh Kumar' },
    { name: 'QuantumData Analytics', type: 'Big Data & Analytics', city: 'Gurugram', email: 'quantumdata@sih.gov.in', contact: 'Sunita Mehra' },
    { name: 'CloudNative Infotech', type: 'DevOps & SRE', city: 'Ahmedabad', email: 'cloudnative@sih.gov.in', contact: 'Bhavin Patel' },
    { name: 'AgriTech Global Solutions', type: 'AgriTech IoT', city: 'Nagpur', email: 'agritech@sih.gov.in', contact: 'Anil Deshmukh' },
    { name: 'GreenGrid Energy Tech', type: 'CleanTech & IoT', city: 'Bengaluru', email: 'greengrid@sih.gov.in', contact: 'Meenakshi Sundaram' },
    { name: 'LogiFast Supply Chain', type: 'Logistics Robotics', city: 'Mumbai', email: 'logifast@sih.gov.in', contact: 'Farhan Zaidi' },
    { name: 'SmartCity Solutions India', type: 'Civic IoT', city: 'New Delhi', email: 'smartcity@sih.gov.in', contact: 'Alok Sharma' },
    { name: 'SecureChain Blockchain', type: 'Web3 & Enterprise Trust', city: 'Hyderabad', email: 'securechain@sih.gov.in', contact: 'Venkatesh Murthy' },
    { name: 'OmniRetail Systems', type: 'E-commerce & Microservices', city: 'Bengaluru', email: 'omniretail@sih.gov.in', contact: 'Deepak Chopra' },
    { name: 'BioGenix Informatics', type: 'Bioinformatics', city: 'Chennai', email: 'biogenix@sih.gov.in', contact: 'Dr. Radhika N.' },
    { name: 'AeroSpace Dynamics', type: 'Avionics & Embedded', city: 'Bengaluru', email: 'aerospace@sih.gov.in', contact: 'Wing Cmdr. R. Iyer' },
    { name: 'DeepVision Tech', type: 'Computer Vision & Edge AI', city: 'Pune', email: 'deepvision@sih.gov.in', contact: 'Amit Joshi' },
    { name: 'InfiniScale Software', type: 'Distributed Databases', city: 'Hyderabad', email: 'infiniscale@sih.gov.in', contact: 'Raghavendra Rao' },
    { name: 'Zenith Robotics', type: 'Industrial Automation', city: 'Coimbatore', email: 'zenith@sih.gov.in', contact: 'Muthuswamy K.' },
  ];

  const seededIndustries: IndustryProfile[] = [];

  for (let i = 0; i < industriesData.length; i++) {
    const item = industriesData[i];
    const [user] = await User.findOrCreate({
      where: { email: item.email },
      defaults: {
        firstName: item.contact.split(' ')[0],
        lastName: item.contact.split(' ')[1] || 'Executive',
        email: item.email,
        passwordHash,
        role: UserRole.INDUSTRY,
        isVerified: true,
        isActive: true,
      },
    });

    const [profile] = await IndustryProfile.findOrCreate({
      where: { userId: user.id },
      defaults: {
        userId: user.id,
        companyName: item.name,
        cin: `U72200KA201${i}PTC${100000 + i * 123}`,
        industryType: item.type,
        websiteUrl: `https://www.${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.demo`,
        location: `${item.city}, India`,
        city: item.city,
        state: 'India',
        country: 'India',
        description: `Leading provider of ${item.type} solutions driving technological transformation across India and globally.`,
        verified: true,
      },
    });

    seededIndustries.push(profile);

    await IndustryContact.findOrCreate({
      where: { industryId: profile.id, email: `contact.${item.email}` },
      defaults: {
        industryId: profile.id,
        name: item.contact,
        designation: 'Director of Talent & Campus Partnerships',
        email: `contact.${item.email}`,
        phone: `+91-91234${String(50000 + i).padStart(5, '0')}`,
        isPrimary: true,
      },
    });
  }

  console.log(`  ✓ Seeded ${seededIndustries.length} Industry Profiles with primary contacts`);

  // ============================================================================
  // 3. ACADEMICIANS (25 Academician Profiles)
  // ============================================================================
  console.log('\n[3/12] Seeding Academician Profiles...');

  const academiciansData = [
    { first: 'Dr. S.', last: 'Ramanujan', email: 'demo.academician@sih.gov.in', dept: 'Computer Science & Engineering', desig: 'Professor & Head of Lab', spec: 'Distributed Systems & Cloud Computing' },
    { first: 'Dr. A.P.J.', last: 'Abdul', email: 'prof.abdul@sih.gov.in', dept: 'Aerospace Engineering', desig: 'Professor', spec: 'Avionics and Propulsion Systems' },
    { first: 'Dr. C.V.', last: 'Raman', email: 'prof.raman@sih.gov.in', dept: 'Electronics & Communication', desig: 'Senior Professor', spec: 'Quantum Sensing and Photonics' },
    { first: 'Dr. Homi', last: 'Bhabha', email: 'prof.bhabha@sih.gov.in', dept: 'Computer Science & Engineering', desig: 'Professor', spec: 'High-Performance Scientific Computing' },
    { first: 'Dr. Vikram', last: 'Sarabhai', email: 'prof.sarabhai@sih.gov.in', dept: 'Information Technology', desig: 'Professor', spec: 'Satellite Communications & IoT' },
    { first: 'Dr. Satyendra', last: 'Bose', email: 'prof.bose@sih.gov.in', dept: 'Artificial Intelligence & Data Science', desig: 'Professor', spec: 'Statistical Machine Learning' },
    { first: 'Dr. Venkatraman', last: 'Ramakrishnan', email: 'prof.venkat@sih.gov.in', dept: 'Computer Science & Engineering', desig: 'Professor', spec: 'Computational Structural Biology' },
    { first: 'Dr. M.S.', last: 'Swaminathan', email: 'prof.swami@sih.gov.in', dept: 'Information Technology', desig: 'Professor', spec: 'Agrigenomics & Spatial Data Systems' },
    { first: 'Dr. Manjul', last: 'Bhargava', email: 'prof.bhargava@sih.gov.in', dept: 'Computer Science & Engineering', desig: 'Associate Professor', spec: 'Cryptographic Algorithms & Number Theory' },
    { first: 'Dr. Meghnad', last: 'Saha', email: 'prof.saha@sih.gov.in', dept: 'Electronics & Communication', desig: 'Associate Professor', spec: 'Thermal Simulation in VLSI' },
    { first: 'Dr. Prasanta', last: 'Mahalanobis', email: 'prof.pc@sih.gov.in', dept: 'Artificial Intelligence & Data Science', desig: 'Professor', spec: 'Multivariate Big Data Analytics' },
    { first: 'Dr. Jagadish', last: 'Bose', email: 'prof.jcbose@sih.gov.in', dept: 'Electronics & Communication', desig: 'Professor', spec: 'Microwave Communication & Embedded Sensors' },
    { first: 'Dr. Har Gobind', last: 'Khorana', email: 'prof.khorana@sih.gov.in', dept: 'Computer Science & Engineering', desig: 'Associate Professor', spec: 'Bioinformatics & Sequence Analysis' },
    { first: 'Dr. Asima', last: 'Chatterjee', email: 'prof.asima@sih.gov.in', dept: 'Information Technology', desig: 'Associate Professor', spec: 'Cheminformatics & Molecular Simulation' },
    { first: 'Dr. Janaki', last: 'Ammal', email: 'prof.janaki@sih.gov.in', dept: 'Artificial Intelligence & Data Science', desig: 'Assistant Professor', spec: 'Environmental Data Modeling' },
    { first: 'Dr. Anna', last: 'Mani', email: 'prof.anna@sih.gov.in', dept: 'Electronics & Communication', desig: 'Assistant Professor', spec: 'Meteorological Sensors and Telemetry' },
    { first: 'Dr. Rajesh', last: 'Gopakumar', email: 'prof.gopakumar@sih.gov.in', dept: 'Computer Science & Engineering', desig: 'Professor', spec: 'Quantum Computing & Algorithms' },
    { first: 'Dr. Rohini', last: 'Godbole', email: 'prof.rohini@sih.gov.in', dept: 'Information Technology', desig: 'Professor', spec: 'Grid Computing and Cloud Architectures' },
    { first: 'Dr. Sanghamitra', last: 'Bandyopadhyay', email: 'prof.sanghamitra@sih.gov.in', dept: 'Computer Science & Engineering', desig: 'Professor', spec: 'Genetic Algorithms & Pattern Recognition' },
    { first: 'Dr. Jayant', last: 'Narlikar', email: 'prof.narlikar@sih.gov.in', dept: 'Artificial Intelligence & Data Science', desig: 'Professor', spec: 'Cosmological Modeling & Numerical Systems' },
    { first: 'Dr. Shanti', last: 'Bhatnagar', email: 'prof.bhatnagar@sih.gov.in', dept: 'Electronics & Communication', desig: 'Associate Professor', spec: 'Industrial Automation & Signal Processing' },
    { first: 'Dr. George', last: 'Sudarshan', email: 'prof.george@sih.gov.in', dept: 'Computer Science & Engineering', desig: 'Associate Professor', spec: 'Theoretical Computer Science' },
    { first: 'Dr. K.', last: 'Radhakrishnan', email: 'prof.radhakrishnan@sih.gov.in', dept: 'Aerospace & Systems', desig: 'Professor', spec: 'Fault-Tolerant Aerospace Architectures' },
    { first: 'Dr. S.K.', last: 'Joshi', email: 'prof.skjoshi@sih.gov.in', dept: 'Computer Science & Engineering', desig: 'Assistant Professor', spec: 'Distributed Database Systems' },
    { first: 'Dr. Tessy', last: 'Thomas', email: 'prof.tessy@sih.gov.in', dept: 'Electronics & Communication', desig: 'Professor', spec: 'Real-time Embedded Control Systems' },
  ];

  const seededAcademicians: AcademicianProfile[] = [];

  for (let i = 0; i < academiciansData.length; i++) {
    const item = academiciansData[i];
    const inst = seededInstitutions[i % seededInstitutions.length];

    const [user] = await User.findOrCreate({
      where: { email: item.email },
      defaults: {
        firstName: item.first,
        lastName: item.last,
        email: item.email,
        passwordHash,
        role: UserRole.ACADEMICIAN,
        isVerified: true,
        isActive: true,
      },
    });

    const [profile] = await AcademicianProfile.findOrCreate({
      where: { userId: user.id },
      defaults: {
        userId: user.id,
        institutionId: inst.id,
        department: item.dept,
        designation: item.desig,
        qualification: 'Ph.D.',
        specialization: item.spec,
        experienceYears: 10 + (i % 15),
        bio: `Distinguished academician specializing in ${item.spec} with numerous peer-reviewed publications and industry sponsored research projects.`,
        researchInterests: item.spec,
        verified: true,
      },
    });

    seededAcademicians.push(profile);

    await AcademicInstitutionAssociation.findOrCreate({
      where: { academicianId: profile.id, institutionId: inst.id },
      defaults: {
        academicianId: profile.id,
        institutionId: inst.id,
        designation: item.desig,
        department: item.dept,
        startDate: new Date('2018-08-01'),
        isCurrent: true,
      },
    });
  }

  console.log(`  ✓ Seeded ${seededAcademicians.length} Academician Profiles`);

  // ============================================================================
  // 4. MENTORS (20 Mentors)
  // ============================================================================
  console.log('\n[4/12] Seeding Mentors...');

  const mentorUsers = seededAcademicians.slice(0, 10).map(a => a.userId);
  const mentorIndustryUsers = seededIndustries.slice(0, 10).map(ind => ind.userId);
  const allMentorUserIds = [...mentorUsers, ...mentorIndustryUsers];

  for (let i = 0; i < allMentorUserIds.length; i++) {
    const userId = allMentorUserIds[i];
    await Mentor.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        expertiseAreas: i < 10 ? 'Academic Research, Cloud Architecture, Distributed Systems' : 'Industry Careers, System Design, DevOps, Full Stack Development',
        maxMentees: 6,
        currentMentees: 1 + (i % 5),
        isAvailable: true,
      },
    });
  }

  console.log(`  ✓ Seeded ${allMentorUserIds.length} Mentors`);

  // ============================================================================
  // 5. SKILL TAXONOMY (120 Skills across 8 Categories)
  // ============================================================================
  console.log('\n[5/12] Seeding Skill Taxonomy (120 Skills across 8 Categories)...');

  const categories = [
    { name: 'Programming Languages', desc: 'Core programming and computational languages' },
    { name: 'Frontend Development', desc: 'Modern web UI, component frameworks and client styling' },
    { name: 'Backend & APIs', desc: 'Server runtimes, microservices, REST and async message brokers' },
    { name: 'Databases & Storage', desc: 'Relational, document, key-value, and distributed storage' },
    { name: 'Cloud & DevOps', desc: 'Cloud infrastructure, containerization, orchestration and CI/CD' },
    { name: 'Data Science & AI', desc: 'Machine learning, deep learning, NLP, computer vision and analytics' },
    { name: 'Software Tools & Systems', desc: 'Developer tools, VCS, testing frameworks and Linux environment' },
    { name: 'Soft Skills & Professional', desc: 'Leadership, communication, agile processes and teamwork' },
  ];

  const skillsByCategory: Record<string, string[]> = {
    'Programming Languages': ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'C', 'Go', 'Rust', 'C#', 'Kotlin', 'Swift', 'Scala', 'R', 'PHP', 'Ruby'],
    'Frontend Development': ['React', 'Angular', 'Vue.js', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'SASS', 'Redux', 'Zustand', 'Webpack', 'Vite', 'WebSockets', 'Three.js', 'Bootstrap'],
    'Backend & APIs': ['Node.js', 'Express', 'Spring Boot', 'Django', 'FastAPI', 'Flask', 'ASP.NET Core', 'NestJS', 'GraphQL', 'REST APIs', 'gRPC', 'Microservices', 'Kafka', 'RabbitMQ', 'Celery'],
    'Databases & Storage': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'Neo4j', 'Oracle', 'Firebase', 'Supabase', 'CouchDB', 'MariaDB', 'Memcached'],
    'Cloud & DevOps': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'Linux', 'Nginx', 'Prometheus', 'Grafana', 'Helm', 'CI/CD'],
    'Data Science & AI': ['Machine Learning', 'Deep Learning', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Natural Language Processing', 'Computer Vision', 'Keras', 'OpenCV', 'Data Visualization', 'Matplotlib', 'Seaborn', 'Large Language Models'],
    'Software Tools & Systems': ['Git', 'GitHub', 'GitLab', 'Postman', 'Jira', 'Confluence', 'Docker Compose', 'VS Code', 'Linux Bash', 'Swagger/OpenAPI', 'Unit Testing', 'Jest', 'JUnit', 'PyTest', 'SonarQube'],
    'Soft Skills & Professional': ['Problem Solving', 'Communication', 'Team Leadership', 'Critical Thinking', 'Agile/Scrum', 'Time Management', 'Code Review', 'Presentation', 'Technical Writing', 'Conflict Resolution', 'Mentorship', 'Negotiation', 'Adaptability', 'Collaboration', 'Creative Thinking'],
  };

  const skillRegistry: Record<string, Skill> = {};

  for (const cat of categories) {
    const [categoryModel] = await SkillCategory.findOrCreate({
      where: { name: cat.name },
      defaults: {
        name: cat.name,
        description: cat.desc,
      },
    });

    const skillNames = skillsByCategory[cat.name] || [];
    for (const sName of skillNames) {
      const slug = sName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const [skillModel] = await Skill.findOrCreate({
        where: { slug },
        defaults: {
          categoryId: categoryModel.id,
          name: sName,
          slug,
          description: `Industry-standard competency in ${sName}`,
          isActive: true,
        },
      });
      skillRegistry[sName] = skillModel;
    }
  }

  console.log(`  ✓ Seeded ${Object.keys(skillRegistry).length} Skills across 8 Categories`);

  // ============================================================================
  // 6. CAREER ROLES & REQUIRED SKILLS (35 Career Roles)
  // ============================================================================
  console.log('\n[6/12] Seeding Career Roles & Skill Frameworks (35 Career Roles)...');

  const careerRolesData = [
    { title: 'Java Backend Developer', skills: ['Java', 'Spring Boot', 'SQL', 'Microservices', 'Git'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Full Stack Developer', skills: ['React', 'Node.js', 'TypeScript', 'MySQL', 'Git'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Frontend Developer', skills: ['React', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Python Engineer', skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Docker'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.BEGINNER] },
    { title: 'Data Scientist', skills: ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-learn'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Data Analyst', skills: ['SQL', 'Python', 'Pandas', 'Data Visualization', 'Problem Solving'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED] },
    { title: 'Machine Learning Engineer', skills: ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'Docker'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE] },
    { title: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED] },
    { title: 'Cloud Infrastructure Engineer', skills: ['AWS', 'Terraform', 'Docker', 'Linux', 'Ansible'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Cybersecurity Analyst', skills: ['Linux', 'Python', 'Problem Solving', 'Git', 'Agile/Scrum'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Site Reliability Engineer (SRE)', skills: ['Linux', 'Prometheus', 'Grafana', 'Docker', 'Kubernetes'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE] },
    { title: 'AI Research Scientist', skills: ['Python', 'PyTorch', 'Deep Learning', 'Natural Language Processing', 'Large Language Models'], levels: [StudentSkillLevel.EXPERT, StudentSkillLevel.EXPERT, StudentSkillLevel.EXPERT, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED] },
    { title: 'Mobile App Developer', skills: ['Kotlin', 'Java', 'REST APIs', 'Git', 'Problem Solving'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED] },
    { title: 'Database Administrator', skills: ['MySQL', 'PostgreSQL', 'Redis', 'Linux', 'SQL'], levels: [StudentSkillLevel.EXPERT, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.EXPERT] },
    { title: 'Microservices Architect', skills: ['Microservices', 'Kafka', 'Docker', 'Kubernetes', 'Java'], levels: [StudentSkillLevel.EXPERT, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED] },
    { title: 'Embedded Systems Engineer', skills: ['C', 'C++', 'Linux', 'Git', 'Problem Solving'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED] },
    { title: 'QA & Automation Engineer', skills: ['Python', 'Unit Testing', 'Jest', 'Git', 'Postman'], levels: [StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED] },
    { title: 'Product Security Specialist', skills: ['Linux', 'Python', 'Code Review', 'REST APIs', 'Problem Solving'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED] },
    { title: 'IoT Systems Engineer', skills: ['C++', 'Python', 'Linux', 'REST APIs', 'Problem Solving'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Big Data Engineer', skills: ['Python', 'SQL', 'Kafka', 'Cassandra', 'Linux'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED] },
    { title: 'Blockchain Developer', skills: ['Go', 'Rust', 'Problem Solving', 'Git', 'Linux'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED] },
    { title: 'Computer Vision Specialist', skills: ['Python', 'OpenCV', 'PyTorch', 'Deep Learning', 'C++'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE] },
    { title: 'NLP Engineer', skills: ['Python', 'Natural Language Processing', 'PyTorch', 'Large Language Models', 'TensorFlow'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Technical Product Manager', skills: ['Agile/Scrum', 'Jira', 'Communication', 'Team Leadership', 'Problem Solving'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.EXPERT, StudentSkillLevel.ADVANCED, StudentSkillLevel.EXPERT] },
    { title: 'UI/UX Technologist', skills: ['React', 'CSS3', 'Tailwind CSS', 'HTML5', 'Presentation'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Systems Software Engineer', skills: ['C', 'C++', 'Linux', 'Linux Bash', 'Git'], levels: [StudentSkillLevel.EXPERT, StudentSkillLevel.ADVANCED, StudentSkillLevel.EXPERT, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Network Engineer', skills: ['Linux', 'Python', 'Problem Solving', 'Git', 'Agile/Scrum'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE] },
    { title: 'Solutions Architect', skills: ['AWS', 'Microservices', 'Docker', 'REST APIs', 'Communication'], levels: [StudentSkillLevel.EXPERT, StudentSkillLevel.EXPERT, StudentSkillLevel.ADVANCED, StudentSkillLevel.EXPERT, StudentSkillLevel.ADVANCED] },
    { title: 'Game Developer', skills: ['C++', 'C#', 'Problem Solving', 'Git', 'Unit Testing'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED] },
    { title: 'Bioinformatician', skills: ['Python', 'R', 'Pandas', 'Linux', 'Problem Solving'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED] },
    { title: 'Robotics Software Engineer', skills: ['C++', 'Python', 'Linux', 'Computer Vision', 'Problem Solving'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED] },
    { title: 'Enterprise Integration Specialist', skills: ['Java', 'Spring Boot', 'REST APIs', 'Kafka', 'MySQL'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED] },
    { title: 'Data Governance Specialist', skills: ['SQL', 'PostgreSQL', 'Problem Solving', 'Communication', 'Technical Writing'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED] },
    { title: 'Cloud Security Engineer', skills: ['AWS', 'Linux', 'Docker', 'Python', 'Problem Solving'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.ADVANCED] },
    { title: 'Node.js Backend Engineer', skills: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'Redis'], levels: [StudentSkillLevel.ADVANCED, StudentSkillLevel.ADVANCED, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE, StudentSkillLevel.INTERMEDIATE] },
  ];

  const seededRoles: CareerRole[] = [];

  for (const r of careerRolesData) {
    const slug = r.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const [role] = await CareerRole.findOrCreate({
      where: { slug },
      defaults: {
        title: r.title,
        slug,
        description: `Professional career track for ${r.title} requiring strong competencies in core technologies and engineering paradigms.`,
      },
    });
    seededRoles.push(role);

    for (let i = 0; i < r.skills.length; i++) {
      const sName = r.skills[i];
      const sModel = skillRegistry[sName];
      if (sModel) {
        await CareerRoleSkill.findOrCreate({
          where: { careerRoleId: role.id, skillId: sModel.id },
          defaults: {
            careerRoleId: role.id,
            skillId: sModel.id,
            requiredLevel: r.levels[i] || StudentSkillLevel.INTERMEDIATE,
            importanceWeight: 5 - i,
          },
        });
      }
    }
  }

  console.log(`  ✓ Seeded ${seededRoles.length} Career Roles with required skill profiles`);

  // ============================================================================
  // 7. ASSESSMENTS & QUESTIONS (25 Assessments)
  // ============================================================================
  console.log('\n[7/12] Seeding Technical Assessments & Multiple-Choice Questions (25 Assessments)...');

  const assessmentTopics = [
    { skill: 'Java', title: 'Java Backend & Concurrency Assessment' },
    { skill: 'Python', title: 'Python Programming & Data Structures' },
    { skill: 'React', title: 'React & Modern Frontend Architecture' },
    { skill: 'Node.js', title: 'Node.js & Asynchronous Systems' },
    { skill: 'SQL', title: 'Relational Database Design & SQL Performance' },
    { skill: 'Machine Learning', title: 'Machine Learning Algorithms & Evaluation' },
    { skill: 'Docker', title: 'Docker & Containerization Best Practices' },
    { skill: 'AWS', title: 'Cloud Architecture with AWS' },
    { skill: 'REST APIs', title: 'RESTful API Design & Security' },
    { skill: 'Problem Solving', title: 'Data Structures & Algorithmic Complexity' },
    { skill: 'Linux', title: 'Linux System Administration & Shell Scripting' },
    { skill: 'Git', title: 'Git & Collaborative Version Control' },
    { skill: 'TypeScript', title: 'TypeScript Fundamentals & Advanced Types' },
    { skill: 'Deep Learning', title: 'Deep Learning & Neural Networks' },
    { skill: 'Microservices', title: 'Microservices & Distributed Architecture' },
    { skill: 'CI/CD', title: 'DevOps & Continuous Delivery (CI/CD)' },
    { skill: 'Spring Boot', title: 'Spring Boot Enterprise Applications' },
    { skill: 'PostgreSQL', title: 'PostgreSQL Internals & Query Optimization' },
    { skill: 'Natural Language Processing', title: 'Natural Language Processing Fundamentals' },
    { skill: 'Kubernetes', title: 'Kubernetes Cluster Orchestration' },
    { skill: 'Computer Vision', title: 'Computer Vision & Image Processing' },
    { skill: 'Kafka', title: 'Apache Kafka Event Streaming' },
    { skill: 'Redis', title: 'Redis In-Memory Caching & Data Structures' },
    { skill: 'Unit Testing', title: 'Software Testing & Quality Assurance' },
    { skill: 'Agile/Scrum', title: 'Agile & Scrum Methodologies' },
  ];

  const seededAssessments: SkillAssessment[] = [];

  for (const a of assessmentTopics) {
    const sModel = skillRegistry[a.skill];
    if (!sModel) continue;

    const [assessment] = await SkillAssessment.findOrCreate({
      where: { skillId: sModel.id },
      defaults: {
        skillId: sModel.id,
        title: a.title,
        description: `Evaluates production-grade conceptual clarity, problem-solving, and practical knowledge of ${a.skill}.`,
        difficulty: 'Intermediate',
        durationMinutes: 30,
        passingScore: 70,
        totalQuestions: 4,
        isActive: true,
      },
    });

    seededAssessments.push(assessment);

    const questions = [
      {
        question: `What is the primary architectural advantage of using ${a.skill} in modern scalable applications?`,
        options: { A: 'Higher throughput and performance', B: 'Zero memory allocation', C: 'Complete immunity to bugs', D: 'Bypasses network latency' },
        correctAnswer: 'A',
      },
      {
        question: `Which fundamental principle is recommended when designing systems with ${a.skill}?`,
        options: { A: 'Monolithic single-state', B: 'Separation of concerns and modularity', C: 'Global mutable variables', D: 'Ignoring error states' },
        correctAnswer: 'B',
      },
      {
        question: `How does ${a.skill} handle concurrency and high loads under production conditions?`,
        options: { A: 'Single global mutex lock', B: 'Efficient asynchronous or thread-pooled execution', C: 'Crashing on excess requests', D: 'Dropping all incoming sockets' },
        correctAnswer: 'B',
      },
      {
        question: `Which best practice ensures maintainability and fault tolerance in ${a.skill}?`,
        options: { A: 'Comprehensive logging, tests, and circuit breakers', B: 'Never writing automated tests', C: 'Hardcoding database passwords', D: 'Silently discarding errors' },
        correctAnswer: 'A',
      },
    ];

    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const q = questions[qIdx];
      await AssessmentQuestion.findOrCreate({
        where: { assessmentId: assessment.id, order: qIdx + 1 },
        defaults: {
          assessmentId: assessment.id,
          question: q.question,
          questionType: AssessmentQuestionType.MULTIPLE_CHOICE,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: 25,
          order: qIdx + 1,
        },
      });
    }
  }

  console.log(`  ✓ Seeded ${seededAssessments.length} Technical Assessments with questions`);

  // ============================================================================
  // 8. STUDENTS & DETAILED PROFILES (60 Students)
  // ============================================================================
  console.log('\n[8/12] Seeding 60 Student Profiles with Education & Career Goals...');

  const studentFirstNames = [
    'Aarav', 'Rohan', 'Ananya', 'Siddharth', 'Priya', 'Vikram', 'Neha', 'Aditya', 'Sneha', 'Karan',
    'Pooja', 'Rahul', 'Kavita', 'Manav', 'Shreya', 'Tanmay', 'Divya', 'Arjun', 'Meera', 'Yash',
    'Ritu', 'Alok', 'Swati', 'Harish', 'Deepa', 'Mohit', 'Nidhi', 'Varun', 'Preeti', 'Gaurav',
    'Payal', 'Kunal', 'Sonalika', 'Tarun', 'Isha', 'Pranav', 'Barkha', 'Nitin', 'Ankita', 'Chetan',
    'Rashi', 'Mayank', 'Radhika', 'Harsh', 'Sonam', 'Saurabh', 'Lavanya', 'Kartik', 'Smita', 'Abhishek',
    'Pallavi', 'Nikhil', 'Urvashi', 'Vivek', 'Gayatri', 'Sagarika', 'Aman', 'Riddhi', 'Raghav', 'Mansi'
  ];

  const studentLastNames = [
    'Sharma', 'Mehta', 'Iyer', 'Nair', 'Sen', 'Patel', 'Gupta', 'Verma', 'Reddy', 'Joshi',
    'Rao', 'Deshmukh', 'Saxena', 'Bhatt', 'Kulkarni', 'Choudhary', 'Singh', 'Pillai', 'Khandelwal', 'Mukherjee',
    'Mishra', 'Ganguly', 'Venkatesh', 'Menon', 'Agarwal', 'Kapoor', 'Tiwari', 'Nambiar', 'Jain', 'Hegde',
    'Das', 'Ghosh', 'Bajaj', 'Malhotra', 'Kulkarni', 'Sethi', 'Goyal', 'Paul', 'Chauhan', 'Srivastava',
    'Mathur', 'Dave', 'Vardhan', 'Wangchuk', 'Pandey', 'Sundaram', 'Soni', 'Biswas', 'Sengupta', 'Patil',
    'Somani', 'Bhardwaj', 'Chawla', 'Mohan', 'Das', 'Parekh', 'Trivedi', 'Singhal', 'Goswami', 'Natarajan'
  ];

  const seededStudents: StudentProfile[] = [];

  for (let i = 0; i < 60; i++) {
    const fName = studentFirstNames[i];
    const lName = studentLastNames[i];
    const email = i === 0 ? 'demo.student@sih.gov.in' : `student.${fName.toLowerCase()}.${lName.toLowerCase()}${i}@sih.gov.in`;
    const inst = seededInstitutions[i % seededInstitutions.length];
    const careerRole = seededRoles[i % seededRoles.length];

    const [user] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstName: fName,
        lastName: lName,
        email,
        passwordHash,
        role: UserRole.STUDENT,
        isVerified: true,
        isActive: true,
      },
    });

    const sem = 4 + (i % 5); // 4, 5, 6, 7, 8
    const gradYear = 2026 - Math.floor(sem / 7);
    const cgpa = Number((7.0 + (i * 0.43) % 2.8).toFixed(2)); // realistic 7.0 - 9.8

    const [profile] = await StudentProfile.findOrCreate({
      where: { userId: user.id },
      defaults: {
        userId: user.id,
        studentId: `${inst.aisheCode || 'INST'}-2022-${1000 + i}`,
        headline: `Aspiring ${careerRole.title} | ${inst.institutionName}`,
        bio: `Undergraduate student passionate about building real-world distributed systems, web architectures, and cloud solutions.`,
        collegeName: inst.institutionName,
        department: i % 2 === 0 ? 'Computer Science & Engineering' : 'Information Technology',
        course: 'B.Tech',
        specialization: 'Software Engineering & Data Systems',
        currentSemester: sem,
        graduationYear: gradYear,
        cgpa,
        careerGoal: careerRole.title,
        availabilityStatus: 'AVAILABLE',
        profileCompletion: 85 + (i % 15),
        location: `${inst.city}, India`,
        city: inst.city,
        state: inst.state,
        country: 'India',
      },
    });

    seededStudents.push(profile);

    // Education
    await StudentEducation.findOrCreate({
      where: { studentId: profile.id, institutionName: inst.institutionName },
      defaults: {
        studentId: profile.id,
        institutionName: inst.institutionName,
        degree: 'Bachelor of Technology (B.Tech)',
        fieldOfStudy: profile.department || 'Computer Science & Engineering',
        startYear: 2022,
        endYear: gradYear,
        grade: `${cgpa} CGPA`,
        description: 'Relevant Coursework: Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks.',
      },
    });

    // Career Interest
    await StudentCareerInterest.findOrCreate({
      where: { studentId: profile.id, careerRoleId: careerRole.id },
      defaults: {
        studentId: profile.id,
        careerRoleId: careerRole.id,
        priorityOrder: 1,
      },
    });

    // Assign 5 realistic skills to each student
    const sampleSkills = ['Java', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'React', 'Node.js', 'Docker', 'AWS', 'Problem Solving', 'Git', 'Linux'];
    const assignedSkillNames = [sampleSkills[i % sampleSkills.length], sampleSkills[(i + 2) % sampleSkills.length], sampleSkills[(i + 4) % sampleSkills.length], sampleSkills[(i + 6) % sampleSkills.length], sampleSkills[(i + 8) % sampleSkills.length]];

    for (let sIdx = 0; sIdx < assignedSkillNames.length; sIdx++) {
      const sName = assignedSkillNames[sIdx];
      const sModel = skillRegistry[sName];
      if (sModel) {
        const skillScore = 55 + ((i * 7 + sIdx * 11) % 40); // 55 - 95
        const skillLevel = skillScore >= 85 ? StudentSkillLevel.ADVANCED : skillScore >= 70 ? StudentSkillLevel.INTERMEDIATE : StudentSkillLevel.BEGINNER;

        await StudentSkill.findOrCreate({
          where: { studentId: profile.id, skillId: sModel.id },
          defaults: {
            studentId: profile.id,
            skillId: sModel.id,
            level: skillLevel,
            score: skillScore,
            verified: skillScore >= 75,
            yearsOfExperience: 1 + (sIdx % 3),
            lastAssessedAt: skillScore >= 75 ? new Date() : null,
          },
        });
      }
    }
  }

  console.log(`  ✓ Seeded ${seededStudents.length} Students with Education, Career Interests, and Skills`);

  // ============================================================================
  // 9. STUDENT ASSESSMENTS & SKILL GAPS (75 Attempts, 80 Gaps)
  // ============================================================================
  console.log('\n[9/12] Seeding Assessment Attempts and Relational Skill Gaps...');

  // 75 Assessment Attempts
  let attemptCount = 0;
  for (let i = 0; i < 75; i++) {
    const student = seededStudents[i % seededStudents.length];
    const assessment = seededAssessments[i % seededAssessments.length];

    const score = 50 + ((i * 13) % 46); // 50 to 95%

    const [attempt] = await AssessmentAttempt.findOrCreate({
      where: { assessmentId: assessment.id, studentId: student.id },
      defaults: {
        assessmentId: assessment.id,
        studentId: student.id,
        startedAt: new Date(Date.now() - 86400000 * (i + 1)),
        completedAt: new Date(Date.now() - 86400000 * (i + 1) + 1800000),
        score,
        percentage: score,
        status: AssessmentAttemptStatus.COMPLETED,
      },
    });

    attemptCount++;

    // Answers
    const questions = await AssessmentQuestion.findAll({ where: { assessmentId: assessment.id } });
    for (const q of questions) {
      const isCorrect = Math.random() < (score / 100);
      await AssessmentAnswer.findOrCreate({
        where: { attemptId: attempt.id, questionId: q.id },
        defaults: {
          attemptId: attempt.id,
          questionId: q.id,
          answer: isCorrect ? q.correctAnswer : 'C',
          isCorrect,
          pointsEarned: isCorrect ? 25 : 0,
        },
      });
    }
  }

  console.log(`  ✓ Seeded ${attemptCount} Assessment Attempts with detailed questions and answers`);

  // 80 Skill Gaps
  let gapCount = 0;
  for (let i = 0; i < 80; i++) {
    const student = seededStudents[i % seededStudents.length];
    const role = seededRoles[i % seededRoles.length];
    const gapSkillNames = ['Microservices', 'Docker', 'AWS', 'Kubernetes', 'Redis', 'Kafka', 'CI/CD', 'Git'];
    const sName = gapSkillNames[i % gapSkillNames.length];
    const sModel = skillRegistry[sName];

    if (sModel) {
      const currentScore = 30 + ((i * 7) % 35);
      const requiredScore = 80;
      const gapScore = requiredScore - currentScore;

      await SkillGap.findOrCreate({
        where: { studentId: student.id, skillId: sModel.id },
        defaults: {
          studentId: student.id,
          skillId: sModel.id,
          targetRoleId: role.id,
          currentLevel: StudentSkillLevel.BEGINNER,
          requiredLevel: StudentSkillLevel.ADVANCED,
          currentScore,
          requiredScore,
          gapScore,
          priority: gapScore > 35 ? SkillGapPriority.HIGH : SkillGapPriority.MEDIUM,
          status: i % 4 === 0 ? SkillGapStatus.RESOLVED : i % 2 === 0 ? SkillGapStatus.IN_PROGRESS : SkillGapStatus.OPEN,
        },
      });

      gapCount++;
    }
  }

  console.log(`  ✓ Seeded ${gapCount} Skill Gaps tied to students and career roles`);

  // ============================================================================
  // 10. OPPORTUNITIES (35 Jobs, 35 Internships, 25 Projects = 95 Opportunities)
  // ============================================================================
  console.log('\n[10/12] Seeding Opportunities (35 Jobs, 35 Internships, 25 Projects = 95 total)...');

  const seededJobs: Job[] = [];
  const seededInternships: Internship[] = [];
  const seededProjects: Project[] = [];

  // 35 Jobs
  for (let i = 0; i < 35; i++) {
    const ind = seededIndustries[i % seededIndustries.length];
    const role = seededRoles[i % seededRoles.length];

    const [job] = await Job.findOrCreate({
      where: { industryId: ind.id, title: `${role.title} - Engineering Team` },
      defaults: {
        industryId: ind.id,
        title: `${role.title} - Engineering Team`,
        description: `Join our high-velocity team as a ${role.title}. You will design, build, and optimize enterprise-scale systems and microservices.`,
        requirements: 'Strong problem-solving, mastery of data structures, proven project experience, and solid team communication.',
        location: ind.location,
        city: ind.city,
        state: 'India',
        workplaceType: i % 3 === 0 ? WorkplaceType.REMOTE : i % 2 === 0 ? WorkplaceType.HYBRID : WorkplaceType.ON_SITE,
        employmentType: EmploymentType.FULL_TIME,
        salaryMin: 800000 + (i % 6) * 150000,
        salaryMax: 1500000 + (i % 8) * 200000,
        applicationDeadline: new Date('2026-12-31'),
        openings: 2 + (i % 4),
        status: OpportunityStatus.OPEN,
      },
    });
    seededJobs.push(job);
  }

  // 35 Internships
  for (let i = 0; i < 35; i++) {
    const ind = seededIndustries[i % seededIndustries.length];
    const role = seededRoles[(i + 3) % seededRoles.length];

    const [internship] = await Internship.findOrCreate({
      where: { industryId: ind.id, title: `${role.title} Intern` },
      defaults: {
        industryId: ind.id,
        title: `${role.title} Intern`,
        description: `Exciting 6-month hands-on engineering internship working alongside senior architects on production codebases.`,
        requirements: 'Demonstrated coursework or personal projects in relevant frameworks, enthusiasm to learn, and strong foundation in algorithms.',
        durationMonths: 6,
        stipend: 35000 + (i % 5) * 5000,
        workplaceType: i % 3 === 0 ? WorkplaceType.REMOTE : WorkplaceType.HYBRID,
        location: ind.location,
        openings: 3 + (i % 5),
        applicationDeadline: new Date('2026-11-30'),
        startDate: new Date('2026-07-01'),
        status: OpportunityStatus.OPEN,
      },
    });
    seededInternships.push(internship);
  }

  // 25 Projects
  for (let i = 0; i < 25; i++) {
    const ind = seededIndustries[i % seededIndustries.length];
    const projectTitles = [
      'Campus Recruitment Intelligence Portal',
      'Autonomous Drone Fleet Management Protocol',
      'Decentralized Credential Verification System',
      'Healthcare Telemetry & Real-Time Alert Engine',
      'Clean Energy Consumption Forecasting Model',
      'Smart Agriculture Soil Moisture IoT Hub',
      'Microservices Latency Tracer & Optimizer',
      'Automated Vulnerability Scanner for CI/CD',
      'Multimodal Video Summarization Pipeline',
      'Enterprise Document Retrieval Augmented Generation'
    ];

    const title = `${projectTitles[i % projectTitles.length]} Phase ${Math.floor(i / 10) + 1}`;

    const [project] = await Project.findOrCreate({
      where: { industryId: ind.id, title },
      defaults: {
        industryId: ind.id,
        title,
        description: `Industry-sponsored live engineering project solving real-world challenges with cutting-edge software paradigms.`,
        deliverables: 'Functional prototype, comprehensive documentation, test suite with >80% coverage, and live demonstration.',
        durationWeeks: 12 + (i % 8),
        budget: 150000 + (i % 10) * 25000,
        status: OpportunityStatus.OPEN,
      },
    });
    seededProjects.push(project);
  }

  console.log(`  ✓ Seeded 95 Opportunities: ${seededJobs.length} Jobs, ${seededInternships.length} Internships, ${seededProjects.length} Projects`);

  // ============================================================================
  // 11. LEARNING PROGRAMS & RECOMMENDATIONS (25 Programs, 50 Recs)
  // ============================================================================
  console.log('\n[11/12] Seeding Learning Programs and Recommendations...');

  const learningProgramData = [
    { title: 'Enterprise Java & Spring Microservices Mastery', mode: 'ONLINE', hours: 40 },
    { title: 'Full Stack Web Development with React & Node.js', mode: 'HYBRID', hours: 60 },
    { title: 'Cloud-Native Engineering with Docker & Kubernetes', mode: 'ONLINE', hours: 35 },
    { title: 'Practical Deep Learning & Applied LLMs', mode: 'HYBRID', hours: 50 },
    { title: 'Relational Database Performance Tuning with MySQL & Postgres', mode: 'ONLINE', hours: 25 },
    { title: 'Zero Trust Cybersecurity Architectures', mode: 'ONLINE', hours: 30 },
    { title: 'Modern DevOps: CI/CD Pipelines with GitHub Actions', mode: 'ONLINE', hours: 20 },
    { title: 'Event-Driven Systems with Apache Kafka', mode: 'HYBRID', hours: 30 },
    { title: 'High-Performance Python & Scalable Data Pipelines', mode: 'ONLINE', hours: 45 },
    { title: 'IoT Edge Computing & Sensor Integration', mode: 'IN_PERSON', hours: 40 },
  ];

  for (let i = 0; i < 25; i++) {
    const pData = learningProgramData[i % learningProgramData.length];
    const ind = seededIndustries[i % seededIndustries.length];
    const inst = seededInstitutions[i % seededInstitutions.length];

    await LearningProgram.findOrCreate({
      where: { title: `${pData.title} (Cohort ${Math.floor(i / 10) + 1})` },
      defaults: {
        industryId: ind.id,
        institutionId: inst.id,
        title: `${pData.title} (Cohort ${Math.floor(i / 10) + 1})`,
        description: `Comprehensive industry-curated curriculum designed to bridge academic theory and production-grade engineering practices.`,
        curriculum: 'Module 1: Foundations, Module 2: Advanced Architecture, Module 3: Hands-on Capstone, Module 4: Industry Evaluation.',
        durationHours: pData.hours,
        mode: pData.mode,
        cost: 0,
        status: OpportunityStatus.OPEN,
      },
    });
  }

  // 50 Learning Recommendations
  for (let i = 0; i < 50; i++) {
    const student = seededStudents[i % seededStudents.length];
    const skill = Object.values(skillRegistry)[i % Object.values(skillRegistry).length];

    await LearningRecommendation.findOrCreate({
      where: { studentId: student.id, skillId: skill.id },
      defaults: {
        studentId: student.id,
        skillId: skill.id,
        title: `Master ${skill.name} for Industry Readiness`,
        resourceUrl: `https://learn.sih.gov.in/modules/${skill.slug}`,
        provider: i % 2 === 0 ? 'NPTEL / SWAYAM' : 'Industry Certification Lab',
        duration: '4 Weeks',
        cost: 0,
        priority: i % 3 === 0 ? SkillGapPriority.HIGH : SkillGapPriority.MEDIUM,
      },
    });
  }

  console.log(`  ✓ Seeded 25 Learning Programs and 50 Student Learning Recommendations`);

  // ============================================================================
  // 12. APPLICATIONS, MATCHING, COLLABORATIONS & NOTIFICATIONS (150 Apps)
  // ============================================================================
  console.log('\n[12/12] Seeding 150 Applications, Opportunity Matches, Collaborations & Notifications...');

  const appStatuses = [
    ApplicationStatus.APPLIED,
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.SELECTED,
    ApplicationStatus.REJECTED,
  ];

  let appCount = 0;
  for (let i = 0; i < 150; i++) {
    const student = seededStudents[i % seededStudents.length];
    const opp = i % 2 === 0 ? seededJobs[i % seededJobs.length] : seededInternships[i % seededInternships.length];
    const oppType = i % 2 === 0 ? 'JOB' : 'INTERNSHIP';
    const status = appStatuses[i % appStatuses.length];

    const matchScore = Number((55 + ((i * 7 + 13) % 43)).toFixed(1)); // 55.0 to 97.0%

    const [app] = await Application.findOrCreate({
      where: { studentId: student.id, opportunityId: opp.id, opportunityType: oppType },
      defaults: {
        studentId: student.id,
        opportunityId: opp.id,
        opportunityType: oppType,
        status,
        coverLetter: `I am thrilled to submit my application for this role. My technical skill profile and academic background align strongly with your requirements.`,
        resumeUrl: `https://storage.sih.gov.in/resumes/${student.id}.pdf`,
        matchScore,
        appliedAt: new Date(Date.now() - 86400000 * (i + 2)),
      },
    });

    appCount++;

    // History
    await ApplicationStatusHistory.findOrCreate({
      where: { applicationId: app.id, toStatus: status },
      defaults: {
        applicationId: app.id,
        fromStatus: null,
        toStatus: status,
        changedByUserId: student.userId,
        reason: `Status transitioned to ${status}`,
      },
    });

    // Opportunity Match with 5-Factor formula breakdown
    await OpportunityMatch.findOrCreate({
      where: { studentId: student.id, opportunityId: opp.id, opportunityType: oppType },
      defaults: {
        studentId: student.id,
        opportunityId: opp.id,
        opportunityType: oppType,
        matchScore,
        breakdown: {
          skillScore: Math.min(100, matchScore + 2),
          careerScore: 85,
          experienceScore: 70,
          assessmentScore: Math.min(100, matchScore - 3),
          preferenceScore: 90,
          weights: '50% Skill, 20% Career, 10% Exp, 10% Assess, 10% Pref',
        },
      },
    });
  }

  console.log(`  ✓ Seeded ${appCount} Applications with status histories and 5-factor match score breakdowns`);

  // 20 Collaborations and 25 Workshops
  for (let i = 0; i < 20; i++) {
    const ind = seededIndustries[i % seededIndustries.length];
    const inst = seededInstitutions[i % seededInstitutions.length];

    const [collab] = await Collaboration.findOrCreate({
      where: { industryId: ind.id, institutionId: inst.id, title: `${ind.companyName} & ${inst.institutionName} Strategic Initiative` },
      defaults: {
        industryId: ind.id,
        institutionId: inst.id,
        title: `${ind.companyName} & ${inst.institutionName} Strategic Initiative`,
        collaborationType: CollaborationType.WORKSHOP,
        description: 'Industry-academia partnership enabling experiential learning, live problem statements, and talent shortlisting.',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: CollaborationStatus.APPROVED,
      },
    });

    await Workshop.findOrCreate({
      where: { collaborationId: collab.id, topic: `Architecting Cloud Native Systems: ${ind.companyName}` },
      defaults: {
        collaborationId: collab.id,
        topic: `Architecting Cloud Native Systems: ${ind.companyName}`,
        speakerName: ind.companyName + ' Tech Lead',
        speakerDesignation: 'Principal Solutions Architect',
        date: new Date('2026-09-20'),
        durationHours: 6,
        venue: `${inst.institutionName} Auditorium & Live Stream`,
        attendeesCount: 150 + (i % 50),
      },
    });
  }

  console.log(`  ✓ Seeded 20 Industry-Institution Collaborations and 20 Technical Workshops`);

  // 80 Notifications
  const notifTypes = [
    NotificationType.NEW_OPPORTUNITY,
    NotificationType.APPLICATION_SUBMITTED,
    NotificationType.SHORTLISTED,
    NotificationType.INTERVIEW_SCHEDULED,
    NotificationType.STUDENT_SELECTED,
    NotificationType.SKILL_GAP_DETECTED,
    NotificationType.LEARNING_RECOMMENDATION,
    NotificationType.MENTORSHIP_ACCEPTED,
  ];

  for (let i = 0; i < 80; i++) {
    const student = seededStudents[i % seededStudents.length];
    const nType = notifTypes[i % notifTypes.length];

    await Notification.findOrCreate({
      where: { userId: student.userId, type: nType, title: `Update regarding ${nType.replace(/_/g, ' ')}` },
      defaults: {
        userId: student.userId,
        type: nType,
        title: `Update regarding ${nType.replace(/_/g, ' ')}`,
        message: `Your profile has received an official platform update. Review your dashboard for detailed actions.`,
        isRead: i % 3 === 0,
        readAt: i % 3 === 0 ? new Date() : null,
      },
    });
  }

  console.log(`  ✓ Seeded 80 Notifications for students and recruiters`);

  console.log('\n================================================================');
  console.log('  R5 REALISTIC DEMO DATA POPULATION COMPLETED SUCCESSFULLY!');
  console.log('================================================================\n');

  return {
    success: true,
    summary: {
      institutions: seededInstitutions.length,
      industries: seededIndustries.length,
      academicians: seededAcademicians.length,
      mentors: allMentorUserIds.length,
      skills: Object.keys(skillRegistry).length,
      careerRoles: seededRoles.length,
      assessments: seededAssessments.length,
      students: seededStudents.length,
      attempts: attemptCount,
      skillGaps: gapCount,
      opportunities: seededJobs.length + seededInternships.length + seededProjects.length,
      applications: appCount,
    },
  };
}

if (require.main === module) {
  runR5Seed()
    .then((res) => {
      console.log('Result:', JSON.stringify(res.summary, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('R5 Seeding error:', err);
      process.exit(1);
    });
}
