"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Props = {
  redirectPath: string;
};

export function AuthForm({ redirectPath }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up" | "forgot">("sign-up");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "forgot") {
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/reinitialiser`,
        });
        if (result.error) {
          setError(result.error.status === 503
            ? "Le service d’email n’est pas configuré. Contactez l’administrateur."
            : "La demande de réinitialisation n’a pas pu être envoyée. Réessayez plus tard.");
          return;
        }
        setMessage("Si un compte correspond à cette adresse, un lien de réinitialisation va être envoyé.");
        return;
      }

      if (mode === "sign-up") {
        const name = String(formData.get("name") ?? "").trim();
        const result = await authClient.signUp.email({ name, email, password });
        if (result.error) {
          setError(result.error.status === 503
            ? "Le service de compte ou d’email n’est pas configuré. Contactez l’administrateur."
            : "Création du compte impossible. Vérifiez les informations et réessayez.");
          return;
        }
        setMessage("Compte créé. Consultez votre boîte email et confirmez votre adresse avant de vous connecter.");
        return;
      }

      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.status === 503
          ? "Le service de compte n’est pas configuré. Contactez l’administrateur."
          : "Connexion impossible. Vérifiez vos identifiants et la confirmation de votre adresse email.");
        return;
      }
      router.replace(redirectPath);
      router.refresh();
    } catch {
      setError("Le service de compte est momentanément indisponible. Réessayez plus tard.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface" style={{ maxWidth: 480, padding: 26, margin: "30px auto" }}>
      <h1 className="page-title" style={{ fontSize: 30, margin: "0 0 8px" }}>
        {mode === "sign-up" ? "Créer un compte" : mode === "forgot" ? "Réinitialiser le mot de passe" : "Se connecter"}
      </h1>
      <p style={{ color: "#718078", lineHeight: 1.6 }}>
        Une adresse email confirmée est nécessaire pour publier une annonce.
      </p>
      <form className="local-publish-form" onSubmit={submit}>
        {mode === "sign-up" && (
          <div className="field">
            <label htmlFor="account-name">Nom affiché</label>
            <input id="account-name" name="name" required minLength={2} maxLength={80} autoComplete="name"/>
          </div>
        )}
        <div className="field">
          <label htmlFor="account-email">Adresse email</label>
          <input id="account-email" name="email" type="email" required maxLength={254} autoComplete="email"/>
        </div>
        {mode !== "forgot" && <div className="field">
          <label htmlFor="account-password">Mot de passe</label>
          <input id="account-password" name="password" type="password" required minLength={12} maxLength={128}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}/>
          {mode === "sign-up" && <small>12 caractères minimum.</small>}
        </div>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p role="status" style={{ color: "#087f5b", lineHeight: 1.6 }}>{message}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Veuillez patienter…" : mode === "sign-up" ? "Créer mon compte" : "Se connecter"}
        </button>
      </form>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <button className="btn btn-light" type="button"
          onClick={() => { setMode(mode === "sign-up" ? "sign-in" : "sign-up"); setError(""); setMessage(""); }}>
          {mode === "sign-up" ? "J’ai déjà un compte" : "Créer un compte"}
        </button>
        {mode === "sign-in" && <button className="btn btn-light" type="button"
          onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}>
          Mot de passe oublié ?
        </button>}
        {mode === "forgot" && <button className="btn btn-light" type="button"
          onClick={() => { setMode("sign-in"); setError(""); setMessage(""); }}>
          Retour à la connexion
        </button>}
      </div>
    </section>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("password") ?? "");

    try {
      const result = await authClient.resetPassword({ newPassword, token });
      if (result.error) {
        setError("Le lien est invalide ou expiré. Demandez une nouvelle réinitialisation.");
        return;
      }
      setMessage("Mot de passe modifié. Vous pouvez maintenant vous connecter.");
    } catch {
      setError("Le service de compte est momentanément indisponible.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="surface" style={{ maxWidth: 480, padding: 26, margin: "30px auto" }}>
    <h1 className="page-title" style={{ fontSize: 30 }}>Choisir un nouveau mot de passe</h1>
    {!token ? <p role="alert">Lien de réinitialisation manquant ou invalide.</p> : <form className="local-publish-form" onSubmit={submit}>
      <div className="field">
        <label htmlFor="reset-password">Nouveau mot de passe</label>
        <input id="reset-password" name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password"/>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Modification…" : "Modifier le mot de passe"}</button>
    </form>}
  </section>;
}
