import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { activityService } from "@/services/api/activityService";
import ApperIcon from "@/components/ApperIcon";
import Activities from "@/components/pages/Activities";
import Deals from "@/components/pages/Deals";
import Contacts from "@/components/pages/Contacts";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [contactsData, dealsData, activitiesData] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
        activityService.getAll()
      ]);

      setContacts(contactsData);
      setDeals(dealsData);
      setActivities(activitiesData.slice(0, 5)); // Latest 5 activities
    } catch (err) {
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getMetrics = () => {
    const totalContacts = contacts.length;
    const activeDeals = deals.filter(deal => deal.stage !== "closed-won" && deal.stage !== "closed-lost").length;
    const wonDeals = deals.filter(deal => deal.stage === "closed-won");
    const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
    
    return { totalContacts, activeDeals, totalRevenue, wonDeals: wonDeals.length };
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "call": return "Phone";
      case "email": return "Mail";
      case "meeting": return "Users";
      default: return "MessageCircle";
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      lead: "default",
      qualified: "info",
      prospect: "warning",
      customer: "success"
    };
    return variants[status] || "default";
  };

  const getStageBadge = (stage) => {
    const variants = {
      lead: "default",
      qualified: "info",
      proposal: "warning",
      "closed-won": "success",
      "closed-lost": "danger"
    };
    return variants[stage] || "default";
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const metrics = getMetrics();

  return (
    <div className="p-6 space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-700 rounded-lg flex items-center justify-center mr-4">
                <ApperIcon name="Users" size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Contacts</p>
                <p className="text-2xl font-bold text-slate-800">{metrics.totalContacts}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-accent to-yellow-500 rounded-lg flex items-center justify-center mr-4">
                <ApperIcon name="Target" size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Active Deals</p>
                <p className="text-2xl font-bold text-slate-800">{metrics.activeDeals}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                <ApperIcon name="TrendingUp" size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Won Deals</p>
                <p className="text-2xl font-bold text-slate-800">{metrics.wonDeals}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mr-4">
                <ApperIcon name="DollarSign" size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-800">
                  ${metrics.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Recent Activities</h3>
              <ApperIcon name="Clock" size={20} className="text-slate-400" />
            </div>
            
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const contact = contacts.find(c => c.Id === activity.contactId);
                return (
                  <motion.div
                    key={activity.Id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ApperIcon 
                        name={getActivityIcon(activity.type)} 
                        size={14} 
                        className="text-slate-600" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact"}
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(activity.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Top Deals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Top Deals</h3>
              <ApperIcon name="Target" size={20} className="text-slate-400" />
            </div>
            
            <div className="space-y-4">
              {deals
                .filter(deal => deal.stage !== "closed-lost")
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((deal, index) => {
                  const contact = contacts.find(c => c.Id === deal.contactId);
                  return (
                    <motion.div
                      key={deal.Id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {deal.title}
                        </p>
                        <p className="text-sm text-slate-600">
                          {contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact"}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getStageBadge(deal.stage)} size="sm">
                            {deal.stage.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {deal.probability}% probability
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-800">
                          ${deal.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(deal.expectedCloseDate), "MMM dd")}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </Card>
</motion.div>
      </div>

      {/* Quick Analytics Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Advanced Analytics & Reports
              </h3>
              <p className="text-sm text-slate-600">
                View detailed insights on sales performance, conversion rates, and customer acquisition metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700">
                  {((metrics.wonDeals / (metrics.activeDeals + metrics.wonDeals)) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">Conversion Rate</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/reports'}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <ApperIcon name="BarChart3" size={16} className="mr-2" />
                View Reports
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;