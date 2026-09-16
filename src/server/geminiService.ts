import { GoogleGenAI } from '@google/genai';
import { db } from './db.ts';

let cachedClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

export interface GenerateWebsiteParams {
  niche: string;
  colors: {
    name: string;
    primary: string;
    secondary: string;
  };
  style: string;
  objectives: string[];
  company_data: {
    name: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    city?: string;
    address?: string;
    hours?: string;
  };
}

export function buildWebsitePrompt(params: GenerateWebsiteParams): string {
  const { niche, colors, style, objectives, company_data } = params;

  return `Você é um desenvolvedor frontend e web designer sênior especialista em páginas comerciais de alta conversão para empresas locais brasileiras.
Crie uma landing page completa, responsiva, moderna e visualmente impecável em HTML5 puro com Tailwind CSS via CDN.

DADOS DA EMPRESA E PROJETO:
- Empresa: ${company_data.name}
- Nicho de Atuação: ${niche}
- Paleta de Cores: ${colors.name} (Cor Primária: ${colors.primary}, Cor Secundária: ${colors.secondary})
- Estilo Visual: ${style}
- Objetivos da Página: ${objectives.join(', ') || 'Gerar contatos e atrair novos clientes'}
${company_data.city ? `- Cidade: ${company_data.city}` : ''}
${company_data.address ? `- Endereço: ${company_data.address}` : ''}
${company_data.whatsapp ? `- WhatsApp de Atendimento: ${company_data.whatsapp}` : ''}
${company_data.instagram ? `- Instagram: ${company_data.instagram}` : ''}
${company_data.hours ? `- Horário de Funcionamento: ${company_data.hours}` : ''}

DIRETRIZES FUNDAMENTAIS:
1. NÃO invente dados falsos que não foram fornecidos (não invente CNPJ falso, preços fictícios se não fornecidos, ou depoimentos fabricados com pessoas irreais).
2. Se faltar informações, use placeholders profissionais e claramente editáveis (ex: "Entre em contato para consultar valores").
3. Adicione botão flutuante de WhatsApp fixado no canto inferior direito com link real para wa.me/${company_data.whatsapp ? company_data.whatsapp.replace(/\D/g, '') : '5500000000000'}.
4. Seções obrigatórias:
   - Header fixo com logo textual "${company_data.name}", links de navegação e botão CTA.
   - Hero Section com título impactante de alta conversão, subtítulo persuasivo e botões de ação com a cor primária ${colors.primary}.
   - Seção de Serviços / Soluções específicas do nicho ${niche}.
   - Benefícios e Diferenciais competitivos.
   - Sobre a empresa.
   - FAQ com as 4 perguntas mais comuns do nicho.
   - Contato / Localização (${company_data.address || 'Atendimento local na região de ' + (company_data.city || 'sua cidade')}).
   - Footer completo com copyright e créditos.
5. Retorne SOMENTE o código HTML completo dentro de <!DOCTYPE html> ... </html>. Sem formatação markdown de bloco de código adicional se possível, apenas código HTML pronto para execução em iframe.`;
}

export async function generateWebsiteWithAI(
  userId: string,
  params: GenerateWebsiteParams
): Promise<{ prompt: string; html: string; modelUsed: string; isAiGenerated: boolean }> {
  const prompt = buildWebsitePrompt(params);
  const client = getGeminiClient();
  const settings = db.getAdminSettings();
  const model = settings.gemini.model || 'gemini-3.8-flash';

  if (!client || !settings.gemini.active || !settings.features.gemini_enabled) {
    // Return high quality structured HTML fallback template customized to company
    const fallbackHtml = generateCustomizedTemplate(params);
    db.logAiGeneration(userId, 'website', model, 'failed', 'Gemini API não configurada ou desativada, usando gerador semântico interno');
    return {
      prompt,
      html: fallbackHtml,
      modelUsed: 'vendeai-semantic-engine',
      isAiGenerated: false,
    };
  }

  try {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
    });

    let html = response.text || '';
    // Clean markdown wrap if returned
    if (html.includes('```html')) {
      html = html.split('```html')[1].split('```')[0].trim();
    } else if (html.includes('```')) {
      html = html.split('```')[1].split('```')[0].trim();
    }

    if (!html.includes('<html')) {
      html = generateCustomizedTemplate(params);
    }

    db.logAiGeneration(userId, 'website', model, 'success');
    return {
      prompt,
      html,
      modelUsed: model,
      isAiGenerated: true,
    };
  } catch (err: any) {
    console.error('Gemini Generation Error:', err);
    db.logAiGeneration(userId, 'website', model, 'failed', err?.message || 'Erro de conexão');
    const fallbackHtml = generateCustomizedTemplate(params);
    return {
      prompt,
      html: fallbackHtml,
      modelUsed: 'vendeai-semantic-engine',
      isAiGenerated: false,
    };
  }
}

