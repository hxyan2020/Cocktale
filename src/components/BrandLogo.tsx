import Image from "next/image";

type Props = {
  className?: string;
  size?: number;
  priority?: boolean;
  alt?: string;
};

export function BrandLogo({
  className = "",
  size = 36,
  priority = false,
  alt = "Cocktale",
}: Props) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 rounded-md ${className}`}
      priority={priority}
    />
  );
}
