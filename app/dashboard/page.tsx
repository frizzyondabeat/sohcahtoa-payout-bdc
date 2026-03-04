import { redirect } from 'next/navigation';

const DashboardPage = () => {
  return redirect('/dashboard/transactions');
};

export default DashboardPage;
