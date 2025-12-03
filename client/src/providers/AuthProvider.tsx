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
import { getAppBaseUrl } from "@/lib/appConfig";

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
  pendingSetupUser: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: {
    name: string;
    email: string;
    password: string;
    companyName: string;
  }) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  completeOnboarding: (payload: {
    companyName: string;
    ownerName?: string;
  }) => Promise<void>;
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

const APP_BASE_URL = getAppBaseUrl();

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
  const [pendingSetupUser, setPendingSetupUser] = useState<User | null>(null);

  const createCompanyWithOwner = useCallback(
    async ({
      companyName,
      ownerName,
      ownerEmail,
      language,
    }: {
      companyName: string;
      ownerName?: string | null;
      ownerEmail?: string | null;
      language?: LanguageCode;
    }) => {
      if (!companyName.trim()) {
        throw new Error("Nome da empresa obrigatório.");
      }

      const { data, error } = await supabase.rpc("create_company_with_owner", {
        p_company_name: companyName.trim(),
        p_owner_name: ownerName ?? null,
        p_owner_email: ownerEmail ?? null,
        p_language: language ?? null,
      });

      if (error) throw error;
      if (!data) {
        throw new Error("Não foi possível criar a empresa.");
      }

      return data as string;
    },
    []
  );

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

    await createCompanyWithOwner({
      companyName,
      ownerName: displayName,
      ownerEmail: user.email,
      language: preferredLanguage,
    });
    return true;
  }, [createCompanyWithOwner]);

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
          setPendingSetupUser(null);
          await fetchProfile(userId);
        } else {
          const { data: userData } = await supabase.auth.getUser();
          setPendingSetupUser(userData.user ?? null);
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

    setPendingSetupUser(null);
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
          emailRedirectTo:
            APP_BASE_URL && APP_BASE_URL.length > 0
              ? `${APP_BASE_URL}/`
              : typeof window !== "undefined"
                ? `${window.location.origin}/`
                : undefined,
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

      await createCompanyWithOwner({
        companyName,
        ownerName: name,
        ownerEmail: email,
        language: preferredLanguage,
      });

      await fetchProfile(userId);
      return { requiresEmailConfirmation: false };
    },
    [fetchProfile, createCompanyWithOwner]
  );

  const completeOnboarding = useCallback(
    async ({ companyName, ownerName }: { companyName: string; ownerName?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        throw new Error("Usuário não autenticado.");
      }
      const displayName = ownerName?.trim() || defaultOwnerName(user.email);
      const preferredLanguage =
        (user.user_metadata?.language as LanguageCode | undefined) ||
        getPreferredLanguage();

      await createCompanyWithOwner({
        companyName,
        ownerName: displayName,
        ownerEmail: user.email,
        language: preferredLanguage,
      });

      setPendingSetupUser(null);
      await fetchProfile(user.id);
    },
    [fetchProfile, createCompanyWithOwner]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCompany(null);
    setPendingSetupUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      company,
      initializing,
      pendingSetupUser,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
    }),
    [session, profile, company, initializing, pendingSetupUser, signIn, signUp, signOut, completeOnboarding]
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
