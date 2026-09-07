import assert from 'assert';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import '../models';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioProject } from '../models/portfolio-project.model';
import { PortfolioCertification } from '../models/portfolio-certification.model';
import { PortfolioAchievement } from '../models/portfolio-achievement.model';
import { PortfolioExperience } from '../models/portfolio-experience.model';
import { PortfolioDocument } from '../models/portfolio-document.model';
import { Mentor } from '../models/mentor.model';
import { MentorshipRequest } from '../models/mentorship-request.model';
import { MentorshipSession } from '../models/mentorship-session.model';
import { Document } from '../models/document.model';
import { DocumentAccess } from '../models/document-access.model';
import { UserRole } from '../constants/roles';
import { MentorshipStatus, DocumentAccessLevel } from '../constants/enums';
import { portfolioService } from '../services/portfolio.service';
import { mentorshipService } from '../services/mentorship.service';
import { documentService } from '../services/document.service';

export const runPhase12Tests = async () => {
  console.log('\n================================================================');
  console.log('STARTING PHASE 12 MENTORSHIP, PORTFOLIO & DOCUMENT TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    Error: ${err.message}`);
      if (err.stack) {
        console.error(err.stack);
      }
      failed++;
    }
  };

  const hash = await bcrypt.hash('Phase12Pass123!', 10);

  // 1. Student User A & Profile
  const userStudA = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Isha',
    lastName: 'Sharma',
    email: `isha.phase12.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const profileStudA = await StudentProfile.create({
    userId: userStudA.id,
    collegeName: 'IIT Delhi',
    course: 'B.Tech',
    department: 'Computer Science',
    graduationYear: 2025,
    profileCompletion: 85,
  });

  // 2. Student User B & Profile (for IDOR testing)
  const userStudB = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Rohan',
    lastName: 'Mehta',
    email: `rohan.phase12.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.STUDENT,
    isActive: true,
    isVerified: true,
  });

  const profileStudB = await StudentProfile.create({
    userId: userStudB.id,
    collegeName: 'IIT Bombay',
    course: 'B.Tech',
    department: 'Electrical Engineering',
    graduationYear: 2024,
    profileCompletion: 70,
  });

  // 3. Mentor User 1 (Academician)
  const userMentor1 = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Dr. Vikram',
    lastName: 'Sarabhai',
    email: `vikram.phase12.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.ACADEMICIAN,
    isActive: true,
    isVerified: true,
  });

  // 4. Mentor User 2 (Industry)
  const userMentor2 = await User.create({
    uuid: crypto.randomUUID(),
    firstName: 'Nandan',
    lastName: 'Nilekani',
    email: `nandan.phase12.${Date.now()}@example.com`,
    passwordHash: hash,
    role: UserRole.INDUSTRY,
    isActive: true,
    isVerified: true,
  });

  // Test state IDs
  let portfolioAId = 0;
  let projectId = 0;
  let certId = 0;
  let achieveId = 0;
  let expId = 0;
  let portDocId = 0;

  let mentor1Id = 0;
  let mentor2Id = 0;
  let mentorshipReqId = 0;
  let sessionId = 0;

  let document1Id = 0;
  let documentUploadId = 0;

  try {
    // ----------------------------------------------------
    // 1. Portfolio & Portfolio Sub-Entities
    // ----------------------------------------------------
    console.log('\n--- 1. Portfolio & Portfolio Child Entities ---');

    await test('Student A creates portfolio', async () => {
      const portfolio = await portfolioService.createPortfolio(userStudA.id, {
        customDomain: `isha-${Date.now()}.dev`,
        theme: 'minimalist',
        isPublished: false,
      });

      assert.ok(portfolio.id);
      assert.strictEqual(portfolio.studentId, profileStudA.id);
      assert.strictEqual(portfolio.theme, 'minimalist');
      assert.strictEqual(portfolio.isPublished, false);
      portfolioAId = portfolio.id;
    });

    await test('Reject duplicate portfolio creation for same student', async () => {
      let errorCaught = false;
      try {
        await portfolioService.createPortfolio(userStudA.id, {
          theme: 'dark',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Student A retrieves own portfolio', async () => {
      const portfolio = await portfolioService.getPortfolio(userStudA.id);
      assert.strictEqual(portfolio.id, portfolioAId);
    });

    await test('Student A updates portfolio settings (publish)', async () => {
      const updated = await portfolioService.updatePortfolio(userStudA.id, {
        isPublished: true,
        theme: 'cyberpunk',
      });
      assert.strictEqual(updated.isPublished, true);
      assert.strictEqual(updated.theme, 'cyberpunk');
    });

    await test('Public/Authenticated view of published portfolio by student ID', async () => {
      const portfolio = await portfolioService.getPortfolioByStudentId(profileStudA.id, userStudB.id);
      assert.strictEqual(portfolio.id, portfolioAId);
      assert.strictEqual(portfolio.theme, 'cyberpunk');
    });

    await test('Student A unpublishes portfolio; Student B view is rejected', async () => {
      await portfolioService.updatePortfolio(userStudA.id, {
        isPublished: false,
      });

      let errorCaught = false;
      try {
        await portfolioService.getPortfolioByStudentId(profileStudA.id, userStudB.id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    // Sub-Entity: Projects
    await test('Student A adds a Portfolio Project', async () => {
      const project = await portfolioService.addProject(userStudA.id, {
        title: 'Distributed Vector Database',
        description: 'High performance HNSW indexing in C++ with Python bindings.',
        role: 'Lead Architect',
        technologies: 'C++, Python, CUDA, CMake',
        projectUrl: 'https://vectordb.example.com',
        githubUrl: 'https://github.com/isha/vectordb',
        order: 1,
      });

      assert.ok(project.id);
      assert.strictEqual(project.portfolioId, portfolioAId);
      assert.strictEqual(project.title, 'Distributed Vector Database');
      projectId = project.id;
    });

    await test('Student A lists projects and gets project by ID', async () => {
      const list = await portfolioService.getProjects(userStudA.id, 1, 10);
      assert.ok(list.projects.length >= 1);
      assert.strictEqual(list.projects[0].id, projectId);

      const project = await portfolioService.getProjectById(userStudA.id, projectId);
      assert.strictEqual(project.id, projectId);
      assert.strictEqual(project.role, 'Lead Architect');
    });

    await test('Student A updates project', async () => {
      const updated = await portfolioService.updateProject(userStudA.id, projectId, {
        role: 'Principal Engineer & Architect',
      });
      assert.strictEqual(updated.role, 'Principal Engineer & Architect');
    });

    await test('CRITICAL SECURITY: Student B cannot view or update Student A project (IDOR Protection)', async () => {
      await portfolioService.createPortfolio(userStudB.id, { theme: 'classic' });

      let errorCaughtView = false;
      try {
        await portfolioService.getProjectById(userStudB.id, projectId);
      } catch (err: any) {
        errorCaughtView = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaughtView, true);

      let errorCaughtUpdate = false;
      try {
        await portfolioService.updateProject(userStudB.id, projectId, {
          title: 'Tampered Title',
        });
      } catch (err: any) {
        errorCaughtUpdate = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaughtUpdate, true);
    });

    // Sub-Entity: Certifications
    await test('Student A manages Portfolio Certification', async () => {
      const cert = await portfolioService.addCertification(userStudA.id, {
        title: 'AWS Certified Solutions Architect - Professional',
        issuer: 'Amazon Web Services',
        issueDate: '2024-02-10',
        credentialUrl: 'https://aws.amazon.com/verify/cert123',
        order: 1,
      });

      assert.ok(cert.id);
      assert.strictEqual(cert.issuer, 'Amazon Web Services');
      certId = cert.id;

      const fetched = await portfolioService.getCertificationById(userStudA.id, certId);
      assert.strictEqual(fetched.id, certId);

      const updated = await portfolioService.updateCertification(userStudA.id, certId, {
        title: 'AWS Certified Solutions Architect - Professional (Recertified)',
      });
      assert.strictEqual(updated.title, 'AWS Certified Solutions Architect - Professional (Recertified)');

      // IDOR test
      let errorCaught = false;
      try {
        await portfolioService.getCertificationById(userStudB.id, certId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // Sub-Entity: Achievements
    await test('Student A manages Portfolio Achievement', async () => {
      const item = await portfolioService.addAchievement(userStudA.id, {
        title: '1st Place - Smart India Hackathon Grand Finale',
        description: 'National champions in the hardware/software innovation category.',
        date: '2023-12-20',
        order: 1,
      });

      assert.ok(item.id);
      assert.strictEqual(item.title, '1st Place - Smart India Hackathon Grand Finale');
      achieveId = item.id;

      const fetched = await portfolioService.getAchievementById(userStudA.id, achieveId);
      assert.strictEqual(fetched.id, achieveId);

      const updated = await portfolioService.updateAchievement(userStudA.id, achieveId, {
        description: 'National champions in the skill intelligence innovation category.',
      });
      assert.strictEqual(updated.description, 'National champions in the skill intelligence innovation category.');

      // IDOR test
      let errorCaught = false;
      try {
        await portfolioService.getAchievementById(userStudB.id, achieveId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // Sub-Entity: Experiences
    await test('Student A manages Portfolio Experience', async () => {
      const exp = await portfolioService.addExperience(userStudA.id, {
        title: 'Systems Research Intern',
        organization: 'Microsoft Research India',
        startDate: '2024-05-01',
        endDate: '2024-07-31',
        description: 'Worked on compiler optimizations for deep neural network kernels.',
        order: 1,
      });

      assert.ok(exp.id);
      assert.strictEqual(exp.organization, 'Microsoft Research India');
      expId = exp.id;

      const fetched = await portfolioService.getExperienceById(userStudA.id, expId);
      assert.strictEqual(fetched.id, expId);

      const updated = await portfolioService.updateExperience(userStudA.id, expId, {
        title: 'Senior Systems Research Intern',
      });
      assert.strictEqual(updated.title, 'Senior Systems Research Intern');

      // IDOR test
      let errorCaught = false;
      try {
        await portfolioService.getExperienceById(userStudB.id, expId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // Sub-Entity: Documents
    await test('Student A manages Portfolio Document link', async () => {
      const doc = await portfolioService.addDocument(userStudA.id, {
        name: 'Curriculum Vitae (Latex)',
        documentUrl: 'https://storage.example.com/docs/isha_cv.pdf',
        order: 1,
      });

      assert.ok(doc.id);
      assert.strictEqual(doc.name, 'Curriculum Vitae (Latex)');
      portDocId = doc.id;

      const fetched = await portfolioService.getDocumentById(userStudA.id, portDocId);
      assert.strictEqual(fetched.id, portDocId);

      const updated = await portfolioService.updateDocument(userStudA.id, portDocId, {
        name: 'Comprehensive Curriculum Vitae (2025)',
      });
      assert.strictEqual(updated.name, 'Comprehensive Curriculum Vitae (2025)');

      // IDOR test
      let errorCaught = false;
      try {
        await portfolioService.getDocumentById(userStudB.id, portDocId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 2. Mentorship Module Tests
    // ----------------------------------------------------
    console.log('\n--- 2. Mentorship Module Tests ---');

    await test('User Mentor 1 creates mentor profile', async () => {
      const mentor = await mentorshipService.createProfile(userMentor1.id, {
        expertiseAreas: 'Deep Learning, Computer Vision, Edge AI, Distributed Systems',
        maxMentees: 2,
        isAvailable: true,
      });

      assert.ok(mentor.id);
      assert.strictEqual(mentor.userId, userMentor1.id);
      assert.strictEqual(mentor.maxMentees, 2);
      assert.strictEqual(mentor.currentMentees, 0);
      mentor1Id = mentor.id;
    });

    await test('Reject duplicate mentor profile creation for same user', async () => {
      let errorCaught = false;
      try {
        await mentorshipService.createProfile(userMentor1.id, {
          expertiseAreas: 'Duplicate',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Mentor 1 retrieves and updates own profile', async () => {
      const mentor = await mentorshipService.getMyProfile(userMentor1.id);
      assert.strictEqual(mentor.id, mentor1Id);

      const updated = await mentorshipService.updateMyProfile(userMentor1.id, {
        expertiseAreas: 'Deep Learning, Computer Vision, High Performance Computing',
      });
      assert.strictEqual(updated.expertiseAreas, 'Deep Learning, Computer Vision, High Performance Computing');
    });

    await test('Student discovers mentors with pagination and expertise filter', async () => {
      mentor2Id = (await mentorshipService.createProfile(userMentor2.id, {
        expertiseAreas: 'Enterprise Architecture, FinTech, Public Cloud Scaling',
        maxMentees: 5,
        isAvailable: true,
      })).id;

      const res = await mentorshipService.getMentors({
        page: 1,
        limit: 10,
        expertise: 'Computer Vision',
        availableOnly: true,
      });

      assert.ok(res.mentors.length >= 1);
      assert.strictEqual(res.mentors[0].id, mentor1Id);
    });

    await test('Student A requests mentorship with Mentor 1', async () => {
      const req = await mentorshipService.createRequest(userStudA.id, {
        mentorId: mentor1Id,
        goals: 'Conduct research on sparse model training and prepare paper for NeurIPS.',
        message: 'Dear Professor, I would love your guidance on our tensor optimization work.',
      });

      assert.ok(req.id);
      assert.strictEqual(req.mentorId, mentor1Id);
      assert.strictEqual(req.studentId, profileStudA.id);
      assert.strictEqual(req.status, MentorshipStatus.REQUESTED);
      mentorshipReqId = req.id;
    });

    await test('Reject self-mentorship attempt', async () => {
      // Mock student profile on mentor user
      const mentorAsStudent = await StudentProfile.create({
        userId: userMentor1.id,
        collegeName: 'Faculty College',
        course: 'PhD',
        department: 'CS',
        graduationYear: 2020,
        profileCompletion: 50,
      });

      let errorCaught = false;
      try {
        await mentorshipService.createRequest(userMentor1.id, {
          mentorId: mentor1Id,
          goals: 'Self mentorship is impossible',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 400);
      }
      assert.strictEqual(errorCaught, true);

      await mentorAsStudent.destroy();
    });

    await test('Reject duplicate active mentorship request to same mentor', async () => {
      let errorCaught = false;
      try {
        await mentorshipService.createRequest(userStudA.id, {
          mentorId: mentor1Id,
          goals: 'Second attempt should be rejected',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Student A and Mentor 1 can view mentorship request; Student B cannot (IDOR)', async () => {
      const reqStudent = await mentorshipService.getRequestById(userStudA.id, mentorshipReqId);
      assert.strictEqual(reqStudent.id, mentorshipReqId);

      const reqMentor = await mentorshipService.getRequestById(userMentor1.id, mentorshipReqId);
      assert.strictEqual(reqMentor.id, mentorshipReqId);

      let errorCaught = false;
      try {
        await mentorshipService.getRequestById(userStudB.id, mentorshipReqId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Reject session creation before request is ACCEPTED', async () => {
      let errorCaught = false;
      try {
        await mentorshipService.createSession(userStudA.id, {
          mentorshipRequestId: mentorshipReqId,
          sessionDate: '2024-09-20',
          startTime: '10:00',
        });
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 400);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Mentor 1 accepts mentorship request (Increments currentMentees)', async () => {
      const updatedReq = await mentorshipService.respondToRequest(userMentor1.id, mentorshipReqId, {
        status: MentorshipStatus.ACCEPTED,
      });

      assert.strictEqual(updatedReq.status, MentorshipStatus.ACCEPTED);

      const mentor = await mentorshipService.getMyProfile(userMentor1.id);
      assert.strictEqual(mentor.currentMentees, 1);
    });

    await test('Create and manage Mentorship Session for accepted request', async () => {
      const session = await mentorshipService.createSession(userMentor1.id, {
        mentorshipRequestId: mentorshipReqId,
        sessionDate: '2024-09-20',
        startTime: '16:00',
        durationMinutes: 60,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notes: 'Initial roadmap review and research proposal discussion.',
      });

      assert.ok(session.id);
      assert.strictEqual(session.mentorshipRequestId, mentorshipReqId);
      assert.strictEqual(session.durationMinutes, 60);
      sessionId = session.id;

      const fetched = await mentorshipService.getSessionById(userStudA.id, sessionId);
      assert.strictEqual(fetched.id, sessionId);

      const updated = await mentorshipService.updateSession(userMentor1.id, sessionId, {
        isCompleted: true,
        notes: 'Completed roadmap review. Agreed on draft delivery by Oct 15.',
      });
      assert.strictEqual(updated.isCompleted, true);

      // IDOR test
      let errorCaught = false;
      try {
        await mentorshipService.getSessionById(userStudB.id, sessionId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    // ----------------------------------------------------
    // 3. Document & Access Control Tests
    // ----------------------------------------------------
    console.log('\n--- 3. Document & Access Control Tests ---');

    await test('User Stud A creates a private document', async () => {
      const doc = await documentService.createDocument(userStudA.id, {
        fileName: 'Confidential_AI_Research_Draft.pdf',
        fileUrl: '/uploads/confidential_draft.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 2450000,
        accessLevel: DocumentAccessLevel.PRIVATE,
      });

      assert.ok(doc.id);
      assert.strictEqual(doc.ownerUserId, userStudA.id);
      assert.strictEqual(doc.accessLevel, DocumentAccessLevel.PRIVATE);
      document1Id = doc.id;
    });

    await test('Owner Stud A can retrieve own document', async () => {
      const doc = await documentService.getDocumentById(userStudA.id, document1Id);
      assert.strictEqual(doc.id, document1Id);
      assert.ok(doc.accessibleUrl);
    });

    await test('CRITICAL SECURITY: User Stud B cannot view User Stud A private document (IDOR Protection)', async () => {
      let errorCaught = false;
      try {
        await documentService.getDocumentById(userStudB.id, document1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Owner Stud A grants access to User Stud B', async () => {
      const grant = await documentService.grantAccess(userStudA.id, document1Id, {
        granteeUserId: userStudB.id,
        canView: true,
        canEdit: false,
      });

      assert.ok(grant.id);
      assert.strictEqual(grant.documentId, document1Id);
      assert.strictEqual(grant.granteeUserId, userStudB.id);
      assert.strictEqual(grant.canView, true);
    });

    await test('User Stud B can now access shared document and see it in shared list', async () => {
      const doc = await documentService.getDocumentById(userStudB.id, document1Id);
      assert.strictEqual(doc.id, document1Id);

      const shared = await documentService.getSharedDocuments(userStudB.id, { page: 1, limit: 10 });
      assert.ok(shared.documents.length >= 1);
      assert.strictEqual(shared.documents[0].id, document1Id);
    });

    await test('Owner Stud A revokes access from User Stud B', async () => {
      const res = await documentService.revokeAccess(userStudA.id, document1Id, userStudB.id);
      assert.strictEqual(res.message, 'Access revoked successfully');

      // Stud B should be forbidden again
      let errorCaught = false;
      try {
        await documentService.getDocumentById(userStudB.id, document1Id);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 403);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Test document upload via storage abstraction', async () => {
      const uploaded = await documentService.uploadDocument(
        userStudA.id,
        {
          buffer: Buffer.from('Smart India Hackathon 2024 Project Document Payload'),
          originalname: 'Hackathon_Proposal.txt',
          mimetype: 'text/plain',
          size: 51,
        },
        DocumentAccessLevel.PRIVATE
      );

      assert.ok(uploaded.id);
      assert.strictEqual(uploaded.fileName, 'Hackathon_Proposal.txt');
      assert.ok(uploaded.fileUrl.startsWith('/uploads/'));
      documentUploadId = uploaded.id;

      // Delete uploaded document
      const delRes = await documentService.deleteDocument(userStudA.id, documentUploadId);
      assert.strictEqual(delRes.message, 'Document deleted successfully');

      let errorCaught = false;
      try {
        await documentService.getDocumentById(userStudA.id, documentUploadId);
      } catch (err: any) {
        errorCaught = true;
        assert.strictEqual(err.statusCode, 404);
      }
      assert.strictEqual(errorCaught, true);
    });

    await test('Clean up all created test entities', async () => {
      await portfolioService.deleteProject(userStudA.id, projectId);
      await portfolioService.deleteCertification(userStudA.id, certId);
      await portfolioService.deleteAchievement(userStudA.id, achieveId);
      await portfolioService.deleteExperience(userStudA.id, expId);
      await portfolioService.deleteDocument(userStudA.id, portDocId);

      await documentService.deleteDocument(userStudA.id, document1Id);
    });

  } finally {
    // Teardown test entities
    if (sessionId) await MentorshipSession.destroy({ where: { id: sessionId } });
    if (mentorshipReqId) await MentorshipRequest.destroy({ where: { id: mentorshipReqId } });
    if (mentor1Id) await Mentor.destroy({ where: { id: mentor1Id } });
    if (mentor2Id) await Mentor.destroy({ where: { id: mentor2Id } });

    if (documentUploadId) await Document.destroy({ where: { id: documentUploadId } });
    if (document1Id) await Document.destroy({ where: { id: document1Id } });

    if (projectId) await PortfolioProject.destroy({ where: { id: projectId } });
    if (certId) await PortfolioCertification.destroy({ where: { id: certId } });
    if (achieveId) await PortfolioAchievement.destroy({ where: { id: achieveId } });
    if (expId) await PortfolioExperience.destroy({ where: { id: expId } });
    if (portDocId) await PortfolioDocument.destroy({ where: { id: portDocId } });
    if (portfolioAId) await Portfolio.destroy({ where: { id: portfolioAId } });

    await Portfolio.destroy({ where: { studentId: profileStudB.id } });
    await StudentProfile.destroy({ where: { id: profileStudA.id } });
    await StudentProfile.destroy({ where: { id: profileStudB.id } });

    await User.destroy({ where: { id: userStudA.id } });
    await User.destroy({ where: { id: userStudB.id } });
    await User.destroy({ where: { id: userMentor1.id } });
    await User.destroy({ where: { id: userMentor2.id } });
  }

  console.log('\n================================================================');
  console.log(`PHASE 12 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runPhase12Tests().catch((err) => {
  console.error('Fatal Phase 12 test error:', err);
  process.exit(1);
});
