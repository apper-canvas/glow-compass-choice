import React from "react";
import { motion } from "framer-motion";

const Loading = ({ type = "default" }) => {
  if (type === "table") {
    return (
      <div className="space-y-4 p-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            />
            <div className="flex-1 space-y-2">
              <motion.div
                className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 + 0.2 }}
              />
              <motion.div
                className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 + 0.4 }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-surface rounded-lg p-6 shadow-sm border border-slate-200"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          >
            <div className="space-y-4">
              <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4" />
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2" />
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-2/3" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <motion.div
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-secondary font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;