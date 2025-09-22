import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const contactService = {
  async getAll() {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Email"}},
          {"field": {"Name": "Phone"}},
          {"field": {"Name": "Company"}},
          {"field": {"Name": "Position"}},
          {"field": {"Name": "Status"}},
          {"field": {"Name": "Source"}},
          {"field": {"Name": "Notes"}},
          {"field": {"Name": "CreatedDate"}},
          {"field": {"Name": "ModifiedDate"}}
        ],
        orderBy: [{"fieldName": "CreatedDate", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords('contact_c', params);

      if (!response.success) {
        console.error('Error fetching contacts:', response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching contacts:', error?.response?.data?.message || error);
      return [];
    }
  },

async getById(id) {
    try {
      await delay(200);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Email"}},
          {"field": {"Name": "Phone"}},
          {"field": {"Name": "Company"}},
          {"field": {"Name": "Position"}},
          {"field": {"Name": "Status"}},
          {"field": {"Name": "Source"}},
          {"field": {"Name": "Notes"}},
          {"field": {"Name": "CreatedDate"}},
          {"field": {"Name": "ModifiedDate"}}
        ]
      };

      const response = await apperClient.getRecordById('contact_c', parseInt(id), params);

      if (!response.success) {
        console.error(`Error fetching contact ${id}:`, response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

async create(contactData) {
    try {
      await delay(400);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const updateableData = {
        Name: contactData.Name,
        Email: contactData.Email,
        Phone: contactData.Phone,
        Company: contactData.Company,
        Position: contactData.Position,
        Status: contactData.Status,
        Source: contactData.Source,
        Notes: contactData.Notes
      };

      const params = {
        records: [updateableData]
      };

      const response = await apperClient.createRecord('contact_c', params);

      if (!response.success) {
        console.error('Error creating contact:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, updateData) {
try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const updateableData = {
        Id: parseInt(id),
        Name: contactData.Name,
        Email: contactData.Email,
        Phone: contactData.Phone,
        Company: contactData.Company,
        Position: contactData.Position,
        Status: contactData.Status,
        Source: contactData.Source,
        Notes: contactData.Notes
      };

      const params = {
        records: [updateableData]
      };

      const response = await apperClient.updateRecord('contact_c', params);

      if (!response.success) {
        console.error('Error updating contact:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      await delay(250);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('contact_c', params);
      
      if (!response.success) {
        console.error('Error deleting contact:', response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting contact:', error?.response?.data?.message || error);
      return false;
    }
  },

async search(query) {
    try {
      await delay(200);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      if (!query || query.trim() === '') {
        return this.getAll();
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Email"}},
          {"field": {"Name": "Phone"}},
          {"field": {"Name": "Company"}},
          {"field": {"Name": "Position"}},
          {"field": {"Name": "Status"}},
          {"field": {"Name": "Source"}},
          {"field": {"Name": "Notes"}},
          {"field": {"Name": "CreatedDate"}},
          {"field": {"Name": "ModifiedDate"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "Name", "operator": "Contains", "values": [query.trim()]},
                {"fieldName": "Email", "operator": "Contains", "values": [query.trim()]},
                {"fieldName": "Company", "operator": "Contains", "values": [query.trim()]}
              ],
              "operator": "OR"
            }
          ]
        }],
        orderBy: [{"fieldName": "CreatedDate", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords('contact_c', params);

      if (!response.success) {
        console.error('Error searching contacts:', response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error searching contacts:', error?.response?.data?.message || error);
      return [];
    }
  }
};