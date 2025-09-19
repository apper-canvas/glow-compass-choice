import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Modal from "@/components/molecules/Modal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { activityService } from "@/services/api/activityService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [formData, setFormData] = useState({
    contactId: "",
    dealId: "",
    type: "call",
    description: ""
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
      contactId: "",
      dealId: "",
      type: "call",
      description: ""
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activityData = {
        ...formData,
        contactId: parseInt(formData.contactId),
        dealId: formData.dealId ? parseInt(formData.dealId) : null
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
        toast.success("Activity deleted successfully");
        await loadData();
      } catch (err) {
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
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
  };

  const getDealTitle = (dealId) => {
    const deal = deals.find(d => d.Id === dealId);
    return deal ? deal.title : null;
  };

  const filteredActivities = typeFilter === "all" 
    ? activities 
    : activities.filter(activity => activity.type === typeFilter);

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
            const contact = contacts.find(c => c.Id === activity.contactId);
            const deal = activity.dealId ? deals.find(d => d.Id === activity.dealId) : null;
            
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
                      getActivityColor(activity.type) === "info" ? "bg-blue-100" :
                      getActivityColor(activity.type) === "success" ? "bg-green-100" :
                      getActivityColor(activity.type) === "warning" ? "bg-yellow-100" :
                      "bg-slate-100"
                    }`}>
                      <ApperIcon 
                        name={getActivityIcon(activity.type)} 
                        size={20} 
                        className={
                          getActivityColor(activity.type) === "info" ? "text-blue-600" :
                          getActivityColor(activity.type) === "success" ? "text-green-600" :
                          getActivityColor(activity.type) === "warning" ? "text-yellow-600" :
                          "text-slate-600"
                        } 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getActivityColor(activity.type)} size="sm">
                            {activity.type.replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <span className="text-sm font-medium text-slate-800">
                            {getContactName(activity.contactId)}
                          </span>
                          {deal && (
                            <span className="text-sm text-slate-500">
                              • {deal.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-400">
                            {format(new Date(activity.createdAt), "MMM dd, yyyy 'at' h:mm a")}
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
                        {activity.description}
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
              value={formData.contactId}
              onChange={(e) => setFormData(prev => ({...prev, contactId: e.target.value}))}
              className="block w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select a contact</option>
              {contacts.map(contact => (
                <option key={contact.Id} value={contact.Id}>
                  {contact.firstName} {contact.lastName} - {contact.company}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Related Deal (Optional)
            </label>
            <select
              value={formData.dealId}
              onChange={(e) => setFormData(prev => ({...prev, dealId: e.target.value}))}
              className="block w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">No related deal</option>
              {deals.map(deal => (
                <option key={deal.Id} value={deal.Id}>
                  {deal.title} - {getContactName(deal.contactId)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Activity Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
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
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
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