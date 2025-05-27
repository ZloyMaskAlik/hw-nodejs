import { ContactsCollection } from '../db/models/contactModel.js';

export const getContacts = () => ContactsCollection.find();

export const getContactById = (id) => ContactsCollection.findById(id);

export const addContact = (payload) => ContactsCollection.create(payload);

export const updateContact = async (id, payload = {}) => {
  const updatedContact = await ContactsCollection.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    },
  );
  if (!updatedContact) return null;

  return updatedContact;
};

export const deleteContact = (filter) =>
  ContactsCollection.findOneAndDelete(filter);