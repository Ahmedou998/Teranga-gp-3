import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const requestedPath = params.redirect ?? "/publier";
  const redirectPath = requestedPath.startsWith("/") && !requestedPath.startsWith("//")
    ? requestedPath
    : "/publier";

  return <>
    <SiteHeader/>
    <main className="container" style={{ padding: "50px 0 90px" }}>
      <Link href="/" style={{ color: "#607168", fontSize: 13, fontWeight: 700 }}>← Accueil</Link>
      <AuthForm redirectPath={redirectPath}/>
    </main>
  </>;
}
