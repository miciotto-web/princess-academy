import type { SVGProps } from "react";

/**
 * Logo WhatsApp ufficiale (marchio registrato).
 * Path SVG derivato dal logo standard (telefono in fumetto).
 * Riutilizzabile sia Admin che pubblico, stesso API dei componenti lucide-react.
 * Coerente con la palette: inerte (currentColor) per integrarsi con text-*.
 */
export function WhatsAppIcon({
  size = 22,
  className,
  "aria-hidden": ariaHidden = true,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : "img"}
      focusable="false"
      fill="currentColor"
      {...rest}
    >
      <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.094c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977.873 2.78 1.247 2.477 2.81 4.382 5.32 5.629.741.372 2.139.93 2.965.93.873 0 2.749-.357 3.378-1.06.258-.3.4-.687.4-1.075 0-.058-.014-.115-.043-.186-.187-.43-1.49-1.118-1.65-1.118zM16.06 0C7.218 0 0 7.218 0 16.06c0 3.36 1.04 6.508 2.84 9.137L.99 31.97l7.05-1.85a15.96 15.96 0 0 0 8.02 2.155h.005c8.842 0 16.06-7.218 16.06-16.06 0-4.29-1.677-8.323-4.722-11.355A16.044 16.044 0 0 0 16.06 0zm0 29.314h-.004a13.41 13.41 0 0 1-6.802-1.864l-.487-.29-4.18 1.097 1.117-4.075-.317-.5a13.255 13.255 0 0 1-2.027-7.058c0-7.32 5.96-13.28 13.28-13.28 3.55 0 6.886 1.39 9.394 3.91a13.207 13.207 0 0 1 3.886 9.39c0 7.32-5.96 13.28-13.28 13.28z" />
    </svg>
  );
}
