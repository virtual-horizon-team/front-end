import { Suspense } from "react";
import AssetStoreClient from "./store-client";

export const metadata = {
  title: "Asset Store | Virtual Horizon Marketplace",
  description: "Browse thousands of premium Unity assets — 3D models, shaders, scripts, textures and more."
};

export default function AssetStorePage() {
  return (
    <Suspense>
      <AssetStoreClient />
    </Suspense>
  );
}
