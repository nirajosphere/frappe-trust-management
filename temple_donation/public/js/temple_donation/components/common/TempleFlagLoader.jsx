import React from "react";
import { createPortal } from "react-dom";

const TempleFlagLoader = ({
    fullScreen = false,
    text = "Trust Management Portal",
    subtext = "Initializing services, please wait...",
    size = "medium" // "small", "medium", "large"
}) => {
    // Determine sizes based on prop
    const loaderSize = size === "small" ? 80 : size === "large" ? 200 : 140;
    const logoSize = size === "small" ? 44 : size === "large" ? 110 : 80;
    
    const loaderContent = (
        <div className="temple-loading-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="temple-svg-container" style={{ 
                width: `${loaderSize}px`, 
                height: `${loaderSize}px`, 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: size === "small" ? '8px' : '20px'
            }}>
                {/* Glowing Background */}
                <div style={{
                    position: 'absolute',
                    width: `${loaderSize * 0.9}px`,
                    height: `${loaderSize * 0.9}px`,
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 1,
                    animation: 'pulseGlow 2s ease-in-out infinite alternate'
                }} />
                
                {/* Spinning Outer Ring */}
                <svg viewBox="0 0 100 100" style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    transformOrigin: 'center',
                    zIndex: 2,
                    animation: 'spin 1.4s linear infinite'
                }}>
                    <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        stroke="#e2e8f0" 
                        strokeWidth="4" 
                        fill="none" 
                    />
                    <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        stroke="url(#emeraldGrad)" 
                        strokeWidth="4" 
                        strokeDasharray="70 200" 
                        strokeLinecap="round"
                        fill="none" 
                    />
                    <defs>
                        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Pulsing Central Logo */}
                <div style={{
                    position: 'relative',
                    zIndex: 3,
                    width: `${logoSize}px`,
                    height: `${logoSize}px`,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '8px',
                    animation: 'pulseLogo 2s ease-in-out infinite alternate'
                }}>
                    <img 
                        src="/assets/temple_donation/img/logo.svg" 
                        alt="Logo" 
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }} 
                    />
                </div>
            </div>
            {size !== "small" && text && (
                <h3 style={{
                    fontSize: size === "large" ? '1.5rem' : '1.25rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    margin: '8px 0 4px 0',
                    letterSpacing: '-0.025em',
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    {text}
                </h3>
            )}
            {size !== "small" && subtext && (
                <p style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: 0,
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    {subtext}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return createPortal(
            <div className="temple-loading-screen" style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                width: '100vw',
                height: '100vh'
            }}>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes pulseGlow {
                        0% { transform: scale(0.95); opacity: 0.5; }
                        100% { transform: scale(1.1); opacity: 0.9; }
                    }
                    @keyframes pulseLogo {
                        0% { transform: scale(0.96); }
                        100% { transform: scale(1.04); }
                    }
                `}</style>
                {loaderContent}
            </div>,
            document.body
        );
    }

    return (
        <div className="temple-loading-screen-inline" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulseGlow {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    100% { transform: scale(1.1); opacity: 0.9; }
                }
                @keyframes pulseLogo {
                    0% { transform: scale(0.96); }
                    100% { transform: scale(1.04); }
                }
            `}</style>
            {loaderContent}
        </div>
    );
};

export default TempleFlagLoader;
