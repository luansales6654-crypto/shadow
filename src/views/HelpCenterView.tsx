import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Sparkles, MapPin, DollarSign } from 'lucide-react';

export const HelpCenterView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Como encontrar empresas que realmente precisam de um site?',
      a: 'Acesse a aba "Encontrar Empresas", selecione o nicho de sua preferência (ex: Pet Shop, Odontologia, Restaurante), selecione seu estado e cidade. A ferramenta irá consultar o Google Maps e sinalizar com a tag roxa "SEM SITE IDENTIFICADO" todos os estabelecimentos que não cadastraram website. Estes são os clientes mais fáceis de fechar!',
    },
    {
      q: 'Quanto devo cobrar pelo desenvolvimento de um site?',
      a: 'Recomendamos para iniciantes cobrar entre R$ 500,00 e R$ 900,00 por um site institucional one-page profissional de alta conversão. Para clientes com maior poder aquisitivo ou demandas adicionais (domínio próprio, contas de e-mail), você pode cobrar tranquilamente de R$ 1.200,00 a R$ 2.500,00.',
    },
    {
      q: 'Como funciona a aprovação do meu pagamento Pix?',
      a: 'Assim que você realiza o Pix e anexa o comprovante, o administrador Master recebe uma notificação instantânea. A aprovação ocorre e o seu acesso é liberado com todos os recursos ativos.',
    },
    {
      q: 'Como utilizar a inteligência artificial Gemini da melhor forma?',
      a: 'Nosso sistema já possui engenharia de prompt avançada. Basta escolher o nicho, o estilo e preencher o nome da empresa. A IA cuidará da paleta de cores de alto contraste, seções persuasivas, depoimentos adaptados e links de WhatsApp automáticos.',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
          Suporte e Capacitação
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Central de Ajuda</h2>
        <p className="text-xs text-gray-400">
          Tire dúvidas e aprenda as melhores estratégias comerciais para fechar clientes todos os dias.
        </p>
      </div>

      {/* Guide Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0E0E12] to-indigo-950/30 border border-purple-500/30 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">Guia Rápido: O Ciclo de Venda de 4 Passos</h3>
        </div>
        <div className="grid sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-black/50 border border-gray-800">
            <span className="font-bold text-purple-400 block mb-1">1. Encontre</span>
            <p className="text-gray-400">Filtre empresas sem site no Google Maps na sua cidade.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-black/50 border border-gray-800">
            <span className="font-bold text-purple-400 block mb-1">2. Crie a Demonstração</span>
            <p className="text-gray-400">Use a IA da Vende AI para gerar um protótipo em 30 segundos.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-black/50 border border-gray-800">
            <span className="font-bold text-purple-400 block mb-1">3. Aborde no WhatsApp</span>
            <p className="text-gray-400">Gere a proposta com IA e envie o link do site modelo.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-black/50 border border-gray-800">
            <span className="font-bold text-emerald-400 block mb-1">4. Feche & Receba</span>
            <p className="text-gray-400">Receba seu Pix de R$ 500 a R$ 1.500 e registre na plataforma.</p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
          Perguntas Frequentes
        </h3>
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl bg-[#0B0B0B] border border-gray-800 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-zinc-900/50 transition"
              >
                <span className="text-xs font-bold text-white">{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-400 leading-relaxed border-t border-gray-800/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
