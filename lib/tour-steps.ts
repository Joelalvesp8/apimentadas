import { TourStep } from '@/components/tour/game-tour';

export const exploreTourSteps: TourStep[] = [
  {
    target: '[data-tour="explore-header"]',
    title: 'Bem-vindo ao Apimentadas! 🌶️',
    description: 'Vamos fazer um tour rápido para você conhecer as principais funcionalidades do jogo.',
    position: 'center',
    action: 'Começar',
  },
  {
    target: '[data-tour="online-users"]',
    title: 'Usuários Online',
    description: 'Aqui você vê todos os usuários que estão online agora. Clique em um perfil para ver mais detalhes e enviar convites para jogar!',
    position: 'center',
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
    description: 'Clique no menu Dashboard para criar uma nova sessão de jogo. Você pode escolher jogar no modo local (presencial) ou online (à distância).',
    position: 'bottom',
    action: 'Próximo',
  },
  {
    target: '[data-tour="connections"]',
    title: 'Suas Conexões',
    description: 'No menu Conexões você vê suas amizades, convites pendentes e pode gerenciar sua rede de contatos!',
    position: 'bottom',
    action: 'Próximo',
  },
  {
    target: '[data-tour="create-card"]',
    title: 'Criar Cartas Personalizadas',
    description: 'Acesse o Dashboard e clique em "Criar Carta" para fazer suas próprias cartas personalizadas! Elas precisarão de aprovação antes de aparecerem no jogo.',
    position: 'center',
    action: 'Próximo',
  },
  {
    target: '[data-tour="profile"]',
    title: 'Seu Perfil',
    description: 'Acesse seu perfil no menu para editar suas informações, ver suas estatísticas de jogo e configurações. Pronto para começar a jogar!',
    position: 'bottom',
    action: 'Finalizar',
  },
];
