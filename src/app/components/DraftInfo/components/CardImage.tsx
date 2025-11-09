import Image from "next/image";
import type { Card } from "@/types/database.types";

interface CardImageProps {
  card: Card | undefined;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export const CardImage = ({ card, onClick, size = "sm" }: CardImageProps) => {
  if (!card) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-gray-200`}>
        <span className="text-xs text-gray-400">?</span>
      </div>
    );
  }

  return (
    <Image
      src={card.image_url}
      alt={card.unit_name}
      width={size === "lg" ? 128 : size === "md" ? 96 : 64}
      height={size === "lg" ? 128 : size === "md" ? 96 : 64}
      className={`${sizeClasses[size]} ${onClick ? "cursor-pointer" : ""} rounded-lg object-cover shadow-sm transition-transform hover:scale-110`}
      onClick={onClick}
    />
  );
};

