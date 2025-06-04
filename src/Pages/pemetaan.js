import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './pemetaan.css';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import Marker_Wisata1 from '../landingPage/assets/img/markerwisata1.png'; // alam
import Marker_Wisata2 from '../landingPage/assets/img/markerwisata2.png'; // buatan
import Marker_Wisata3 from '../landingPage/assets/img/markerwisata3.png'; // religi
import Marker_Wisata4 from '../landingPage/assets/img/markerwisata4.png'; // senibudaya
import Marker_Desa from '../landingPage/assets/img/markerdesa.png';
import Marker_Penginapan from '../landingPage/assets/img/markerpenginapan.png';
import Marker_Kuliner from '../landingPage/assets/img/markerkuliner.png';



const Pemetaan = () => {
const [geoData, setGeoData] = useState(null); // awalnya null
const [showInfo, setShowInfo] = useState(false);
// const [desaWisata, setDesaWisata] = useState([]);
const [wisata, setWisata] = useState([]);
// const [selectedDesa, setSelectedDesa] = useState(null);
const [penginapan, setPenginapan] = useState([]);
const [kuliner, setKuliner] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [selectedKategori, setSelectedKategori] = useState('');
const [showLegend, setShowLegend] = useState(false);
const [geoJsonKey, setGeoJsonKey] = useState(Date.now());
const [showFilter, setShowFilter] = useState(false);


useEffect(() => {
  const fetchAllData = async () => {
    try {
      const [resWisata, resPenginapan, resKuliner] = await Promise.all([
        axios.get('https://apigomadiun.tifpsdku.com/api/wisata/get_all'),
        axios.get('https://apigomadiun.tifpsdku.com/api/penginapan/get_all'),
        axios.get('https://apigomadiun.tifpsdku.com/api/kuliner/get_all'),
      ]);
      setWisata(resWisata.data.data);
      setPenginapan(resPenginapan.data.data);
      setKuliner(resKuliner.data.data);
    } catch (err) {
      console.error('Gagal fetch semua data:', err);
    }
  };

  fetchAllData();
}, []);


function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

const [selectedDate, setSelectedDate] = useState(getTodayDate());

function getNextFiveDates() {
  const dates = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const handleLihatWisata = async (id_desaWisata) => {
  try {
    const [resWisata, resPenginapan, resKuliner] = await Promise.all([
      axios.get(`https://apigomadiun.tifpsdku.com/api/wisata/get_all/${id_desaWisata}`),
      axios.get(`https://apigomadiun.tifpsdku.com/api/penginapan/get_all/${id_desaWisata}`),
      axios.get(`https://apigomadiun.tifpsdku.com/api/kuliner/get_all/${id_desaWisata}`)
    ]);
    setWisata(resWisata.data.data);
    setPenginapan(resPenginapan.data.data);
    setKuliner(resKuliner.data.data);
    // setSelectedDesa(id_desaWisata);
    setSearchTerm('');
    setSelectedKategori('');

  } catch (err) {
    console.error('Gagal fetch destinasi:', err);
  }
};


const handleLihatDetail = (id) => {
  // Arahkan ke halaman detail, atau tampilkan modal detail
  console.log("Detail untuk ID wisata:", id);
};

const getMarkerByKategori = (kategori) => {
  switch (kategori.toLowerCase()) {
    case 'alam': return Marker_Wisata1;
    case 'buatan': return Marker_Wisata2;
    case 'religi': return Marker_Wisata3;
    case 'senibudaya': return Marker_Wisata4;
    default: return Marker_Wisata1;
  }
};



 
  useEffect(() => {
  const fetchKecamatan = async () => {
    try {
      const response = await axios.get(`https://apigomadiun.tifpsdku.com/api/kecamatan/get_all?tanggal=${selectedDate}`);
      const data = response.data.data;

      const allFeatures = data.flatMap(item => {
        const geojson = item.geojson;
        if (!geojson || !geojson.features) return [];

        let hci = null;
        if (Array.isArray(item.hci_history)) {
          hci = item.hci_history.find(h => {
            const tanggalData = new Date(h.tanggal).toISOString().split('T')[0];
            return tanggalData === selectedDate;
          });
        }

        return geojson.features.map(feature => ({
          ...feature,
          properties: {
            ...feature.properties,
            nama: item.nama_kecamatan,
            hci: hci ? hci.hci_score : null,
            kategori: hci ? hci.hci_kategori : 'Tidak Ada Data'
          }
        }));
      });

      const geojson = {
        type: 'FeatureCollection',
        features: allFeatures,
      };

      setGeoData(geojson);
      setGeoJsonKey(Date.now()); // <--- tambahkan ini agar Layer benar-benar dire-render ulang
    } catch (err) {
      console.error('Gagal fetch data kecamatan:', err);
    }
  };

  if (selectedDate) {
    fetchKecamatan();
  }
}, [selectedDate]);


const toggleFilter = () => {
  setShowFilter(!showFilter);
};

  const getColorByHCI = (kategori) => {
    switch (kategori) {
      case 'Sangat Ideal': return '#2ecc71';
      case 'Ideal': return '#f1c40f';
      case 'Cukup': return '#e67e22';
      case 'Kurang': return '#e74c3c';
      case 'Tidak cocok': return '#8e44ad';
      default: return '#bdc3c7';
    }
  };
  

  const getDeskripsiByKategori = (kategori) => {
    switch (kategori) {
      case 'Sangat Ideal':
        return 'Daerah ini sangat cocok untuk berlibur! Udara segar dan fasilitas mendukung.';
      case 'Ideal':
        return 'Daerah ini cukup cocok untuk berlibur! Nikmati suasana yang nyaman dan tenang.';
      case 'Cukup':
        return 'Daerah ini bisa dipertimbangkan untuk berlibur, meskipun tidak terlalu optimal.';
      case 'Kurang':
        return 'Kondisi di daerah ini kurang mendukung untuk berlibur.';
      case 'Tidak cocok':
        return 'Sebaiknya cari alternatif lain, karena daerah ini tidak cocok untuk wisata.';
      default:
        return 'Tidak ada keterangan.';
    }
  };
  
const onEachFeature = (feature, layer) => {
  const { nama, hci, kategori} = feature.properties || {};
  const color = getColorByHCI(kategori);
  const deskripsi = getDeskripsiByKategori(kategori);

  layer.setStyle({
    color: 'white',
    weight: 0.5,
    fillOpacity: 0.4,
    fillColor: color,
  });

  if (nama && hci && kategori) {
    const popupContent = `
  <div class="custom-popup">
    <div class="popup-header">
      <div class="popup-color-box" style="background:${color}"></div>
      <div class="popup-content">
        <h3> Daerah Kec. ${nama}</h3>
        <p><strong>Holiday Climate Index : ${hci}</strong></p>
        <p><strong>Status : ${kategori.toUpperCase()}</strong></p>
        <p><strong>Tanggal: ${new Date(selectedDate).toLocaleDateString('id-ID')}</strong></p>
      </div>
    </div>
    <p><strong>Keterangan :</strong> ${deskripsi}</p>
  </div>
`;


    layer.bindPopup(popupContent);
  }
};

  return (
   <div className="map-container">
    {/* Tombol toggle filter */}
    <button className="toggle-filter-btn" onClick={toggleFilter}>
      {showFilter ? 'Tutup Filter' : '🔍 Filter'}
    </button>

    {/* Tombol kembali */}
    <button
      className="back-button-map"
      onClick={() => {
        window.location.href = "/"; // atau gunakan navigate jika pakai react-router
      }}
    >
      Kembali ke Dashboard
    </button>

 {/* Filter dan search */}
    <div className={`search-filter-wrapper ${showFilter ? 'show' : 'hide'}`}>
      <p className="search-title">Cari tempat tujuan anda</p>
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Cari destinasi wisata, kuliner, atau penginapan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="tanggal-filter-container">
          <p className="filter-title">Filter HCI per tanggal</p>
          <div className="tanggal-button-group">
            {getNextFiveDates().map((date, index) => (
              <button
                key={index}
                className={`tanggal-button ${selectedDate === date ? 'active' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                {new Date(date).toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </button>
            ))}
          </div>
        </div>

        <p className="filter-title">Filter destinasi wisata</p>
        <select
          className="filter-select"
          value={selectedKategori}
          onChange={(e) => setSelectedKategori(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          <option value="buatan">Buatan</option>
          <option value="alam">Alam</option>
          <option value="religi">Religi</option>
          <option value="senibudaya">Seni Budaya</option>
        </select>
      </div>
    </div>




     <MapContainer center={[-7.6323, 111.6486]} zoom={11} style={{ height: '100vh', width: '100%' }}>
 


        {/* Marker Wisata */}
        {wisata
  .filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedKategori || item.kategori.toLowerCase() === selectedKategori.toLowerCase())
  )
            .map((item, index) => (
          <Marker
          key={`wisata-${index}`}
          position={[item.latitude, item.longitude]}
          icon={L.icon({
            iconUrl: getMarkerByKategori(item.kategori),
            iconSize: [35, 35],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })}
          >
          <Popup className="wisata-popup">
            <div className="wisata-popup-card">
              <img src={item.imageUrl} alt={item.nama_destinasi} className="wisata-popup-image" />
              <div className="wisata-popup-content">
                <p className="wisata-popup-kategori" style={{ marginBottom: "-10px" }}>{item.kategori}</p>
                <p className="wisata-popup-title" style={{ marginBottom: "-10px" }}>{item.nama}</p>
                <p className="wisata-popup-alamat">{item.alamat}</p>
                <div className="popup-link">
                <Link to={`/wisata/${item.id}`} className="wisata-popup-detail-btn">
                  Lihat Detail
                </Link>
              </div>
            </div>
            </div>
          </Popup>
          </Marker>
        ))}
        
        {/* Marker Penginapan */}
        {penginapan
            .filter(item =>
              item.nama.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((item, index) => (
          <Marker
            key={`penginapan-${index}`}
            position={[item.latitude, item.longitude]}
            icon={L.icon({
              iconUrl: Marker_Penginapan,
              iconSize: [35, 35],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
          <Popup className="penginapan-popup">
          <div className="penginapan-popup-card">
            <img src={item.imageUrl} alt={item.nama} className="penginapan-popup-image" />
            <div className="penginapan-popup-content">
              <p className="penginapan-popup-kategori"style={{ marginBottom: "9px" }}>{item.kategori_penginapan}</p>
              <h4 className="penginapan-popup-title"style={{ marginBottom: "-6px" }}>{item.nama}</h4>
              <p className="penginapan-popup-alamat">{item.alamat}</p>
              <div className="popup-link">
                <Link to={`/penginapan/${item.id}`} className="penginapan-popup-detail-btn">
                  Lihat Detail
                </Link>
              </div>
            </div>
          </div>
        </Popup>
        </Marker>
        ))}


        {/* Marker Kuliner */}
        {kuliner
            .filter(item =>
              item.nama.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((item, index) => (
          <Marker
            key={`kuliner-${index}`}
            position={[item.latitude, item.longitude]}
            icon={L.icon({
              iconUrl: Marker_Kuliner,
              iconSize: [35, 35],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup className="kuliner-popup">
          <div className="kuliner-popup-card">
            <img src={item.imageUrl} alt={item.nama} className="kuliner-popup-image" />
            <div className="kuliner-popup-content">
              <p className="kuliner-popup-status"  style={{ marginBottom: "9px" }}>Sedang {item.status_buka}</p>
              <h4 className="kuliner-popup-title"  style={{ marginBottom: "-10px" }}>{item.nama}</h4>
              <p className="kuliner-popup-alamat">{item.alamat}</p>
              <div className="popup-link">
                <Link to={`/kuliner/${item.id}`} className="kuliner-popup-detail-btn">
                  Lihat Detail
                </Link>
              </div>
            </div>
          </div>
        </Popup>
        </Marker>
        ))}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
       {geoData && (
  <GeoJSON
    key={geoJsonKey} // <--- key yang unik setiap kali data berubah
    data={geoData}
    onEachFeature={onEachFeature}
    style={(feature) => {
      const kategori = feature.properties?.kategori || 'Lainnya';
      return {
        fillColor: getColorByHCI(kategori),
        color: 'white',
        weight: 0,
        fillOpacity: 0.4
      };
    }}
  />
)}

      </MapContainer>


     {!showLegend && (
  <button className="legend-toggle-button" onClick={() => setShowLegend(true)}>
    Lihat Informasi Peta
  </button>
)}

{showLegend && (
  <div className="legend-container">
    <button className="legend-close-button" onClick={() => setShowLegend(false)}>
      ✕
    </button>

    {/* Legend Marker */}
    <div className="legend-marker">
      <h4>Legenda Marker</h4>
      <div><img src={Marker_Penginapan} alt="Penginapan" className="legend-icon" /> Penginapan</div>
      <div><img src={Marker_Kuliner} alt="Kuliner" className="legend-icon" /> Kuliner</div>
      <div><img src={Marker_Desa} alt="Desa Wisata" className="legend-icon" /> Desa Wisata</div>
      <div><img src={Marker_Wisata1} alt="Alam" className="legend-icon" /> Wisata Alam</div>
      <div><img src={Marker_Wisata2} alt="Buatan" className="legend-icon" /> Wisata Buatan</div>
      <div><img src={Marker_Wisata3} alt="Religi" className="legend-icon" /> Wisata Religi</div>
      <div><img src={Marker_Wisata4} alt="Seni Budaya" className="legend-icon" /> Wisata Seni Budaya</div>
    </div>

    {/* Legend HCI */}
    <div className="legend-hci">
      <div className="legend-header">
        <h4>Kategori HCI</h4>
        <button className="info-button" onClick={() => setShowInfo(true)}>?</button>
      </div>
      <div><span style={{ background: '#2ecc71' }}></span> Sangat Ideal</div>
      <div><span style={{ background: '#f1c40f' }}></span> Ideal</div>
      <div><span style={{ background: '#e67e22' }}></span> Cukup</div>
      <div><span style={{ background: '#e74c3c' }}></span> Kurang</div>
      <div><span style={{ background: '#8e44ad' }}></span> Tidak Cocok</div>
    </div>
  </div>
)}

        {/* Modal Info HCI */}
        {showInfo && (
          <div className="info-modal">
            <div className="info-content">
              <h4><strong>Apa itu HCI?</strong></h4>
              <p><strong>HCI (Holiday Climate Index)</strong> adalah indeks kenyamanan suatu daerah untuk berlibur berdasarkan cuaca, aksesibilitas, fasilitas, dan lingkungan.</p>
              <ul>
                <li><strong>Sangat Ideal:</strong> Sangat cocok untuk liburan.</li>
                <li><strong>Ideal:</strong> Nyaman dan tenang untuk wisata.</li>
                <li><strong>Cukup:</strong> Bisa dipertimbangkan dengan beberapa catatan.</li>
                <li><strong>Kurang:</strong> Kurang mendukung kenyamanan wisata.</li>
                <li><strong>Tidak cocok:</strong> Sebaiknya cari alternatif lain.</li>
              </ul>
              <p><em>*klik wilayah yang ingin kamu lihat statusnya di map</em></p>
              <button onClick={() => setShowInfo(false)}>Tutup</button>
            </div>
          </div>
        )}
    </div>
  );
};

export default Pemetaan;
