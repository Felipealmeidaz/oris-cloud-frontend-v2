import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou cookies
    const cookieConsent = localStorage.getItem('oris-cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('oris-cookie-consent', 'accepted');
    localStorage.setItem('oris-cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('oris-cookie-consent', 'rejected');
    localStorage.setItem('oris-cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Política de Cookies e Privacidade</h3>
                  <p className="text-sm text-foreground/70 mb-4">
                    Utilizamos cookies para melhorar sua experiência no site. Ao continuar navegando, você concorda com nossa{' '}
                    <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                      Política de Privacidade
                    </a>{' '}
                    e{' '}
                    <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                      Termos de Uso
                    </a>
                    . Conforme a LGPD, você tem direito ao acesso, correção e exclusão de seus dados.
                  </p>
                </div>
                <button
                  onClick={handleReject}
                  className="flex-shrink-0 p-1 hover:bg-foreground/10 rounded transition-colors"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAccept}
                  className="px-6 py-2 bg-white text-black font-semibold rounded-sm hover:bg-gray-200 transition-colors"
                >
                  Aceitar Todos
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReject}
                  className="px-6 py-2 border border-white/30 text-white font-semibold rounded-sm hover:border-white/60 transition-colors"
                >
                  Rejeitar
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
