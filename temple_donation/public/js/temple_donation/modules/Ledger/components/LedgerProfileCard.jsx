import React from 'react';
import { Avatar } from 'antd';
import SectionCard from '../../../components/common/SectionCard';

const LedgerProfileCard = ({ user }) => {
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return parts.map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const fullName = user.full_name || user.name || "Cashier";
  const initials = getInitials(fullName);

  return (
    <SectionCard>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '12px 0 4px 0' }}>
        <Avatar
          size={96}
          src={user.user_image || undefined}
          style={{
            fontSize: 32, 
            fontWeight: 800,
            border: '4px solid #fff',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            background: user.user_image ? undefined : 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {!user.user_image && initials}
        </Avatar>

        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
            {fullName}
          </div>
          {user.email && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, wordBreak: 'break-all' }}>
              {user.email}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default LedgerProfileCard;
