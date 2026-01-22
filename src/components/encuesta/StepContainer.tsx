import { motion } from "framer-motion";

export default function StepContainer({
  children,
  step,
}: {
  children: React.ReactNode;
  step: number;
}) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6"
    >
      {children}
    </motion.div>
  );
}