export function buildProposalPrompt(lead: {
  company_name: string;
  category: string;
  city?: string;
  has_website: boolean;
}): string {
  return `Você é um especialista em vendas B2B e prospecção de clientes para desenvolvimento de sites e presença digital no Brasil.
Crie uma mensagem curta, altamente profissional e sem parecer spam para ser enviada pelo WhatsApp para o dono da empresa "${lead.company_name}".

Dados da empresa:
- Nome: ${lead.company_name}
- Nicho / Ramo: ${lead.category}
- Cidade: ${lead.city || 'sua região'}
- Situação do site: ${lead.has_website ? 'Possui site desatualizado ou que pode ser melhorado para celular' : 'Ainda não possui site oficial no Google'}

REGRAS:
1. Seja educado, direto e profissional (máximo 4 a 6 linhas).
2. Mencione que encontrou o negócio na região e notou grande potencial de crescimento de clientes diretos pelo Google e WhatsApp.
3. Não faça promessas mirabolantes. Apresente que você cria sites profissionais modernos focados em agendamentos/pedidos.
4. Inclua uma chamada para ação suave (ex: "Se fizer sentido para você, posso te mandar uma prévia sem compromisso de como ficaria").
5. NÃO inclua saudações genéricas como [Seu Nome] ou placeholders complexos, use uma redação pronta para envio.`;
}

export async function generateProposalWithAI(
  userId: string,
  lead: {
    company_name: string;
    category: string;
    city?: string;
    has_website: boolean;
  }
): Promise<{ proposal: string; modelUsed: string; isAiGenerated: boolean }> {
  const prompt = buildProposalPrompt(lead);
  const client = getGeminiClient();
  const settings = db.getAdminSettings();
  const model = settings.gemini.model || 'gemini-3.8-flash';

  if (!client || !settings.gemini.active || !settings.features.gemini_enabled) {
    // Generate tailored Brazilian high-conversion proposal template
    const proposal = generateFallbackProposal(lead);
    db.logAiGeneration(userId, 'proposal', model, 'failed', 'Gemini API inativa, gerado pelo motor inteligente de propostas');
    return {
      proposal,
      modelUsed: 'vendeai-sales-engine',
      isAiGenerated: false,
    };
  }

  try {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
    });

    const proposal = response.text ? response.text.trim() : generateFallbackProposal(lead);
    db.logAiGeneration(userId, 'proposal', model, 'success');
    return {
      proposal,
      modelUsed: model,
      isAiGenerated: true,
    };
  } catch (err: any) {
    db.logAiGeneration(userId, 'proposal', model, 'failed', err?.message || 'Erro');
    return {
      proposal: generateFallbackProposal(lead),
      modelUsed: 'vendeai-sales-engine',
      isAiGenerated: false,
    };
  }
}

