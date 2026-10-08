import { Header } from "@/components/shop/header";
import { Footer } from "@/components/shop/footer";
import { MobileCta } from "@/components/shop/mobile-cta";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
