import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata = {
  title: "Shop | NEXTGEN FITNESS",
  description: "NEXTGEN FITNESS shop — supplements, gym wear and accessories. Launching soon.",
};

export default function ShopPage() {
  return (
    <ComingSoon
      eyebrow="Shop"
      title="Fuel up. Gear up."
      highlight="Shop smart."
      subtitle="Supplements, apparel and accessories — member-priced, delivered to your locker or doorstep."
      what="An online shop with 40+ lab-tested supplements, NEXTGEN apparel and training accessories, plus member-only pricing and free locker delivery."
      targets={[
        "Member-only prices with 5–15% off every order",
        "Free delivery to your locker within 24 hours",
        "Loyalty points earned on every purchase",
        "Subscription re-orders for whey, creatine and BCAAs",
      ]}
      preview={["NEXTGEN Whey Protein 1kg", "NEXTGEN Performance Tee", "Micronised Creatine 250g", "Steel Shaker 700ml"]}
    />
  );
}
