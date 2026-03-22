import { Link } from "wouter";

import SEO from "@/hooks/useSEO";

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <SEO
        title="Política de Privacidade"
        description="Política de Privacidade do Valtor. Saiba como coletamos, utilizamos e protegemos seus dados pessoais em conformidade com a LGPD."
        path="/privacidade"
      />
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidade — Valtor</h1>
          <p className="text-gray-400">Última atualização: 18 de março de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert max-w-none space-y-8">

          {/* 1. Introdução */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introdução</h2>
            <p className="text-gray-300 leading-relaxed">
              A Valtor Tecnologia Ltda. ("Valtor", "nós") respeita a sua privacidade e está comprometida com a proteção
              dos dados pessoais de seus usuários ("Usuário", "você").
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos seus dados,
              em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
            </p>
          </section>

          {/* 2. Dados Coletados */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Dados Coletados</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Podemos coletar os seguintes dados:
            </p>

            <h3 className="text-lg font-medium text-gray-200 mt-4 mb-2">a) Dados de cadastro</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Nome</li>
              <li>E-mail</li>
              <li>Dados de autenticação via OAuth (Google, etc.)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-200 mt-4 mb-2">b) Dados de uso</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Histórico de acesso</li>
              <li>Interações com a plataforma</li>
              <li>Jogos salvos</li>
              <li>Preferências</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-200 mt-4 mb-2">c) Dados técnicos</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Endereço IP</li>
              <li>Tipo de dispositivo e navegador</li>
              <li>Cookies e identificadores</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-200 mt-4 mb-2">d) Dados de pagamento</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Informações de pagamento são processadas pela Stripe</li>
              <li>O Valtor não armazena dados completos de cartão</li>
            </ul>
          </section>

          {/* 3. Finalidade do Tratamento */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Finalidade do Tratamento</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Utilizamos seus dados para:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Fornecer e operar o serviço</li>
              <li>Personalizar a experiência do usuário</li>
              <li>Enviar notificações e comunicações</li>
              <li>Processar pagamentos e assinaturas</li>
              <li>Melhorar a plataforma</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          {/* 4. Base Legal */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Base Legal</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Tratamos seus dados com base em:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Execução de contrato</li>
              <li>Consentimento</li>
              <li>Legítimo interesse</li>
              <li>Cumprimento de obrigação legal</li>
            </ul>
          </section>

          {/* 5. Compartilhamento de Dados */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Compartilhamento de Dados</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Seus dados podem ser compartilhados com:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>
                <strong className="text-white">Stripe</strong> (processamento de pagamentos)
              </li>
              <li>
                <strong className="text-white">Provedores de infraestrutura</strong> (hosting, analytics)
              </li>
              <li>
                <strong className="text-white">Autoridades legais</strong>, quando exigido
              </li>
            </ul>
            <div className="bg-gray-900 rounded-lg p-4 mt-4 border border-gray-800">
              <p className="text-yellow-400 font-semibold">Não vendemos dados pessoais.</p>
            </div>
          </section>

          {/* 6. Cookies e Tecnologias */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cookies e Tecnologias</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Autenticação</li>
              <li>Análise de uso</li>
              <li>Melhoria da experiência</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Você pode gerenciar cookies no seu navegador.
            </p>
          </section>

          {/* 7. Armazenamento e Segurança */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Armazenamento e Segurança</h2>
            <p className="text-gray-300 leading-relaxed">
              Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado,
              perda ou alteração.
            </p>
          </section>

          {/* 8. Direitos do Usuário (LGPD) */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Direitos do Usuário (LGPD)</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Você pode:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Acessar seus dados</li>
              <li>Corrigir dados</li>
              <li>Solicitar exclusão</li>
              <li>Revogar consentimento</li>
            </ul>
            <div className="bg-gray-900 rounded-lg p-4 mt-4 border border-gray-800">
              <p className="text-gray-300">
                <strong className="text-white">Solicitações:</strong>{" "}
                <a href="mailto:suporte@valtor.com.br" className="text-blue-400 hover:text-blue-300">
                  suporte@valtor.com.br
                </a>
              </p>
            </div>
          </section>

          {/* 9. Comunicações */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Comunicações</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              O usuário poderá receber:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>E-mails operacionais</li>
              <li>Notificações de resultados</li>
              <li>Comunicações do serviço</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Você pode cancelar comunicações a qualquer momento.
            </p>
          </section>

          {/* 10. Retenção de Dados */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Retenção de Dados</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Seus dados serão mantidos enquanto:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Sua conta estiver ativa</li>
              <li>Necessário para cumprimento legal</li>
            </ul>
          </section>

          {/* 11. Alterações */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Alterações</h2>
            <p className="text-gray-300 leading-relaxed">
              Podemos atualizar esta Política. Notificaremos alterações relevantes.
            </p>
          </section>

          {/* 12. Contato */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contato</h2>
            <div className="bg-gray-900 rounded-lg p-4 mt-3 space-y-2 border border-gray-800">
              <p className="text-gray-300">
                <strong className="text-white">E-mail:</strong>{" "}
                <a href="mailto:suporte@valtor.com.br" className="text-blue-400 hover:text-blue-300">
                  suporte@valtor.com.br
                </a>
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Site:</strong>{" "}
                <a href="https://valtor.com.br" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  https://valtor.com.br
                </a>
              </p>
            </div>
          </section>

          {/* Cláusula de Aceite */}
          <section className="mt-12">
            <div className="bg-gradient-to-r from-blue-950 to-indigo-950 rounded-xl p-6 border border-blue-800/50">
              <h2 className="text-xl font-bold text-white mb-4">Cláusula de Aceite (Obrigatória na Assinatura)</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Ao criar uma conta ou contratar o plano premium do Valtor, o usuário declara que:
              </p>
              <ul className="space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">☑</span>
                  <span className="text-gray-300">Leu e concorda com os <Link href="/termos" className="text-blue-400 hover:text-blue-300 underline">Termos de Uso</Link></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">☑</span>
                  <span className="text-gray-300">Leu e concorda com a <strong className="text-white">Política de Privacidade</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">☑</span>
                  <span className="text-gray-300">Autoriza o tratamento de seus dados pessoais conforme descrito</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">☑</span>
                  <span className="text-gray-300">Declara ser maior de 18 anos</span>
                </li>
              </ul>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex gap-4">
          <Link href="/termos" className="text-blue-400 hover:text-blue-300 transition-colors">
            Termos de Uso
          </Link>
          <Link href="/" className="text-gray-400 hover:text-gray-300 transition-colors">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
