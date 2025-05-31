import { ContactsCollection } from '../db/models/contact.js';
import { calcPaginationData } from '../utils/pagination/calcPaginationData.js';

export const getContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * limit;
  const contactsQuery = ContactsCollection.find();
  
  if (filter.type) {
    contactsQuery.where('contactType').equals(filter.type);
  }

  if (filter.isFavourite) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  if (filter.userId) {
    contactsQuery.where('userId').equals(filter.userId);
  }

  const [totalItems, data] = await Promise.all([
    ContactsCollection.countDocuments(contactsQuery),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }),
  ]);

  const paginationData = calcPaginationData({ totalItems, page, perPage });

  return {
    data,
    totalItems,
    page,
    perPage,
    ...paginationData,
  };
};


export const getContactById = (id) => ContactsCollection.findById(id);

export const getContact = (filter) => ContactsCollection.findOne(filter);

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