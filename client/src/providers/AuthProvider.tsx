import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type LanguageCode = "en" | "pt" | "es";
type UserRole = "superadmin" | "owner" | "admin" | "cleaner";

export interface ProfileRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  language: LanguageCode;
  companyId: string | null;
}

export interface CompanyRecord {
  id: string;
  name: string;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  isBlocked: boolean;
}

interface AuthContextValue {
  session: Session | null;
  profile: ProfileRecord | null;
  company: CompanyRecord | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: {
    name: string;
    email: string;
    password: string;
    companyName: string;
  }) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LANGUAGE_FALLBACK: LanguageCode = "en";

function getPreferredLanguage(): LanguageCode {
  const stored = localStorage.getItem("i18nextLng");
  if (stored && ["en", "pt", "es"].includes(stored)) {
    return stored as LanguageCode;
  }
  return LANGUAGE_FALLBACK;
}

const defaultOwnerName = (email?: string | null) => {
  if (!email) return "Owner";
  return email.split("@")[0] || "Owner";
};

function mapProfile(row: any): ProfileRecord | null {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    role: row.role,
    language: row.language,
    companyId: row.company_id ?? null,
  };
}

function mapCompany(row: any): CompanyRecord | null {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    subscriptionStatus: row.subscription_status ?? null,
    trialEndsAt: row.trial_ends_at ?? null,
    isBlocked: row.is_blocked ?? false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [initializing, setInitializing] = useState(true);

  const provisionFromMetadata = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return false;
    const companyName: string | undefined =
      user.user_metadata?.companyName || user.user_metadata?.company_name;
    if (!companyName) return false;

    const preferredLanguage =
      (user.user_metadata?.language as LanguageCode | undefined) ||
      getPreferredLanguage();
    const displayName =
      (user.user_metadata?.name as string | undefined) ||
      defaultOwnerName(user.email);

    const { data: companyRow, error: companyError } = await supabase
      .from("companies")
      .insert({ name: companyName })
      .select("id")
      .single();
    if (companyError) throw companyError;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      company_id: companyRow.id,
      role: "owner",
      name: displayName,
      email: user.email,
      language: preferredLanguage,
    });
    if (profileError) throw profileError;

    return true;
  }, []);

  const fetchProfile = useCallback(async (userId: string | null | undefined) => {
    if (!userId) {
      setProfile(null);
      setCompany(null);
      return;
    }

    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, name, email, phone, role, language, company_id"
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Erro ao carregar perfil", profileError);
      setProfile(null);
      setCompany(null);
      return;
    }

    const mappedProfile = mapProfile(profileRow);
    if (!mappedProfile) {
      try {
        const created = await provisionFromMetadata();
        if (created) {
          await fetchProfile(userId);
        } else {
          setProfile(null);
          setCompany(null);
        }
      } catch (err) {
        console.error("Erro ao provisionar perfil", err);
        setProfile(null);
        setCompany(null);
      }
      return;
    }

    setProfile(mappedProfile);

    if (mappedProfile?.companyId) {
      const { data: companyRow, error: companyError } = await supabase
        .from("companies")
        .select("id, name, subscription_status, trial_ends_at, is_blocked")
        .eq("id", mappedProfile.companyId)
        .maybeSingle();
      if (companyError) {
        console.error("Erro ao carregar empresa", companyError);
        setCompany(null);
      } else {
        setCompany(mapCompany(companyRow));
      }
    } else {
      setCompany(null);
    }
  }, [provisionFromMetadata]);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      await fetchProfile(data.session?.user?.id);
      setInitializing(false);
    };
    run();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      fetchProfile(nextSession?.user?.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await fetchProfile(data.user?.id ?? null);
  }, [fetchProfile]);

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
      companyName,
    }: {
      name: string;
      email: string;
      password: string;
      companyName: string;
    }) => {
      const preferredLanguage = getPreferredLanguage();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
            language: preferredLanguage,
            companyName,
          },
        },
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) {
        throw new Error("Não foi possível criar o usuário");
      }

      if (!data.session) {
        return { requiresEmailConfirmation: true };
      }

      const { data: companyRow, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: companyName,
        })
        .select("id")
        .single();
      if (companyError) throw companyError;

      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        company_id: companyRow.id,
        role: "owner",
        name,
        email,
        language: preferredLanguage,
      });
      if (profileError) throw profileError;

      await fetchProfile(userId);
      return { requiresEmailConfirmation: false };
    },
    [fetchProfile]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCompany(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      company,
      initializing,
      signIn,
      signUp,
      signOut,
    }),
    [session, profile, company, initializing, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
