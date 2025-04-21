
import { supabase } from "@/integrations/supabase/client";

// Utilitários de segurança para a aplicação

// Função para detectar se o DevTools está aberto (não é 100% confiável, mas auxilia)
export const detectDevTools = (): boolean => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  return widthThreshold || heightThreshold;
};

// Função para prevenir capturas de tela (implementação limitada por segurança do navegador)
export const preventScreenCapture = (): void => {
  document.documentElement.style.webkitUserSelect = "none";
  document.documentElement.style.userSelect = "none";
  
  // Adicionando uma classe para estilizar elementos para prevenir capturas
  document.body.classList.add("secure-content", "no-print");
};

// Função para permitir capturas de tela novamente
export const allowScreenCapture = (): void => {
  document.documentElement.style.webkitUserSelect = "";
  document.documentElement.style.userSelect = "";
  
  // Removendo a classe de segurança
  document.body.classList.remove("secure-content", "no-print");
};

// Função para habilitar proteções durante uma avaliação
export const enableAssessmentProtection = (): void => {
  localStorage.setItem("assessmentInProgress", "true");
  preventScreenCapture();
  
  // Monitoramento periódico de tentativas de trapaça
  const interval = setInterval(() => {
    if (detectDevTools()) {
      console.warn("Tentativa de abrir DevTools detectada!");
      // Em uma aplicação real, você poderia registrar essa tentativa ou até finalizar a avaliação
    }
    
    // Verificar se estamos ainda em modo de avaliação
    if (localStorage.getItem("assessmentInProgress") !== "true") {
      clearInterval(interval);
    }
  }, 1000);
  
  // Guardar o ID do intervalo para limpeza posterior
  window.sessionStorage.setItem("securityIntervalId", interval.toString());
  
  // Desabilitar seleção de texto para elementos com classe "secure-content"
  document.querySelectorAll(".secure-content").forEach((el) => {
    (el as HTMLElement).classList.add("no-select");
  });
};

// Função para desabilitar proteções após uma avaliação
export const disableAssessmentProtection = (): void => {
  localStorage.removeItem("assessmentInProgress");
  allowScreenCapture();
  
  // Limpar o intervalo de monitoramento
  const intervalId = window.sessionStorage.getItem("securityIntervalId");
  if (intervalId) {
    clearInterval(parseInt(intervalId));
    window.sessionStorage.removeItem("securityIntervalId");
  }
  
  // Restaurar seleção de texto
  document.querySelectorAll(".secure-content").forEach((el) => {
    (el as HTMLElement).classList.remove("no-select");
  });
};

// Função para sanitizar entradas (para prevenir XSS)
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Função para exibir mensagem caso JavaScript esteja desabilitado
export const ensureJavaScriptEnabled = (): void => {
  // Esta função é chamada apenas se JavaScript estiver habilitado
  const noScriptElements = document.querySelectorAll('noscript');
  noScriptElements.forEach(el => {
    el.style.display = 'none';
  });
  
  // Remover overlay de aviso, se existir
  const jsWarning = document.getElementById('js-disabled-warning');
  if (jsWarning) {
    jsWarning.style.display = 'none';
  }
};

// Função para prevenir navegação para fora da página
export const preventNavigation = (): (() => void) => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
    return '';
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Retorna uma função para remover o event listener quando necessário
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Função para verificar se o usuário é administrador
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    if (error || !profile) {
      console.error("Erro ao verificar permissões de administrador:", error);
      return false;
    }
    
    return profile.is_admin === true;
  } catch (error) {
    console.error("Erro ao verificar permissões de administrador:", error);
    return false;
  }
};

// Versões síncronas para uso em componentes que não podem esperar por uma Promise
export const isAuthenticatedSync = (): boolean => {
  // Uma verificação preliminar usando localStorage
  // Esta função deve ser usada apenas quando a versão assíncrona não é viável
  const session = localStorage.getItem("sb-erbyxhjehrvpxvfycxwx-auth-token");
  return !!session;
};

export const isAdminSync = (): boolean => {
  try {
    // Verificar no localStorage se o usuário já foi identificado como admin
    const isAdminValue = localStorage.getItem("isAdmin");
    if (isAdminValue) {
      return isAdminValue === "true";
    }
    
    // Se não houver valor no localStorage, retorna false
    // O valor correto será definido após a verificação assíncrona
    return false;
  } catch (error) {
    console.error("Erro ao verificar permissões de administrador:", error);
    return false;
  }
};

// Função para armazenar o status de admin no localStorage para acesso síncrono
export const updateAdminStatus = async (): Promise<void> => {
  const adminStatus = await isAdmin();
  localStorage.setItem("isAdmin", adminStatus.toString());
};
