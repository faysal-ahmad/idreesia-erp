import React, { type ReactNode } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shell for the signed-out screens: brand header, form card, footer links. */
export const AuthLayout = ({ title, subtitle, children, footer }: Props) => (
  <div className="auth-layout">
    <header className="auth-brand">
      <img alt="Idreesia" className="auth-brand-logo" src="/images/idreesia-logo.png" />
      <p className="auth-brand-name">Idreesia</p>
    </header>
    <section className="auth-card">
      {title && <h1 className="auth-title">{title}</h1>}
      {subtitle && <p className="auth-subtitle">{subtitle}</p>}
      {children}
    </section>
    {footer && <footer className="auth-footer">{footer}</footer>}
  </div>
);
