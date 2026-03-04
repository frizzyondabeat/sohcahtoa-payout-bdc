import Image, { type ImageProps } from "next/image";

type SohcahtoaLogoProps = Omit<ImageProps, "src" | "alt">;

const SohcahtoaLogo = ({
  width = 24.67142677307129,
  height = 24.67142677307129,
  preload = true,
  ...props
}: SohcahtoaLogoProps) => {
  return (
    <Image
      src="/images/svg/logo.svg"
      alt={"Sohcahtoa logo"}
      width={width}
      height={height}
      preload={preload}
      {...props}
    />
  );
};

export default SohcahtoaLogo;
