import activitiesData from "@/services/mockData/activities.json";

let activities = [...activitiesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const activityService = {
  async getAll() {
    await delay(300);
    return [...activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    await delay(200);
    const activity = activities.find(a => a.Id === parseInt(id));
    return activity ? { ...activity } : null;
  },

  async create(activityData) {
    await delay(400);
    const newId = activities.length > 0 ? Math.max(...activities.map(a => a.Id)) + 1 : 1;
    const newActivity = {
      ...activityData,
      Id: newId,
      createdAt: new Date().toISOString()
    };
    activities.push(newActivity);
    return { ...newActivity };
  },

  async update(id, updateData) {
    await delay(300);
    const index = activities.findIndex(a => a.Id === parseInt(id));
    if (index !== -1) {
      activities[index] = { ...activities[index], ...updateData };
      return { ...activities[index] };
    }
    return null;
  },

  async delete(id) {
    await delay(250);
    const index = activities.findIndex(a => a.Id === parseInt(id));
    if (index !== -1) {
      activities.splice(index, 1);
      return true;
    }
    return false;
  },

  async getByContact(contactId) {
    await delay(200);
    return activities.filter(activity => 
      activity.contactId === parseInt(contactId)
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};