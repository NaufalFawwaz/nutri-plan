'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiBook, FiActivity, FiTarget, FiTrendingUp, FiDroplet, 
  FiCoffee, FiUsers, FiStar, FiInfo, FiArrowUp, 
  FiArrowDown, FiCheck, FiHeart, FiThermometer, 
  FiBarChart2, FiSun, FiBattery, FiShield, FiZap
} from 'react-icons/fi';

const EdukasiCard = ({ title, description, icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-[#f0f0f0] hover:shadow-xl transition-all duration-300"
    >
      <div className="w-12 h-12 bg-[#a8e6cf] rounded-xl flex items-center justify-center mb-4">
        <div className="text-white text-xl">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-[#5d4037] mb-3">{title}</h3>
      <p className="text-[#8d6e63] leading-relaxed">{description}</p>
    </motion.div>
  );
};

const Table = ({ headers, rows, title, footnote }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#f0f0f0]">
      {title && <h4 className="text-lg font-bold text-[#5d4037] mb-4">{title}</h4>}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f0f9f5]">
              {headers.map((header, index) => (
                <th key={index} className="py-3 px-4 text-left font-semibold text-[#5d4037]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#f8f6f2]'}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-3 px-4 text-[#8d6e63]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote && <p className="text-sm text-gray-600 mt-4">{footnote}</p>}
    </div>
  );
};

export default function Edukasi() {
  const [activeSection, setActiveSection] = useState(null);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf6f0] to-[#f8f6f2] text-[#5d4037] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="text-[#5d4037]">Edukasi </span>
            <span className="text-[#a8e6cf]">Gizi Lengkap</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Referensi komprehensif tentang ilmu gizi, dari konsep dasar hingga penerapan praktis
          </motion.p>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'ilmu-gizi', label: 'Ilmu Gizi', icon: <FiBook className="w-4 h-4" /> },
              { id: 'zat-gizi', label: 'Zat Gizi', icon: <FiDroplet className="w-4 h-4" /> },
              { id: 'imt', label: 'IMT', icon: <FiTarget className="w-4 h-4" /> },
              { id: 'energi', label: 'Energi', icon: <FiZap className="w-4 h-4" /> },
              { id: 'bmr-ree', label: 'BMR/REE', icon: <FiTrendingUp className="w-4 h-4" /> },
              { id: 'aktivitas', label: 'Aktivitas', icon: <FiActivity className="w-4 h-4" /> },
              { id: 'makronutrien', label: 'Makronutrien', icon: <FiCoffee className="w-4 h-4" /> },
              { id: 'kebutuhan', label: 'Kebutuhan', icon: <FiUsers className="w-4 h-4" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-[#a8e6cf] text-white'
                    : 'bg-white text-[#5d4037] hover:bg-[#f0f9f5]'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          <section id="ilmu-gizi" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#a8e6cf] rounded-xl flex items-center justify-center">
                  <FiBook className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">1. Ilmu Gizi</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-4">
                <p>
                  Ilmu Gizi (Nutrition Science) adalah ilmu yang mempelajari segala sesuatu tentang makanan dalam hubungannya dengan kesehatan optimal. Kata Gizi berasal dari bahasa Arab ghizda, yang berarti "makanan".
                </p>
                <p>
                  Di satu sisi ilmu gizi berkaitan dengan makanan dan di sisi lain dengan tubuh manusia.
                </p>
              </div>
            </div>
          </section>

          <section id="zat-gizi" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#a8e6cf] rounded-xl flex items-center justify-center">
                  <FiDroplet className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">2. Zat Gizi</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-4">
                <p>
                  Zat Gizi (Nutrients) adalah ikatan kimia yang diperlukan tubuh untuk melakukan fungsinya, yaitu menghasilkan energi, membangun dan memelihara jaringan, serta mengatur proses-proses kehidupan.
                </p>
              </div>
            </div>
          </section>

          <section id="makanan" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#ffd3b6] rounded-xl flex items-center justify-center">
                  <FiCoffee className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">3. Makanan</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-4">
                <p>
                  Makanan adalah bahan selain obat yang mengandung zat-zat gizi dan atau unsur-unsur/ikatan kimia yang dapat diubah menjadi zat gizi oleh tubuh, yang berguna bila dimasukkan ke dalam tubuh.
                </p>
              </div>
            </div>
          </section>

          <section id="pangan" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#ffd3b6] rounded-xl flex items-center justify-center">
                  <FiCoffee className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">4. Pangan</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed">
                <p>Pangan adalah istilah umum untuk semua bahan yang dapat dijadikan makanan.</p>
              </div>
            </div>
          </section>

          <section id="bahan-makanan" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#ffd3b6] rounded-xl flex items-center justify-center">
                  <FiCoffee className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">5. Bahan Makanan</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-4">
                <p>
                  Bahan makanan adalah makanan dalam keadaan mentah. Dalam Bahasa Inggris hanya digunakan satu kata untuk menyatakan kata makanan, pangan, dan bahan makanan, yaitu food.
                </p>
              </div>
            </div>
          </section>

          <section id="status-gizi" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#ffaaa5] rounded-xl flex items-center justify-center">
                  <FiUsers className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">6. Status Gizi</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-4">
                <p>
                  Status gizi adalah keadaan tubuh sebagai akibat konsumsi makanan dan penggunaan zat-zat gizi.
                </p>
                <p>
                  Dibedakan antara status gizi buruk, kurang, baik, dan lebih.
                </p>
              </div>
            </div>
          </section>

          <section id="imt" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#a8e6cf] rounded-xl flex items-center justify-center">
                  <FiTarget className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">7. Indeks Massa Tubuh (IMT)</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-6">
                <p>
                  Indeks Massa Tubuh (IMT) adalah cara untuk mengukur status gizi dengan membandingkan berat badan dan tinggi badan. Rumus IMT adalah berat badan (kg) dibagi kuadrat tinggi badan (m²). Hasilnya kemudian dapat dikategorikan untuk mengetahui apakah seseorang berada dalam kategori berat badan kurang, normal, kelebihan, atau obesitas.
                </p>
                
                <div className="bg-[#f0f9f5] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#5d4037] mb-4">Rumus IMT</h3>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <code className="text-2xl font-mono text-[#5d4037]">
                      IMT = Berat Badan (kg) / (Tinggi Badan (m))²
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#5d4037] mb-4">Kategori IMT Kemenkes 2013</h3>
                  <Table
                    headers={["IMT", "Kategori"]}
                    rows={[
                      ["< 18,5", "Kurus/Kurang"],
                      ["18,5 – 24,9", "Normal"],
                      ["25 – 27", "Overweight"],
                      ["> 27", "Obesitas"]
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>

          <section id="bbi" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#a8e6cf] rounded-xl flex items-center justify-center">
                  <FiTarget className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">8. Berat Badan Ideal (BBI)</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-4">
                <p>
                  Berat badan ideal (BBI) adalah bobot optimal dari tubuh seseorang.
                </p>
                <p>
                  Jika TB pria {'<'}160cm dan TB wanita {'<'}150 cm, tidak perlu dikurangi 10% (Brocca Modifikasi Indonesia).
                </p>
              </div>
            </div>
          </section>

          <section id="energi" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#d8e3e7] rounded-xl flex items-center justify-center">
                  <FiZap className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">9. Energi</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-4">
                <p>
                  Energi dapat didefinisikan sebagai "kemampuan untuk melakukan kerja." Sumber utama dari seluruh energi dalam makhluk hidup adalah matahari. Melalui proses fotosintesis, tumbuhan hijau menangkap sebagian energi matahari pada daun mereka dan menyimpannya di dalam ikatan kimia glukosa.
                </p>
                <p>
                  Protein, lemak, dan karbohidrat disintesis dari karbohidrat dasar ini untuk memenuhi kebutuhan tubuh makhluk hidup. Manusia dan hewan memperoleh sumber nutrisi ini dengan mengonsumsi tumbuhan atau daging hewan lainnya.
                </p>
                <p>
                  Tubuh memanfaatkan energi dari makanan yang berasal dari karbohidrat, protein, lemak, dan alkohol; energi ini tersimpan dalam ikatan kimia di dalam makanan dan dilepaskan melalui metabolisme. Energi dari makanan digunakan untuk mempertahankan hidup. Walaupun semua energi pada akhirnya berubah menjadi panas, sebagian hilang ke atmosfer melalui panas tubuh, sedangkan sebagian lagi digunakan untuk semua tugas seluler dalam jaringan tubuh. Proses ini melibatkan reaksi kimia di jaringan untuk mempertahankan ukuran tubuh, aktivitas listrik saraf, kerja mekanis otot, dan produksi panas untuk mempertahankan suhu tubuh.
                </p>
              </div>
            </div>
          </section>

          <section id="kebutuhan-energi" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#d8e3e7] rounded-xl flex items-center justify-center">
                  <FiZap className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">10. Kebutuhan Energi</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-4">
                <p>
                  Kebutuhan energi didefinisikan sebagai asupan energi dari diet yang diperlukan untuk pertumbuhan atau pemeliharaan seseorang dengan usia, jenis kelamin, berat badan, tinggi badan, dan tingkat aktivitas fisik tertentu.
                </p>
                <p>
                  Pada anak-anak serta wanita hamil atau menyusui, kebutuhan energi dikaitkan dengan pertumbuhan dan deposisi jaringan. Pada orang dewasa, kebutuhan energi terkait dengan pengeluaran energi untuk mempertahankan berat badan dengan status kesehatan yang baik.
                </p>
                <p>
                  Pada individu sakit atau terluka, stres dapat meningkatkan atau menurunkan kebutuhan energi, bergantung pada kondisi metabolik tertentu.
                </p>
              </div>
            </div>
          </section>

          <section id="satuan-energi" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#d8e3e7] rounded-xl flex items-center justify-center">
                  <FiThermometer className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">11. Satuan Energi</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-6">
                <p>
                  Satuan energi digunakan untuk menggambarkan jumlah panas atau energi yang disediakan oleh berbagai makronutrien. Angka-angka tersebut diperoleh melalui penelitian menggunakan bom kalorimeter. Dan sekarang dikenal dengan Faktor Atwater.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#f0f9f5] p-6 rounded-xl text-center">
                    <div className="text-4xl font-bold text-[#5d4037] mb-3">4</div>
                    <div className="text-lg font-semibold text-[#8d6e63] mb-2">1 gram protein</div>
                    <div className="text-gray-600">= 4 kalori</div>
                  </div>
                  <div className="bg-[#f0f9f5] p-6 rounded-xl text-center">
                    <div className="text-4xl font-bold text-[#5d4037] mb-3">9</div>
                    <div className="text-lg font-semibold text-[#8d6e63] mb-2">1 gram lemak</div>
                    <div className="text-gray-600">= 9 kalori</div>
                  </div>
                  <div className="bg-[#f0f9f5] p-6 rounded-xl text-center">
                    <div className="text-4xl font-bold text-[#5d4037] mb-3">4</div>
                    <div className="text-lg font-semibold text-[#8d6e63] mb-2">1 gram karbohidrat</div>
                    <div className="text-gray-600">= 4 kalori</div>
                  </div>
                </div>

                <div className="bg-[#f8f6f2] rounded-xl p-6">
                  <p className="text-[#8d6e63]">
                    Satuan energi yang digunakan adalah kalori (Kal) atau kilokalori (kkal). Satu Kal didefinisikan sebagai jumlah panas yang diperlukan untuk menaikkan suhu 1 liter air dari 14,5 °C ke 15,5 °C, sedangkan 1 kkal setara dengan 4,2 kJ (kilojoule).
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="bmr-ree" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#a8e6cf] rounded-xl flex items-center justify-center">
                  <FiTrendingUp className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">12. Basal Metabolic Rate (BMR)</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-4">
                <p>
                  Angka Metabolisme Basal (AMB) atau Basal Metabolic Rate (BMR) adalah kebutuhan energi minimal yang dibutuhkan tubuh untuk menjalankan proses tubuh yang vital. Kebutuhan energi metabolisme basal termasuk jumlah energi yang diperlukan untuk pernapasan, peredaran darah, pekerjaan ginjal, pankreas, dan lain lain alat tubuh, serta untuk proses metabolisme di dalam sel-sel dan untuk mempertahankan suhu tubuh.
                </p>
                <p>
                  Angka metabolisme basal dinyatakan dalam kilokalori per kilogram berat badan per jam.
                </p>
              </div>
            </div>
          </section>

          <section id="rumus-ree" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#a8e6cf] rounded-xl flex items-center justify-center">
                  <FiBarChart2 className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">13. Rumus Resting Energy Expenditure (REE) / Basal Metabolic Rate (BMR)</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-6">
                <p>
                  Walaupun istilah BMR (Basal Metabolic Rate) sering digunakan, sebagian besar rumus yang tersedia sebenarnya ditujukan untuk memperkirakan Resting Energy Expenditure (REE), karena BMR sejati hanya dapat diukur melalui prosedur ketat menggunakan indirect calorimetry (IC). Oleh sebab itu, estimasi kebutuhan energi di praktik gizi lebih banyak menggunakan persamaan REE.
                </p>
                <p>
                  Selama bertahun-tahun, beberapa persamaan telah dikembangkan untuk memperkirakan REE. Tersedia persamaan yang memungkinkan estimasi REE berdasarkan pengukuran menggunakan indirect calorimetry (IC) pada orang dewasa. Hingga beberapa waktu lalu, persamaan Harris-Benedict merupakan salah satu yang paling banyak digunakan untuk memperkirakan REE pada individu sehat maupun pada orang sakit atau cedera. Namun, persamaan Harris-Benedict diketahui melebihkan estimasi REE pada individu dengan berat badan normal maupun obesitas sekitar 7% sampai 27%.
                </p>
                <p>
                  Sebuah penelitian yang membandingkan REE terukur dengan REE estimasi menggunakan persamaan Mifflin-St. Jeor, persamaan Owen, dan persamaan Harris-Benedict pada laki-laki dan perempuan menemukan bahwa persamaan Mifflin-St. Jeor adalah yang paling akurat dalam memperkirakan REE baik pada orang dengan berat badan normal maupun obesitas. Persamaan Mifflin-St. Jeor dikembangkan berdasarkan REE yang diukur dengan IC pada 251 laki-laki dan 247 perempuan, di mana hampir setengahnya memiliki indeks massa tubuh (BMI) antara 30 hingga 42 kg/m². Saat ini, persamaan Mifflin-St. Jeor banyak digunakan untuk memperkirakan kebutuhan energi pada individu sehat dan juga pada beberapa pasien.
                </p>
                <p>
                  Walaupun persamaan Harris-Benedict sering diterapkan pada orang sakit atau cedera, persamaan ini termasuk persamaan Mifflin pada dasarnya dikembangkan untuk individu sehat, sehingga penerapannya pada populasi lain perlu dipertimbangkan kembali. Selain itu, basis data yang digunakan untuk mengembangkan persamaan Harris-Benedict sudah tidak lagi menggambarkan populasi saat ini, sehingga penggunaannya tidak lagi direkomendasikan.
                </p>

                <div className="bg-[#f0f9f5] rounded-xl p-6 mt-4">
                  <h3 className="text-lg font-bold text-[#5d4037] mb-4">Rumus Mifflin-St. Jeor</h3>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="font-semibold text-[#5d4037] mb-2">Laki-laki:</div>
                      <code className="text-lg font-mono text-[#5d4037] block">
                        REE = 10 × berat (kg) + 6,25 × tinggi (cm) – 5 × usia (tahun) + 5
                      </code>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="font-semibold text-[#5d4037] mb-2">Perempuan:</div>
                      <code className="text-lg font-mono text-[#5d4037] block">
                        REE = 10 × berat (kg) + 6,25 × tinggi (cm) – 5 × usia (tahun) – 161
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="aktivitas" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#ffd3b6] rounded-xl flex items-center justify-center">
                  <FiActivity className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">14. Energi Aktivitas (Physical Activity)</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-6">
                <p>
                  Yang dimaksud dengan energi aktivitas termasuk energi yang dibutuhkan oleh semua otot yang tersangkut dalam aktivitas tersebut ditambah sedikit energi yang diperlukan karena adanya peningkatan denyut jantung serta pernafasan selama melaksanakan aktivitas yang berat. Untuk sebagian besar aktivitas, energi yang dibutuhkan tergantung dari ukuran tubuh serta berat atau ringannya aktivitas.
                </p>

                <Table
                  title="Faktor Aktivitas"
                  headers={["Aktivitas", "Laki-Laki", "Perempuan"]}
                  rows={[
                    ["Aktivitas Sangat Ringan", "1,3", "1,3"],
                    ["Aktivitas Ringan", "1,6", "1,5"],
                    ["Aktivitas Moderat", "1,7", "1,6"],
                    ["Aktivitas Berat", "2,1", "1,9"],
                    ["Aktivitas Sangat Berat", "2,4", "2,2"]
                  ]}
                />
              </div>
            </div>
          </section>

          <section id="stress" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#ffaaa5] rounded-xl flex items-center justify-center">
                  <FiThermometer className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">15. Faktor Stress</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-6">
                <p>
                  Faktor stres (stress factor) adalah angka penyesuaian yang ditambahkan pada perhitungan kebutuhan energi untuk menggambarkan kenaikan metabolisme tubuh akibat kondisi stres fisiologis.
                </p>

                <Table
                  headers={["Kondisi Stres", "Faktor"]}
                  rows={[
                    ["Tidak Stres", "1,3"],
                    ["Ringan", "1,4"],
                    ["Sedang", "1,5"],
                    ["Berat", "1,6"],
                    ["Sangat Berat", "1,7"],
                    ["Luka Bakar Berat", "2,1"]
                  ]}
                />
              </div>
            </div>
          </section>

          <section id="tee" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#d8e3e7] rounded-xl flex items-center justify-center">
                  <FiZap className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">16. Total Energy Expenditure (TEE)</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-6">
                <p>
                  Energi yang digunakan tubuh manusia terdiri atas:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><span className="font-semibold">Basal energy expenditure (BEE)</span> – pengeluaran energi basal</li>
                  <li><span className="font-semibold">Thermic effect of food (TEF)</span> – efek termis makanan</li>
                  <li><span className="font-semibold">Activity thermogenesis (AT) / Physical Activity (PA)</span> – Termogenesis Aktivitas / Aktivitas Fisik</li>
                </ul>
                <p>
                  Ketiga komponen ini disebut sebagai total energy expenditure (TEE) atau total pengeluaran energi. TEE (Total Energy Expenditure) adalah total energi yang dikeluarkan tubuh dalam satu hari (24 jam) untuk semua fungsi tubuh, termasuk metabolisme basal (Basal Metabolic Rate), aktivitas fisik (Physical Activity), dan pemrosesan makanan (Thermic Effect of Food (TEF)). TEF tidak dihitung terpisah karena kontribusinya kecil dan umumnya sudah tercakup dalam faktor aktivitas/stres pada perhitungan klinis.
                </p>
              </div>
            </div>
          </section>

          <div id="makronutrien" className="space-y-12 scroll-mt-20">
            <section id="karbohidrat" className="scroll-mt-20">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#a8e6cf] rounded-xl flex items-center justify-center">
                    <FiCoffee className="text-white text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#5d4037]">18. Karbohidrat</h2>
                </div>
                <div className="text-[#8d6e63] leading-relaxed space-y-4">
                  <p>
                    Istilah Karbohidrat, berasal dari kata hidrat karbon (hidrates of carbon) atau yang populer dikenal dengan sebutan hidrat arang atau sakarida (dari bahasa Yunani sakcharon yang berarti gula). Karbohidrat adalah zat gizi berupa senyawa organik yang terdiri dari atom karbon, hidrogen, dan oksigen yang digunakan sebagai bahan pembentuk energi.
                  </p>
                  <p>
                    Karbohidrat dapat diklasifikasikan berdasarkan jumlah unit gula atau sakarida yang menjadi struktur penyusunnya. Monosakarida dan disakarida dikategorikan sebagai karbohidrat sederhana karena ukuran dan strukturnya relatif kecil, sedangkan polisakarida, pati, dan serat jenis tertentu dapat dinamakan karbohidrat kompleks berdasarkan ukuran yang besar dan struktur yang kompleks.
                  </p>
                  <p>
                    Karbohidrat adalah sumber kalori terbesar dalam makanan sehari-hari, dengan sebagian besar kalori terdapat dalam serealia, umbi, dan sayuran dalam bentuk pati yang tergolong polisakarida. Pencernaan karbohidrat berawal dari mulut dengan memecah karbohidrat kompleks menjadi unit yang lebih sederhana, terutama maltosa. Enzim yang dihasilkan oleh mulut, pankreas, dan usus halus berpartisipasi dalam proses pencernaan hingga menjadi glukosa, fruktosa, dan galaktosa. Glukosa dan galaktosa memasuki aliran darah dan didistribusikan ke berbagai jaringan tubuh. Serat tidak dapat dicerna secara enzimatis, tetapi dapat difermentasi oleh bakteri di usus besar.
                  </p>
                  <p>
                    Karbohidrat mempunyai fungsi utama menyediakan kebutuhan energi tubuh namun juga berperan dalam keberlangsungan proses metabolisme (protein dan lemak sparer, pencernaan) dan pengolahan bahan pangan (memberi rasa manis, aroma dan bentuk khas, dan memberikan warna, pelembut tekstur, dan tampilan makanan).
                  </p>
                </div>
              </div>
            </section>

            <section id="protein" className="scroll-mt-20">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#ffd3b6] rounded-xl flex items-center justify-center">
                    <FiDroplet className="text-white text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#5d4037]">19. Protein</h2>
                </div>
                <div className="text-[#8d6e63] leading-relaxed space-y-4">
                  <p>
                    Protein merupakan salah satu zat gizi makro yang penting bagi kehidupan manusia selain karbohidrat dan lemak. Kata protein berasal dari bahasa Yunani "protos" yang berarti paling utama. Protein dikaitkan dengan berbagai bentuk kehidupan , salah satunya adalah enzim yang yang dibuat dari protein. Pada tubuh manusia, protein juga dapat ditemukan pada rambut, kuku, otot, tulang, dan hampir di seluruh bagian dan jaringan tubuh. Ketika bernapas sehingga darah mengalir ke seluruh tubuh, menggerakan tangan dan melemaskannya, kita sedang menggunakan beberapa jenis protein tubuh, yaitu hemoglobin, kolagen, dan miosin.
                  </p>
                  <p>
                    Protein diperoleh dari berbagai makanan sumber protein baik yang berasal dari hewan maupun tumbuh-tumbuhan. Selanjutnya tubuh kita memecah protein dari makanan menjadi unit terkecil, yaitu asam amino yang dibawa ke sel untuk kemudian digunakan untuk membentuk berbagai jenis protein yang dibutuhkan oleh tubuh.
                  </p>
                  <p>
                    Secara umum protein berfungsi antara lain untuk pertumbuhan, pembentukan komponen struktural, pengangkut dan penyimpanan zat gizi, enzim, pembentukan antibodi, dan sumber energi.
                  </p>
                </div>
              </div>
            </section>

            <section id="lemak" className="scroll-mt-20">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#ffaaa5] rounded-xl flex items-center justify-center">
                    <FiTrendingUp className="text-white text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#5d4037]">20. Lemak</h2>
                </div>
                <div className="text-[#8d6e63] leading-relaxed space-y-4">
                  <p>
                    Lemak (lipid) adalah zat organik hidrofobik yang bersifat sukar larut dalam air, tetapi larut dalam pelarut non-polar. Unsur penyusun lemak adalah karbon (C), hidrogen (H), oksigen (O), dan terkadang fosfor (P) serta nitrogen (N).
                  </p>
                  <p>
                    Sumber lemak adalah dari tumbuh-tumbuhan dan hewan. Sayur dan buah (kecuali alpukat sangat sedikit mengandung lemak). Pencernaan lemak tidak terjadi di mulut dan lambung karena tidak memiliki enzim lipase untuk menghidrolisis lemak. Pencernaan lemak dimulai di usus halus ketika empedu mengemulsikan lemak dan lipase pankreas memecahnya menjadi asam lemak serta monogliserida. Senyawa ini diserap oleh mukosa usus, kemudian disintesis ulang menjadi trigliserida dan dikemas menjadi kilomikron. Kilomikron masuk ke sistem limfe lalu darah untuk didistribusikan ke jaringan tubuh.
                  </p>
                  <p>
                    Lemak berfungsi sebagai sumber energi cadangan, sumber asam lemak esensial, pelindung organ tubuh, memelihara suhu tubuh, membantu penyerapan vitamin larut lemak, pembentuk hormon, memberi rasa kenyang dan kelezatan, transportasi zat gizi dan lain-lain.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section id="kebutuhan" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#d8e3e7] rounded-xl flex items-center justify-center">
                  <FiUsers className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">21. Kebutuhan Protein, Lemak, dan Karbohidrat dalam tubuh</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-6">
                <p>Diet normal dalam sehari:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#f0f9f5] rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-[#5d4037] mb-3">45-55%</div>
                    <div className="text-lg font-semibold text-[#8d6e63] mb-2">Karbohidrat</div>
                    <div className="text-sm text-gray-600">3–5 g/kg/hari</div>
                  </div>
                  
                  <div className="bg-[#fff5f5] rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-[#5d4037] mb-3">10-15%</div>
                    <div className="text-lg font-semibold text-[#8d6e63] mb-2">Protein</div>
                    <div className="text-sm text-gray-600">0,8–1 g/kg/hari</div>
                  </div>
                  
                  <div className="bg-[#fff8f2] rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-[#5d4037] mb-3">25-35%</div>
                    <div className="text-lg font-semibold text-[#8d6e63] mb-2">Lemak</div>
                    <div className="text-sm text-gray-600">0,5–1,5 g/kg/hari</div>
                  </div>
                </div>

                <div className="bg-[#f8f6f2] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#5d4037] mb-3">Catatan:</h3>
                  <p className="text-[#8d6e63]">
                    Untuk total % kebutuhan Protein, Lemak, Karbohidrat harus 100%. Contoh: protein 15%, Lemak 25% dan Karbohidrat sisanya yaitu 60%.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="kategori-asupan" className="scroll-mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f0f0f0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#a8e6cf] rounded-xl flex items-center justify-center">
                  <FiStar className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#5d4037]">23. Kategori dan Tingkat Asupan Makan</h2>
              </div>
              <div className="text-[#8d6e63] leading-relaxed space-y-6">
                <p>
                  Tingkat kecukupan adalah persentase perbandingan antara asupan energi atau zat gizi yang dikonsumsi dengan angka kebutuhan atau Angka Kecukupan Gizi (AKG). Nilai ini digunakan untuk menilai apakah asupan seseorang sudah memenuhi kebutuhan optimal atau belum.
                </p>

                <Table
                  title="Kategori Tingkat Kecukupan"
                  headers={["Kategori", "Persentase Tingkat Kecukupan"]}
                  rows={[
                    ["Kurang", "< 85%"],
                    ["Cukup", "85–115%"],
                    ["Berlebih", "> 115%"]
                  ]}
                />
              </div>
            </div>
          </section>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-[#a8e6cf] text-white p-4 rounded-full shadow-lg hover:bg-[#93d4bc] transition-all duration-300 z-50"
        >
          <FiArrowUp className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}