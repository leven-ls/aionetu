import { MobileSidebar } from "@/components/mobile-sidebar";
import { getHuanLeDouCount } from "@/lib/huanledou_count";


const Navbar = async () => {
  const apiLimitCount = await getHuanLeDouCount();
  //   const isPro = await checkSubscription();

  return (
    <div className="flex items-center p-4">
      <MobileSidebar isPro={true} apiLimitCount={apiLimitCount} />
      <div className="flex w-full justify-end">

      </div>
    </div>
  );
}

export default Navbar;