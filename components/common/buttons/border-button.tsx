import { ArrowRight } from "lucide-react";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  className?: string;
  icon?: any;
};

export default function BorderButton({
  label,
  onClick,
  className,
  icon,
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} bg-white hover:text-white ps-6! pe-6! py-1 h-10 hover:bg-(--primary) border-(--primary) border text-(--primary) font-medium ps-6! pe-6! py-1 h-10 rounded-full text-base transition-all duration-300 cursor-pointer group relative flex items-center hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.30)]`}
    >
      {label}
      {icon && icon}
    </button>
  );
}
