import { Suspense } from "react";
import CmsLoginPage from "@/components/CmsLoginPage";

export default function LocalizedCMSLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CmsLoginPage />
    </Suspense>
  );
}
