import { ContactsCollection } from '../db/models/contactModel.js';

export const getContacts = () => ContactsCollection.find();  
export const getContactById = (id) => ContactsCollection.findById(id);