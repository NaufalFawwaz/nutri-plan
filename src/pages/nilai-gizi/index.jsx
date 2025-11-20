import { useState } from 'react';

export default function NilaiGizi() {
  const [formData, setFormData] = useState({
    beratBadan: '',
    tinggiBadan: '',
    usia: '',
    jenisKelamin: '',
    aktivitasFisik: '',
    kondisi: '',
    faktorStress: '',
    jenisDiet: ''
  });

  const [hasil, setHasil] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateResults = () => {
    const {
      beratBadan,
      tinggiBadan,
      usia,
      jenisKelamin,
      aktivitasFisik,
      kondisi,
      faktorStress,
      jenisDiet
    } = formData;

    const bb = parseFloat(beratBadan);
    const tb = parseFloat(tinggiBadan) / 100;
    const umur = parseInt(usia);

    const imt = bb / (tb * tb);

    let kategoriIMT = '';
    if (imt < 18.5) kategoriIMT = 'Kurus';
    else if (imt >= 18.5 && imt <= 24.9) kategoriIMT = 'Normal';
    else if (imt >= 25.0 && imt <= 29.9) kategoriIMT = 'Gemuk';
    else kategoriIMT = 'Obesitas';

    const tbCm = parseFloat(tinggiBadan);
    let bbi;
    if (jenisKelamin === 'L') {
      bbi = (tbCm - 100) - (0.1 * (tbCm - 100));
    } else {
      bbi = (tbCm - 100) - (0.15 * (tbCm - 100));
    }

    let bmr;
    if (jenisKelamin === 'L') {
      bmr = (10 * bb) + (6.25 * tbCm) - (5 * umur) + 5;
    } else {
      bmr = (10 * bb) + (6.25 * tbCm) - (5 * umur) - 161;
    }

    const faktorAktivitas = {
      'Istirahat': 1.2,
      'Ringan': 1.3,
      'Sedang': 1.4,
      'Berat': 1.5
    };

    const faktorStressMap = {
      'Tidak Stress': 1.3,
      'Ringan': 1.4,
      'Sedang': 1.5,
      'Berat': 1.6,
      'Sangat Berat': 1.7,
      'Luka Bakar Berat': 2.1
    };

    let tee;
    if (kondisi === 'Sehat') {
      tee = bmr * faktorAktivitas[aktivitasFisik];
    } else {
      tee = bmr * faktorAktivitas[aktivitasFisik] * faktorStressMap[faktorStress];
    }

    const komposisiDiet = {
      'Diet Biasa': { karbo: 60, protein: 15, lemak: 25 },
      'Diabetes Mellitus': { karbo: 55, protein: 20, lemak: 25 },
      'Dislipidemia': { karbo: 55, protein: 15, lemak: 30 },
      'DASH': { karbo: 60, protein: 15, lemak: 25 },
      'Penyakit Ginjal Kronik Non Dialisis': { karbo: 65, protein: 10, lemak: 25 },
      'Penyakit Ginjal Kronik Dialisis': { karbo: 55, protein: 20, lemak: 25 },
      'Penyakit Hati': { karbo: 55, protein: 15, lemak: 30 },
      'Rendah Protein': { karbo: 65, protein: 8, lemak: 27 },
      'Rendah Lemak': { karbo: 65, protein: 20, lemak: 15 },
      'Tinggi Protein': { karbo: 55, protein: 25, lemak: 20 }
    };

    const komposisi = komposisiDiet[jenisDiet];

    const kh = ((komposisi.karbo / 100) * tee) / 4;
    const protein = ((komposisi.protein / 100) * tee) / 4;
    const lemak = ((komposisi.lemak / 100) * tee) / 9;

    setHasil({
      imt: imt.toFixed(2),
      kategoriIMT,
      bbi: bbi.toFixed(2),
      bmr: bmr.toFixed(2),
      tee: tee.toFixed(2),
      kh: kh.toFixed(2),
      protein: protein.toFixed(2),
      lemak: lemak.toFixed(2),
      komposisi
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateResults();
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-[#5d4037]">Kalkulator </span>
            <span className="text-[#a8e6cf]">Nilai Gizi</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hitung kebutuhan gizi Anda berdasarkan data pribadi dan kondisi kesehatan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Diri</h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    name="beratBadan"
                    value={formData.beratBadan}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02]"
                    placeholder="Contoh: 65"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    name="tinggiBadan"
                    value={formData.tinggiBadan}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02]"
                    placeholder="Contoh: 170"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Usia (tahun)
                  </label>
                  <input
                    type="number"
                    name="usia"
                    value={formData.usia}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02]"
                    placeholder="Contoh: 25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Jenis Kelamin
                  </label>
                  <select
                    name="jenisKelamin"
                    value={formData.jenisKelamin}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] cursor-pointer"
                    required
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Aktivitas Fisik
                  </label>
                  <select
                    name="aktivitasFisik"
                    value={formData.aktivitasFisik}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] cursor-pointer"
                    required
                  >
                    <option value="">Pilih Aktivitas Fisik</option>
                    <option value="Istirahat">Istirahat</option>
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Kondisi
                  </label>
                  <select
                    name="kondisi"
                    value={formData.kondisi}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] cursor-pointer"
                    required
                  >
                    <option value="">Pilih Kondisi</option>
                    <option value="Sehat">Sehat</option>
                    <option value="Sakit">Sakit</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Faktor Stress
                  </label>
                  <select
                    name="faktorStress"
                    value={formData.faktorStress}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] cursor-pointer"
                    required
                  >
                    <option value="">Pilih Faktor Stress</option>
                    <option value="Tidak Stress">Tidak Stress</option>
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                    <option value="Sangat Berat">Sangat Berat</option>
                    <option value="Luka Bakar Berat">Luka Bakar Berat</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Jenis Diet
                  </label>
                  <select
                    name="jenisDiet"
                    value={formData.jenisDiet}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] cursor-pointer"
                    required
                  >
                    <option value="">Pilih Jenis Diet</option>
                    <option value="Diet Biasa">Diet Biasa</option>
                    <option value="Diabetes Mellitus">Diabetes Mellitus</option>
                    <option value="Dislipidemia">Dislipidemia</option>
                    <option value="DASH">DASH</option>
                    <option value="Penyakit Ginjal Kronik Non Dialisis">Penyakit Ginjal Kronik Non Dialisis</option>
                    <option value="Penyakit Ginjal Kronik Dialisis">Penyakit Ginjal Kronik Dialisis</option>
                    <option value="Penyakit Hati">Penyakit Hati</option>
                    <option value="Rendah Protein">Rendah Protein</option>
                    <option value="Rendah Lemak">Rendah Lemak</option>
                    <option value="Tinggi Protein">Tinggi Protein</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer mt-8 bg-[#a8e6cf] text-white py-4 px-6 rounded-xl hover:bg-[#93d4bc] focus:outline-none focus:ring-2 focus:ring-[#a8e6cf] focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-semibold text-lg shadow-md hover:shadow-lg"
              >
                Hitung Nilai Gizi
              </button>
            </form>
          </div>

          {hasil && (
            <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Hasil Perhitungan</h2>

              <div className="space-y-6">
                <div className="border-l-4 border-[#a8e6cf] pl-4 transition-all duration-300 hover:border-l-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Indeks Massa Tubuh (IMT)</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{hasil.imt}</span>
                    <span className="text-lg font-medium text-gray-600">kg/m²</span>
                  </div>
                  <p className={`text-lg font-semibold mt-2 transition-colors duration-300 ${hasil.kategoriIMT === 'Kurus' ? 'text-yellow-600' :
                      hasil.kategoriIMT === 'Normal' ? 'text-green-600' :
                        hasil.kategoriIMT === 'Gemuk' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                    {hasil.kategoriIMT}
                  </p>
                </div>

                <div className="border-l-4 border-[#a8e6cf] pl-4 transition-all duration-300 hover:border-l-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Berat Badan Ideal</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{hasil.bbi}</span>
                    <span className="text-lg font-medium text-gray-600">kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-[#a8e6cf] pl-4 transition-all duration-300 hover:border-l-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Energi Basal (BMR)</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">{hasil.bmr}</span>
                      <span className="text-sm font-medium text-gray-600">kkal/hari</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-[#a8e6cf] pl-4 transition-all duration-300 hover:border-l-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Energi Total (TEE)</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">{hasil.tee}</span>
                      <span className="text-sm font-medium text-gray-600">kkal/hari</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#f8f6f2] rounded-xl p-5 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Kebutuhan Zat Gizi Harian</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 transition-all duration-300 hover:bg-white hover:px-3 hover:rounded-lg">
                        <div>
                          <span className="font-semibold text-gray-800">Karbohidrat</span>
                          <span className="text-sm text-gray-600 block">Sumber energi utama</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900">{hasil.kh}</span>
                          <span className="text-sm font-medium text-gray-600 block">gram</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-200 transition-all duration-300 hover:bg-white hover:px-3 hover:rounded-lg">
                        <div>
                          <span className="font-semibold text-gray-800">Protein</span>
                          <span className="text-sm text-gray-600 block">Pembangun dan perbaikan jaringan</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900">{hasil.protein}</span>
                          <span className="text-sm font-medium text-gray-600 block">gram</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-2 transition-all duration-300 hover:bg-white hover:px-3 hover:rounded-lg">
                        <div>
                          <span className="font-semibold text-gray-800">Lemak</span>
                          <span className="text-sm text-gray-600 block">Cadangan energi dan penyerapan vitamin</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900">{hasil.lemak}</span>
                          <span className="text-sm font-medium text-gray-600 block">gram</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f0f9f5] rounded-xl p-5 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Komposisi Diet</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-[#a8e6cf] transition-all duration-300 hover:bg-white hover:px-3 hover:rounded-lg">
                        <span className="font-semibold text-gray-800">Karbohidrat</span>
                        <span className="text-xl font-bold text-[#2d7a5f]">{hasil.komposisi.karbo}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[#a8e6cf] transition-all duration-300 hover:bg-white hover:px-3 hover:rounded-lg">
                        <span className="font-semibold text-gray-800">Protein</span>
                        <span className="text-xl font-bold text-[#2d7a5f]">{hasil.komposisi.protein}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 transition-all duration-300 hover:bg-white hover:px-3 hover:rounded-lg">
                        <span className="font-semibold text-gray-800">Lemak</span>
                        <span className="text-xl font-bold text-[#2d7a5f]">{hasil.komposisi.lemak}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}