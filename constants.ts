import { AlbumIcon, Code, Hammer, MessageSquare, SailboatIcon, Users2, TrainFront } from "lucide-react";

export const MAX_FREE_COUNTS = 5;

export const tools = [
  // {
  //   label: '点子王',
  //   icon: MessageSquare,
  //   href: '/conversation',
  //   color: "text-violet-500",
  //   bgColor: "bg-violet-500/10",
  // },
  {
    label: '证件照',
    icon: Users2,
    href: '/protraitGeneration',
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: '形象照',
    icon: TrainFront,
    href: '/headshot',
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: '老照片修复',
    icon: Hammer,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: '/oldPhotoRestore',
  },
  {
    label: '旅游照',
    icon: SailboatIcon,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: '/travelAnywhere',
  },
  {
    label: '历史记录',
    icon: AlbumIcon,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: '/history',
  },
  // {
  //   label: '许愿池',
  //   icon: Code,
  //   color: "text-green-700",
  //   bgColor: "bg-green-700/10",
  //   href: '/code',
  // },
  // {
  //   label: '结婚照',
  //   icon: Heart,
  //   color: "text-green-700",
  //   bgColor: "bg-green-700/10",
  //   href: '/code',
  // },
];
