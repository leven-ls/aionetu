import { useEffect, useState } from "react";

import { Zap } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

import { MAX_FREE_COUNTS } from "@/constants";


export const FreeCounter = ({
  isPro = false,
  apiLimitCount = 0,
}: {
  isPro: boolean,
  apiLimitCount: number
}) => {
  const [mounted, setMounted] = useState(false);

  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-center text-sm text-white mb-4 space-y-2">
            {isSignedIn ?
              <></>
              :
              <SignInButton>
                <Button>登录</Button>
              </SignInButton>
            }
            <div className="w-full flex justify-center">
              <UserButton afterSignOutUrl="/" />
            </div>
            <p>
              {apiLimitCount} 欢乐豆
            </p>
          </div>
          <Button className="w-full">
            升级VIP
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}