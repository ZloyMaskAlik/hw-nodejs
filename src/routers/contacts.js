import { Router } from 'express';

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
 
const contactsRouter = Router();

contactsRouter.get('/contacts', ctrlWrapper(getContactsController));

contactsRouter.get('/contacts/:id', isValidId, ctrlWrapper(getContactsByIdController));

contactsRouter.post('/contacts', validateBody(createContactsSchema), ctrlWrapper(createContactController));

contactsRouter.patch('/contacts/:id', isValidId, validateBody(updateContactsSchema), ctrlWrapper(patchContactController));

contactsRouter.delete('/contacts/:id', isValidId, ctrlWrapper(deleteContactController));

export default contactsRouter;