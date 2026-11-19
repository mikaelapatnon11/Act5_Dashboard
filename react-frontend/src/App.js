import { useEffect, useState } from 'react';
import './App.css';
import QueryCharts from './components/QueryCharts';

const API_URL = 'http://127.0.0.1:8000/api/v1/products/queries';

const peso = (value) => {
  const number = Number(value);

  return `₱${(Number.isFinite(number) ? number : 0).toLocaleString(
    'en-PH',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

const getMetric = (data, key) => {
  const value = data?.[key];

  if (typeof value === 'object' && value !== null) {
    return Number(
      value.value ??
        value.total ??
        value.average ??
        value.price ??
        0
    );
  }

  return Number(value ?? 0);
};

function StatCard({ title, value, description, icon, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>

      <h2 className="stat-value">{value}</h2>

      <p className="stat-description">{description}</p>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchQueries = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();

        const queryData =
          result?.data?.data ??
          result?.data ??
          result;

        if (isMounted) {
          setData(queryData);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || 'Unable to load dashboard data.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQueries();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPrice = getMetric(data, 'total_price');
  const averagePrice = getMetric(data, 'average_price');
  const highestPrice = getMetric(data, 'highest_price');
  const lowestPrice = getMetric(data, 'lowest_price');

  return (
    <div className="dashboard-container">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">P</div>

          <div>
            <h2>Product API</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="active">
            ▦ Dashboard
          </a>

          <a href="#analytics">
            ▣ Query Analytics
          </a>
        </nav>

        <div className="sidebar-footer">
          <span className="online-indicator"></span>
          Laravel API Connected
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" id="dashboard">

        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
          </div>

          <div className="status-label">
            <span className="online-indicator"></span>
            Live API Data
          </div>
        </header>

        {/* LOADING MESSAGE */}
        {loading && (
          <div className="message">
            Loading dashboard data...
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="error-message">
            <h3>Unable to load dashboard</h3>
            <p>{error}</p>

            <p>
              Make sure Laravel is running at
              http://127.0.0.1:8000.
            </p>
          </div>
        )}

        {/* DASHBOARD DATA */}
        {!loading && !error && data && (
          <>

            {/* FOUR KPI CARDS */}
            <section className="stats-grid">

              <StatCard
                title="Total Product Prices"
                value={peso(totalPrice)}
                description="Combined value of products"
                icon="₱"
                color="teal"
              />

              <StatCard
                title="Average Price"
                value={peso(averagePrice)}
                description="Average product price"
                icon="◷"
                color="purple"
              />

              <StatCard
                title="Highest Price"
                value={peso(highestPrice)}
                description="Most expensive product"
                icon="↗"
                color="orange"
              />

              <StatCard
                title="Lowest Price"
                value={peso(lowestPrice)}
                description="Least expensive product"
                icon="↘"
                color="pink"
              />

            </section>

            {/* CHARTS */}
            <section
              id="analytics"
              className="dashboard-charts-section"
            >
              <div className="section-heading">
                <div>
                  <h2>Analytics Overview</h2>

                  <p>
                    15 total visualizations: 4 KPI cards
                    and 11 different charts.
                  </p>
                </div>
              </div>

              <QueryCharts data={data} />
            </section>

          </>
        )}

        {/* FOOTER */}
        <footer className="dashboard-footer">
          <p> Product Analytics Dashboard</p>
        </footer>

      </main>
    </div>
  );
}

export default App;