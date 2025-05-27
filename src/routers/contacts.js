import { Router } from 'express';

import {
  createContactController,
  deleteContactController,
  getContactsController,
  getContactsByIdController,
  patchContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const contactsRouter = Router();

contactsRouter.get('/contacts', ctrlWrapper(getContactsController));

contactsRouter.get('/contacts/:id', ctrlWrapper(getContactsByIdController));

contactsRouter.post('/contacts', ctrlWrapper(createContactController));

contactsRouter.patch('/contacts/:id', ctrlWrapper(patchContactController));

contactsRouter.delete('/contacts/:id', ctrlWrapper(deleteContactController));

export default contactsRouter;