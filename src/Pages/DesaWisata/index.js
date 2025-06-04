import { React, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ContentDesaWisata from './components/content';
import Alert from '../../modal/alert';
import { debounce } from 'lodash';
import Lottie from 'lottie-react';
import animationData from "./../assets/js/loading.json"

function DesaWisata() {

  const [DesaWisataDatas, setDesaWisataData] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [onshow, setOnshow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const toogleOnclose = () => {
    setOnshow(false);
  };

  const getData = async (searchTerm = '', pageNumber = 1) => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/get_all?keyword=${searchTerm}&page=${pageNumber}&limit=6`;
      const response = await axios.get(url);

      if (response) {
        setDesaWisataData(response.data.data);
        setPage(response.data.pages.current_page);
        setTotalPages(response.data.pages.last_page);
        setLoading(false);
        toogleOnclose();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getData(keyword, page);
  }, [page]);

  const debounceGetData = useCallback(
    debounce((value) => {
      setPage(1);
      getData(value, 1);
    }, 1000),
    []
  );

  const searchKeyword = (event) => {
    setLoading(true);
    const value = event.target.value;
    setKeyword(value);
    debounceGetData(value);
  };

  return (
    <section className='desawisata'>
      {/* HERO */}
     <div className="hero-desawisata">
        <div className="hero-desawisata-overlay">
          <div className="hero-desawisata-title">
            <h1>Desa Wisata</h1>
          </div>
          <div className="hero-desawisata-subtitle">
            <p>Temukan desawisata di Kabupaten Madiun</p>
          </div>
        </div>
      </div>

      <div className='d-flex flex-row justify-content-center'>
        <div className="sidebar-desawisata-all">
          <span className='fw-bold' style={{ color : "#015C91" }}><i className="fa-solid fa-search"></i> Temukan desa wisata</span>
          <div className="form-group py-3">
            <input
              type="text"
              className="form-control"
              placeholder="Cari"
              value={keyword}
              onChange={searchKeyword}
            />
          </div>
        </div>

        {DesaWisataDatas != 0 ? (
          <ContentDesaWisata
            dataDesaWisata={DesaWisataDatas}
            isLoading={loading}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        ) : (
          <div className="content-desawisata">
            <div className='desawisata-container justify-content-center'>
              <div className='d-flex' style={{ height: 200, width: 200 }}>
                <Lottie
                  animationData={animationData}
                  loop={true}
                  autoplay={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {message !== '' && (
        <Alert show={onshow} onClose={toogleOnclose} status={"Info"} message={message} />
      )}
    </section>
  );
}

export default DesaWisata;
