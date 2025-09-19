import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "No data found",
  description = "Get started by adding your first item",
  icon = "Database",
  actionText,
  onAction
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name={icon} size={32} className="text-slate-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        {title}
      </h3>
      
      <p className="text-secondary mb-6 max-w-md">
        {description}
      </p>
      
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};

export default Empty;