import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        features: 'Features',
        pricing: 'Pricing',
        login: 'Login',
        signup: 'Start Free Trial',
        dashboard: 'Dashboard',
        logout: 'Logout'
      },
      hero: {
        title: 'Smart Scheduling for Cleaning Agencies',
        subtitle: 'Manage your teams, clients, and schedules in one place. Built for NYC cleaning agencies.',
        cta: 'Start 30-Day Free Trial',
        ctaSecondary: 'See How It Works'
      },
      features: {
        title: 'Everything You Need to Run Your Agency',
        scheduling: {
          title: 'Team Scheduling',
          description: 'Assign drivers and helpers to jobs with conflict detection.'
        },
        clients: {
          title: 'Client Management',
          description: 'Track all your clients, addresses, and service frequencies.'
        },
        mobile: {
          title: 'Mobile App for Cleaners',
          description: 'Cleaners check their schedule and report directly from their phones.'
        },
        reports: {
          title: 'Service Reports',
          description: 'Track job completion, issues, and extra tasks in real-time.'
        }
      },
      auth: {
        login: 'Login',
        signup: 'Create Account',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        companyName: 'Company Name',
        name: 'Full Name',
        forgotPassword: 'Forgot password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        trialNote: 'Start your 30-day free trial. No credit card required.'
      },
      dashboard: {
        welcome: 'Welcome back',
        overview: 'Overview',
        cleaners: 'Cleaners',
        clients: 'Clients',
        schedule: 'Schedule',
        reports: 'Reports',
        settings: 'Settings'
      },
      superadmin: {
        title: 'SaaS Administration',
        companies: 'Companies',
        totalCompanies: 'Total Companies',
        activeSubscriptions: 'Active Subscriptions',
        inTrial: 'In Trial',
        totalJobs: 'Total Jobs'
      },
      cleaners: {
        title: 'Cleaners',
        add: 'Add Cleaner',
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        language: 'Language',
        drives: 'Driver',
        status: 'Status',
        area: 'Area',
        active: 'Active',
        inactive: 'Inactive'
      },
      clients: {
        title: 'Clients',
        add: 'Add Client',
        name: 'Name',
        address: 'Address',
        frequency: 'Frequency',
        notes: 'Notes',
        weekly: 'Weekly',
        biweekly: 'Bi-weekly',
        monthly: 'Monthly',
        onetime: 'One-time'
      },
      schedule: {
        title: 'Schedule',
        addJob: 'Add Job',
        date: 'Date',
        time: 'Time',
        client: 'Client',
        driver: 'Driver',
        helper1: 'Helper 1',
        helper2: 'Helper 2',
        status: 'Status',
        scheduled: 'Scheduled',
        inProgress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled'
      },
      cleaner: {
        myAgenda: 'My Agenda',
        today: 'Today',
        upcoming: 'Upcoming',
        start: 'Start Job',
        complete: 'Complete Job',
        youAre: 'You are',
        driver: 'Driver',
        helper: 'Helper',
        report: {
          title: 'Job Report',
          issues: 'Issues or Problems',
          issuesPlaceholder: 'Any issues, delays, or problems?',
          extras: 'Extra Tasks',
          extrasPlaceholder: 'Any extra tasks requested by client?',
          notes: 'Notes',
          notesPlaceholder: 'Any other observations?',
          submit: 'Submit Report'
        }
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        search: 'Search',
        filter: 'Filter',
        loading: 'Loading...',
        noResults: 'No results found',
        actions: 'Actions'
      },
      subscription: {
        expired: 'Your trial has expired',
        expiredMessage: 'Please subscribe to continue using CleanTeams.',
        subscribe: 'Subscribe Now',
        trialDays: 'days left in trial'
      }
    }
  },
  pt: {
    translation: {
      nav: {
        features: 'Recursos',
        pricing: 'Precos',
        login: 'Entrar',
        signup: 'Teste Gratis',
        dashboard: 'Painel',
        logout: 'Sair'
      },
      hero: {
        title: 'Agendamento Inteligente para Agencias de Limpeza',
        subtitle: 'Gerencie suas equipes, clientes e agendas em um so lugar. Feito para agencias de limpeza em NY.',
        cta: 'Comece 30 Dias Gratis',
        ctaSecondary: 'Veja Como Funciona'
      },
      features: {
        title: 'Tudo que Voce Precisa para Gerenciar sua Agencia',
        scheduling: {
          title: 'Agendamento de Equipes',
          description: 'Atribua motoristas e auxiliares com deteccao de conflitos.'
        },
        clients: {
          title: 'Gestao de Clientes',
          description: 'Acompanhe todos os clientes, enderecos e frequencias de servico.'
        },
        mobile: {
          title: 'App Movel para Diaristas',
          description: 'Diaristas verificam agenda e reportam direto do celular.'
        },
        reports: {
          title: 'Relatorios de Servico',
          description: 'Acompanhe conclusao de servicos, problemas e tarefas extras em tempo real.'
        }
      },
      auth: {
        login: 'Entrar',
        signup: 'Criar Conta',
        email: 'Email',
        password: 'Senha',
        confirmPassword: 'Confirmar Senha',
        companyName: 'Nome da Empresa',
        name: 'Nome Completo',
        forgotPassword: 'Esqueceu a senha?',
        noAccount: 'Nao tem uma conta?',
        hasAccount: 'Ja tem uma conta?',
        trialNote: 'Comece seu teste gratis de 30 dias. Sem cartao de credito.'
      },
      dashboard: {
        welcome: 'Bem-vindo de volta',
        overview: 'Visao Geral',
        cleaners: 'Diaristas',
        clients: 'Clientes',
        schedule: 'Agenda',
        reports: 'Relatorios',
        settings: 'Configuracoes'
      },
      superadmin: {
        title: 'Administracao SaaS',
        companies: 'Empresas',
        totalCompanies: 'Total de Empresas',
        activeSubscriptions: 'Assinaturas Ativas',
        inTrial: 'Em Teste',
        totalJobs: 'Total de Servicos'
      },
      cleaners: {
        title: 'Diaristas',
        add: 'Adicionar Diarista',
        name: 'Nome',
        phone: 'Telefone',
        email: 'Email',
        language: 'Idioma',
        drives: 'Motorista',
        status: 'Status',
        area: 'Area',
        active: 'Ativo',
        inactive: 'Inativo'
      },
      clients: {
        title: 'Clientes',
        add: 'Adicionar Cliente',
        name: 'Nome',
        address: 'Endereco',
        frequency: 'Frequencia',
        notes: 'Observacoes',
        weekly: 'Semanal',
        biweekly: 'Quinzenal',
        monthly: 'Mensal',
        onetime: 'Avulso'
      },
      schedule: {
        title: 'Agenda',
        addJob: 'Adicionar Servico',
        date: 'Data',
        time: 'Horario',
        client: 'Cliente',
        driver: 'Motorista',
        helper1: 'Auxiliar 1',
        helper2: 'Auxiliar 2',
        status: 'Status',
        scheduled: 'Agendado',
        inProgress: 'Em Andamento',
        completed: 'Concluido',
        cancelled: 'Cancelado'
      },
      cleaner: {
        myAgenda: 'Minha Agenda',
        today: 'Hoje',
        upcoming: 'Proximos',
        start: 'Iniciar Servico',
        complete: 'Concluir Servico',
        youAre: 'Voce e',
        driver: 'Motorista',
        helper: 'Auxiliar',
        report: {
          title: 'Relatorio do Servico',
          issues: 'Problemas',
          issuesPlaceholder: 'Houve algum problema ou atraso?',
          extras: 'Tarefas Extras',
          extrasPlaceholder: 'Cliente pediu algo extra?',
          notes: 'Observacoes',
          notesPlaceholder: 'Outras observacoes?',
          submit: 'Enviar Relatorio'
        }
      },
      common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        edit: 'Editar',
        delete: 'Excluir',
        search: 'Buscar',
        filter: 'Filtrar',
        loading: 'Carregando...',
        noResults: 'Nenhum resultado encontrado',
        actions: 'Acoes'
      },
      subscription: {
        expired: 'Seu periodo de teste expirou',
        expiredMessage: 'Assine para continuar usando o CleanTeams.',
        subscribe: 'Assinar Agora',
        trialDays: 'dias restantes no teste'
      }
    }
  },
  es: {
    translation: {
      nav: {
        features: 'Caracteristicas',
        pricing: 'Precios',
        login: 'Iniciar Sesion',
        signup: 'Prueba Gratis',
        dashboard: 'Panel',
        logout: 'Cerrar Sesion'
      },
      hero: {
        title: 'Programacion Inteligente para Agencias de Limpieza',
        subtitle: 'Gestiona tus equipos, clientes y horarios en un solo lugar. Hecho para agencias de limpieza en NY.',
        cta: 'Comienza 30 Dias Gratis',
        ctaSecondary: 'Ver Como Funciona'
      },
      features: {
        title: 'Todo lo que Necesitas para Gestionar tu Agencia',
        scheduling: {
          title: 'Programacion de Equipos',
          description: 'Asigna conductores y ayudantes con deteccion de conflictos.'
        },
        clients: {
          title: 'Gestion de Clientes',
          description: 'Rastrea todos tus clientes, direcciones y frecuencias de servicio.'
        },
        mobile: {
          title: 'App Movil para Limpiadores',
          description: 'Los limpiadores revisan su agenda y reportan desde su telefono.'
        },
        reports: {
          title: 'Reportes de Servicio',
          description: 'Rastrea finalizacion de trabajos, problemas y tareas extras en tiempo real.'
        }
      },
      auth: {
        login: 'Iniciar Sesion',
        signup: 'Crear Cuenta',
        email: 'Correo',
        password: 'Contrasena',
        confirmPassword: 'Confirmar Contrasena',
        companyName: 'Nombre de Empresa',
        name: 'Nombre Completo',
        forgotPassword: 'Olvidaste tu contrasena?',
        noAccount: 'No tienes cuenta?',
        hasAccount: 'Ya tienes cuenta?',
        trialNote: 'Comienza tu prueba gratis de 30 dias. Sin tarjeta de credito.'
      },
      dashboard: {
        welcome: 'Bienvenido de vuelta',
        overview: 'Resumen',
        cleaners: 'Limpiadores',
        clients: 'Clientes',
        schedule: 'Agenda',
        reports: 'Reportes',
        settings: 'Configuracion'
      },
      superadmin: {
        title: 'Administracion SaaS',
        companies: 'Empresas',
        totalCompanies: 'Total de Empresas',
        activeSubscriptions: 'Suscripciones Activas',
        inTrial: 'En Prueba',
        totalJobs: 'Total de Trabajos'
      },
      cleaners: {
        title: 'Limpiadores',
        add: 'Agregar Limpiador',
        name: 'Nombre',
        phone: 'Telefono',
        email: 'Correo',
        language: 'Idioma',
        drives: 'Conductor',
        status: 'Estado',
        area: 'Area',
        active: 'Activo',
        inactive: 'Inactivo'
      },
      clients: {
        title: 'Clientes',
        add: 'Agregar Cliente',
        name: 'Nombre',
        address: 'Direccion',
        frequency: 'Frecuencia',
        notes: 'Notas',
        weekly: 'Semanal',
        biweekly: 'Quincenal',
        monthly: 'Mensual',
        onetime: 'Una vez'
      },
      schedule: {
        title: 'Agenda',
        addJob: 'Agregar Trabajo',
        date: 'Fecha',
        time: 'Hora',
        client: 'Cliente',
        driver: 'Conductor',
        helper1: 'Ayudante 1',
        helper2: 'Ayudante 2',
        status: 'Estado',
        scheduled: 'Programado',
        inProgress: 'En Progreso',
        completed: 'Completado',
        cancelled: 'Cancelado'
      },
      cleaner: {
        myAgenda: 'Mi Agenda',
        today: 'Hoy',
        upcoming: 'Proximos',
        start: 'Iniciar Trabajo',
        complete: 'Completar Trabajo',
        youAre: 'Tu eres',
        driver: 'Conductor',
        helper: 'Ayudante',
        report: {
          title: 'Reporte del Trabajo',
          issues: 'Problemas',
          issuesPlaceholder: 'Hubo algun problema o retraso?',
          extras: 'Tareas Extras',
          extrasPlaceholder: 'El cliente pidio algo extra?',
          notes: 'Notas',
          notesPlaceholder: 'Otras observaciones?',
          submit: 'Enviar Reporte'
        }
      },
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        edit: 'Editar',
        delete: 'Eliminar',
        search: 'Buscar',
        filter: 'Filtrar',
        loading: 'Cargando...',
        noResults: 'No se encontraron resultados',
        actions: 'Acciones'
      },
      subscription: {
        expired: 'Tu prueba ha expirado',
        expiredMessage: 'Suscribete para continuar usando CleanTeams.',
        subscribe: 'Suscribirse Ahora',
        trialDays: 'dias restantes de prueba'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
