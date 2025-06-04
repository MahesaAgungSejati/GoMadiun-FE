import { React, useCallback, useState, useEffect } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import Lottie from 'lottie-react';
import animationData from './../assets/js/loading.json';
import Alert from '../../modal/alert';

import KulinerContent from './components/contentkuliner';

function KulinerPage() {

  const [KulinerDatas, setKulinerDatas] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [onshow, setOnshow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchKeyword = (event) => {
    setLoading(true);
    const value = event.target.value;
    setKeyword(value);
    debounceGetData(value);
  };

  // const debounceGetData = useCallback(
  //   debounce((value) => {
  //     getData(value);
  //   }, 1000),
  //   []
  // );

  const toogleOnclose = () => {
    setOnshow(false);
  };

  const getData = async (searchTerm = '', pageNumber = 1) => {
  setLoading(true);
  try {
    const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/kuliner/get_all?keyword=${searchTerm}&page=${pageNumber}&limit=6`;
    const response = await axios.get(url);
    if (response) {
      setKulinerDatas(response.data.data);
      setPage(response.data.pages.current_page);
      setTotalPages(response.data.pages.last_page);
      setLoading(false);
      toogleOnclose();
    }
  } catch (error) {
    console.error('Error fetching kuliner:', error);
  }
};

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

  return (
    <section className='kuliner'>
      {/* HERO */}
      <div className="hero-kuliner">
        <div className="hero-kuliner-overlay">
  <div className="hero-kuliner-title">
    <h1>Tempat Kuliner</h1>
  </div>
  <div className="hero-kuliner-subtitle">
    <p>Jelajahi tempat kuliner di Kabupaten Madiun</p>
  </div>
</div>
</div>

      <div className='d-flex flex-row justify-content-center w-100'>
        <div className="sidebar-kuliner-all">
          <span className='fw-bold' style={{ color : "#06647B" }}><i className="fa-solid fa-search"></i> Temukan kuliner tujuanmu?</span>
          <div className="form-group py-3">
            <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Cari" value={keyword} onChange={searchKeyword} />
          </div>
        </div>

        {KulinerDatas != 0 ? (
          <KulinerContent
            datakuliner={KulinerDatas}
            isLoading={loading}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />

        ) : (
          <div>
            <div className="cover-kuliner-page">
              <div className="child-cardkuliner-loading">
                <div className='d-flex' style={{ height: 200, width: 200 }}>
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                  />
                </div>
              </div>
              <div className="child-cardkuliner-loading">
                <div className='d-flex' style={{ height: 200, width: 200 }}>
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                  />
                </div>
              </div>
              <div className="child-cardkuliner-loading">
                <div className='d-flex' style={{ height: 200, width: 200 }}>
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                  />
                </div>
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

export default KulinerPage;
