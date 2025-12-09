import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { dataGizi } from '@/utils/data/dataGizi';

const ZatGiziPage = () => {
  const { user } = useAuth();
  const [pasienList, setPasienList] = useState([]);
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [selectedFoods, setSelectedFoods] = useState({
    makanPagi: [],
    snackPagi: [],
    makanSiang: [],
    snackSore: [],
    makanMalam: []
  });

  const [kebutuhanGizi, setKebutuhanGizi] = useState({
    energi: 0,
    protein: 0,
    lemak: 0,
    karbohidrat: 0,
    serat: 0,
    natrium: 0,
    kalium: 0,
    kalsium: 0,
    besi: 0
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMeal, setCurrentMeal] = useState('');
  const [selectedFood, setSelectedFood] = useState('');
  const [selectedFoodWeight, setSelectedFoodWeight] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [foodCategories, setFoodCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [editingWeights, setEditingWeights] = useState({});

  useEffect(() => {
    const categories = [...new Set(dataGizi.map(food => {
      if (food.KODE && food.KODE.startsWith('AR')) return 'Bahan Mentah';
      if (food.KODE && food.KODE.startsWith('AP')) return 'Produk Olahan';
      if (food.KODE && food.KODE.startsWith('BR')) return 'Umbi-umbian';
      if (food.KODE && food.KODE.startsWith('BP')) return 'Produk Umbi';
      return 'Lainnya';
    }))];
    setFoodCategories(categories);
  }, []);

  useEffect(() => {
    const fetchPasienData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'hasilGizi'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const pasienData = [];

        querySnapshot.forEach((doc) => {
          pasienData.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setPasienList(pasienData);

        if (pasienData.length > 0 && !selectedPasien) {
          handleSelectPasien(pasienData[0]);
        }
      } catch (error) {
        console.error('Error fetching patient data: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPasienData();
  }, [user]);

  useEffect(() => {
    if (selectedPasien) {
      setKebutuhanGizi({
        energi: selectedPasien.tee || 2000,
        protein: selectedPasien.protein || 60,
        lemak: selectedPasien.lemak || 65,
        karbohidrat: selectedPasien.kh || 300,
        serat: 25,
        natrium: 2300,
        kalium: 4700,
        kalsium: 1000,
        besi: 18
      });
    }
  }, [selectedPasien]);

  const handleSelectPasien = (pasien) => {
    setSelectedPasien(pasien);
    setSelectedFoods({
      makanPagi: [],
      snackPagi: [],
      makanSiang: [],
      snackSore: [],
      makanMalam: []
    });
    setEditingWeights({});
    setSaveSuccess(false);
  };

  const handleOpenDialog = (mealType) => {
    if (!selectedPasien) {
      alert('Pilih pasien terlebih dahulu!');
      return;
    }
    setCurrentMeal(mealType);
    setDialogOpen(true);
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedFood('');
    setSelectedFoodWeight(100);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFood('');
    setSelectedFoodWeight(100);
    setSearchTerm('');
    setSelectedCategory('');
  };

  const calculateNutritionValues = (foodData, beratBahan) => {
    const bdd = foodData.BDD_persen || 100;
    const beratSaji = (beratBahan * bdd) / 100;
    const factor = beratSaji / 100;
    
    return {
      energi: (foodData.ENERGI_Kal || 0) * factor,
      protein: (foodData.PROTEIN_g || 0) * factor,
      lemak: (foodData.LEMAK_g || 0) * factor,
      karbohidrat: (foodData.KH_g || 0) * factor,
      serat: (foodData.SERAT_g || 0) * factor,
      natrium: (foodData.NATRIUM_mg || 0) * factor,
      kalium: (foodData.KALIUM_mg || 0) * factor,
      kalsium: (foodData.KALSIUM_mg || 0) * factor,
      besi: (foodData.BESI_mg || 0) * factor
    };
  };

  const handleAddFood = () => {
    if (selectedFood && currentMeal) {
      const foodData = dataGizi.find(item => item.KODE === selectedFood);
      if (foodData) {
        const weight = selectedFoodWeight === "" || selectedFoodWeight < 1 ? 100 : selectedFoodWeight;
        
        const newFood = {
          kode: foodData.KODE,
          nama: foodData.NAMA_BAHAN,
          beratBahan: weight,
          bdd: foodData.BDD_persen || 100,
          data: foodData,
          nutritionValues: calculateNutritionValues(foodData, weight)
        };
        
        setSelectedFoods(prev => ({
          ...prev,
          [currentMeal]: [...prev[currentMeal], newFood]
        }));
      }
      handleCloseDialog();
    }
  };

  const removeFood = (mealType, index) => {
    setSelectedFoods(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
    
    const key = `${mealType}-${index}`;
    if (editingWeights[key]) {
      const newEditingWeights = { ...editingWeights };
      delete newEditingWeights[key];
      setEditingWeights(newEditingWeights);
    }
  };

  const updateFoodWeight = (mealType, index, newWeight) => {
    const weightNum = parseInt(newWeight);
    
    let validatedWeight;
    if (isNaN(weightNum) || weightNum < 1) {
      validatedWeight = 1;
    } else if (weightNum > 10000) {
      validatedWeight = 10000;
    } else {
      validatedWeight = weightNum;
    }
    
    setSelectedFoods(prev => {
      const updatedFoods = [...prev[mealType]];
      const food = updatedFoods[index];
      
      if (food) {
        updatedFoods[index] = {
          ...food,
          beratBahan: validatedWeight,
          nutritionValues: calculateNutritionValues(food.data, validatedWeight)
        };
      }
      
      return {
        ...prev,
        [mealType]: updatedFoods
      };
    });
    
    const key = `${mealType}-${index}`;
    if (editingWeights[key]) {
      const newEditingWeights = { ...editingWeights };
      delete newEditingWeights[key];
      setEditingWeights(newEditingWeights);
    }
  };

  const handleWeightInputChange = (mealType, index, value) => {
    const key = `${mealType}-${index}`;
    setEditingWeights(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleWeightInputBlur = (mealType, index, value) => {
    if (value === "") {
      updateFoodWeight(mealType, index, 1);
    } else {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        updateFoodWeight(mealType, index, 1);
      } else {
        updateFoodWeight(mealType, index, numValue);
      }
    }
  };

  const simpanMenuKeFirestore = async () => {
    if (!user || !selectedPasien) {
      alert('Harap login dan pilih pasien terlebih dahulu!');
      return;
    }

    const totals = calculateTotal();
    const hasFoods = Object.values(selectedFoods).some(foods => foods.length > 0);
    
    if (!hasFoods) {
      alert('Tambahkan makanan terlebih dahulu sebelum menyimpan menu!');
      return;
    }

    setSaving(true);
    try {
      const menuData = {
        userId: user.uid,
        userEmail: user.email,
        pasienId: selectedPasien.id,
        pasienNama: selectedPasien.nama,
        pasienData: {
          nama: selectedPasien.nama,
          usia: selectedPasien.usia,
          jenisKelamin: selectedPasien.jenisKelamin,
          beratBadan: selectedPasien.beratBadan,
          tinggiBadan: selectedPasien.tinggiBadan,
          jenisDiet: selectedPasien.jenisDiet,
          tee: selectedPasien.tee,
          protein: selectedPasien.protein,
          lemak: selectedPasien.lemak,
          kh: selectedPasien.kh
        },
        menu: selectedFoods,
        totals: totals,
        kebutuhanGizi: kebutuhanGizi,
        persentaseKecukupan: nutrients.reduce((acc, nutrient) => {
          acc[nutrient.key] = calculatePercentage(totals[nutrient.key], kebutuhanGizi[nutrient.key]);
          return acc;
        }, {}),
        interpretasi: nutrients.reduce((acc, nutrient) => {
          const percentage = calculatePercentage(totals[nutrient.key], kebutuhanGizi[nutrient.key]);
          acc[nutrient.key] = getInterpretasi(percentage);
          return acc;
        }, {}),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'menuGizi', selectedPasien.id), menuData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving menu: ', error);
      alert('Terjadi kesalahan saat menyimpan menu: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredFoods = dataGizi.filter(food => {
    const matchesSearch = food.NAMA_BAHAN.toLowerCase().includes(searchTerm.toLowerCase());

    let foodCategory = 'Lainnya';
    if (food.KODE && food.KODE.startsWith('AR')) foodCategory = 'Bahan Mentah';
    else if (food.KODE && food.KODE.startsWith('AP')) foodCategory = 'Produk Olahan';
    else if (food.KODE && food.KODE.startsWith('BR')) foodCategory = 'Umbi-umbian';
    else if (food.KODE && food.KODE.startsWith('BP')) foodCategory = 'Produk Umbi';
    
    const matchesCategory = !selectedCategory || foodCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const calculateSubTotal = (mealType) => {
    const foods = selectedFoods[mealType];
    
    return foods.reduce((totals, food) => {
      const values = food.nutritionValues;
      return {
        energi: totals.energi + (values.energi || 0),
        protein: totals.protein + (values.protein || 0),
        lemak: totals.lemak + (values.lemak || 0),
        karbohidrat: totals.karbohidrat + (values.karbohidrat || 0),
        serat: totals.serat + (values.serat || 0),
        natrium: totals.natrium + (values.natrium || 0),
        kalium: totals.kalium + (values.kalium || 0),
        kalsium: totals.kalsium + (values.kalsium || 0),
        besi: totals.besi + (values.besi || 0)
      };
    }, {
      energi: 0, protein: 0, lemak: 0, karbohidrat: 0, serat: 0,
      natrium: 0, kalium: 0, kalsium: 0, besi: 0
    });
  };

  const calculateTotal = () => {
    const meals = ['makanPagi', 'snackPagi', 'makanSiang', 'snackSore', 'makanMalam'];
    const totals = {
      energi: 0,
      protein: 0,
      lemak: 0,
      karbohidrat: 0,
      serat: 0,
      natrium: 0,
      kalium: 0,
      kalsium: 0,
      besi: 0
    };

    meals.forEach(meal => {
      const subTotal = calculateSubTotal(meal);
      Object.keys(totals).forEach(key => {
        totals[key] += subTotal[key];
      });
    });

    return totals;
  };

  const calculatePercentage = (total, kebutuhan) => {
    if (kebutuhan === 0) return 0;
    return Math.round((total / kebutuhan) * 100);
  };

  const getInterpretasi = (percentage) => {
    if (percentage >= 85 && percentage <= 115) return 'Cukup';
    if (percentage <= 84) return 'Kurang';
    if (percentage >= 116) return 'Lebih';
    return '-';
  };

  const getInterpretasiColor = (percentage) => {
    if (percentage >= 85 && percentage <= 115) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage <= 84) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (percentage >= 116) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const totals = calculateTotal();

  const mealTypes = [
    { key: 'makanPagi', label: 'Makan Pagi' },
    { key: 'snackPagi', label: 'Snack Pagi' },
    { key: 'makanSiang', label: 'Makan Siang' },
    { key: 'snackSore', label: 'Snack Sore' },
    { key: 'makanMalam', label: 'Makan Malam' }
  ];

  const nutrients = [
    { key: 'energi', label: 'Energi (Kal)', satuan: 'Kal' },
    { key: 'protein', label: 'Protein (g)', satuan: 'g' },
    { key: 'lemak', label: 'Lemak (g)', satuan: 'g' },
    { key: 'karbohidrat', label: 'Karbohidrat (g)', satuan: 'g' },
    { key: 'serat', label: 'Serat (g)', satuan: 'g' },
    { key: 'natrium', label: 'Natrium (mg)', satuan: 'mg' },
    { key: 'kalium', label: 'Kalium (mg)', satuan: 'mg' },
    { key: 'kalsium', label: 'Kalsium (mg)', satuan: 'mg' },
    { key: 'besi', label: 'Besi (mg)', satuan: 'mg' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8e6cf] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pasien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#5d4037]">
                Menu Zat Gizi Harian
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Kelola dan pantau asupan gizi harian pasien dengan mudah
              </p>
              <div className="mt-4 flex gap-3">
                <a
                  href="/history"
                  className="inline-flex items-center text-[#5d4037] hover:text-[#3d2c1e] text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lihat Riwayat
                </a>
                <a
                  href="/nilai-gizi"
                  className="inline-flex items-center text-[#5d4037] hover:text-[#3d2c1e] text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Hitung Nilai Gizi
                </a>
              </div>
            </div>
            <a
              href="/nilai-gizi"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#a8e6cf] text-[#5d4037] rounded-lg hover:bg-[#93d4bc] transition duration-200 border border-[#a8e6cf]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Hitung Nilai Gizi Baru
            </a>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            ✅ Menu berhasil disimpan! Lihat di <a href="/history" className="font-semibold underline">Riwayat</a>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-[#a8e6cf] rounded-lg mr-3">
              <svg className="w-6 h-6 text-[#5d4037]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Pilih Pasien</h2>
          </div>

          {!user ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="p-3 bg-yellow-100 rounded-full w-12 h-12 mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium mb-4">Silakan login terlebih dahulu untuk melihat data pasien.</p>
              <a
                href="/login"
                className="inline-flex items-center px-5 py-2.5 bg-[#a8e6cf] text-[#5d4037] rounded-lg hover:bg-[#93d4bc] transition duration-200 border border-[#a8e6cf]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </a>
            </div>
          ) : pasienList.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="p-3 bg-[#a8e6cf] rounded-full w-12 h-12 mx-auto mb-4">
                <svg className="w-6 h-6 text-[#5d4037] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium mb-4">Belum ada data pasien.</p>
              <a
                href="/nilai-gizi"
                className="inline-flex items-center px-5 py-2.5 bg-[#a8e6cf] text-[#5d4037] rounded-lg hover:bg-[#93d4bc] transition duration-200 border border-[#a8e6cf]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Hitung Nilai Gizi Baru
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pasienList.map((pasien) => (
                <div
                  key={pasien.id}
                  onClick={() => handleSelectPasien(pasien)}
                  className={`p-5 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedPasien?.id === pasien.id
                      ? 'border-[#a8e6cf] bg-white shadow-sm'
                      : 'border-gray-200 hover:border-[#a8e6cf] hover:bg-white'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{pasien.nama}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${pasien.jenisKelamin === 'L'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                          }`}>
                          {pasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {pasien.usia} tahun
                        </span>
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${selectedPasien?.id === pasien.id ? 'bg-[#a8e6cf]' : 'bg-gray-100'
                      }`}>
                      {selectedPasien?.id === pasien.id ? (
                        <svg className="w-5 h-5 text-[#5d4037]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      BB: {pasien.beratBadan} kg • TB: {pasien.tinggiBadan} cm
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      TEE: <span className="font-semibold ml-1">{pasien.tee}</span> kkal
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-600">Diet:</span>
                      <span className="font-medium text-[#5d4037] ml-1">{pasien.jenisDiet}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Ditambahkan: {pasien.createdAt?.toDate?.().toLocaleDateString('id-ID') || 'Tanggal tidak tersedia'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPasien && (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-[#a8e6cf] rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#5d4037]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg md:text-xl">
                      Sedang Mengatur Menu untuk: <span className="text-[#5d4037]">{selectedPasien.nama}</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Energi (TEE)', value: `${selectedPasien.tee} kkal` },
                      { label: 'Protein', value: `${selectedPasien.protein} g` },
                      { label: 'Lemak', value: `${selectedPasien.lemak} g` },
                      { label: 'Karbohidrat', value: `${selectedPasien.kh} g` }
                    ].map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                        <p className="font-bold text-lg text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Jenis Diet</p>
                    <p className="font-bold text-[#5d4037]">{selectedPasien.jenisDiet}</p>
                    <div className="mt-3">
                      <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full">
                        IMT: {selectedPasien.imt} ({selectedPasien.kategoriIMT})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={simpanMenuKeFirestore}
                  disabled={saving || Object.values(selectedFoods).every(foods => foods.length === 0)}
                  className={`inline-flex items-center px-6 py-3 rounded-lg transition duration-200 font-medium ${saving || Object.values(selectedFoods).every(foods => foods.length === 0)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#5d4037] text-white hover:bg-[#3d2c1e]'
                    }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {saving ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              {mealTypes.map((meal) => {
                const subTotal = calculateSubTotal(meal.key);
                const energyPercentage = calculatePercentage(subTotal.energi, kebutuhanGizi.energi / 5);

                return (
                  <div key={meal.key} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-200 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-[#a8e6cf] rounded-lg mr-3">
                          <svg className="w-5 h-5 text-[#5d4037]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-gray-800">{meal.label}</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${energyPercentage >= 85 && energyPercentage <= 115
                          ? 'bg-green-100 text-green-800'
                          : energyPercentage < 85
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {energyPercentage}%
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {selectedFoods[meal.key].length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-500 text-sm">Belum ada makanan</p>
                          <p className="text-gray-400 text-xs mt-1">Tambahkan makanan</p>
                        </div>
                      ) : (
                        selectedFoods[meal.key].map((food, index) => {
                          const key = `${meal.key}-${index}`;
                          const isEditing = editingWeights[key] !== undefined;
                          const displayValue = isEditing ? editingWeights[key] : food.beratBahan;
                          const beratSaji = Math.round((food.beratBahan * food.bdd) / 100);
                          
                          return (
                            <div key={index} className="bg-gray-50 border border-gray-100 rounded-lg p-3 hover:bg-white transition-colors duration-150">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 text-sm">{food.nama}</p>
                                  
                                  <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
                                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100">
                                      {food.beratBahan}g bahan
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-100">
                                      BDD: {food.bdd}%
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded border border-gray-100">
                                      Saji: {beratSaji}g
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded border border-orange-100">
                                      {Math.round(food.nutritionValues.energi || 0)} Kal
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded border border-green-100">
                                      P: {Math.round(food.nutritionValues.protein || 0)}g
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded border border-yellow-100">
                                      L: {Math.round(food.nutritionValues.lemak || 0)}g
                                    </span>
                                  </div>
                                  
                                  <div className="mt-3 flex items-center">
                                    <span className="text-xs text-gray-600 mr-2">Berat bahan:</span>
                                    <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                                      <input
                                        type="number"
                                        value={displayValue}
                                        onChange={(e) => {
                                          handleWeightInputChange(meal.key, index, e.target.value);
                                        }}
                                        onBlur={(e) => {
                                          handleWeightInputBlur(meal.key, index, e.target.value);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.target.blur();
                                          }
                                        }}
                                        className="w-20 px-2 py-1 text-sm text-gray-700 border-r border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#a8e6cf]"
                                        min="1"
                                        max="10000"
                                      />
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs">g</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => removeFood(meal.key, index)}
                                  className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-red-100"
                                  title="Hapus makanan"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenDialog(meal.key)}
                      className="w-full py-3 px-4 rounded-lg transition-all duration-200 font-medium flex items-center justify-center border bg-[#a8e6cf] text-[#5d4037] hover:bg-[#93d4bc] border-[#a8e6cf]"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Tambah Makanan
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden mb-12 border border-gray-200">
              <div className="px-6 py-4 bg-gray-800">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h2 className="text-xl font-bold text-white">
                    Ringkasan Zat Gizi Harian - {selectedPasien.nama}
                  </h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        Zat Gizi
                      </th>
                      {mealTypes.map((meal) => (
                        <th key={meal.key} className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          {meal.label}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        Total
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        Kebutuhan
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        % Kecukupan
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {nutrients.map((nutrient) => {
                      const percentage = calculatePercentage(
                        totals[nutrient.key],
                        kebutuhanGizi[nutrient.key]
                      );
                      const interpretasi = getInterpretasi(percentage);
                      const colorClass = getInterpretasiColor(percentage);
                      const subTotals = mealTypes.map(meal => calculateSubTotal(meal.key)[nutrient.key]);

                      return (
                        <tr key={nutrient.key} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                              <span className="font-medium text-gray-900">{nutrient.label}</span>
                            </div>
                          </td>

                          {subTotals.map((value, index) => (
                            <td key={index} className="px-6 py-4 text-center border-b border-gray-100">
                              <span className="font-medium text-gray-700">{value.toFixed(1)}</span>
                            </td>
                          ))}

                          <td className="px-6 py-4 text-center border-b border-gray-100">
                            <span className="font-bold text-gray-900">{totals[nutrient.key].toFixed(1)}</span>
                          </td>

                          <td className="px-6 py-4 text-center border-b border-gray-100">
                            <span className="text-gray-600">{kebutuhanGizi[nutrient.key].toFixed(1)}</span>
                          </td>

                          <td className="px-6 py-4 text-center border-b border-gray-100">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold ${percentage >= 85 && percentage <= 115
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : percentage < 85
                                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                              {percentage}%
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center border-b border-gray-100">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${colorClass}`}>
                              {interpretasi}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {dialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 bg-gray-800 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      Tambah Makanan untuk {mealTypes.find(m => m.key === currentMeal)?.label}
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">Pilih makanan dari daftar di bawah</p>
                  </div>
                  <button
                    onClick={handleCloseDialog}
                    className="p-2 hover:bg-white/10 rounded transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 border-b border-gray-200">
                <div className="max-w-2xl mx-auto">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent transition duration-200"
                        placeholder="Cari makanan (nasi, ayam, sayur, dll.)"
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent transition duration-200"
                      >
                        <option value="">Semua Kategori</option>
                        {foodCategories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {selectedFood ? (
                  <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {dataGizi.find(f => f.KODE === selectedFood)?.NAMA_BAHAN}
                        </h4>
                        <p className="text-sm text-gray-600">
                          BDD: <span className="font-medium">{dataGizi.find(f => f.KODE === selectedFood)?.BDD_persen || 100}%</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedFood('')}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">Energi per 100g</p>
                        <p className="font-bold text-lg text-gray-900">
                          {dataGizi.find(f => f.KODE === selectedFood)?.ENERGI_Kal || 0} Kal
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">Protein per 100g</p>
                        <p className="font-bold text-lg text-gray-900">
                          {dataGizi.find(f => f.KODE === selectedFood)?.PROTEIN_g || 0} g
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">Lemak per 100g</p>
                        <p className="font-bold text-lg text-gray-900">
                          {dataGizi.find(f => f.KODE === selectedFood)?.LEMAK_g || 0} g
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">Karbo per 100g</p>
                        <p className="font-bold text-lg text-gray-900">
                          {dataGizi.find(f => f.KODE === selectedFood)?.KH_g || 0} g
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Berat Bahan (gram)
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={selectedFoodWeight}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              setSelectedFoodWeight("");
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue)) {
                                const clampedValue = Math.min(Math.max(1, numValue), 10000);
                                setSelectedFoodWeight(clampedValue);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            if (selectedFoodWeight === "" || selectedFoodWeight < 1) {
                              setSelectedFoodWeight(100);
                            }
                          }}
                          className="flex-1 text-black px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8e6cf] focus:border-transparent"
                          min="1"
                          max="10000"
                          placeholder="Masukkan berat bahan"
                        />
                        <span className="ml-3 text-gray-600 text-lg">gram</span>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Berat Saji:</span>{' '}
                          {Math.round((selectedFoodWeight * (dataGizi.find(f => f.KODE === selectedFood)?.BDD_persen || 100)) / 100)}g
                          {' '}({selectedFoodWeight || 0}g × {(dataGizi.find(f => f.KODE === selectedFood)?.BDD_persen || 100)}% / 100)
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          <span className="font-medium">Energi estimasi:</span>{' '}
                          {Math.round(((dataGizi.find(f => f.KODE === selectedFood)?.ENERGI_Kal || 0) * 
                            (((selectedFoodWeight || 0) * (dataGizi.find(f => f.KODE === selectedFood)?.BDD_persen || 100)) / 100)) / 100)} Kal
                        </p>
                      </div>
                    </div>
                  </div>
                ) : filteredFoods.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">Tidak ada makanan ditemukan</p>
                    <p className="text-gray-400 text-sm mt-1">Coba gunakan kata kunci lain</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFoods.map((food) => (
                      <div
                        key={food.KODE}
                        onClick={() => setSelectedFood(food.KODE)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${selectedFood === food.KODE
                            ? 'border-[#a8e6cf] bg-[#f8f6f2]'
                            : 'border-gray-200 hover:border-[#a8e6cf]'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{food.NAMA_BAHAN}</h4>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded border border-gray-200">
                                {food.KODE}
                              </span>
                              <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-100">
                                BDD: {food.BDD_persen || 100}%
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                              <div className="text-center p-2 bg-orange-50 rounded border border-orange-100">
                                <p className="text-xs text-orange-600 font-medium">Energi</p>
                                <p className="font-bold text-orange-700">{food.ENERGI_Kal || 0}</p>
                                <p className="text-xs text-orange-500">Kal</p>
                              </div>
                              <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
                                <p className="text-xs text-blue-600 font-medium">Protein</p>
                                <p className="font-bold text-blue-700">{food.PROTEIN_g || 0}</p>
                                <p className="text-xs text-blue-500">g</p>
                              </div>
                              <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-100">
                                <p className="text-xs text-yellow-600 font-medium">Lemak</p>
                                <p className="font-bold text-yellow-700">{food.LEMAK_g || 0}</p>
                                <p className="text-xs text-yellow-500">g</p>
                              </div>
                              <div className="text-center p-2 bg-green-50 rounded border border-green-100">
                                <p className="text-xs text-green-600 font-medium">Karbo</p>
                                <p className="font-bold text-green-700">{food.KH_g || 0}</p>
                                <p className="text-xs text-green-500">g</p>
                              </div>
                            </div>
                          </div>

                          <div className={`ml-3 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedFood === food.KODE
                              ? 'border-[#a8e6cf] bg-[#a8e6cf]'
                              : 'border-gray-300'
                            }`}>
                            {selectedFood === food.KODE && (
                              <svg className="w-3 h-3 text-[#5d4037]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedFood ? (
                        <span className="font-medium text-gray-900">
                          {dataGizi.find(f => f.KODE === selectedFood)?.NAMA_BAHAN} ({selectedFoodWeight || 0}g bahan)
                        </span>
                      ) : (
                        'Belum ada makanan terpilih'
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {filteredFoods.length} makanan ditemukan
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCloseDialog}
                      className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleAddFood}
                      disabled={!selectedFood || (selectedFoodWeight !== "" && selectedFoodWeight < 1)}
                      className={`px-5 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a8e6cf] transition duration-200 border ${selectedFood && (selectedFoodWeight === "" || selectedFoodWeight >= 1)
                          ? 'bg-[#a8e6cf] text-[#5d4037] hover:bg-[#93d4bc] border-[#a8e6cf]'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                    >
                      Tambah ke Menu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZatGiziPage;