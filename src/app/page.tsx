import { motion } from "framer-motion";
export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="px-6 py-16 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-semibold">
          NeuraMed — Watchful Guardian for Meds
        </motion.h1>
        <p className="mt-4 text-gray-600">Adherence, caregiver alerts, and AI pill recognition — all in a smooth, mobile-first PWA.</p>
      </section>
    </main>
  );
}
