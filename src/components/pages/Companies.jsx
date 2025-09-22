import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Modal from '@/components/molecules/Modal';
import SearchBar from '@/components/molecules/SearchBar';
import ApperIcon from '@/components/ApperIcon';
import * as companiesService from '@/services/api/companiesService';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    CompanyName: '',
    Industry: '',
    Phone: '',
    Email: '',
    Website: '',
    Address: '',
    City: '',
    State: '',
    ZipCode: '',
    Country: '',
    Description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await companiesService.getAll();
      setCompanies(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.CompanyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.Industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCompany = () => {
    setEditingCompany(null);
    setFormData({
      CompanyName: '',
      Industry: '',
      Phone: '',
      Email: '',
      Website: '',
      Address: '',
      City: '',
      State: '',
      ZipCode: '',
      Country: '',
      Description: ''
    });
    setIsModalOpen(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setFormData({
      CompanyName: company.CompanyName || '',
      Industry: company.Industry || '',
      Phone: company.Phone || '',
      Email: company.Email || '',
      Website: company.Website || '',
      Address: company.Address || '',
      City: company.City || '',
      State: company.State || '',
      ZipCode: company.ZipCode || '',
      Country: company.Country || '',
      Description: company.Description || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteCompany = async (company) => {
    if (!confirm(`Are you sure you want to delete ${company.CompanyName}?`)) {
      return;
    }

    try {
      await companiesService.deleteById(company.Id);
      setCompanies(prev => prev.filter(c => c.Id !== company.Id));
      toast.success('Company deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete company');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.CompanyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCompany) {
        const updatedCompany = await companiesService.update(editingCompany.Id, formData);
        setCompanies(prev => prev.map(c => c.Id === editingCompany.Id ? updatedCompany : c));
        toast.success('Company updated successfully');
      } else {
        const newCompany = await companiesService.create(formData);
        setCompanies(prev => [newCompany, ...prev]);
        toast.success('Company created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <Loading message="Loading companies..." />;
  if (error) return <Error message={error} onRetry={loadCompanies} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
          <p className="text-slate-600">Manage your company relationships</p>
        </div>
        <Button onClick={handleCreateCompany} className="sm:w-auto">
          <ApperIcon name="Plus" size={16} />
          Add Company
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search companies..."
          />
        </div>
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="text-sm text-slate-600">Total Companies</div>
            <div className="text-xl font-semibold">{companies.length}</div>
          </Card>
        </div>
      </div>

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <Empty
          title="No companies found"
          description={searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first company"}
          action={!searchTerm ? { label: "Add Company", onClick: handleCreateCompany } : null}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-700">Company</th>
                  <th className="text-left p-4 font-medium text-slate-700">Industry</th>
                  <th className="text-left p-4 font-medium text-slate-700">Contact</th>
                  <th className="text-left p-4 font-medium text-slate-700">Location</th>
                  <th className="text-right p-4 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCompanies.map((company) => (
                  <tr key={company.Id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-slate-900">{company.CompanyName}</div>
                        {company.Website && (
                          <a
                            href={company.Website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {company.Website}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-600">{company.Industry || '-'}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {company.Email && (
                          <div className="text-slate-900">{company.Email}</div>
                        )}
                        {company.Phone && (
                          <div className="text-slate-600">{company.Phone}</div>
                        )}
                        {!company.Email && !company.Phone && (
                          <span className="text-slate-400">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-600">
                        {[company.City, company.State].filter(Boolean).join(', ') || 
                         company.Country || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCompany(company)}
                        >
                          <ApperIcon name="Edit2" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCompany(company)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Company Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? 'Edit Company' : 'Create Company'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Name *
              </label>
              <Input
                name="CompanyName"
                value={formData.CompanyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Industry
              </label>
              <Input
                name="Industry"
                value={formData.Industry}
                onChange={handleInputChange}
                placeholder="e.g., Technology, Healthcare"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <Input
                name="Phone"
                value={formData.Phone}
                onChange={handleInputChange}
                placeholder="Phone number"
                type="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                placeholder="company@example.com"
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Website
              </label>
              <Input
                name="Website"
                value={formData.Website}
                onChange={handleInputChange}
                placeholder="https://company.com"
                type="url"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address
              </label>
              <Input
                name="Address"
                value={formData.Address}
                onChange={handleInputChange}
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                City
              </label>
              <Input
                name="City"
                value={formData.City}
                onChange={handleInputChange}
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                State
              </label>
              <Input
                name="State"
                value={formData.State}
                onChange={handleInputChange}
                placeholder="State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ZIP Code
              </label>
              <Input
                name="ZipCode"
                value={formData.ZipCode}
                onChange={handleInputChange}
                placeholder="ZIP Code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Country
              </label>
              <Input
                name="Country"
                value={formData.Country}
                onChange={handleInputChange}
                placeholder="Country"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Brief description of the company"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingCompany ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Companies;