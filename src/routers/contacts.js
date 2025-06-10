import { Router } from 'express';

import { upload } from '../middlewares/multer.js';

import {
  createContactController,
  deleteContactController,
  getContactsController,
  getContactsByIdController,
  patchContactController,
} from '../controllers/contacts.js';

import { isValidId } from '../middlewares/isValidId.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createContactsSchema,
  updateContactsSchema
} from '../validation/contacts.js';

import { authenticate } from '../middlewares/authenticate.js';
 
const contactsRouter = Router();

contactsRouter.use(authenticate);

contactsRouter.get('/contacts', ctrlWrapper(getContactsController));

contactsRouter.get('/contacts/:id', isValidId, ctrlWrapper(getContactsByIdController));

contactsRouter.post(
  '/contacts',
  upload.single('photo'),
  validateBody(createContactsSchema),
  ctrlWrapper(createContactController),
);

contactsRouter.patch(
  '/contacts/:id',
  isValidId,
  upload.single('photo'),
  validateBody(updateContactsSchema),
  ctrlWrapper(patchContactController),
);

contactsRouter.delete('/contacts/:id', isValidId, ctrlWrapper(deleteContactController));

export default contactsRouter;