"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export function useShopContext() {
  const shopsQuery = trpc.shop.getUserShops.useQuery(undefined, { enabled: true });
  const [selectedShopId, setSelectedShopId] = useState<string>("");

  const shops = shopsQuery.data?.shops ?? [];
  const isLoading = shopsQuery.isLoading;

  useEffect(() => {
    if (!isLoading && shops.length > 0 && !selectedShopId) {
      setSelectedShopId(shops[0]?.id ?? "");
    }
  }, [isLoading, shops, selectedShopId]);

  if (isLoading || shops.length === 0) {
    return {
      shops: [],
      selectedShopId,
      setSelectedShopId,
      isShopLoading: false,
      hasShops: false,
    };
  }

  return {
    shops,
    selectedShopId,
    setSelectedShopId,
    isShopLoading: false,
    hasShops: true,
  };
}
