import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import PublisherList from '../components/publishers/PublisherList';
import PublisherForm from '../components/publishers/PublisherForm';
import Button from '../components/common/Button';
import useApi from '../hooks/useApi';
import apiService from '../services/api';

// Component for editing a publisher
const EditPublisher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { execute: fetchPublisher } = useApi(apiService.getPublisher);
  
  useEffect(() => {
    const loadPublisher = async () => {
      try {
        const data = await fetchPublisher(id);
        setPublisher(data);
      } catch (err) {
        setError(err.message || 'Error al cargar la editorial');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadPublisher();
    }
  }, [id, fetchPublisher]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/publishers')}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button 
          variant="outline" 
          className="mr-4"
          onClick={() => navigate('/publishers')}
        >
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Editar Editorial</h1>
      </div>
      
      {publisher && (
        <PublisherForm 
          publisher={publisher} 
          isEdit={true}
        />
      )}
    </div>
  );
};

// Component for creating a new publisher
const NewPublisher = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button 
          variant="outline" 
          className="mr-4"
          onClick={() => navigate('/publishers')}
        >
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Nueva Editorial</h1>
      </div>
      
      <PublisherForm />
    </div>
  );
};

// Main Publishers Page that manages routing
const PublishersPage = () => {
  return (
    <Routes>
      <Route index element={<PublisherList />} />
      <Route path="new" element={<NewPublisher />} />
      <Route path=":id/edit" element={<EditPublisher />} />
    </Routes>
  );
};

export default PublishersPage;