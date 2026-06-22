import React from "react";
import { createPortal } from "react-dom";

const TempleFlagLoader = ({
    fullScreen = false,
    text = "Temple Donation Portal",
    subtext = "Initializing services, please wait...",
    size = "medium" // "small", "medium", "large"
}) => {
    // Determine sizes based on prop
    const svgSize = size === "small" ? 80 : size === "large" ? 220 : 150;
    
    if (fullScreen) {
        return createPortal(
            <div className="temple-loading-screen">
                <div className="temple-loading-wrapper">
                    <div className="temple-svg-container" style={{ width: `${svgSize}px`, height: `${svgSize}px` }}>
                        <div className="temple-bg-glow" style={{ width: `${svgSize * 0.83}px`, height: `${svgSize * 0.83}px` }}></div>
                        <svg viewBox="0 0 200 200" className="temple-svg" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 50,160 L 150,160 L 145,150 L 55,150 Z" fill="#eab308" opacity="0.9" />
                            <path d="M 60,150 L 140,150 L 136,140 L 64,140 Z" fill="#eab308" />
                            <path d="M 68,140 L 132,140 L 128,128 L 72,128 Z" fill="#eab308" opacity="0.95" />
                            <path d="M 76,128 C 76,105 92,85 94,62 L 106,62 C 108,85 124,105 124,128 Z" fill="#eab308" />
                            <line x1="82" y1="115" x2="118" y2="115" stroke="#a16207" strokeWidth="1.5" opacity="0.5" />
                            <line x1="87" y1="102" x2="113" y2="102" stroke="#a16207" strokeWidth="1.5" opacity="0.5" />
                            <line x1="91" y1="89" x2="109" y2="89" stroke="#a16207" strokeWidth="1.5" opacity="0.5" />
                            <line x1="93" y1="76" x2="107" y2="76" stroke="#a16207" strokeWidth="1.5" opacity="0.5" />
                            <path d="M 96,62 L 104,62 L 104,59 L 96,59 Z" fill="#eab308" />
                            <circle cx="100" cy="55" r="4.5" fill="#eab308" />
                            <path d="M 98,51 L 102,51 L 100,44 Z" fill="#eab308" />
                            <line x1="100" y1="44" x2="100" y2="10" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="100" cy="9" r="1.5" fill="#eab308" />
                            <path fill="#f97316" stroke="#ea580c" strokeWidth="0.5" strokeLinejoin="round">
                                <animate
                                    attributeName="d"
                                    dur="1.8s"
                                    repeatCount="indefinite"
                                    values="
                                        M 100,12 Q 115,2 128,12 T 155,20 Q 130,30 115,22 T 100,34 Z;
                                        M 100,12 Q 115,10 128,4 T 155,24 Q 130,22 115,30 T 100,34 Z;
                                        M 100,12 Q 115,18 128,12 T 155,26 Q 130,18 115,26 T 100,34 Z;
                                        M 100,12 Q 115,10 128,4 T 155,22 Q 130,28 115,20 T 100,34 Z;
                                        M 100,12 Q 115,2 128,12 T 155,20 Q 130,30 115,22 T 100,34 Z
                                    "
                                />
                            </path>
                        </svg>
                    </div>
                    {text && <h2 className="temple-loading-text">{text}</h2>}
                    {subtext && <p className="temple-loading-subtext">{subtext}</p>}
                    <div className="temple-loading-bar-container">
                        <div className="temple-loading-bar-progress"></div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return (
        <div className="temple-loading-screen-inline">
            <div className="temple-loading-wrapper">
                <div className="temple-svg-container" style={{ width: `${svgSize}px`, height: `${svgSize}px` }}>
                    <div className="temple-bg-glow" style={{ width: `${svgSize * 0.83}px`, height: `${svgSize * 0.83}px` }}></div>
                    <svg viewBox="0 0 200 200" className="temple-svg" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 50,160 L 150,160 L 145,150 L 55,150 Z" fill="#eab308" opacity="0.9" />
                        <path d="M 60,150 L 140,150 L 136,140 L 64,140 Z" fill="#eab308" />
                        <path d="M 68,140 L 132,140 L 128,128 L 72,128 Z" fill="#eab308" opacity="0.95" />
                        <path d="M 76,128 C 76,105 92,85 94,62 L 106,62 C 108,85 124,105 124,128 Z" fill="#eab308" />
                        <line x1="82" y1="115" x2="118" y2="115" stroke="#a16207" strokeWidth="1.5" opacity="0.5" />
                        <line x1="87" y1="102" x2="113" y2="102" stroke="#a16207" strokeWidth="1.5" opacity="0.5" />
                        <line x1="91" y1="89" x2="109" y2="89" stroke="#a16207" strokeWidth="1.5" opacity="0.5" />
                        <line x1="93" y1="76" x2="107" y2="76" stroke="#a16207" strokeWidth="1.5" opacity="0.5" />
                        <path d="M 96,62 L 104,62 L 104,59 L 96,59 Z" fill="#eab308" />
                        <circle cx="100" cy="55" r="4.5" fill="#eab308" />
                        <path d="M 98,51 L 102,51 L 100,44 Z" fill="#eab308" />
                        <line x1="100" y1="44" x2="100" y2="10" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="100" cy="9" r="1.5" fill="#eab308" />
                        <path fill="#f97316" stroke="#ea580c" strokeWidth="0.5" strokeLinejoin="round">
                            <animate
                                attributeName="d"
                                dur="1.8s"
                                repeatCount="indefinite"
                                values="
                                    M 100,12 Q 115,2 128,12 T 155,20 Q 130,30 115,22 T 100,34 Z;
                                    M 100,12 Q 115,10 128,4 T 155,24 Q 130,22 115,30 T 100,34 Z;
                                    M 100,12 Q 115,18 128,12 T 155,26 Q 130,18 115,26 T 100,34 Z;
                                    M 100,12 Q 115,10 128,4 T 155,22 Q 130,28 115,20 T 100,34 Z;
                                    M 100,12 Q 115,2 128,12 T 155,20 Q 130,30 115,22 T 100,34 Z
                                "
                            />
                        </path>
                    </svg>
                </div>
                {size !== "small" && text && <h3 className="temple-loading-text-inline">{text}</h3>}
                {size !== "small" && subtext && <p className="temple-loading-subtext-inline">{subtext}</p>}
            </div>
        </div>
    );
};

export default TempleFlagLoader;
