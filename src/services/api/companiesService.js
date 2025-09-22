import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize ApperClient
let apperClient = null;

const getApperClient = () => {
  if (!apperClient) {
    const { ApperClient } = window.ApperSDK;
    apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }
  return apperClient;
};

const TABLE_NAME = 'companies_c';

// Updateable fields based on companies_c schema
const UPDATEABLE_FIELDS = [
  'CompanyName',
  'Industry', 
  'Phone',
  'Email',
  'Website',
  'Address',
  'City',
  'State',
  'ZipCode',
  'Country',
  'Description'
];

const ALL_FIELDS = [
  'Id',
  'CompanyName',
  'Industry',
  'Phone', 
  'Email',
  'Website',
  'Address',
  'City',
  'State',
  'ZipCode',
  'Country',
  'Description',
  'CreatedDate',
  'ModifiedDate'
];

// Fetch all companies
export const getAll = async () => {
  await delay(300);
  try {
    const client = getApperClient();
    const params = {
      fields: ALL_FIELDS.map(field => ({ field: { Name: field } })),
      orderBy: [{ fieldName: 'ModifiedDate', sorttype: 'DESC' }],
      pagingInfo: { limit: 100, offset: 0 }
    };

    const response = await client.fetchRecords(TABLE_NAME, params);

    if (!response.success) {
      console.error('Failed to fetch companies:', response.message);
      throw new Error(response.message || 'Failed to fetch companies');
    }

    return response.data || [];
  } catch (error) {
    console.error('Error fetching companies:', error?.response?.data?.message || error.message);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch companies');
  }
};

// Get company by ID
export const getById = async (id) => {
  await delay(200);
  try {
    const client = getApperClient();
    const params = {
      fields: ALL_FIELDS.map(field => ({ field: { Name: field } }))
    };

    const response = await client.getRecordById(TABLE_NAME, id, params);

    if (!response.success) {
      console.error(`Failed to fetch company ${id}:`, response.message);
      throw new Error(response.message || 'Company not found');
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching company ${id}:`, error?.response?.data?.message || error.message);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch company');
  }
};

// Create new company
export const create = async (companyData) => {
  await delay(400);
  try {
    const client = getApperClient();
    
    // Filter to only include updateable fields
    const filteredData = {};
    UPDATEABLE_FIELDS.forEach(field => {
      if (companyData[field] !== undefined && companyData[field] !== null) {
        filteredData[field] = companyData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await client.createRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error('Failed to create company:', response.message);
      throw new Error(response.message || 'Failed to create company');
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} companies: ${JSON.stringify(failed)}`);
        failed.forEach(record => {
          if (record.errors) {
            record.errors.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
          }
          if (record.message) {
            toast.error(record.message);
          }
        });
        throw new Error('Failed to create company');
      }

      if (successful.length > 0) {
        return successful[0].data;
      }
    }

    throw new Error('No company data returned');
  } catch (error) {
    console.error('Error creating company:', error?.response?.data?.message || error.message);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to create company');
  }
};

// Update company
export const update = async (id, companyData) => {
  await delay(400);
  try {
    const client = getApperClient();
    
    // Filter to only include updateable fields
    const filteredData = { Id: parseInt(id) };
    UPDATEABLE_FIELDS.forEach(field => {
      if (companyData[field] !== undefined) {
        filteredData[field] = companyData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await client.updateRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error(`Failed to update company ${id}:`, response.message);
      throw new Error(response.message || 'Failed to update company');
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} companies: ${JSON.stringify(failed)}`);
        failed.forEach(record => {
          if (record.errors) {
            record.errors.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
          }
          if (record.message) {
            toast.error(record.message);
          }
        });
        throw new Error('Failed to update company');
      }

      if (successful.length > 0) {
        return successful[0].data;
      }
    }

    throw new Error('No company data returned');
  } catch (error) {
    console.error(`Error updating company ${id}:`, error?.response?.data?.message || error.message);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to update company');
  }
};

// Delete company
export const deleteById = async (id) => {
  await delay(300);
  try {
    const client = getApperClient();
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await client.deleteRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error(`Failed to delete company ${id}:`, response.message);
      throw new Error(response.message || 'Failed to delete company');
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);

      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} companies: ${JSON.stringify(failed)}`);
        failed.forEach(record => {
          if (record.message) {
            toast.error(record.message);
          }
        });
        throw new Error('Failed to delete company');
      }

      return successful.length === 1;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting company ${id}:`, error?.response?.data?.message || error.message);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to delete company');
  }
};