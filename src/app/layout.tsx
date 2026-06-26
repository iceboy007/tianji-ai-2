import type { Metadata } from "next";
import "@radix-ui/themes/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "参天AI - 更懂你的AI",
  description: "AI驱动的中国传统命理分析平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-full overflow-x-hidden overscroll-y-none">
        {children}
      </body>
    </html>
  );
}
