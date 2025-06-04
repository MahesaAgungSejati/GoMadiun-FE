import React, { useState } from 'react';

const PopUp = ({ show, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!show) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="modal-backdrops">
      <div className="modal-content-backdrop">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <button className="slider-button left" onClick={handlePrev}>
          &#10094;
        </button>
        <div className="sliders">
          <img src={images[currentIndex].url_poster} alt={images[currentIndex].url_poster} className="slider-images" />
        </div>
        <button className="slider-button right" onClick={handleNext}>
          &#10095;
        </button>
      </div>
    </div>
  );
};

export default PopUp;
