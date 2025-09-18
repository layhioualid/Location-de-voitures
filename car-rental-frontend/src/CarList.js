import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddCarForm from './AddCarForm';

function CarList() {
const [cars, setCars] = useState([]);
const [page, setPage] = useState(1);
const [lastPage, setLastPage] = useState(1);

const fetchCars = () => {
  axios.get(`http://127.0.0.1:8000/api/cars?page=${page}`)
    .then(res => {
      setCars(res.data.data);
      setLastPage(res.data.last_page);
    });
};

useEffect(() => {
  fetchCars();
}, [page]);

// ...
// en bas du return()
<div style={{ marginTop: '20px' }}>
  <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
  <span style={{ margin: '0 10px' }}>Page {page} of {lastPage}</span>
  <button disabled={page >= lastPage} onClick={() => setPage(page + 1)}>Next</button>
</div>

}
export default CarList;
