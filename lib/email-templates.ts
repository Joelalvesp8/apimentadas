// Email templates for Apimentadas

interface EmailTemplateProps {
  name?: string;
  email?: string;
}

export function getWaitlistConfirmationEmail(props: EmailTemplateProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo à Lista de Espera - Apimentadas</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #000000;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #000000;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .brand {
            color: white;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .content {
            background: linear-gradient(to bottom, #0a0a0a 0%, #1a1a1a 100%);
            padding: 40px 30px;
            border-left: 4px solid #dc2626;
            border-right: 4px solid #dc2626;
          }
          .content h2 {
            color: #ffffff;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .content p {
            color: #d4d4d4;
            font-size: 16px;
            margin-bottom: 15px;
          }
          .highlight {
            color: #ef4444;
            font-weight: 600;
          }
          .footer {
            background-color: #0a0a0a;
            padding: 30px 20px;
            text-align: center;
            border-top: 2px solid #dc2626;
          }
          .footer p {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
          }
          .social-proof {
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .social-proof p {
            color: #999;
            font-size: 14px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌶️</div>
            <div class="brand">APIMENTADAS</div>
          </div>

          <div class="content">
            <h2>Você está na lista!</h2>

            <p>
              Obrigado por se inscrever na lista de espera do <span class="highlight">Apimentadas</span>.
            </p>

            <p>
              Sua inscrição foi registrada com sucesso. Você receberá um novo email quando for aprovado(a) para testar o aplicativo.
            </p>

            <div class="social-proof">
              <p><strong>Por que uma lista de espera?</strong></p>
              <p>Estamos em fase de testes e queremos garantir a melhor experiência possível para cada jogador.</p>
            </div>

            <p>
              <span class="highlight">O que acontece agora?</span>
            </p>

            <p>
              Nossa equipe analisa cada inscrição manualmente. Em breve, você receberá instruções de como criar sua conta e começar a jogar.
            </p>

            <p style="margin-top: 30px; color: #999; font-size: 14px;">
              Fique atento ao seu email! 🔥
            </p>
          </div>

          <div class="footer">
            <p style="color: #ef4444; font-weight: 600;">Conexões começam com respeito</p>
            <p>© ${new Date().getFullYear()} Apimentadas. Todos os direitos reservados.</p>
            <p>Jogo para maiores de 18 anos</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getApprovalEmail(props: EmailTemplateProps): string {
  const appUrl = process.env.NEXTAUTH_URL || 'https://apimentadas.app';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Você foi aprovado! - Apimentadas</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #000000;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #000000;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .brand {
            color: white;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .badge {
            display: inline-block;
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
          }
          .content {
            background: linear-gradient(to bottom, #0a0a0a 0%, #1a1a1a 100%);
            padding: 40px 30px;
            border-left: 4px solid #16a34a;
            border-right: 4px solid #16a34a;
          }
          .content h2 {
            color: #ffffff;
            font-size: 26px;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .content p {
            color: #d4d4d4;
            font-size: 16px;
            margin-bottom: 15px;
          }
          .highlight {
            color: #22c55e;
            font-weight: 600;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 18px;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(220, 38, 38, 0.4);
          }
          .steps {
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .step {
            display: flex;
            align-items: start;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #2a2a2a;
          }
          .step:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .step-number {
            background-color: #dc2626;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
            margin-right: 15px;
          }
          .step-text {
            color: #d4d4d4;
            font-size: 15px;
          }
          .footer {
            background-color: #0a0a0a;
            padding: 30px 20px;
            text-align: center;
            border-top: 2px solid #16a34a;
          }
          .footer p {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✅</div>
            <div class="brand">APIMENTADAS</div>
            <div class="badge">Você foi aprovado!</div>
          </div>

          <div class="content">
            <h2>Bem-vindo ao Apimentadas! 🔥</h2>

            <p>
              Parabéns! Sua conta foi <span class="highlight">aprovada</span> e agora você pode criar seu perfil e começar a jogar.
            </p>

            <p style="text-align: center;">
              <a href="${appUrl}/register" class="cta-button">Criar Minha Conta</a>
            </p>

            <div class="steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-text">
                  <strong style="color: #fff;">Crie sua conta</strong><br>
                  Clique no botão acima e preencha seus dados básicos (nome, email e senha)
                </div>
              </div>

              <div class="step">
                <div class="step-number">2</div>
                <div class="step-text">
                  <strong style="color: #fff;">Complete seu perfil</strong><br>
                  Escolha seu nickname e personalize seu perfil de jogador
                </div>
              </div>

              <div class="step">
                <div class="step-number">3</div>
                <div class="step-text">
                  <strong style="color: #fff;">Comece a jogar</strong><br>
                  Convide amigos, crie sessões e vire a primeira carta!
                </div>
              </div>
            </div>

            <p style="margin-top: 30px;">
              <strong style="color: #fff;">Importante:</strong>
            </p>

            <p style="font-size: 14px; color: #999;">
              • Use o email <strong style="color: #fff;">${props.email}</strong> para criar sua conta<br>
              • Você pode começar a jogar imediatamente após completar o cadastro<br>
              • Explore os modos de jogo: Presencial e Online<br>
              • Convide outras pessoas através do sistema de conexões
            </p>

            <p style="margin-top: 30px; color: #22c55e; font-weight: 600; font-size: 18px; text-align: center;">
              Que as perguntas comecem! 🎴
            </p>
          </div>

          <div class="footer">
            <p style="color: #22c55e; font-weight: 600;">Conexões começam com respeito</p>
            <p>© ${new Date().getFullYear()} Apimentadas. Todos os direitos reservados.</p>
            <p>Jogo para maiores de 18 anos</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
