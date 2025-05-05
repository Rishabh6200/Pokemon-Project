import React, { useEffect, useState } from 'react';
import Card from './Card';
import Footer from './Footer';
import Header from './Header';
import Navbar from './Navbar';
import { httpComman } from './api/http-comman';
import axios from 'axios';
import { CircularProgress } from '@mui/material';

const Home = () => {
    const [pokedata, setPokedata] = useState([]);
    const [search, setSearch] = useState([]);
    const [apply, setApply] = useState('');
    const [next, setNext] = useState('');
    const [prev, setPrev] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeButton, setActiveButton] = useState(null); // 'next' or 'prev'
    const [error, setError] = useState(null);

    const fetchData = async (url) => {
        try {
            setLoading(true);
            setError(null);
            const res = await httpComman.get(url);
            const results = res.data.results;
            const pokemonData = await Promise.all(results.map(item => axios.get(item.url)));
            const data = pokemonData.map(response => response.data);

            setPokedata(data);
            setNext(res.data.next);
            setPrev(res.data.previous);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch Pokémon data. Please try again.');
        } finally {
            setLoading(false);
            setActiveButton(null);
        }
    };

    const handleNext = () => {
        if (next) {
            setActiveButton('next');
            fetchData(next);
        }
    };

    const handlePrevious = () => {
        if (prev) {
            setActiveButton('prev');
            fetchData(prev);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchData('/pokemon/');
    }, []);

    // Debounced search
    useEffect(() => {
        const debounce = setTimeout(() => {
            const filterData = pokedata.filter(item =>
                item.name.toLowerCase().includes(apply.toLowerCase()) ||
                item.id.toString() === apply
            );
            setSearch(filterData);
        }, 2000);

        return () => clearTimeout(debounce);
    }, [apply, pokedata]);

    // Show full-screen loader on first load
    if (loading && pokedata.length === 0) {
        return (
            <div className="loading d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <CircularProgress size={60} />
            </div>
        );
    }

    return (
        <>
            <Header />
            <Navbar input={setApply} />

            {/* Error display */}
            {error && (
                <div className="alert alert-danger text-center">
                    {error}
                </div>
            )}

            <Card data={apply ? search : pokedata} />

            <div className="d-grid gap-2 d-md-flex justify-content-md-center my-3">
                {prev && (
                    <button
                        className="btn btn-primary me-md-2 d-flex align-items-center gap-2"
                        onClick={handlePrevious}
                        type="button"
                        disabled={activeButton === 'prev'}
                    >
                        {activeButton === 'prev' ? (
                            <>
                                <CircularProgress size={20} color="inherit" /> Next Page
                            </>
                        ) : (
                            'Previous'
                        )}
                    </button>
                )}
                {next && (
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={handleNext}
                        type="button"
                        disabled={activeButton === 'next'}
                    >
                        {activeButton === 'next' ? (
                            <>
                                <CircularProgress size={20} color="inherit" /> Next Page
                            </>
                        ) : (
                            'Next Page'
                        )}
                    </button>
                )}
            </div>


            <Footer />
        </>
    );
};

export default Home;
