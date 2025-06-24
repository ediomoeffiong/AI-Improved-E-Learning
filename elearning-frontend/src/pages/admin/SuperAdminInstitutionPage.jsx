import React from 'react';
import { useNavigate } from 'react-router-dom';
import InstitutionManagement from '../../components/admin/InstitutionManagement';

const SuperAdminInstitutionPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InstitutionManagement onBack={handleBack} />
      </div>
    </div>
  );
};

export default SuperAdminInstitutionPage;
