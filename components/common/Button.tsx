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
            className="text-white bg-black hover:bg-black font-normal ps-6! pe-6! hover:pe-12! py-1 h-10 rounded-none text-lg transition-all duration-300 font-rethink group relative flex items-center">
            {label} <ArrowRight className="size-5 group-hover:opacity-100 opacity-0 transition-all duration-300 absolute right-4 top-0 bottom-0 m-auto" />
        </button>
    );
}