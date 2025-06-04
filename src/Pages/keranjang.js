import { React, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';
import animationData from './assets/js/cart_empty.json';
import loadingAnimation from './assets/js/loading.json';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import useSnap from './hooks/useSnap';
import Alert from './../modal/alert'; // Pastikan path sesuai lokasi file Alert.jsx


function KeranjangPage({
    showAlert,
    messageAlert,
    nameAlert
}) {
    const [DataKeranjang, setDataKeranjang] = useState([]);
    const [loading, setLoading] = useState(false);
    const [OpenSnap, setOpenSnap] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { snapEmbed } = useSnap();

    const getData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/get_all/keranjang`)
            if (response) {
                setDataKeranjang(response.data.data)
                setLoading(false);
            }
        } catch (error) {
            if (error.response.status === 401) {
                setLoading(false);
                navigate('/');
                messageAlert(error.response.data.msg);
                nameAlert('Error')
                showAlert();
            }
            else if (error.response.status === 422) {
                setMessage(error.response.data.message)
                setLoading(false);
            }
        }
    }, [setDataKeranjang, navigate, messageAlert, nameAlert, showAlert])

    useEffect(() => {
        getData();
    }, [getData]);


    const RemoveKeranjang = async (id) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/remove/${id}`);

            if (response) {
                window.location.reload()
            }
        } catch (error) {
            console.log(error);
        }
    }

    const BuatPesanan = async () => {
    setLoading(true); // Tambahkan loading opsional
    const dataId = DataKeranjang.flatMap(item =>
        item.list_keranjang.map(innerItem => innerItem.id_pesanan)
    );
    const dataTotalPembayaran = DataKeranjang.flatMap(item =>
        item.detail_transaksi.map(innerItem => innerItem.total_pembayaran)
    ).reduce((acc, curr) => acc + curr, 0);

    try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/pesanan/create`, {
            dataId: dataId,
            dataTotalPembayaran: dataTotalPembayaran
        });

        if (response && response.data.success) {
            // Alert berhasil, tidak perlu Snap
            messageAlert("Pesanan berhasil ditambahkan ke daftar pesanan saya");
            nameAlert("Berhasil");
            showAlert();
            navigate('/pesananku');
        }
    } catch (error) {
        console.error(error);
        messageAlert("Gagal membuat pesanan");
        nameAlert("Error");
        showAlert();
    } finally {
        setLoading(false);
    }
};


    const Navigate = (href) => {
        navigate(`${href}`);
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD');
    };
    

    return (
        <section>
            <div className='desawisata-header'></div>
            <h2 className="text-center my-top-3" style={{ color: "#313131", fontFamily: "Poppins" , fontWeight:"600"}}>Keranjang Anda</h2>
            {loading ? (
                <div className='d-flex flex-column justify-content-center align-item-center w-100 my-top-3' style={{ height: '50vh' }}>
                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                        <Lottie
                            animationData={loadingAnimation}
                            loop={true}
                            autoplay={true}
                        />
                    </div>
                </div>
            ) : (
                <>
                    {DataKeranjang.length === 0 ? (
                        <div className='d-flex flex-column justify-content-center align-item-center w-100' style={{ height: '60vh' }}>
                            <div style={{ height: 200, width: 200 }}>
                                <Lottie
                                    animationData={animationData}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                            <p className='text-default text-size-14 text-bold my-top-2' >{message}</p>
                            <span onClick={() => Navigate("/")} className='button-form w-25' style={{ backgroundColor: "#06647B" }}>Mulai cari destinasimu!</span>
                        </div>
                    ) : (
                        <>
                            {DataKeranjang.map((item, index) => {
                                return (
                                    <div className="cover-keranjang" key={index}>
                                        <div className='cover-items-keranjang'>

                                            {item.list_keranjang.map((item, index) => {
                                                return (
                                                    <div className="card-keranjang" key={index}>
                                                        <div className='d-flex justify-content-beetwen my-bottom-1'>
                                                            <div className='d-flex flex-column'>
                                                                <span className='text-size-14 text-bold' style={{ color: "#313131" }}>{item.nama_destinasi}</span>
                                                                <span className='text-size-12' style={{ color: "#616161" }}>Tgl Booking: {formatDate(item.tgl_booking)}</span>
                                                                {item.jenis_destinasi === "tbl_kuliner" && (
                                                                    <button className="my-top-1 btn-edit" onClick={() => Navigate(`/kuliner/${item.id_destinasi}`)}>
                                                                        <i className="fa-solid fa-cart-plus"></i>
                                                                        <span className='mx-2'>Tambah menu</span>
                                                                    </button>
                                                                )}
                                                                {item.jenis_destinasi === "tbl_destinasi" && (
                                                                    <button className="my-top-1 btn-edit" onClick={() => Navigate(`/wisata/${item.id_destinasi}`)}>
                                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                                        <span className='mx-1'> Ubah pesanan</span>
                                                                    </button>
                                                                )}
                                                                {item.jenis_destinasi === "tbl_paket_wisata" && (
                                                                    <button className="my-top-1 btn-edit" onClick={() => Navigate(`/paket_wisata/${item.id_destinasi}`)}>
                                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                                        <span className='mx-1'> Ubah pesanan</span>
                                                                    </button>
                                                                )}
                                                                {item.jenis_destinasi === "tbl_penginapan" && (
                                                                    <button className="my-top-1 btn-edit" onClick={() => Navigate(`/penginapan/${item.id_destinasi}`)}>
                                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                                        <span className='mx-1'> Ubah Pesanan</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className='d-flex flex-column'>
                                                                <span className='text-size-12' style={{ color: "#616161" }}>Total pesanan:</span>
                                                                <span className='text-size-14 text-bold' style={{ color: "#313131" }}>{Number(item.total_pesanan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                            </div>
                                                        </div>

                                                        {item.detail_pesanan.map((item, index) => {
                                                            return (

                                                                <div className='item-card' key={index}>
                                                                    <div className='cover-img'>
                                                                        <img src={item.sampul_menu} alt='foto kosong' />
                                                                    </div>
                                                                    <div className='text-child'>
                                                                        <h4>{item.nama_menu}</h4>
                                                                        <p>Jumlah : {item.jumlah}</p>
                                                                        <p>Harga satuan : {Number(item.harga_satuan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                                                                        <div className="d-flex">
                                                                            <button className="btn-list" onClick={() => RemoveKeranjang(item.id_detail_pesanan)}>
                                                                                <i className="fa fa-trash"></i>
                                                                                <span> Batalkan pesanan</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                        }

                                                    </div>

                                                )
                                            })
                                            }

                                        </div>

                                        {item.detail_transaksi.map((item, index) => {
                                            return (
                                                <div className="card-pembayaran" key={index}>
                                                    {!OpenSnap && (
                                                        <>
                                                            <h4 style={{ fontWeight: "600" }}>Rincian Pembayaran</h4>
                                                            <div className='detail-pembayaran'>
                                                                <div className='d-flex justify-content-beetwen'>
                                                                    <span>Subtotal pemesanan</span>
                                                                    <span>{Number(item.total_pemesanan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                                </div>
                                                                {/* <div className='d-flex justify-content-beetwen'>
                                                            <span>Biaya admin</span>
                                                            <span>{Number(item.biaya_admin).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                        </div> */}
                                                            </div>
                                                            <div className='d-flex justify-content-beetwen text-bold' style={{ color: "#F0A44F" }}>
                                                                <span>Total pembayaran</span>
                                                                <span>{Number(item.total_pembayaran).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                                                            </div>
                                                            <button className='button-form my-top-1 my-bottom-1'  style={{ backgroundColor: "#06647B" }} onClick={BuatPesanan}>Buat pesanan
                                                            </button>
                                                        </>
                                                    )}
                                                    {OpenSnap && (
                                                        <div className='d-flex justify-content-center w-100'>
                                                            <div id='snap-container'></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                        }

                                    </div>
                                )
                            })
                            }
                        </>
                    )}
                </>
            )}
        </section>
    );
}

export default KeranjangPage;
