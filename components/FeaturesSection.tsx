import { motion } from "framer-motion";
import { Search, Sparkles, FileText } from "lucide-react";

const features = [
  {
    title: "Intelligente Suche",
    description: "Finden Sie passende Förderprogramme für Ihre Schule.",
    icon: Search,
  },
  {
    title: "KI-Antragsassistent",
    description: "Generieren Sie professionelle Antragstexte mit KI.",
    icon: Sparkles,
  },
  {
    title: "Übersichtliche Details",
    description: "Alle Informationen zu Fristen, Förderbeträgen und Kriterien.",
    icon: FileText,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 text-orange-400 mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
