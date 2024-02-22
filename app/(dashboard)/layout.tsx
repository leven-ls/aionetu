import Navbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { getHuanLeDouCount } from "@/lib/huanledou_count";
import { ClerkProvider } from '@clerk/nextjs';
// import { Toaster } from "@/components/ui/toaster";
import { Toaster } from 'react-hot-toast';

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const apiLimitCount = await getHuanLeDouCount();

  return (
    <ClerkProvider>
      <div className="h-full relative">
        <div className="hidden h-full md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
          <Sidebar isPro={false} apiLimitCount={apiLimitCount} />
        </div>
        <main className="md:pl-60 pb-10 h-full">
          <Navbar />
          {children}
        </main>
        <Toaster />
      </div>
    </ClerkProvider >
  );
}

export default DashboardLayout;
