"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { tools } from "@/constants";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();

  return (
    <div>
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          探索AI的无限可能
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          探索版本，后续功能支持开放中。注册即可，免费1000欢乐豆
          {!isSignedIn && <Button onClick={() => router.push("/sign-up")} className="w-32 ml-6">注册</Button>}
        </p>
        
      </div>
      <div className="px-4 md:px-20 lg:px-32 space-y-4">
        {tools.map((tool) => (
          <Card onClick={() => router.push(tool.href)} key={tool.href} className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-x-4">
              <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8", tool.color)} />
              </div>
              <div className="font-semibold">
                {tool.label}
              </div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Card>
        ))}
      </div>
    </div>
  );
}
