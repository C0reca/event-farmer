function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-600 text-sm font-medium">Total de Empresas</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">{stats.n_empresas || 0}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-600 text-sm font-medium">Atividades Disponíveis</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">{stats.n_atividades || 0}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-600 text-sm font-medium">Reservas</h3>
        <p className="text-3xl font-bold text-purple-600 mt-2">{stats.n_reservas || 0}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-600 text-sm font-medium">Faturação Total</h3>
        <p className="text-3xl font-bold text-orange-600 mt-2">
          €{stats.faturacao_total?.toFixed(2) || '0.00'}
        </p>
      </div>
    </div>
  );
}

export default DashboardStats;

