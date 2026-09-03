import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { StatCard } from '../components/StatCard';
import { Card, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Users, FileText, CheckCircle, Clock, Building, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Dashboard = () => {
  const { user, isValidating } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isValidating) {
      if (!user) {
        navigate('/login');
      } else if (!user.onboardingCompleted) {
        navigate('/onboarding');
      }
    }
  }, [user, isValidating, navigate]);

  if (isValidating || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.firstName} {user?.lastName}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-4">
          <span className="capitalize font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
            {user?.role}
          </span>
          {user?.companyName && (
            <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {user.companyName}</span>
          )}
          {user?.skills && (
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> Skills: {user.skills}</span>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={Users}
          value="1,248"
          label="Total Candidates"
          change="+12%"
          changeType="positive"
        />
        <StatCard 
          icon={FileText}
          value="24"
          label="Active Tests"
          change="+4"
          changeType="positive"
          iconBg="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatCard 
          icon={CheckCircle}
          value="94.2%"
          label="Completion Rate"
          change="Avg"
          changeType="neutral"
          iconBg="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
        <StatCard 
          icon={Clock}
          value="42m 15s"
          label="Avg. Time Spent"
          iconBg="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Recent Activity Section */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Frontend Developer Assessment - Q3</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">45 candidates • Created 2 days ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">View Results</Button>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
};

export default Dashboard;
