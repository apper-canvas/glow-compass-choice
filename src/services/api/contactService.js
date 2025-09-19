import contactsData from "@/services/mockData/contacts.json";

let contacts = [...contactsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const contactService = {
  async getAll() {
    await delay(300);
    return [...contacts];
  },

  async getById(id) {
    await delay(200);
    const contact = contacts.find(c => c.Id === parseInt(id));
    return contact ? { ...contact } : null;
  },

  async create(contactData) {
    await delay(400);
    const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.Id)) + 1 : 1;
    const newContact = {
      ...contactData,
      Id: newId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    contacts.push(newContact);
    return { ...newContact };
  },

  async update(id, updateData) {
    await delay(300);
    const index = contacts.findIndex(c => c.Id === parseInt(id));
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updateData };
      return { ...contacts[index] };
    }
    return null;
  },

  async delete(id) {
    await delay(250);
    const index = contacts.findIndex(c => c.Id === parseInt(id));
    if (index !== -1) {
      contacts.splice(index, 1);
      return true;
    }
    return false;
  },

  async search(query) {
    await delay(200);
    const searchTerm = query.toLowerCase();
    return contacts.filter(contact =>
      contact.firstName.toLowerCase().includes(searchTerm) ||
      contact.lastName.toLowerCase().includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm) ||
      contact.company.toLowerCase().includes(searchTerm)
    );
  }
};