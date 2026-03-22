import { Link } from "wouter";

import SEO from "@/hooks/useSEO";

export default function Termos() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <SEO
        title="Termos de Uso"
        description="Termos de Uso do Valtor. Condições de utilização da plataforma de análise de loterias."
        path="/termos"
      />
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Termos de Uso</h1>
          <p className="text-gray-400">Última atualização: 18 de março de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceitação dos Termos</h2>
            <p className="text-gray-300 leading-relaxed">
              Ao acessar e utilizar a plataforma Valtor ("Serviço"), você concorda com estes Termos de Uso ("Termos").
              Se você não concordar com qualquer parte destes Termos, não utilize o Serviço. Estes Termos constituem
              um acordo legal entre você ("Usuário") e Valtor Tecnologia Ltda. ("Valtor", "nós", "nosso").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Descrição do Serviço</h2>
            <p className="text-gray-300 leading-relaxed">
              O Valtor é uma plataforma digital de informações e ferramentas para apostadores de loterias da Caixa
              Econômica Federal. O Serviço oferece:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 mt-3 ml-4">
              <li>Consulta de resultados de loterias (Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete e +Milionária)</li>
              <li>Ferramentas de análise estatística de números sorteados</li>
              <li>Gerador de jogos com base em frequência histórica</li>
              <li>Conferidor de apostas</li>
              <li>Carteira pessoal de jogos salvos</li>
              <li>Notificações por e-mail com resultados diários (plano premium)</li>
              <li>Extensão Chrome para importação de jogos (plano premium)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Natureza Informativa do Serviço</h2>
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-yellow-400">IMPORTANTE:</strong> O Valtor é uma plataforma de informações e
              ferramentas de apoio. Não realizamos apostas, não intermediamos apostas e não garantimos ganhos ou
              resultados. As análises estatísticas e jogos gerados são baseados em dados históricos e não representam
              previsão ou garantia de resultados futuros. Jogos de loteria são jogos de azar regulados pela Caixa
              Econômica Federal. Aposte com responsabilidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Cadastro e Conta de Usuário</h2>
            <p className="text-gray-300 leading-relaxed">
              Para acessar determinadas funcionalidades, você deverá criar uma conta utilizando autenticação OAuth.
              Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades
              realizadas em sua conta. Você concorda em notificar imediatamente o Valtor sobre qualquer uso não
              autorizado de sua conta.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Ao criar uma conta, você declara que tem pelo menos 18 (dezoito) anos de idade, conforme exigido pela
              legislação brasileira para participação em jogos de loteria.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Planos e Pagamentos</h2>
            <p className="text-gray-300 leading-relaxed">
              O Valtor oferece dois planos:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-3 ml-4">
              <li><strong className="text-white">Plano Gratuito (Explorador):</strong> Acesso às funcionalidades básicas sem custo.</li>
              <li><strong className="text-white">Clube Valtor (Premium):</strong> Assinatura mensal de R$ 39,90, com acesso a todas as funcionalidades premium, incluindo extensão Chrome, notificações por e-mail e ferramentas avançadas.</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Os pagamentos são processados com segurança pela Stripe. A assinatura é renovada automaticamente a cada
              mês até que seja cancelada. O cancelamento pode ser realizado a qualquer momento pelo usuário, sem multa
              ou fidelidade. Após o cancelamento, o acesso premium permanece ativo até o fim do período já pago.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Os preços podem ser alterados mediante aviso prévio de 30 (trinta) dias por e-mail.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Política de Reembolso</h2>
            <p className="text-gray-300 leading-relaxed">
              Oferecemos reembolso integral em até 7 (sete) dias corridos após a primeira cobrança, conforme o
              Código de Defesa do Consumidor (CDC) e o Decreto nº 7.962/2013. Para solicitar reembolso, entre em
              contato pelo e-mail suporte@valtor.com.br. Após o período de 7 dias, não são realizados reembolsos
              parciais por períodos não utilizados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Propriedade Intelectual</h2>
            <p className="text-gray-300 leading-relaxed">
              Todo o conteúdo do Valtor, incluindo mas não limitado a textos, gráficos, logotipos, ícones, imagens,
              código-fonte e software, é de propriedade do Valtor ou de seus licenciadores e está protegido pelas
              leis de propriedade intelectual brasileiras e internacionais.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Os dados de resultados de loterias são de domínio público, fornecidos pela Caixa Econômica Federal.
              A extensão Chrome é fornecida como ferramenta auxiliar e não possui vínculo oficial com a Caixa
              Econômica Federal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Limitação de Responsabilidade</h2>
            <p className="text-gray-300 leading-relaxed">
              O Valtor não se responsabiliza por:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 mt-3 ml-4">
              <li>Perdas financeiras decorrentes de apostas realizadas com base nas ferramentas do Serviço</li>
              <li>Interrupções temporárias do Serviço por manutenção ou fatores externos</li>
              <li>Imprecisões nos dados fornecidos pela Caixa Econômica Federal</li>
              <li>Danos indiretos, incidentais ou consequentes de qualquer natureza</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Conduta do Usuário</h2>
            <p className="text-gray-300 leading-relaxed">
              Você concorda em não utilizar o Serviço para:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 mt-3 ml-4">
              <li>Violar qualquer lei ou regulamento aplicável</li>
              <li>Realizar engenharia reversa, descompilar ou tentar extrair o código-fonte do Serviço</li>
              <li>Usar scrapers, bots ou ferramentas automatizadas para acessar o Serviço em volume excessivo</li>
              <li>Compartilhar credenciais de acesso com terceiros</li>
              <li>Tentar comprometer a segurança ou integridade do Serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Modificações dos Termos</h2>
            <p className="text-gray-300 leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão
              comunicadas por e-mail com antecedência mínima de 15 (quinze) dias. O uso continuado do Serviço após
              as alterações constitui aceitação dos novos Termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Rescisão</h2>
            <p className="text-gray-300 leading-relaxed">
              O Valtor reserva-se o direito de suspender ou encerrar sua conta em caso de violação destes Termos,
              mediante aviso prévio quando possível. Você pode encerrar sua conta a qualquer momento através das
              configurações do perfil ou entrando em contato com o suporte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Lei Aplicável e Foro</h2>
            <p className="text-gray-300 leading-relaxed">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca
              de São Paulo, Estado de São Paulo, para dirimir quaisquer controvérsias decorrentes destes Termos,
              com renúncia expressa a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contato</h2>
            <p className="text-gray-300 leading-relaxed">
              Para dúvidas sobre estes Termos, entre em contato:
            </p>
            <ul className="list-none text-gray-300 space-y-1 mt-3 ml-4">
              <li><strong className="text-white">E-mail:</strong> suporte@valtor.com.br</li>
              <li><strong className="text-white">Site:</strong> https://valtor.com.br</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex gap-4">
          <Link href="/privacidade" className="text-blue-400 hover:text-blue-300 transition-colors">
            Política de Privacidade
          </Link>
          <Link href="/" className="text-gray-400 hover:text-gray-300 transition-colors">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
