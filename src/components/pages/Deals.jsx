import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({
    title_c: "",
    contact_id_c: "",
    value_c: "",
    stage_c: "lead",
    probability_c: "",
    expected_close_date_c: ""
  });

  const stages = [
    { key: "lead", label: "Lead", color: "default" },
    { key: "qualified", label: "Qualified", color: "info" },
    { key: "proposal", label: "Proposal", color: "warning" },
    { key: "closed-won", label: "Closed Won", color: "success" },
    { key: "closed-lost", label: "Closed Lost", color: "danger" }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load deals data");
      toast.error("Failed to load deals data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (deal = null) => {
    if (deal) {
setSelectedDeal(deal);
      setFormData({
        title_c: deal.title_c,
        contact_id_c: deal.contact_id_c?.Id ? deal.contact_id_c.Id.toString() : "",
        value_c: deal.value_c.toString(),
        stage_c: deal.stage_c,
        probability_c: deal.probability_c.toString(),
        expected_close_date_c: format(new Date(deal.expected_close_date_c), "yyyy-MM-dd")
      });
      setIsEditing(true);
} else {
      setSelectedDeal(null);
      setFormData({
        title_c: "",
        contact_id_c: "",
        value_c: "",
        stage_c: "lead",
        probability_c: "",
        expected_close_date_c: ""
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDeal(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dealData = {
...formData,
        contact_id_c: parseInt(formData.contact_id_c),
        value_c: parseFloat(formData.value_c),
        probability_c: parseInt(formData.probability_c),
        expected_close_date_c: new Date(formData.expected_close_date_c).toISOString()
      };

      if (isEditing) {
        await dealService.update(selectedDeal.Id, dealData);
        toast.success("Deal updated successfully");
      } else {
        await dealService.create(dealData);
        toast.success("Deal created successfully");
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      toast.error(`Failed to ${isEditing ? "update" : "create"} deal`);
    }
  };

  const handleDelete = async (dealId) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        await dealService.delete(dealId);
        toast.success("Deal deleted successfully");
        await loadData();
        if (selectedDeal && selectedDeal.Id === dealId) {
          handleCloseModal();
        }
      } catch (err) {
        toast.error("Failed to delete deal");
      }
    }
  };

  const handleDragStart = (e, dealId) => {
    e.dataTransfer.setData("text/plain", dealId.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const dealId = parseInt(e.dataTransfer.getData("text/plain"));
    const deal = deals.find(d => d.Id === dealId);
    
if (deal && deal.stage_c !== targetStage) {
      try {
        await dealService.update(dealId, { stage_c: targetStage });
        toast.success("Deal stage updated");
        await loadData();
      } catch (err) {
        toast.error("Failed to update deal stage");
      }
    }
  };

const getStageBadge = (stage) => {
    const stageConfig = stages.find(s => s.key === stage);
    return stageConfig ? stageConfig.color : "default";
  };

const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === (contactId?.Id || contactId));
    return contact ? `${contact.first_name_c} ${contact.last_name_c}` : "Unknown Contact";
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Deals Pipeline</h1>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {stages.map(stage => {
const stageDeals = deals.filter(deal => deal.stage_c === stage.key);
          const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value_c, 0);
          
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-lg p-4 min-h-[600px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{stage.label}</h3>
                  <p className="text-sm text-slate-500">
                    {stageDeals.length} deals • ${stageValue.toLocaleString()}
                  </p>
                </div>
                <Badge variant={stage.color} size="sm">
                  {stageDeals.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <ApperIcon name="Target" size={32} className="mx-auto mb-2" />
                    <p className="text-sm">No deals in this stage</p>
                  </div>
                ) : (
                  stageDeals.map((deal, index) => (
                    <motion.div
                      key={deal.Id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        hover
                        className="p-4 cursor-move bg-surface shadow-sm"
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.Id)}
                        onClick={() => handleOpenModal(deal)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-800 text-sm line-clamp-2">
{deal.title_c}
                          </h4>
                          <ApperIcon name="GripVertical" size={16} className="text-slate-400" />
                        </div>
                        
<p className="text-sm text-slate-600 mb-2">
                          {getContactName(deal.contact_id_c)}
                        </p>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-slate-800">
${deal.value_c.toLocaleString()}
                          </span>
<span className="text-sm text-slate-500">
                            {deal.probability_c}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-primary to-blue-700 h-2 rounded-full"
style={{ width: `${deal.probability_c}%` }}
                          />
                        </div>
                        
<p className="text-xs text-slate-400">
                          Expected: {format(new Date(deal.expected_close_date_c), "MMM dd, yyyy")}
                        </p>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Deal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditing ? "Edit Deal" : "Add New Deal"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Deal Title"
value={formData.title_c}
onChange={(e) => setFormData(prev => ({...prev, title_c: e.target.value}))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact
            </label>
            <select
value={formData.contact_id_c}
              onChange={(e) => setFormData(prev => ({...prev, contact_id_c: e.target.value}))}
              className="block w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select a contact</option>
              {contacts.map(contact => (
                <option key={contact.Id} value={contact.Id}>
{contact.first_name_c} {contact.last_name_c} - {contact.company_c}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Deal Value ($)"
type="number"
value={formData.value_c}
              onChange={(e) => setFormData(prev => ({...prev, value_c: e.target.value}))}
              required
            />
<Input
              label="Probability (%)"
              type="number"
              value={formData.probability_c}
              onChange={(e) => setFormData(prev => ({...prev, probability_c: e.target.value}))}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Stage
            </label>
            <select
value={formData.stage_c}
              onChange={(e) => setFormData(prev => ({...prev, stage_c: e.target.value}))}
              className="block w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {stages.map(stage => (
                <option key={stage.key} value={stage.key}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
          
          <Input
            label="Expected Close Date"
            type="date"
value={formData.expected_close_date_c}
onChange={(e) => setFormData(prev => ({...prev, expected_close_date_c: e.target.value}))}
            required
          />

          <div className="flex justify-between pt-6">
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDelete(selectedDeal.Id)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <ApperIcon name="Trash2" size={16} className="mr-2" />
                Delete
              </Button>
            )}
            <div className={`space-x-3 ${!isEditing ? "ml-auto" : ""}`}>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? "Update Deal" : "Create Deal"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Deals;