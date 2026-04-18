import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full text-gray-400 py-8 px-6 md:px-4">
      {/* Centered Gradient Border Line */}
      <div className="w-full max-w-screen-xl md:w-[82%] mx-auto h-px mb-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

      {/* Main */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Minha Conta */}
          <div>
            <h2 className="font-normal text-lg mb-4 text-white">MINHA CONTA</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://dashboard.oriscloud.com.br/"
                  className="hover:text-gray-300 transition-colors inline-flex items-center space-x-1.5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Painel de Controle</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Máquinas */}
          <div>
            <h2 className="font-normal text-lg mb-4 text-white">MÁQUINAS</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/machines/"
                  className="hover:text-gray-300 transition-colors inline-flex items-center space-x-1.5"
                >
                  <span>Máquinas Virtuais</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Downloads */}
          <div>
            <h2 className="font-normal text-lg mb-4 text-white">DOWNLOADS</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://parsec.app/downloads"
                  className="hover:text-gray-300 transition-colors inline-flex items-center space-x-1.5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Parsec</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/moonlight-stream/moonlight-qt/releases/tag/v6.1.0"
                  className="hover:text-gray-300 transition-colors inline-flex items-center space-x-1.5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Moonlight</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h2 className="font-normal text-lg mb-4 text-white">CONTATO</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/discord"
                  className="hover:text-gray-300 transition-colors inline-flex items-center space-x-1.5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Discord</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Aviso de Direitos Autorais */}
        <div className="mt-8 text-left">
          <p>&copy; {new Date().getFullYear()} Oris Cloud. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
