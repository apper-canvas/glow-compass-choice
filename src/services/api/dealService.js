import dealsData from "@/services/mockData/deals.json";

let deals = [...dealsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dealService = {
  async getAll() {
    await delay(350);
    return [...deals];
  },

  async getById(id) {
    await delay(200);
    const deal = deals.find(d => d.Id === parseInt(id));
    return deal ? { ...deal } : null;
  },

  async create(dealData) {
    await delay(400);
    const newId = deals.length > 0 ? Math.max(...deals.map(d => d.Id)) + 1 : 1;
    const newDeal = {
      ...dealData,
      Id: newId,
      createdAt: new Date().toISOString()
    };
    deals.push(newDeal);
    return { ...newDeal };
  },

  async update(id, updateData) {
    await delay(300);
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index !== -1) {
      deals[index] = { ...deals[index], ...updateData };
      return { ...deals[index] };
    }
    return null;
  },

  async delete(id) {
    await delay(250);
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index !== -1) {
      deals.splice(index, 1);
      return true;
    }
    return false;
  },

  async getByStage(stage) {
    await delay(200);
    return deals.filter(deal => deal.stage === stage);
  }
};