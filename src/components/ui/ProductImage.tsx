import Image from "next/image";
import { productImage } from "@/lib/asset";
import type { ImageKey } from "@/lib/types";

interface Props {
  image: ImageKey;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

/** Product photo from /public, prefixed with the basePath. Sized by CSS; width/height set the aspect ratio. */
export function ProductImage({ image, alt, size = 400, className, priority }: Props) {
  return <Image src={productImage(image)} alt={alt} width={size} height={size} className={className} priority={priority} />;
}
