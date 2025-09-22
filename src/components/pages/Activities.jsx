import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { activityService } from "@/services/api/activityService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
const [formData, setFormData] = useState({
    contact_id_c: "",
    deal_id_c: "",
    type_c: "call",
    description_c: ""
  });

  const activityTypes = [
    { key: "call", label: "Call", icon: "Phone", color: "info" },
    { key: "email", label: "Email", icon: "Mail", color: "success" },
    { key: "meeting", label: "Meeting", icon: "Users", color: "warning" },
    { key: "note", label: "Note", icon: "MessageCircle", color: "default" }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load activities data");
      toast.error("Failed to load activities data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

const handleOpenModal = () => {
    setFormData({
      contact_id_c: "",
      deal_id_c: "",
      type_c: "call",
      description_c: ""
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      contact_id_c: "",
      deal_id_c: "",
      type_c: "call",
      description_c: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activityData = {
        ...formData,
        contact_id_c: parseInt(formData.contact_id_c),
        deal_id_c: formData.deal_id_c ? parseInt(formData.deal_id_c) : null
      };
      
      await activityService.create(activityData);
      toast.success("Activity logged successfully");
      await loadData();
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to log activity");
    }
  };

  const handleDelete = async (activityId) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await activityService.delete(activityId);
        loadData();
        toast.success("Activity deleted successfully");
      } catch (error) {
        toast.error("Failed to delete activity");
      }
    }
  };

  const getActivityIcon = (type) => {
    const activityType = activityTypes.find(t => t.key === type);
    return activityType ? activityType.icon : "MessageCircle";
  };

  const getActivityColor = (type) => {
    const activityType = activityTypes.find(t => t.key === type);
    return activityType ? activityType.color : "default";
  };
const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === (contactId?.Id || contactId));
    return contact ? `${contact.first_name_c} ${contact.last_name_c}` : "Unknown Contact";
  };

const getDealTitle = (dealId) => {
    const deal = deals.find(d => d.Id === (dealId?.Id || dealId));
    return deal ? deal.title_c : "Unknown Deal";
  };

const filteredActivities = typeFilter === "all" 
    ? activities 
    : activities.filter(activity => activity.type_c === typeFilter);

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">Activities</h1>
        <Button onClick={handleOpenModal} variant="accent">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Log Activity
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTypeFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            typeFilter === "all"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Activities
        </button>
        {activityTypes.map(type => (
          <button
            key={type.key}
            onClick={() => setTypeFilter(type.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
              typeFilter === type.key
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ApperIcon name={type.icon} size={16} className="mr-2" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <Empty
          title="No activities found"
          description={typeFilter !== "all" ? 
            "No activities of this type found" : 
            "Start tracking your customer interactions by logging your first activity"
          }
          icon="Clock"
          actionText="Log Activity"
          onAction={handleOpenModal}
        />
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => {
const contact = contacts.find(c => c.Id === activity.contact_id_c?.Id);
            const deal = activity.deal_id_c ? deals.find(d => d.Id === activity.deal_id_c?.Id) : null;
            return (
              <motion.div
                key={activity.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
<div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      getActivityColor(activity.type_c) === "info" ? "bg-blue-100" :
                      getActivityColor(activity.type_c) === "success" ? "bg-green-100" :
                      getActivityColor(activity.type_c) === "warning" ? "bg-yellow-100" :
                      "bg-slate-100"
                    }`}>
                      <ApperIcon 
                        name={getActivityIcon(activity.type_c)} 
                        size={20} 
                        className={
                          getActivityColor(activity.type_c) === "info" ? "text-blue-600" :
                          getActivityColor(activity.type_c) === "success" ? "text-green-600" :
                          getActivityColor(activity.type_c) === "warning" ? "text-yellow-600" :
                          "text-slate-600"
                        } 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
<div className="flex items-center space-x-3">
                          <Badge variant={getActivityColor(activity.type_c)} size="sm">
                            {activity.type_c.replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <p className="text-sm text-slate-600">
                            {getContactName(activity.contact_id_c)}
                            {deal && (
                              <>
                                <span className="mx-2">•</span>
                                {getDealTitle(activity.deal_id_c)}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-400">
{format(new Date(activity.created_at_c), "MMM dd, yyyy 'at' h:mm a")}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(activity.Id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                      
<p className="text-slate-700 leading-relaxed">
                        {activity.description_c}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Log New Activity"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Related Deal (Optional)
</label>
            <select
              value={formData.deal_id_c}
              onChange={(e) => setFormData(prev => ({...prev, deal_id_c: e.target.value}))}
              className="block w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">No related deal</option>
              {deals.map(deal => (
                <option key={deal.Id} value={deal.Id}>
                  {deal.title_c} - {getContactName(deal.contact_id_c)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Activity Type
            </label>
            <select
              value={formData.type_c}
              onChange={(e) => setFormData(prev => ({...prev, type_c: e.target.value}))}
              className="block w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {activityTypes.map(type => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
<div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description_c}
              onChange={(e) => setFormData(prev => ({...prev, description_c: e.target.value}))}
              rows={4}
              className="block w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Describe the activity details..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Activities;