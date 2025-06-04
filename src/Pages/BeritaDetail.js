import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BeritaDetail.css';

const DetailBerita = () => {
  const { id } = useParams(); // Pastikan routing menggunakan :id
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/berita/detail/${id}`);
        setBerita(res.data.data);
      } catch (err) {
        console.error('Gagal mengambil data berita:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (!berita) return <div className="detail-error">Berita tidak ditemukan.</div>;

   return (
    <>
       <div className='desawisata-header my-bottom-0'></div>

  {/* <button className="back-button" style={{ fontFamily: "Poppins"}}onClick={() => navigate('/berita')}>
    &lt; Kembali 
  </button> */}

      <div className="detail-berita-container">
        <div className="detail-date">{formatDate(berita.createdAt)}</div>
        <img src={berita.sampul_berita} alt="Sampul Berita" className="detail-image" />
        <h1 className="detail-title">{berita.title}</h1>
        <div
          className="detail-content"
          dangerouslySetInnerHTML={{ __html: berita.content }}
        />
      </div>
    </>
  );
};

export default DetailBerita;
