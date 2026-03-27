import { motion } from "framer-motion";

interface BrandLogoProps {
  compact?: boolean;
  showIcon?: boolean;
  onClick?: () => void;
}

const BrandLogo = ({ compact = false, showIcon = false, onClick }: BrandLogoProps) => {
  return (
    <div className="flex items-center gap-3">
      {showIcon ? (
        <img src="/favicon.svg" alt="DEV404" className="h-10 w-10 rounded-lg object-contain" />
      ) : null}
      {compact ? null : (
        <div className="min-w-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="flex items-center gap-2"
          >
            <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-md object-contain" />
            <span className="text-xl font-bold leading-none text-foreground">DEV404</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
