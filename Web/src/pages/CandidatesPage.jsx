import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const CandidatesPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Candidates</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your candidates here.</p>
      </div>
    </DashboardLayout>
  );
};

export default CandidatesPage;
