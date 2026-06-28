export type RealEstate = {
  id: string;
  userId: string;
  name: string;
  currency: string;
  purchasePriceCents: number | null;
  monthlyIncomeCents: number | null;
  purchased: string | null;
};