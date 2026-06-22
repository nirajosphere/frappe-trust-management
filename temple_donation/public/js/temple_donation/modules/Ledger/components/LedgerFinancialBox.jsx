import React from 'react';

const LedgerFinancialBox = ({ title, amount, description, colorTheme = "black" }) => {
  // Slate-Black dynamic token configurations
  const styles = colorTheme === "black" ? {
    bg: "#0F172A",          // Premium Dark Slate / Black Background
    border: "#0F172A",      // Seamless edge border
    text: "#FFFFFF",        // Primary white typography
    subText: "#94A3B8"      // Muted slate text for description
  } : {
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#0F172A",
    subText: "#64748B"
  };

  return (
    <div style={{
      background: styles.bg,
      border: `1px solid ${styles.border}`,
      borderRadius: 6,
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      // boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.05)"
    }}>
      {/* Title Header Block */}
      <span style={{ 
        fontSize: 10, 
        fontWeight: 700, 
        color: styles.subText, 
        letterSpacing: "0.09em", 
        textTransform: "uppercase" 
      }}>
        {title}
      </span>

      {/* Primary Amount Display */}
      <span style={{ 
        fontSize: 28, 
        fontWeight: 800, 
        color: styles.text, 
        letterSpacing: "-0.03em",
        lineHeight: 1
      }}>
        ₹{Number(amount || 0).toLocaleString("en-IN")}
      </span>

      {/* Description Meta Helper */}
      {description && (
        <span style={{ 
          fontSize: 11, 
          color: styles.subText, 
          fontWeight: 500,
          lineHeight: "1.4",
          marginTop: 2
        }}>
          {description}
        </span>
      )}
    </div>
  );
};

export default LedgerFinancialBox;