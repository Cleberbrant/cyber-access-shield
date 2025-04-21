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
  
  // Fechar DevTools se estiver aberto
  if (detectDevTools()) {
    console.warn("DevTools detectado! Em uma prova real isso seria registrado.");
    window.location.href = "/dashboard";
    return;
  }
  
  // Monitoramento preventivo antes de entrar na avaliação
  const preventiveCheck = setInterval(() => {
    if (detectDevTools()) {
      clearInterval(preventiveCheck);
      window.location.href = "/dashboard";
      return;
    }
  }, 500);
  
  // Guardar o ID do intervalo para limpeza posterior
  window.sessionStorage.setItem("preventiveCheckId", preventiveCheck.toString());
  
  // Verifica se o DevTools está aberto
  if (detectDevTools()) {
    console.warn("DevTools detectado! Em uma prova real isso seria registrado.");
  }
  
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

  // Adicionar CSS para prevenir seleção de texto
  const style = document.createElement('style');
  style.id = 'secure-assessment-styles';
  style.innerHTML = `
    .no-select {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    .secure-content {
      position: relative;
    }
    
    .secure-content::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }
  `;
  document.head.appendChild(style);
  
  // Prevenir teclas de atalho comuns
  const securityKeyHandler = (e: KeyboardEvent) => {
    // Previne Ctrl+C, Ctrl+V, Ctrl+X, Print, etc.
    if ((e.ctrlKey || e.metaKey) && 
      (e.key === "c" || e.key === "v" || e.key === "x" || 
       e.key === "p" || e.key === "s" || e.key === "a" || 
       e.key === "u")) {
      e.preventDefault();
      console.warn("Atalho de teclado bloqueado por segurança: " + e.key);
      return false;
    }
    
    // Previne F12 (DevTools)
    if (e.key === "F12" || (e.key === "i" && e.ctrlKey && e.shiftKey)) {
      e.preventDefault();
      console.warn("Tentativa de abrir DevTools bloqueada");
      return false;
    }
  };
  
  // Prevenir clique direito e menu de contexto
  const securityContextHandler = (e: MouseEvent) => {
    e.preventDefault();
    console.warn("Menu de contexto desativado durante a avaliação");
    return false;
  };
  
  document.addEventListener("keydown", securityKeyHandler);
  document.addEventListener("contextmenu", securityContextHandler);
  
  // Armazenar referências para remover depois
  window.sessionStorage.setItem("securityHandlersActive", "true");
};

// Função para desabilitar proteções após uma avaliação
export const disableAssessmentProtection = (): void => {
  localStorage.removeItem("assessmentInProgress");
  allowScreenCapture();
  
  // Limpar o intervalo de verificação preventiva
  const preventiveCheckId = window.sessionStorage.getItem("preventiveCheckId");
  if (preventiveCheckId) {
    clearInterval(parseInt(preventiveCheckId));
    window.sessionStorage.removeItem("preventiveCheckId");
  }
  
  // Limpar o intervalo de monitoramento
  const intervalId = window.sessionStorage.getItem("securityIntervalId");
  if (intervalId) {
    clearInterval(parseInt(intervalId));
    window.sessionStorage.removeItem("securityIntervalId");
  }
  
  // Restaurar seleção de texto
  document.querySelectorAll(".no-select").forEach((el) => {
    (el as HTMLElement).classList.remove("no-select");
  });
  
  // Remover estilos de segurança
  const secureStyles = document.getElementById('secure-assessment-styles');
  if (secureStyles) {
    secureStyles.remove();
  }
  
  // Remover event listeners de segurança
  if (window.sessionStorage.getItem("securityHandlersActive") === "true") {
    // Precise removers would require storing the handler functions
    // This is a simplified version
    window.sessionStorage.removeItem("securityHandlersActive");
  }
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
