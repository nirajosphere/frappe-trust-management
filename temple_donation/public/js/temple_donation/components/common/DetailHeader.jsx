import React from "react";
import { Button, Typography, Avatar } from "antd";
import { ArrowLeft } from "lucide-react";
import { getTagConfig } from "../../utils/tagUtils"; 

const { Title, Text } = Typography;

const DetailHeader = ({
  onBack,
  title,
  subtitle,
  imageSrc,
  imageFlag,
  initials = "U",
  tags = [],
  actions
}) => {
  const cleanImageSrc = typeof imageSrc === "string" ? imageSrc.trim() : "";
  const hasValidImage = cleanImageSrc && 
    !cleanImageSrc.includes("undefined") && 
    !cleanImageSrc.includes("null");

  return (
    <div 
      className="w-full pb-4 border-b border-zinc-200/60 unique-profile-header bg-transparent"
      style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
    >
      {/* Left side info block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: '1 1 auto' }}>
        {onBack && (
          <Button
            type="default"
            icon={<ArrowLeft size={16} strokeWidth={2.5} />}
            onClick={onBack}
            className="flex items-center justify-center border-zinc-200 hover:border-zinc-400 bg-white hover:bg-zinc-50 text-zinc-700 transition-all shrink-0"
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
         { imageFlag && <Avatar 
            size={48}
            src={hasValidImage ? cleanImageSrc : undefined}
            className={`shrink-0 flex items-center justify-center text-base font-bold select-none ${
              !hasValidImage 
                ? "bg-zinc-900 text-white border border-zinc-900" 
                : "border border-zinc-200"
            }`}
          >
            {!hasValidImage && initials}
          </Avatar>}

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, gap: '4px' }}>
            <Title 
              level={4} 
              className="!m-0 !font-bold text-zinc-900 tracking-tight truncate" 
              style={{ fontSize: '18px', lineHeight: '1.2' }}
            >
              {title}
            </Title>
            {subtitle && (
              <Text className="text-xs text-zinc-400 font-medium leading-none truncate">
                {subtitle}
              </Text>
            )}
          </div>
        </div>
      </div>

      {/* Right side actions — wraps below on small screens */}
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default DetailHeader;