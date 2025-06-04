import { React, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function ContentDetailDesaWisata({
    Detailwisata,
    showAlert,
    messageAlert,
    nameAlert,
    statusLogin,
    openModal
}) {
    const wisata = Detailwisata[0];
    const [jumlahWisatawan, setJumlahWisatawan] = useState(1);
    const [date, setDate] = useState();
    const [cuacaLimaHari, setCuacaLimaHari] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const add = () => setJumlahWisatawan(jumlahWisatawan + 1);
    const min = () => {
        if (jumlahWisatawan > 1) setJumlahWisatawan(jumlahWisatawan - 1);
    };

    const AddKeranjang = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/add/ticket`, {
                id_menu: wisata.id,
                id_destinasi: wisata.id,
                jumlah: jumlahWisatawan,
                date: date
            });

            if (response) {
                messageAlert(response.data.message);
                nameAlert('Success');
                showAlert();
            }
        } catch (error) {
            if (error.response?.status === 422) {
                messageAlert(error.response.data.message);
                nameAlert('Warning');
                showAlert();
            } else if (error.response?.status === 401) {
                openModal();
            } else {
                console.log(error);
            }
        }
    };

    const getData = useCallback(async () => {
        try {
            if (statusLogin === "login") {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/check?filter[id_destinasi]=${wisata.id}&filter[nama_destinasi]=tbl_destinasi`);
                if (response) {
                    setDate(response.data.data[0].tgl_booking);
                    setJumlahWisatawan(response.data.data[0].detail_pesanan[0].jumlah);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, [statusLogin, wisata.id]);

    const getCuaca = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/cuaca/detail/${wisata.id}`);
            const list = response.data.list.filter(item => item.dt_txt.includes("12:00:00"));
            setCuacaLimaHari(list);
        } catch (err) {
            console.error("Gagal fetch cuaca:", err);
        }
    }, [wisata.id]);

    useEffect(() => {
        getData();
        getCuaca();
    }, [getData, getCuaca]);

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        const dateWithTime = moment(selectedDate).set({ hour: 23, minute: 59, second: 0 }).format('YYYY-MM-DD HH:mm:ss');
        setDate(dateWithTime);
    };

    const getMapLink = (iframeLink) => {
        if (!iframeLink) return "";
        const googleMapsEmbedRegex = /https:\/\/www\\.google\\.com\/maps\/embed\?pb=.*$/;
        if (googleMapsEmbedRegex.test(iframeLink)) {
            return iframeLink.replace("/embed?", "/maps?q=");
        }
        return iframeLink;
    };

    const cuacaSelected = cuacaLimaHari[selectedIndex];

    return (
        <div className="content-detail-wrapper">
            <div className="top-section">
                <div className="image-side">
                    <img src={wisata.imageUrl} alt={wisata.nama} className="detail-image" />
                </div>
                <div className="description-side">
                    <h2 className="title-detail-wisata">{wisata.nama}</h2>
                    <p className="description-detail-wisata">{wisata.deskripsi}</p>
                    <div className="location-contact">
                        <p><i className="fas fa-map-marker-alt" style={{ color : "#015C91" }}></i> {wisata.alamat}</p>
                        <p>{wisata.link_iframe && (
                            <a href={getMapLink(wisata.link_iframe)} target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-map" ></i> Lihat di Google Maps
                            </a>
                        )}</p>
                        <p><i className="fas fa-phone-alt" style={{ color : "#015C91" }}></i> {wisata.no_telp}</p>
                    </div>
                    <div className="info-boxes">
                        <div className="info-box">
                            <h4>Kondisi Jalan</h4>
                            <p>Kondisi akses jalan menuju ke {wisata.nama} {wisata.status_jalan === '1' ? "cukup bagus" : wisata.status_jalan === '2' ? "lumayan rusak" : "masih jauh dari kata layak"} ({wisata.jenis_kendaraan === '1' ? "dapat dilalui kendaraan roda empat dan roda dua" : wisata.jenis_kendaraan === '2' ? "hanya dapat dilalui kendaraan roda dua" : "kendaraan tidak dapat masuk ke destinasi"})</p>
                        </div>
                        <div className="info-box">
                            <h4>Fasilitas Wisata</h4>
                            <ul>
                                {wisata.data_fasilitas.map((item, index) => (
                                    <li key={index}>{item.nama_fasilitas_wisata}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bottom-section flex flex-col md:flex-row gap-4">
                    {cuacaLimaHari.length > 0 && cuacaSelected && cuacaSelected.weather ? (
                        <div className="cuaca-wrapper-kecil">
                            <h3 className="judul-cuaca">Cuaca destinasi dalam 5 hari ke depan</h3>

                            <div className="cuaca-pilihan-hari">
                                {cuacaLimaHari.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`btn-hari ${selectedIndex === index ? "aktif" : ""}`}
                                        disabled={index > 4}
                                    >
                                        {moment(item.dt_txt).format("ddd, DD MMM")}
                                    </button>
                                ))}
                            </div>

                            <div className="cuaca-card-kecil">
                                <div className="cuaca-header">
                                    <img
                                        src={`https://openweathermap.org/img/wn/${cuacaSelected.weather[0].icon}@2x.png`}
                                        alt="icon cuaca"
                                        className="cuaca-icon-kecil"
                                    />
                                    <h2>{Math.round(cuacaSelected.main.temp)}°C</h2>
                                </div>
                                <p className="cuaca-deskripsi-kecil">
                                    Terasa seperti {Math.round(cuacaSelected.main.feels_like)}°C | {" "}
                                    {cuacaSelected.weather[0].description} | Calm
                                </p>

                                <div className="cuaca-detail-flex">
                                    <p>💨 {cuacaSelected.wind.speed} m/s</p>
                                    <p>꩜ {cuacaSelected.main.pressure} hPa</p>
                                    <p>💧 {cuacaSelected.main.humidity}%</p>
                                    <p>🌡 {cuacaSelected.main.temp_min + 2}°C (dew)</p>
                                    <p>👁️ {cuacaSelected.visibility / 1000} km</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p style={{ marginTop: '2rem' }}>Cuaca tidak tersedia saat ini.</p>
                    )}
                    

                    {/* Booking Section Dipindah ke Kanan */}
                    <div className="booking-section">
                        <div className="price-and-ticket">
                            Harga Tiket
                            {wisata.harga === "GRATIS" ? (
                                <span className="free">GRATIS</span>
                            ) : (
                                <span className="price">
                                    {Number(wisata.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                    <span className="per-person"> / orang</span>
                                </span>
                            )}
                            <div className="ticket-control">
                                <button className="btn-min" onClick={min}>-</button>
                                <span>{jumlahWisatawan} Tiket</span>
                                <button className="btn-add" onClick={add}>+</button>
                            </div>
                        </div>
                        <div className="date-picker">
                            <label>Pilih Tanggal Booking</label>
                            <input type="date" value={moment(date).format('YYYY-MM-DD')} onChange={handleDateChange} className="input-date" />
                        </div>
                        <button className="btn-book" onClick={AddKeranjang}>
                            Masukkan Keranjang
                        </button>
                    </div>
                </div>
                </div>
            </div>
        
    );
}

export default ContentDetailDesaWisata;
