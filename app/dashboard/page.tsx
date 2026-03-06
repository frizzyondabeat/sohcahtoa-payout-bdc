import { redirect } from 'next/navigation';

const DashboardPage = () => {
  return redirect('/dashboard/home');
};

export default DashboardPage;
