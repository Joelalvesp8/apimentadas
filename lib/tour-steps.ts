import { TourStep } from '@/components/tour/game-tour';

export const exploreTourSteps: TourStep[] = [
  {
    target: '[data-tour="explore-header"]',
    title: 'Bem-vindo ao Apimentadas! 🌶️',
    description: 'Vamos fazer um tour rápido para você conhecer as principais funcionalidades do jogo.',
    position: 'bottom',
    action: 'Começar',
  },
  {
    target: '[data-tour="online-users"]',
    title: 'Usuários Online',
    description: 'Aqui você vê todos os usuários que estão online agora. Clique em um perfil para ver mais detalhes e enviar convites para jogar!',
    position: 'bottom',
    action: 'Próximo',
  },
  {
    target: '[data-tour="search-input"]',
    title: 'Buscar Usuários',
    description: 'Use a busca para encontrar usuários específicos por nickname. Perfeito para encontrar seus amigos!',
    position: 'bottom',
    action: 'Próximo',
  },
  {
    target: '[data-tour="new-session"]',
    title: 'Criar Nova Sessão',
    description: 'Clique aqui para criar uma nova sessão de jogo. Você pode escolher jogar no modo local (presencial) ou online (à distância).',
    position: 'left',
    action: 'Próximo',
  },
  {
    target: '[data-tour="connections"]',
    title: 'Suas Conexões',
    description: 'Veja suas conexões, convites pendentes e gerencie sua rede de amigos. Você também pode enviar novos convites aqui!',
    position: 'left',
    action: 'Próximo',
  },
  {
    target: '[data-tour="create-card"]',
    title: 'Criar Cartas Personalizadas',
    description: 'Crie suas próprias cartas personalizadas! Suas cartas precisarão de aprovação antes de aparecerem no jogo.',
    position: 'left',
    action: 'Próximo',
  },
  {
    target: '[data-tour="profile"]',
    title: 'Seu Perfil',
    description: 'Acesse seu perfil para editar suas informações, ver suas estatísticas e configurações.',
    position: 'left',
    action: 'Finalizar',
  },
];
