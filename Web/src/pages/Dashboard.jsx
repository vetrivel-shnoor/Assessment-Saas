import DashboardLayout from '../layouts/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { Card, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your assessments today.</p>
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
    </DashboardLayout>
  );
};

export default Dashboard;