export async function testGeminiConnection(): Promise<{ success: boolean; message: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, message: 'GEMINI_API_KEY não está configurada no ambiente.', model: 'none' };
  }
  const client = getGeminiClient();
  if (!client) {
    return { success: false, message: 'Falha ao instanciar cliente Gemini.', model: 'none' };
  }
  const settings = db.getAdminSettings();
  const model = settings.gemini.model || 'gemini-3.8-flash';

  try {
    const res = await client.models.generateContent({
      model,
      contents: 'Responda apenas: Conexão Vende AI Gemini OK.',
    });
    return {
      success: true,
      message: res.text?.trim() || 'Gemini respondeu com sucesso.',
      model,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro na chamada ao modelo ${model}: ${err?.message || 'Falha de autenticação ou rede'}`,
      model,
    };
  }
}

function generateFallbackProposal(lead: { company_name: string; category: string; city?: string; has_website: boolean }): string {
  const cityStr = lead.city ? ` em ${lead.city}` : '';
  const niche = lead.category.toLowerCase();
  
  let specificPitch = 'apresentar seus serviços com destaque e facilitar o agendamento de clientes';
  if (niche.includes('restaurante') || niche.includes('pizzaria') || niche.includes('hamburgueria')) {
    specificPitch = 'exibir seu cardápio digital completo e receber pedidos diretos no WhatsApp sem taxas de aplicativos';
  } else if (niche.includes('pet') || niche.includes('veterin')) {
    specificPitch = 'mostrar os serviços de banho, tosa e consultas facilitando o contato dos tutores';
  } else if (niche.includes('barbearia') || niche.includes('salão')) {
    specificPitch = 'mostrar os cortes, serviços e permitir agendamento rápido com um clique';
  } else if (niche.includes('dentista') || niche.includes('clínica')) {
    specificPitch = 'passar máxima credibilidade aos pacientes e facilitar o agendamento de avaliações';
  }

  const websiteContext = lead.has_website
    ? 'percebi que a presença digital de vocês pode ser modernizada para converter muito mais visitas em contatos reais'
    : 'percebi que vocês ainda não possuem um site oficial destacado no Google quando as pessoas pesquisam na região';

  return `Olá! Tudo bem?

Acompanho o trabalho da ${lead.company_name}${cityStr} e vejo o quanto o atendimento de vocês tem destaque.

Estava analisando negócios da sua área e ${websiteContext}. 

Eu trabalho desenvolvendo páginas profissionais focadas em ${specificPitch}. 

Se fizer sentido para você, montei uma prévia demonstrativa sem compromisso para você ver como ficaria o site oficial da ${lead.company_name}. Posso te enviar por aqui?`;
}

function generateCustomizedTemplate(params: GenerateWebsiteParams): string {
  const { niche, colors, style, objectives, company_data } = params;
  const primary = colors.primary || '#7C3AED';
  const secondary = colors.secondary || '#1F2937';
  const name = company_data.name || 'Sua Empresa';
  const phone = company_data.phone || '(00) 90000-0000';
  const whatsappClean = (company_data.whatsapp || phone).replace(/\D/g, '');
  const city = company_data.city || 'Brasil';
  const address = company_data.address || `Atendimento especial em ${city}`;

  return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} | ${niche}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-gray-900 text-gray-100 antialiased selection:bg-purple-500 selection:text-white">
  <!-- Topbar -->
  <header class="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white" style="background-color: ${primary};">
          ${name.charAt(0)}
        </div>
        <span class="text-xl font-bold tracking-tight text-white">${name}</span>
      </div>
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
        <a href="#servicos" class="hover:text-white transition">Serviços</a>
        <a href="#diferenciais" class="hover:text-white transition">Diferenciais</a>
        <a href="#sobre" class="hover:text-white transition">Sobre Nós</a>
        <a href="#faq" class="hover:text-white transition">Dúvidas</a>
        <a href="#contato" class="hover:text-white transition">Contato</a>
      </nav>
      <a href="https://wa.me/${whatsappClean}" target="_blank" class="px-5 py-2.5 rounded-full font-semibold text-sm text-white shadow-lg transition transform hover:-translate-y-0.5" style="background-color: ${primary};">
        Falar no WhatsApp
      </a>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
    <div class="max-w-5xl mx-auto px-4 text-center">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-700 bg-gray-800/80 text-xs text-gray-300 font-semibold mb-6">
        <span class="w-2 h-2 rounded-full animate-pulse" style="background-color: ${primary};"></span>
        Referência em ${niche} em ${city}
      </div>
      <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
        Excelência e cuidado com <span style="color: ${primary};">${name}</span>
      </h1>
      <p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Soluções personalizadas em ${niche.toLowerCase()} com atendimento de alto padrão, agilidade e total satisfação para você.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="https://wa.me/${whatsappClean}?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20mais%20informações." target="_blank" class="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-base shadow-xl transition transform hover:scale-105" style="background-color: ${primary};">
          Solicitar Atendimento Imediato
        </a>
        <a href="#servicos" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-base border border-gray-700 transition">
          Conhecer Serviços
        </a>
      </div>
    </div>
  </section>

  <!-- Services -->
  <section id="servicos" class="py-20 bg-gray-950 border-t border-gray-800">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl font-bold text-white mb-4">Nossos Serviços Especializados</h2>
        <p class="text-gray-400">Desenvolvidos para entregar os melhores resultados com atendimento exclusivo.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-6 text-white" style="background-color: ${primary};">01</div>
          <h3 class="text-xl font-bold text-white mb-3">Atendimento Personalizado</h3>
          <p class="text-gray-400 text-sm leading-relaxed">Cada detalhe é avaliado por profissionais dedicados para garantir a sua tranquilidade e satisfação.</p>
        </div>
        <div class="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-6 text-white" style="background-color: ${primary};">02</div>
          <h3 class="text-xl font-bold text-white mb-3">Soluções Rápidas</h3>
          <p class="text-gray-400 text-sm leading-relaxed">Processos ágeis sem burocracia, mantendo rigoroso padrão de qualidade em ${niche.toLowerCase()}.</p>
        </div>
        <div class="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-6 text-white" style="background-color: ${primary};">03</div>
          <h3 class="text-xl font-bold text-white mb-3">Garantia & Confiança</h3>
          <p class="text-gray-400 text-sm leading-relaxed">Compromisso comprovado com os clientes e suporte contínuo para qualquer necessidade.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Location & Contact -->
  <section id="contato" class="py-20 bg-gray-900 border-t border-gray-800">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold text-white mb-4">Visite Nosso Espaço ou Entre em Contato</h2>
      <p class="text-gray-400 mb-8">${address}</p>
      <div class="p-6 rounded-2xl bg-gray-950 border border-gray-800 max-w-md mx-auto mb-8">
        <p class="text-sm text-gray-300 font-semibold mb-2">Horário de Funcionamento</p>
        <p class="text-xs text-gray-400">${company_data.hours || 'Segunda a Sexta das 08h às 18h | Sábado das 08h às 13h'}</p>
      </div>
      <a href="https://wa.me/${whatsappClean}" target="_blank" class="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-xl transition transform hover:scale-105" style="background-color: ${primary};">
        Chamar no WhatsApp Direto
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 bg-black border-t border-gray-800 text-center text-xs text-gray-500">
    <p>&copy; ${new Date().getFullYear()} ${name} - Todos os direitos reservados. Feito com tecnologia Vende AI.</p>
  </footer>

  <!-- Floating WhatsApp CTA -->
  <a href="https://wa.me/${whatsappClean}" target="_blank" class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl hover:bg-green-600 transition transform hover:scale-110" title="Falar no WhatsApp">
    <svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.541 1.961.82 2.796.82h.005c3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.767-5.773-5.767zm7.65 5.767c0 4.22-3.434 7.653-7.653 7.653-.889 0-1.745-.152-2.548-.439l-4.48 1.173 1.196-4.368c-.371-.852-.569-1.791-.569-2.776 0-4.22 3.434-7.653 7.653-7.653 4.22 0 7.653 3.433 7.653 7.653z"/></svg>
  </a>
</body>
</html>`;
}
