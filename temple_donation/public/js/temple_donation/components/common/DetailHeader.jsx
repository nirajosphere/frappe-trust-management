import React from "react";
import { Button, Space, Typography, Tag, Avatar } from "antd";
import { ArrowLeft } from "lucide-react";
// Yahan apna sahi relative path daal dena file ka
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
    <div className="flex items-center justify-between w-full pb-4 border-b border-zinc-200/60 unique-profile-header bg-transparent">
      {/* Left side info block */}
      <div className="flex items-center gap-4 min-w-0">
        {onBack && (
          <Button
            type="default"
            icon={<ArrowLeft size={16} strokeWidth={2.5} />}
            onClick={onBack}
            className="flex items-center justify-center border-zinc-200 hover:border-zinc-400 bg-white hover:bg-zinc-50 text-zinc-700 transition-all shrink-0"
          />
        )}

        <div className="flex items-center gap-2 min-w-0">
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

          <div className="flex flex-col justify-center min-w-0 gap-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <Title 
                level={4} 
                className="!m-0 !font-bold text-zinc-900 tracking-tight truncate" 
                style={{ fontSize: '18px', lineHeight: '1.2' }}
              >
                {title}
              </Title>
              
              {/* {tags.map((tag, i) => {
                const config = getTagConfig(tag);
                return (
                  <Tag 
                    key={i} 
                    color={config.color}
                    className={`!m-0 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${config.glassClass || ""}`}
                  >
                    {config.label}
                  </Tag>
                );
              })} */}
            </div>
            {subtitle && (
              <Text className="text-xs text-zinc-400 font-medium leading-none truncate">
                {subtitle}
              </Text>
            )}
          </div>
        </div>
      </div>

      {/* Right side actions */}
      {actions && (
        <Space size={8} className="shrink-0 flex items-center">
          {actions}
        </Space>
      )}
    </div>
  );
};

export default DetailHeader;