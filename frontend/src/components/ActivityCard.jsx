import { useNavigate } from 'react-router-dom';

function ActivityCard({ atividade, onReserve }) {
  const navigate = useNavigate();
  const imagens = atividade.imagens ? JSON.parse(atividade.imagens || '[]') : [];
  const imagemUrl = imagens[0] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800';

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-gray-300">★</span>);
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        <img 
          src={imagemUrl} 
          alt={atividade.nome}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => navigate(`/atividade/${atividade.id}`)}
        />
        {atividade.rating_medio > 0 && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-md flex items-center gap-1">
            {renderStars(atividade.rating_medio)}
            <span className="text-sm font-semibold ml-1">{atividade.rating_medio.toFixed(1)}</span>
          </div>
        )}
        {atividade.categoria && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold uppercase">
            {atividade.categoria}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 
          className="text-xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-blue-600"
          onClick={() => navigate(`/atividade/${atividade.id}`)}
        >
          {atividade.nome}
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {atividade.tipo && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {atividade.tipo}
            </span>
          )}
          {atividade.clima && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              {atividade.clima}
            </span>
          )}
          {atividade.duracao_minutos && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              {atividade.duracao_minutos}min
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-2">
          <span className="font-semibold">📍</span> {atividade.localizacao || 'N/A'}
        </p>
        <p className="text-gray-600 text-sm mb-4">
          <span className="font-semibold">👥</span> até {atividade.capacidade_max} pessoas
        </p>
        {atividade.descricao && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{atividade.descricao}</p>
        )}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              €{atividade.preco_por_pessoa.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">/pessoa</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/atividade/${atividade.id}`)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Ver Detalhes
            </button>
            <button
              onClick={() => onReserve(atividade)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityCard;

