import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizeLeadStatus } from "@/lib/leadStatus";
import LeadDetailClient from "@/components/admin/LeadDetailClient";

interface PageProps {
  params: { id: string };
}

export default async function LeadDetailPage({ params }: PageProps) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      createdAt: true,
      patientName: true,
      country: true,
      contactPreference: true,
      requestedProcedure: true,
      status: true,
      email: true,
      phone: true,
    },
  });

  if (!lead) {
    notFound();
  }

  // Prepare data for client component
  const leadData = {
    patientName: lead.patientName,
    country: lead.country,
    contactPreference: lead.contactPreference,
    requestedProcedure: lead.requestedProcedure,
    status: normalizeLeadStatus(lead.status),
    createdAt: lead.createdAt.toISOString(),
    email: lead.email || undefined,
    phone: lead.phone || undefined,
  };

  return <LeadDetailClient leadId={lead.id} leadData={leadData} />;
}
