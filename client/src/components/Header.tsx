import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useAuthContext } from '@/contexts/AuthContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading, isLoggedIn, logout } = useAuthContext();

  const navItems = [
    { name: 'Início', href: '#home' },
    { name: 'Sobre', href: '#about' },
    { name: 'Planos', href: '#plans' },
    { name: 'FAQ', href: '#faq' },
  ];

  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const avatarInitial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo - Minimalista */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2"
        >
          <img
            src="/logo-sm.png"
            srcSet="/logo-sm.png 1x, /logo-md.png 2x, /logo-lg.png 3x"
            alt="Oris Cloud"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-bold tracking-wider text-white">ORIS</span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-12">
          {navItems.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              whileHover={{ opacity: 0.7 }}
              className="text-sm font-medium text-foreground/80 hover:text-white transition-colors"
            >
              {item.name}
            </motion.a>
          ))}
        </nav>

        {/* Auth + CTA - Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse bg-white/10 rounded" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-3">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={displayName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white">
                  {avatarInitial}
                </div>
              )}
              <span className="text-sm font-medium text-white hidden lg:inline max-w-[160px] truncate">
                {displayName}
              </span>
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-foreground/60 hover:text-red-400 transition-colors inline-flex items-center gap-1.5"
                aria-label="Sair"
              >
                <LogOut size={16} />
                <span className="hidden lg:inline">Sair</span>
              </motion.button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-foreground/80 hover:text-white transition-colors"
            >
              Entrar
            </Link>
          )}

          <motion.a
            href="https://discord.gg/3pT7NJGZ97"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-white text-black font-semibold rounded-sm hover:bg-gray-200 transition-colors"
          >
            Discord
          </motion.a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-card border-b border-border"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground/80 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}

            {/* Auth - Mobile */}
            {isLoading ? null : isLoggedIn ? (
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={displayName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white">
                      {avatarInitial}
                    </div>
                  )}
                  <span className="text-sm text-white truncate max-w-[180px]">{displayName}</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-foreground/80 hover:text-white transition-colors"
              >
                Entrar
              </Link>
            )}

            <a
              href="https://discord.gg/3pT7NJGZ97"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-white text-black font-semibold rounded-sm text-center hover:bg-gray-200 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Discord
            </a>
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
}
