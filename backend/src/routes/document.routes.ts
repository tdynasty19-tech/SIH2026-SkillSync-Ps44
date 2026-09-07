import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Protect all document routes with authentication
router.use(authenticate);

// Document CRUD & Upload
router.post('/', documentController.createDocument);
router.post('/upload', documentController.uploadDocument);
router.get('/', documentController.getMyDocuments);
router.get('/shared', documentController.getSharedDocuments);
router.get('/:documentId', documentController.getDocumentById);
router.patch('/:documentId', documentController.updateDocument);
router.delete('/:documentId', documentController.deleteDocument);

// Document Access Control
router.post('/:documentId/access', documentController.grantAccess);
router.delete('/:documentId/access/:granteeUserId', documentController.revokeAccess);

export default router;
