import { TourStep } from '@/components/tour/game-tour';

export const exploreTourSteps: TourStep[] = [
  {
    target: '[data-tour="explore-header"]',
    title: 'Bem-vindo ao Apimentadas! 🌶️',
    description: 'Vamos fazer um tour rápido para você conhecer como encontrar pessoas e começar a jogar!',
    position: 'center',
    action: 'Começar',
  },
  {
    target: '[data-tour="search-input"]',
    title: 'Buscar Usuários',
    description: 'Use a busca para encontrar usuários específicos por nickname. Digite o nome de quem você procura!',
    position: 'bottom',
    action: 'Próximo',
  },
  {
    target: '[data-tour="online-users"]',
    title: 'Usuários Online',
    description: 'Aqui você vê todos os usuários que estão online agora. Clique em um perfil para ver mais detalhes e enviar convites para jogar!',
    position: 'center',
    action: 'Próximo',
  },
  {
    target: '[data-tour="new-session"]',
    title: 'Criar Nova Sessão',
    description: 'No menu superior, clique em "Dashboard" para criar uma nova sessão de jogo local ou online!',
    position: 'bottom',
    action: 'Próximo',
  },
  {
    target: '[data-tour="connections"]',
    title: 'Suas Conexões',
    description: 'Clique em "Conexões" no menu para ver suas amizades e convites pendentes!',
    position: 'bottom',
    action: 'Próximo',
  },
  {
    target: '[data-tour="profile"]',
    title: 'Seu Perfil',
    description: 'No menu "Perfil" você pode editar suas informações e ver suas estatísticas. Pronto para começar a jogar! 🎮',
    position: 'bottom',
    action: 'Finalizar',
  },
];
