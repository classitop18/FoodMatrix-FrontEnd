import { ArrowRight } from "lucide-react";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  icon?: any;
  className?: string;
};

export default function ThemeButton({
  label,
  onClick,
  icon,
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`text-white bg-(--primary) hover:bg-(--primary) font-normal ps-6! pe-6! py-1 h-12 rounded-full text-base transition-all duration-300 cursor-pointer group relative flex items-center gap-3
            inset-shadow-[5px_5px_5px_rgba(0,0,0,0.30)] hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.50)] min-w-42 justify-center ${className}`}
    >
      {label}

      {icon ? (
        icon
      ) : (
        <ArrowRight className="size-5 transition-all duration-300" />
      )}
    </button>
  );
}
