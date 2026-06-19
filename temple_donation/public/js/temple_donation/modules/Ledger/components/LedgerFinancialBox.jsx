import React from 'react';

const LedgerFinancialBox = ({ title, amount, description, colorTheme = "green" }) => {
  const styles = colorTheme === "green" ? {
    bg: "#F0FDF4",
    border: "#BBF7D0",
    text: "#16A34A"
  } : {
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#0F172A"
  };

  return (
    <div style={{
      background: styles.bg,
      border: `1px solid ${styles.border}`,
      borderRadius: 16,
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: styles.text, letterSpacing: "0.09em", textTransform: "uppercase" }}>
        {title}
      </span>
      <span style={{ fontSize: 28, fontWeight: 800, color: styles.text, letterSpacing: "-0.03em" }}>
        ₹{Number(amount || 0).toLocaleString("en-IN")}
      </span>
      {description && (
        <span style={{ fontSize: 11, color: styles.text, opacity: 0.8, fontWeight: 500 }}>
          {description}
        </span>
      )}
    </div>
  );
};

export default LedgerFinancialBox;
