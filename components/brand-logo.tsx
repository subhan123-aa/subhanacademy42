import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, sizes = "(max-width: 640px) 180px, 280px" }: { className?: string; sizes?: string }) {
  return (
    <Image
      src="/images/subhan-academy-logo.png"
      alt="Subhan Academy"
      width={320}
      height={120}
      sizes={sizes}
      className={cn("h-auto w-full object-contain", className)}
      priority
    />
  );
}