import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { MobileNav } from "@/components/ui/MobileNav";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow pb-16 sm:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
