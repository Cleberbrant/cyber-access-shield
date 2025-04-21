
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface UserSession {
  email: string;
  isAdmin: boolean;
}

export function useSessionCheck() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, is_admin')
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile) {
        console.error("Erro ao buscar perfil:", error);
        return;
      }
      
      setUser({
        email: session.user.email || '',
        isAdmin: profile.is_admin
      });
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { user };
}
