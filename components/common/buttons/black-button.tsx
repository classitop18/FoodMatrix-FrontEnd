import { ArrowRight } from "lucide-react";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  className?: string;
};

export default function Button({ label, onClick, className }: ButtonProps) {
  return (
    <button
      type="button"
      className="text-white bg-black hover:bg-black font-medium ps-6! pe-6! py-1 h-10 rounded-full text-base transition-all duration-300 cursor-pointer group relative flex items-center
            inset-shadow-[5px_5px_5px_rgba(255,255,255,0.30)] hover:inset-shadow-[-5px_-5px_5px_rgba(255,255,255,0.30)]"
    >
      {label}
    </button>
  );
}
