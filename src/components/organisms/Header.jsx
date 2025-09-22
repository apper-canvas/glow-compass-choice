import React, { useContext } from "react";
import { useSelector } from 'react-redux';
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { AuthContext } from '@/App';
const Header = ({ onMenuClick, title = "Dashboard" }) => {
  const { user } = useSelector((state) => state.user);
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="lg:pl-64 bg-surface shadow-sm border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden mr-3 p-2"
          >
            <ApperIcon name="Menu" size={20} />
          </Button>
          
          <h1 className="text-xl font-semibold text-slate-800">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2">
            <ApperIcon name="Bell" size={20} />
          </Button>
          
          <Button variant="ghost" size="sm" className="p-2">
            <ApperIcon name="Settings" size={20} />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-700 rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={16} className="text-white" />
            </div>
            
            {user && (
              <span className="text-sm text-slate-600 hidden sm:block">
                {user.firstName} {user.lastName}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 hover:text-red-600"
              title="Logout"
            >
              <ApperIcon name="LogOut" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;