import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';

function ActivityCard({ atividade, onReserve }) {
  const navigate = useNavigate();
  const imagens = atividade.imagens ? JSON.parse(atividade.imagens || '[]') : [];
  const imagemUrl = imagens[0] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800';

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-warning-500">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-warning-500">☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-secondary-300">★</span>);
    }
    return stars;
  };

  return (
    <Card className="overflow-hidden" hover={true} padding="none">
      <div className="relative">
        <img 
          src={imagemUrl} 
          alt={atividade.nome}
          className="w-full h-48 object-cover cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => navigate(`/atividade/${atividade.id}`)}
        />
        {atividade.rating_medio > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md">
            {renderStars(atividade.rating_medio)}
            <span className="text-sm font-semibold text-secondary-900 ml-1">
              {atividade.rating_medio.toFixed(1)}
            </span>
          </div>
        )}
        {atividade.categoria && (
          <div className="absolute top-3 left-3 bg-primary-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold uppercase shadow-md">
            {atividade.categoria}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 
          className="text-xl font-bold text-secondary-900 mb-3 cursor-pointer hover:text-primary-600 transition-colors line-clamp-1"
          onClick={() => navigate(`/atividade/${atividade.id}`)}
        >
          {atividade.nome}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {atividade.tipo && (
            <span className="px-2.5 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded-full">
              {atividade.tipo}
            </span>
          )}
          {atividade.clima && (
            <span className="px-2.5 py-1 bg-success-100 text-success-700 text-xs font-medium rounded-full">
              {atividade.clima}
            </span>
          )}
          {atividade.duracao_minutos && (
            <span className="px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
              {atividade.duracao_minutos}min
            </span>
          )}
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm text-secondary-600 flex items-center gap-2">
            <span className="text-base">📍</span>
            <span>{atividade.localizacao || 'N/A'}</span>
          </p>
          <p className="text-sm text-secondary-600 flex items-center gap-2">
            <span className="text-base">👥</span>
            <span>até {atividade.capacidade_max} pessoas</span>
          </p>
        </div>
        
        {atividade.descricao && (
          <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
            {atividade.descricao}
          </p>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t border-secondary-200">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              €{atividade.preco_por_pessoa.toFixed(2)}
            </span>
            <span className="text-sm text-secondary-500 ml-1">/pessoa</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/atividade/${atividade.id}`)}
              variant="outline"
              size="sm"
            >
              Detalhes
            </Button>
            <Button
              onClick={() => onReserve(atividade)}
              size="sm"
            >
              Reservar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ActivityCard;

