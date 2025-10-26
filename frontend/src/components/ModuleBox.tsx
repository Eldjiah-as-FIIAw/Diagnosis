// ModuleBox.tsx (inchangé)
import React, { ReactNode } from 'react';
import './ModuleBox.css';

interface ModuleBoxProps {
  title: string;
  icon: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

const ModuleBox: React.FC<ModuleBoxProps> = ({ title, icon, isActive, onClick, children }) => {
  return (
    <div className={`module-box ${isActive ? 'active' : ''}`} onClick={onClick}>
      {/* En-tête */}
      <div className="module-header">
        <div className={`module-icon ${isActive ? 'active' : ''}`}>
          {icon}
        </div>
        <div className="module-title">{title}</div>
      </div>

      {/* Contenu */}
      <div className="module-content">{children}</div>

      {/* Icône flottante en bas quand inactif */}
      {!isActive && (
        <div className="floating-icon">
          {icon}
        </div>
      )}
    </div>
  );
};

export default ModuleBox;