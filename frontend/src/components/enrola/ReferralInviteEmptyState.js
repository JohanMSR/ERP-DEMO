import React from 'react';
import { Share2, Users } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

function ReferralInviteEmptyState({ onOpenPrograms, className = '' }) {
  return (
    <EmptyState
      className={className}
      icon={Users}
      title="Aún no tienes invitados"
      description="Cuando alguien use tu enlace y se registre, aparecerá aquí con el estado paso a paso."
      action={
        onOpenPrograms ? (
          <button
            type="button"
            onClick={onOpenPrograms}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Share2 className="h-5 w-5" />
            Compartir mi enlace
          </button>
        ) : null
      }
    />
  );
}

export default ReferralInviteEmptyState;
