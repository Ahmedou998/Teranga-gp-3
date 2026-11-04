import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <>
    <SiteHeader/>
    <main className="container" style={{ padding: "50px 0 90px" }}>
      <Link href="/connexion" style={{ color: "#607168", fontSize: 13, fontWeight: 700 }}>← Retour à la connexion</Link>
      <ResetPasswordForm token={token ?? ""}/>
    </main>
  </>;
}
