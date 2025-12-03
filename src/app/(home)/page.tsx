'use client';

import Image from 'next/image';
import useInfoStore from '@/stores/useUserInfo';

export default function Home() {
  const nickname = useInfoStore((state) => state.nickname);

  return (
    <main className="flex h-full w-full items-start pt-32">
      {/* 左侧图片 */}
      <div className="flex h-full w-1/2 items-start justify-center pt-16">
        <Image
          src="/homepage.svg"
          alt="欢迎页面"
          width={700}
          height={700}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* 右侧文字 */}
      <div className="flex h-full w-1/2 flex-col items-start justify-start gap-6 px-8 pt-16 text-left">
        <p className="text-4xl font-semibold">
          {nickname ? `您好，${nickname}。` : '您好。'}
        </p>
        <p className="text-2xl">欢迎您进入8BU-EHS管理平台</p>
        <p className="text-xl text-gray-600">开始您的使用之旅吧！</p>
      </div>
    </main>
  );
}
