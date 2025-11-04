// src/components/AutocompleteEndereco.jsx
import React, { useState, useRef, useCallback } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

// Bibliotecas necessárias do Google Maps
const libraries = ['places'];

// O 'segredo' é a sua API key
// Use import.meta.env.VITE_... (padrão do Vite)
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Se estiver usando Create React App, seria:
// const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function AutocompleteEndereco({ onPlaceSelected }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);

  const onLoad = useCallback((autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      // Log para ver todos os dados que o Google retorna
      console.log('Google Place Result:', place); 
      
      const addressData = parseAddressComponents(place);
      
      // Envia os dados formatados para o componente pai (perfilCliente.jsx)
      if (onPlaceSelected) {
        onPlaceSelected(addressData);
      }
    } else {
      console.error('Instância do Autocomplete não está carregada.');
    }
  };

  /**
   * Função Mágica: Converte o objeto 'place' do Google
   * no formato do seu banco de dados (schema.prisma)
   */
  const parseAddressComponents = (place) => {
    const components = place.address_components;
    if (!components) return {};

    const address = {
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    };

    for (const component of components) {
      const types = component.types;

      if (types.includes('street_number')) {
        address.numero = component.long_name;
      }
      if (types.includes('route')) {
        address.logradouro = component.long_name;
      }
      if (types.includes('sublocality_level_1') || types.includes('political')) {
        if (address.bairro === '') address.bairro = component.long_name; // Prioriza sublocality
      }
      if (types.includes('administrative_area_level_2')) {
        address.cidade = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        address.estado = component.short_name; // 'SP', 'RJ', etc.
      }
      if (types.includes('postal_code')) {
        address.cep = component.long_name;
      }
    }
    
    // Fallback para bairro, se não encontrado
    if (address.bairro === '' && components.find(c => c.types.includes('sublocality'))) {
        address.bairro = components.find(c => c.types.includes('sublocality')).long_name;
    }

    return address;
  };

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={libraries}
      loadingElement={<div>Carregando API do Google...</div>}
    >
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        // Restringe a busca ao Brasil
        options={{ componentRestrictions: { country: 'br' } }}
        fields={['address_components', 'geometry', 'name']}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Digite seu endereço (ex: Av. Paulista, 1000)"
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </Autocomplete>
    </LoadScript>
  );
}

export default AutocompleteEndereco;