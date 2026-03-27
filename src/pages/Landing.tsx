import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, Zap, Palette, Layers, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import StarBackground from "@/components/chat/StarBackground";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const Landing = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  const features = [
    {
      icon: Code2,
      title: "AI-Powered Generation",
      description: "Describe what you want to get production-ready code instantly."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate complete components and full pages in seconds, not minutes."
    },
    {
      icon: Palette,
      title: "Customizable Themes",
      description: "Switch between light and dark modes with a single click."
    },
    {
      icon: Layers,
      title: "Component Library",
      description: "Access a vast library of pre-built components and patterns."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StarBackground />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(190_80%_60%/0.08),transparent_28%)]" />

      <header className="relative bg-transparent shadow-none backdrop-blur-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <img src="/favicon.svg" alt="DEV404" className="w-8 h-8" />
            <span className="font-bold text-xl">DEV404</span>
          </motion.div>
          <nav className="flex items-center gap-4">
            <Link to="/app">
              <Button variant="ghost">Launch App</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative px-4 py-24">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.16, 0.24, 0.16]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-[-8rem] left-[12%] h-[36rem] w-[36rem] rounded-full bg-primary/18 blur-[160px]"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.12, 0.2, 0.12]
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-[-10rem] right-[10%] h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[150px]"
            />
            <div className="absolute inset-x-[18%] top-12 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
          </div>
          <div className="container mx-auto text-center max-w-4xl relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Code Generator</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
            >
              Build UIs with the<br />
              <span className="text-gradient-primary">Power of AI</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Describe what you want to build and watch DEV404 generate production-ready 
              React code instantly. No coding required.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/app">
                <Button size="lg" className="text-lg px-8 group">
                  <span>Start Building</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Documentation
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="relative px-4 py-20">
          <div className="container mx-auto relative">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-center mb-12"
            >
              Why Developers Love DEV404
            </motion.h2>
            <motion.div 
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-[220px] border-transparent bg-card/55 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-transparent">
                    <CardContent className="pt-6">
                      <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                      >
                        <feature.icon className="w-10 h-10 text-primary mb-4" />
                      </motion.div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-base">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative px-4 py-20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/6 via-transparent to-transparent" />
          <div className="container mx-auto text-center max-w-3xl relative">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-6"
            >
              Ready to Transform Your Workflow?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Join thousands of developers who are already building faster with DEV404.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/app">
                <Button size="lg" className="text-lg px-10 group">
                  <span>Get Started Now</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="relative bg-background/20 py-8 px-4 backdrop-blur-xl">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            <img src="/favicon.svg" alt="DEV404" className="w-6 h-6" />
            <span className="font-semibold">DEV404</span>
          </motion.div>
          <p className="text-sm text-muted-foreground">
            Built with passion for developers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
