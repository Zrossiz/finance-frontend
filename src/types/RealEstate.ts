export type RealEstate = {
  id: string;
  userId: string;
  name: string;
  currency: string;
  purchasePriceCents: number | null;
  monthlyIncomeCents: number | null;
  purchased: string | null;
};

export type CreateRealEstate = {
  name: string;
  currency: string;
  purchasePriceCents: number | null;
  monthlyIncomeCents: number | null;
  purchased: Date | null;
};

export type UpdateRealEstate = {
  name: string;
  currency: string;
  purchasePriceCents: number | null;
  monthlyIncomeCents: number | null;
  purchased: Date | null;
};
