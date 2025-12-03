'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiCheck, FiBarChart, FiCalendar, FiDollarSign, FiPackage, FiUsers, FiTrendingUp, FiHeart, FiTarget, FiClock, FiAward } from 'react-icons/fi';

const AnimatedSection = ({ children, className = "", delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FeatureCard3D = ({ icon, title, description, points, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotateY: -15 }}
      animate={inView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -8,
        rotateY: 5,
        transition: { type: "spring", stiffness: 300 }
      }}
      className="group perspective-1000"
    >
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#f0f0f0] hover:shadow-2xl transition-all duration-500 transform-style-3d scroll-mt-8">
        <div className="w-16 h-16 bg-[#a8e6cf] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
          <div className="text-white text-2xl">
            {icon}
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-[#5d4037] mb-4 group-hover:translate-x-2 transition-transform duration-300">{title}</h3>
        <p className="text-[#8d6e63] mb-6 leading-relaxed group-hover:translate-x-1 transition-transform duration-300">{description}</p>
        
        <ul className="space-y-3">
          {points.map((point, pointIndex) => (
            <motion.li 
              key={pointIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: delay + pointIndex * 0.1 }}
              className="flex items-center space-x-3 text-[#5d4037]"
            >
              <FiCheck className="w-5 h-5 text-[#a8e6cf] flex-shrink-0" />
              <span className="text-sm">{point}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const FloatingElement = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

export default function HomePageContent() {
  const features = [
    {
      icon: <FiBarChart className="w-8 h-8" />,
      title: "Analisis Status Gizi",
      description: "Hitung IMT dan status gizi secara real-time dengan standar WHO terbaru",
      points: ["Data antropometri lengkap", "Perhitungan IMT otomatis", "Klasifikasi WHO", "Rekomendasi personal"]
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Kebutuhan Energi & Zat Gizi",
      description: "Hitung Total Energy Expenditure dan kebutuhan gizi makro-mikro",
      points: ["TEE berdasarkan aktivitas", "Protein, lemak, karbohidrat", "Personalized plan"]
    },
    {
      icon: <FiCalendar className="w-8 h-8" />,
      title: "Perencanaan Menu",
      description: "Buat menu dengan analisis gizi lengkap berdasarkan database TKPI",
      points: ["Input bahan & berat", "Database TKPI", "Analisis kandungan", "Total gizi per menu"]
    },
    {
      icon: <FiDollarSign className="w-8 h-8" />,
      title: "Manajemen Anggaran",
      description: "Kelola anggaran bahan makanan dengan estimasi biaya yang akurat",
      points: ["Harga satuan bahan", "Estimasi per porsi", "Total anggaran", "Planning efisien"]
    },
    {
      icon: <FiPackage className="w-8 h-8" />,
      title: "Monitoring Stok",
      description: "Pantau persediaan bahan makanan dengan sistem tracking real-time",
      points: ["Stok awal & pembelian", "Tracking penggunaan", "Sisa stok otomatis", "Alert stok menipis"]
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Laporan & Analytics",
      description: "Pantau perkembangan dengan dashboard analytics yang komprehensif",
      points: ["Progress status gizi", "Laporan asupan", "Analisis kecukupan", "Export data"]
    }
  ];

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToFeatures = () => {
    scrollToSection('features');
  };

  const scrollToHome = () => {
    scrollToSection('home-hero');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf6f0] to-[#f8f6f2] text-[#5d4037] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-8 h-8 bg-[#a8e6cf]/20 rounded-full"></div>
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute top-40 right-20 w-6 h-6 bg-[#ffd3b6]/20 rounded-full"></div>
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute bottom-40 left-20 w-10 h-10 bg-[#ffaaa5]/20 rounded-full"></div>
        </FloatingElement>
        <FloatingElement delay={3}>
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-[#d8e3e7]/20 rounded-full"></div>
        </FloatingElement>
      </div>

      <section 
        id="home-hero" 
        className="relative min-h-screen flex items-center justify-center px-4 py-20"
      >
        <div className="max-w-6xl mx-auto text-center">
          <AnimatedSection delay={0.2}>
            <FloatingElement>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-24 h-24 bg-[#a8e6cf] rounded-3xl rotate-45 flex items-center justify-center mx-auto mb-8 shadow-lg cursor-pointer"
                onClick={scrollToHome}
              >
                <FiHeart className="w-12 h-12 text-white -rotate-45" />
              </motion.div>
            </FloatingElement>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="text-[#5d4037]">Nutri</span>
              <span className="text-[#a8e6cf]">Plan</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-[#8d6e63] mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Kelola gizi dengan presisi, rencanakan menu sehat, dan pantau stok dalam satu platform terintegrasi
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={scrollToFeatures}
                className="cursor-pointer inline-block px-6 py-3 sm:px-8 sm:py-4 bg-[#a8e6cf] text-white font-semibold text-base sm:text-lg rounded-lg shadow-[4px_4px_0px_0px_rgba(93,64,55,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 ease-in-out transform hover:bg-[#88d4b2] focus:outline-none focus:ring-2 focus:ring-[#a8e6cf]"
              >
                Explore
              </button>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection delay={1.0} className="mt-18">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: <FiTarget className="w-8 h-8" />,
                  title: "Akurat & Terpercaya",
                  description: "Berdasarkan standar WHO dan database TKPI terbaru"
                },
                {
                  icon: <FiClock className="w-8 h-8" />,
                  title: "Efisien & Cepat",
                  description: "Proses analisis dan perencanaan dalam hitungan menit"
                },
                {
                  icon: <FiAward className="w-8 h-8" />,
                  title: "Komprehensif",
                  description: "Solusi lengkap dari analisis hingga monitoring"
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 + index * 0.2 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-[#f0f0f0] hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="w-16 h-16 bg-[#a8e6cf] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-white text-2xl">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#5d4037] mb-3">{benefit.title}</h3>
                  <p className="text-[#8d6e63] text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section 
        id="features" 
        className="relative py-20 px-4 bg-white scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#5d4037] mb-6">
              Fitur <span className="text-[#a8e6cf]">Unggulan</span>
            </h2>
            <p className="text-xl text-[#8d6e63] max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk manajemen gizi yang komprehensif dan akurat
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard3D
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                points={feature.points}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 bg-[#f8f6f2]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#5d4037] mb-6">
              Untuk <span className="text-[#a8e6cf]">Siapa?</span>
            </h2>
            <p className="text-xl text-[#8d6e63] max-w-2xl mx-auto">
              Dirancang untuk berbagai profesional dan institusi di bidang gizi
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Ahli Gizi",
                description: "Analisis status gizi dan buat rencana diet",
                color: "bg-[#a8e6cf]"
              },
              {
                title: "Rumah Sakit",
                description: "Kelola gizi pasien dan stok makanan",
                color: "bg-[#ffd3b6]"
              },
              {
                title: "Restoran Sehat",
                description: "Rencana menu dan kontrol anggaran",
                color: "bg-[#ffaaa5]"
              },
              {
                title: "Lembaga Sosial",
                description: "Program makan komunitas & monitoring",
                color: "bg-[#d8e3e7]"
              }
            ].map((user, index) => (
              <AnimatedSection key={index} delay={index * 0.15}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-[#f0f0f0] hover:shadow-xl transition-all duration-300 text-center h-full"
                >
                  <div className={`w-12 h-12 ${user.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <FiUsers className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#5d4037] mb-3">{user.title}</h3>
                  <p className="text-[#8d6e63] text-sm">{user.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}