import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const HistoryPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pasienList, setPasienList] = useState([]);
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [activeTab, setActiveTab] = useState('nilai-gizi');
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pasienToDelete, setPasienToDelete] = useState(null);

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

  const handleSelectPasien = async (pasien) => {
    setSelectedPasien(pasien);
    setMenuData(null);

    try {
      const menuRef = doc(db, 'menuGizi', pasien.id);
      const menuSnap = await getDoc(menuRef);

      console.log('Menu Ref Path:', menuRef.path);
      console.log('Menu Snapshot exists:', menuSnap.exists());

      if (menuSnap.exists()) {
        const data = menuSnap.data();
        console.log('Menu Data:', data);
        console.log('Menu Keys:', Object.keys(data));
        console.log('Has totals?', 'totals' in data);
        console.log('Has menu?', 'menu' in data);
        
        if (data.menu) {
          console.log('Menu structure keys:', Object.keys(data.menu));
          console.log('Has makanPagi in menu?', 'makanPagi' in data.menu);
          console.log('makanPagi data:', data.menu.makanPagi);
        }
        
        setMenuData(data);
      } else {
        console.log('No menu found for patient ID:', pasien.id);
        console.log('Patient Name:', pasien.nama);
      }
    } catch (error) {
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
    }
  };

  const handleDeletePasien = async () => {
    if (!pasienToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'hasilGizi', pasienToDelete.id));

      const menuRef = doc(db, 'menuGizi', pasienToDelete.id);
      const menuSnap = await getDoc(menuRef);
      if (menuSnap.exists()) {
        await deleteDoc(menuRef);
      }

      const updatedList = pasienList.filter(p => p.id !== pasienToDelete.id);
      setPasienList(updatedList);

      if (selectedPasien && selectedPasien.id === pasienToDelete.id) {
        if (updatedList.length > 0) {
          handleSelectPasien(updatedList[0]);
        } else {
          setSelectedPasien(null);
          setMenuData(null);
        }
      }

      setShowDeleteConfirm(false);
      setPasienToDelete(null);

      alert(`Data pasien "${pasienToDelete.nama}" berhasil dihapus!`);
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Terjadi kesalahan saat menghapus data pasien: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDelete = (pasien) => {
    setPasienToDelete(pasien);
    setShowDeleteConfirm(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Tanggal tidak tersedia';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateBBI = (pasien) => {
    if (!pasien || !pasien.tinggiBadan || !pasien.jenisKelamin) return '0.00';
    const tbCm = parseFloat(pasien.tinggiBadan);
    if (pasien.jenisKelamin === 'L') {
      return ((tbCm - 100) - (0.1 * (tbCm - 100))).toFixed(2);
    } else {
      return ((tbCm - 100) - (0.15 * (tbCm - 100))).toFixed(2);
    }
  };

  const calculateNutrientPercentage = (total, kebutuhan) => {
    if (!kebutuhan || kebutuhan === 0) return 0;
    return Math.round((total / kebutuhan) * 100);
  };

  const getInterpretasi = (percentage) => {
    if (percentage >= 85 && percentage <= 115) return 'Cukup';
    if (percentage < 85) return 'Kurang';
    if (percentage > 115) return 'Lebih';
    return '-';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Cukup': return [220, 237, 200];
      case 'Kurang': return [255, 242, 204];
      case 'Lebih': return [248, 206, 204];
      default: return [240, 240, 240];
    }
  };

  const exportFullReportToPDF = () => {
    if (!selectedPasien) {
      alert('Pilih pasien terlebih dahulu');
      return;
    }

    setExportLoading(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      let yPos = margin;

      doc.setFontSize(16);
      doc.setTextColor(93, 64, 55);
      doc.text('LAPORAN LENGKAP GIZI PASIEN', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Dibuat pada: ${new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        pageWidth / 2,
        yPos,
        { align: 'center' }
      );
      yPos += 12;

      doc.setFontSize(12);
      doc.setTextColor(93, 64, 55);
      doc.setFont(undefined, 'bold');
      doc.text('IDENTITAS PASIEN', margin, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');

      const leftColumn = [
        ['Nama Lengkap', selectedPasien.nama],
        ['Usia', `${selectedPasien.usia} tahun`],
        ['Jenis Kelamin', selectedPasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
        ['Berat Badan', `${selectedPasien.beratBadan} kg`],
        ['Tinggi Badan', `${selectedPasien.tinggiBadan} cm`]
      ];

      const rightColumn = [
        ['Jenis Diet', selectedPasien.jenisDiet],
        ['Aktivitas Fisik', selectedPasien.aktivitasFisik],
        ['Kondisi Kesehatan', selectedPasien.kondisi],
        ['Faktor Stress', selectedPasien.faktorStress || 'Tidak ada'],
        ['Tanggal Data', formatDate(selectedPasien.createdAt)]
      ];

      const columnWidth = (pageWidth - (margin * 2) - 10) / 2;

      leftColumn.forEach(([label, value], index) => {
        doc.setFont(undefined, 'bold');
        doc.text(`${label}:`, margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(value, margin + 40, yPos);
        yPos += 5;
      });

      yPos = margin + 27;

      rightColumn.forEach(([label, value], index) => {
        const xPos = margin + columnWidth + 10;
        doc.setFont(undefined, 'bold');
        doc.text(`${label}:`, xPos, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(value, xPos + 40, yPos);
        yPos += 5;
      });

      yPos = Math.max(margin + 27 + (rightColumn.length * 5), margin + 27 + (leftColumn.length * 5));
      yPos += 10;

      doc.setFontSize(12);
      doc.setTextColor(93, 64, 55);
      doc.setFont(undefined, 'bold');
      doc.text('HASIL PERHITUNGAN GIZI', margin, yPos);
      yPos += 7;

      const gridWidth = (pageWidth - (margin * 2) - 15) / 4;
      const gridData = [
        {
          label: 'IMT',
          value: String(selectedPasien.imt || '0.00'),
          sublabel: selectedPasien.kategoriIMT || '-',
          color: selectedPasien.kategoriIMT === 'Normal' ? [168, 230, 207] :
            selectedPasien.kategoriIMT === 'Kurus' ? [255, 224, 130] :
              [255, 138, 128]
        },
        {
          label: 'BBI',
          value: `${selectedPasien.bbi || calculateBBI(selectedPasien)} kg`,
          sublabel: 'Berat Badan Ideal',
          color: [144, 202, 249]
        },
        {
          label: 'TEE',
          value: `${selectedPasien.tee || '0.00'} kkal`,
          sublabel: 'Energi Total',
          color: [255, 204, 188]
        },
        {
          label: 'BMR',
          value: `${selectedPasien.bmr || '0.00'} kkal`,
          sublabel: 'Energi Basal',
          color: [206, 147, 216]
        }
      ];

      gridData.forEach((item, index) => {
        const x = margin + (index * (gridWidth + 5));
        doc.setFillColor(...item.color);
        doc.roundedRect(x, yPos, gridWidth, 20, 2, 2, 'F');

        doc.setFontSize(9);
        doc.setTextColor(93, 64, 55);
        doc.text(item.label, x + 3, yPos + 6);

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');

        const valueText = String(item.value);
        doc.text(valueText, x + 3, yPos + 12, { maxWidth: gridWidth - 6 });

        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(item.sublabel, x + 3, yPos + 17, { maxWidth: gridWidth - 6 });
      });

      yPos += 25;

      doc.setFontSize(12);
      doc.setTextColor(93, 64, 55);
      doc.setFont(undefined, 'bold');
      doc.text('KEBUTUHAN GIZI HARIAN', margin, yPos);
      yPos += 7;

      const nutritionTable = [
        ['ZAT GIZI', 'KEBUTUHAN', 'SATUAN'],
        ['Energi (TEE)', (selectedPasien.tee || 0).toFixed(1), 'kkal'],
        ['Protein', (selectedPasien.protein || 0).toFixed(1), 'g'],
        ['Lemak', (selectedPasien.lemak || 0).toFixed(1), 'g'],
        ['Karbohidrat', (selectedPasien.kh || 0).toFixed(1), 'g']
      ];

      autoTable(doc, {
        startY: yPos,
        head: [nutritionTable[0]],
        body: nutritionTable.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [93, 64, 55],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [0, 0, 0]
        },
        margin: { left: margin, right: margin },
        styles: {
          cellPadding: 3,
          lineWidth: 0.1
        }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      if (menuData && menuData.totals && menuData.menu) {
        doc.setFontSize(12);
        doc.setTextColor(93, 64, 55);
        doc.setFont(undefined, 'bold');
        doc.text('RINGKASAN NUTRISI DARI MENU', margin, yPos);
        yPos += 7;

        const summaryTable = [
          ['NUTRISI', 'TOTAL', 'KECUKUPAN', 'STATUS']
        ];

        const nutrients = [
          { key: 'energi', label: 'Energi', satuan: 'Kal' },
          { key: 'protein', label: 'Protein', satuan: 'g' },
          { key: 'lemak', label: 'Lemak', satuan: 'g' },
          { key: 'karbohidrat', label: 'Karbohidrat', satuan: 'g' }
        ];

        nutrients.forEach(nutrient => {
          const total = menuData.totals[nutrient.key] || 0;
          const kebutuhan = selectedPasien[nutrient.key === 'energi' ? 'tee' :
            nutrient.key === 'karbohidrat' ? 'kh' :
              nutrient.key] || 0;
          const percentage = calculateNutrientPercentage(total, kebutuhan);
          const status = getInterpretasi(percentage);

          summaryTable.push([
            nutrient.label,
            `${total.toFixed(1)} ${nutrient.satuan}`,
            `${percentage}%`,
            status
          ]);
        });

        autoTable(doc, {
          startY: yPos,
          head: [summaryTable[0]],
          body: summaryTable.slice(1),
          theme: 'grid',
          headStyles: {
            fillColor: [93, 64, 55],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0]
          },
          margin: { left: margin, right: margin },
          styles: {
            cellPadding: 3,
            lineWidth: 0.1
          },
          didDrawCell: (data) => {
            if (data.column.index === 3 && data.row.index >= 0) {
              const status = data.cell.raw;
              const color = getStatusColor(status);
              doc.setFillColor(...color);
              doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
              doc.setTextColor(0, 0, 0);
            }
          }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        const mealTimes = [
          { key: 'makanPagi', label: 'Makan Pagi' },
          { key: 'snackPagi', label: 'Snack Pagi' },
          { key: 'makanSiang', label: 'Makan Siang' },
          { key: 'snackSore', label: 'Snack Sore' },
          { key: 'makanMalam', label: 'Makan Malam' }
        ];

        const validMeals = mealTimes.filter(meal => 
          menuData.menu[meal.key] && menuData.menu[meal.key].length > 0
        );

        if (validMeals.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(93, 64, 55);
          doc.setFont(undefined, 'bold');
          doc.text('DETAIL MENU HARIAN', margin, yPos);
          yPos += 7;

          validMeals.forEach((meal) => {
            const foods = menuData.menu[meal.key];

            if (yPos > doc.internal.pageSize.height - 50) {
              doc.addPage();
              yPos = margin;
            }

            // Header waktu makan
            doc.setFontSize(10);
            doc.setTextColor(93, 64, 55);
            doc.setFont(undefined, 'bold');
            doc.text(`${meal.label.toUpperCase()}`, margin, yPos);
            yPos += 5;

            const mealTable = [
              ['NO', 'NAMA MAKANAN', 'ENERGI', 'PROTEIN', 'LEMAK', 'KARBO']
            ];

            foods.forEach((food, foodIndex) => {
              mealTable.push([
                (foodIndex + 1).toString(),
                food.NAMA_BAHAN.length > 30 ? food.NAMA_BAHAN.substring(0, 27) + '...' : food.NAMA_BAHAN,
                `${(food.ENERGI_Kal || 0).toFixed(0)}`,
                `${(food.PROTEIN_g || 0).toFixed(1)}`,
                `${(food.LEMAK_g || 0).toFixed(1)}`,
                `${(food.KH_g || 0).toFixed(1)}`
              ]);
            });

            const subTotal = foods.reduce((acc, food) => ({
              energi: acc.energi + (food.ENERGI_Kal || 0),
              protein: acc.protein + (food.PROTEIN_g || 0),
              lemak: acc.lemak + (food.LEMAK_g || 0),
              karbohidrat: acc.karbohidrat + (food.KH_g || 0)
            }), { energi: 0, protein: 0, lemak: 0, karbohidrat: 0 });

            mealTable.push([
              'TOTAL',
              '',
              subTotal.energi.toFixed(0),
              subTotal.protein.toFixed(1),
              subTotal.lemak.toFixed(1),
              subTotal.karbohidrat.toFixed(1)
            ]);

            autoTable(doc, {
              startY: yPos,
              head: [mealTable[0]],
              body: mealTable.slice(1, -1),
              foot: [mealTable[mealTable.length - 1]],
              theme: 'grid',
              headStyles: {
                fillColor: [168, 230, 207],
                textColor: [93, 64, 55],
                fontStyle: 'bold',
                fontSize: 8
              },
              bodyStyles: {
                fontSize: 8,
                textColor: [0, 0, 0]
              },
              footStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 8
              },
              margin: { left: margin, right: margin },
              styles: {
                cellPadding: 2,
                lineWidth: 0.1,
                overflow: 'linebreak',
                cellWidth: 'wrap'
              },
              columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 50 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 }
              }
            });

            yPos = doc.lastAutoTable.finalY + 8;
          });
        }
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Catatan: Belum ada data menu harian untuk pasien ini', margin, yPos);
        yPos += 10;
      }

      if (yPos > doc.internal.pageSize.height - 60) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFontSize(12);
      doc.setTextColor(93, 64, 55);
      doc.setFont(undefined, 'bold');
      doc.text('CATATAN DAN REKOMENDASI', margin, yPos);
      yPos += 7;

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');

      const recommendations = [
        `Pasien ${selectedPasien.nama} dengan jenis diet ${selectedPasien.jenisDiet}.`,
        `IMT sebesar ${selectedPasien.imt} termasuk dalam kategori ${selectedPasien.kategoriIMT}.`,
        `Kebutuhan energi harian sebesar ${selectedPasien.tee} kkal.`,
        menuData && menuData.totals ?
          `Menu harian telah direncanakan dengan total ${(menuData.totals?.energi || 0).toFixed(1)} kkal.` :
          'Belum ada menu harian yang direncanakan.',
        `Disarankan untuk kontrol rutin setiap 1 bulan sekali.`,
        `Perhatikan asupan cairan minimal 8 gelas per hari.`,
        `Jaga pola makan teratur sesuai jadwal yang telah ditentukan.`
      ];

      recommendations.forEach((rec, index) => {
        const lines = doc.splitTextToSize(`• ${rec}`, pageWidth - (margin * 2));
        lines.forEach(line => {
          if (yPos > doc.internal.pageSize.height - 15) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, margin + 5, yPos);
          yPos += 4;
        });
        yPos += 2;
      });

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Halaman ${i} dari ${totalPages}`,
          pageWidth - margin,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
        doc.text(
          `Laporan Gizi - ${selectedPasien.nama}`,
          margin,
          doc.internal.pageSize.height - 10
        );
      }

      const fileName = `Laporan_Gizi_${selectedPasien.nama.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating full PDF report:', error);
      alert('Terjadi kesalahan saat membuat laporan lengkap');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8e6cf] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat riwayat...</p>
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
                Riwayat Pasien
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Lihat dan kelola riwayat perhitungan gizi dan menu pasien
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/nilai-gizi"
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-[#5d4037] rounded-lg hover:bg-gray-50 transition duration-200 border border-gray-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nilai Gizi Baru
              </a>
              <a
                href="/zat-gizi"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#a8e6cf] text-[#5d4037] rounded-lg hover:bg-[#93d4bc] transition duration-200 border border-[#a8e6cf]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Buat Menu
              </a>
            </div>
          </div>
        </div>

        {!user ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="p-3 bg-yellow-100 rounded-full w-12 h-12 mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-4">Silakan login terlebih dahulu untuk melihat riwayat.</p>
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
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="p-3 bg-[#a8e6cf] rounded-full w-12 h-12 mx-auto mb-4">
              <svg className="w-6 h-6 text-[#5d4037] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-4">Belum ada data pasien.</p>
            <div className="flex gap-3 justify-center">
              <a
                href="/nilai-gizi"
                className="inline-flex items-center px-5 py-2.5 bg-[#a8e6cf] text-[#5d4037] rounded-lg hover:bg-[#93d4bc] transition duration-200 border border-[#a8e6cf]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Hitung Nilai Gizi
              </a>
              <a
                href="/zat-gizi"
                className="inline-flex items-center px-5 py-2.5 bg-white text-[#5d4037] rounded-lg hover:bg-gray-50 transition duration-200 border border-gray-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Buat Menu
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Daftar Pasien</h2>
                <div className="text-sm text-gray-600">
                  Total: {pasienList.length} pasien
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pasienList.map((pasien) => (
                  <div
                    key={pasien.id}
                    onClick={() => handleSelectPasien(pasien)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedPasien?.id === pasien.id
                      ? 'border-[#a8e6cf] bg-white shadow-sm'
                      : 'border-gray-200 hover:border-[#a8e6cf] hover:bg-white'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{pasien.nama}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {pasien.usia} tahun • {pasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Diet: {pasien.jenisDiet}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${selectedPasien?.id === pasien.id ? 'bg-[#a8e6cf]' : 'bg-gray-100'}`}>
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(pasien);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Hapus pasien"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        {formatDate(pasien.createdAt)}
                      </p>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                        IMT: {pasien.imt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPasien && (
              <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
                <div className="border-b border-gray-200">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Data Pasien: {selectedPasien.nama}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedPasien.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => confirmDelete(selectedPasien)}
                        className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition duration-200 border border-red-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus Data
                      </button>
                      <button
                        onClick={exportFullReportToPDF}
                        disabled={exportLoading || !selectedPasien}
                        className={`inline-flex items-center px-4 py-2 rounded-lg transition duration-200 border ${exportLoading || !selectedPasien
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-[#5d4037] text-white hover:bg-[#3d2c1e] border-[#5d4037]'
                          }`}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {exportLoading ? 'Membuat Laporan...' : 'Export Laporan Lengkap'}
                      </button>
                    </div>
                  </div>

                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('nilai-gizi')}
                      className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'nilai-gizi'
                        ? 'border-[#a8e6cf] text-[#5d4037]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Data Nilai Gizi
                    </button>
                    <button
                      onClick={() => setActiveTab('menu-gizi')}
                      className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'menu-gizi'
                        ? 'border-[#a8e6cf] text-[#5d4037]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Menu Harian
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'nilai-gizi' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Informasi Dasar</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Nama</span>
                                <span className="font-medium text-gray-900">{selectedPasien.nama}</span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Usia</span>
                                <span className="font-medium text-gray-900">{selectedPasien.usia} tahun</span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Jenis Kelamin</span>
                                <span className="font-medium text-gray-900">
                                  {selectedPasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                </span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Berat Badan</span>
                                <span className="font-medium text-gray-900">{selectedPasien.beratBadan} kg</span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Tinggi Badan</span>
                                <span className="font-medium text-gray-900">{selectedPasien.tinggiBadan} cm</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Kondisi Kesehatan</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Jenis Diet</span>
                                <span className="font-medium text-[#5d4037]">{selectedPasien.jenisDiet}</span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Aktivitas Fisik</span>
                                <span className="font-medium text-gray-900">{selectedPasien.aktivitasFisik}</span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Kondisi</span>
                                <span className="font-medium text-gray-900">{selectedPasien.kondisi}</span>
                              </div>
                              {selectedPasien.faktorStress && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                  <span className="text-gray-600">Faktor Stress</span>
                                  <span className="font-medium text-gray-900">{selectedPasien.faktorStress}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Hasil Perhitungan Gizi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-1">Indeks Massa Tubuh</p>
                              <p className="text-2xl font-bold text-gray-900">{selectedPasien.imt}</p>
                              <span className={`text-sm font-medium px-2 py-1 rounded-full mt-2 inline-block ${selectedPasien.kategoriIMT === 'Normal'
                                ? 'bg-green-100 text-green-800'
                                : selectedPasien.kategoriIMT === 'Kurus'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                                }`}>
                                {selectedPasien.kategoriIMT}
                              </span>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-1">Energi Total (TEE)</p>
                              <p className="text-2xl font-bold text-gray-900">{selectedPasien.tee}</p>
                              <p className="text-sm text-gray-500 mt-1">kkal/hari</p>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-1">Protein</p>
                              <p className="text-2xl font-bold text-gray-900">{selectedPasien.protein}</p>
                              <p className="text-sm text-gray-500 mt-1">gram/hari</p>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-1">Karbohidrat</p>
                              <p className="text-2xl font-bold text-gray-900">{selectedPasien.kh}</p>
                              <p className="text-sm text-gray-500 mt-1">gram/hari</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'menu-gizi' && (
                    <div>
                      {menuData && menuData.menu ? (
                        <div className="space-y-6">
                          {menuData.totals && (
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Nutrisi Harian</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                  { key: 'energi', label: 'Energi', satuan: 'Kal', kebutuhan: selectedPasien.tee },
                                  { key: 'protein', label: 'Protein', satuan: 'g', kebutuhan: selectedPasien.protein },
                                  { key: 'lemak', label: 'Lemak', satuan: 'g', kebutuhan: selectedPasien.lemak },
                                  { key: 'karbohidrat', label: 'Karbohidrat', satuan: 'g', kebutuhan: selectedPasien.kh },
                                ].map((nutrient) => {
                                  const total = menuData.totals[nutrient.key] || 0;
                                  const percentage = calculateNutrientPercentage(total, nutrient.kebutuhan);

                                  return (
                                    <div key={nutrient.key} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                      <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-1">{nutrient.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">{total.toFixed(1)}</p>
                                        <p className="text-sm text-gray-500 mb-2">{nutrient.satuan}</p>
                                        <div className={`text-sm font-medium px-2 py-1 rounded-full ${percentage >= 85 && percentage <= 115
                                          ? 'bg-green-100 text-green-800'
                                          : percentage < 85
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                          }`}>
                                          {percentage}% dari kebutuhan
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Menu Harian</h3>
                            <div className="space-y-6">
                              {[
                                { key: 'makanPagi', label: 'Makan Pagi' },
                                { key: 'snackPagi', label: 'Snack Pagi' },
                                { key: 'makanSiang', label: 'Makan Siang' },
                                { key: 'snackSore', label: 'Snack Sore' },
                                { key: 'makanMalam', label: 'Makan Malam' }
                              ].map((meal) => {
                                if (!menuData.menu[meal.key] || !Array.isArray(menuData.menu[meal.key])) {
                                  return null;
                                }

                                return menuData.menu[meal.key].length > 0 && (
                                  <div key={meal.key} className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="font-semibold text-gray-800 mb-3 text-lg">{meal.label}</h4>
                                    <div className="space-y-3">
                                      {menuData.menu[meal.key].map((food, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                          <div>
                                            <p className="font-medium text-gray-900">{food.NAMA_BAHAN}</p>
                                            <div className="flex gap-2 mt-1">
                                              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                                {food.ENERGI_Kal || 0} Kal
                                              </span>
                                              <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                                                P: {food.PROTEIN_g || 0}g
                                              </span>
                                              <span className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
                                                L: {food.LEMAK_g || 0}g
                                              </span>
                                              <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">
                                                KH: {food.KH_g || 0}g
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-4">
                            <svg className="w-6 h-6 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <p className="text-gray-700 font-medium mb-4">Belum ada data menu untuk pasien ini</p>
                          <a
                            href={`/zat-gizi?pasienId=${selectedPasien.id}`}
                            className="inline-flex items-center px-5 py-2.5 bg-[#a8e6cf] text-[#5d4037] rounded-lg hover:bg-[#93d4bc] transition duration-200 border border-[#a8e6cf]"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Buat Menu Sekarang
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Konfirmasi Hapus</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600 mb-4">
                Apakah Anda yakin ingin menghapus data pasien <span className="font-semibold">"{pasienToDelete?.nama}"</span>?
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Tindakan ini akan menghapus semua data pasien termasuk data perhitungan gizi dan menu terkait. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPasienToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                onClick={handleDeletePasien}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition duration-200 flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menghapus...
                  </>
                ) : (
                  'Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;