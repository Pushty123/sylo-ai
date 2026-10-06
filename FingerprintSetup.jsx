// FingerprintSetup.jsx
// Lets any signed-in user register their device fingerprint / face / PIN (Windows Hello, Touch ID, Android)
// and verify with it. Saves the credential ID to profiles.passkey_credential_id.
//

import { supabase } from "./supabase";
import { useEffect, useState } from "react";

// ---- helpers ----
const toB64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromB64url = (str) => {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

const randomChallenge = () => crypto.getRandomValues(new Uint8Array(32));

export default function FingerprintSetup() {
  const [supported, setSupported] = useState(null);
  const [user, setUser] = useState(null);
  const [credentialId, setCredentialId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    (async () => {
      // 1. Does this device have a fingerprint / face / PIN unlock?
      const ok =
        !!window.PublicKeyCredential &&
        (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
      setSupported(ok);

      // 2. Load current user + saved credential
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("passkey_credential_id")
          .eq("id", user.id)
          .single();
        setCredentialId(data?.passkey_credential_id ?? null);
      }
    })();
  }, []);

  const register = async () => {
    setBusy(true); setMsg({ type: "", text: "" });
    try {
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: randomChallenge(),
          rp: { name: "Sylo AI", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(user.id),
            name: user.email,
            displayName: user.user_metadata?.full_name || user.email,
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },   // ES256
            { type: "public-key", alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // built-in fingerprint/face/PIN
            userVerification: "required",
            residentKey: "preferred",
          },
          attestation: "none",
          timeout: 60000,
        },
      });

      const id = toB64url(cred.rawId);
      const { error } = await supabase
        .from("profiles")
        .update({ passkey_credential_id: id, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;

      setCredentialId(id);
      setMsg({ type: "ok", text: "Fingerprint set up successfully." });
    } catch (e) {
      setMsg({ type: "err", text: e.name === "NotAllowedError" ? "Setup was cancelled." : e.message });
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true); setMsg({ type: "", text: "" });
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: randomChallenge(),
          rpId: window.location.hostname,
          allowCredentials: [{ type: "public-key", id: fromB64url(credentialId), transports: ["internal"] }],
          userVerification: "required",
          timeout: 60000,
        },
      });
      setMsg({ type: "ok", text: "Identity verified with your fingerprint ✔" });
    } catch (e) {
      setMsg({ type: "err", text: e.name === "NotAllowedError" ? "Verification was cancelled or failed." : e.message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ passkey_credential_id: null })
      .eq("id", user.id);
    if (!error) {
      setCredentialId(null);
      setMsg({ type: "ok", text: "Fingerprint removed from your account." });
    }
    setBusy(false);
  };

  if (supported === null) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <span aria-hidden>🔐</span> Fingerprint / Passkey
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Use your device's fingerprint, face or PIN to verify your identity before sensitive actions.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            credentialId ? "bg-emerald-900/50 text-emerald-300" : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {credentialId ? "Enabled" : "Not set up"}
        </span>
      </div>

      {!supported ? (
        <p className="mt-4 text-sm text-amber-400">
          This device doesn't support fingerprint/face unlock. Try on a laptop with Windows Hello or a phone.
        </p>
      ) : !user ? (
        <p className="mt-4 text-sm text-zinc-400">Sign in to set up your fingerprint.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          {!credentialId ? (
            <button
              onClick={register}
              disabled={busy}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {busy ? "Waiting for device…" : "Set up fingerprint"}
            </button>
          ) : (
            <>
              <button
                onClick={verify}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {busy ? "Waiting for device…" : "Verify with fingerprint"}
              </button>
              <button
                onClick={remove}
                disabled={busy}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
              >
                Remove
              </button>
            </>
          )}
        </div>
      )}

      {msg.text && (
        <p className={`mt-3 text-sm ${msg.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</p>
      )}
    </div>
  );
}
