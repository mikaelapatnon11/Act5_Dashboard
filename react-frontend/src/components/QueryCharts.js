import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  Treemap,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = [
  '#14B8A6',
  '#8B5CF6',
  '#F59E0B',
  '#EF6475',
  '#3B82F6',
  '#22C55E',
  '#EC4899',
  '#06B6D4',
  '#F97316',
  '#A855F7',
  '#84CC16',
];

const peso = (value) =>
  `₱${Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getRows = (data, key) =>
  Array.isArray(data?.[key]) ? data[key] : [];

const getName = (item, index) =>
  item?.name ??
  item?.product_name ??
  item?.category_name ??
  item?.category?.name ??
  `Item ${index + 1}`;

const getPrice = (item) =>
  Number(
    item?.price ??
    item?.total_price ??
    item?.avg_price ??
    item?.average_price ??
    item?.min_price ??
    0
  );

const productRows = (rows) =>
  rows.map((item, index) => ({
    name: getName(item, index),
    price: getPrice(item),
    index: index + 1,
    category:
      item?.category_name ??
      item?.category?.name ??
      'Uncategorized',
  }));

const categoryRows = (rows, field) =>
  rows.map((item, index) => ({
    name: getName(item, index),
    value: Number(item?.[field] ?? 0),
    index: index + 1,
  }));

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="custom-tooltip">
      <strong>{label || payload[0]?.name || 'Product'}</strong>
      {payload.map((item, index) => (
        <p key={index} style={{ color: item.color || item.fill }}>
          {item.name}: {peso(item.value)}
        </p>
      ))}
    </div>
  );
};

const ChartContainer = ({ children }) => (
  <div className="visual-chart">
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

const EmptyChart = () => (
  <div className="chart-empty">
    No chart data available
  </div>
);

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="visual-card">
      <div className="visual-heading">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function QueryCharts({ data }) {
  const namePrice = productRows(
    getRows(data, 'name_and_price')
  );

  const withCategory = productRows(
    getRows(data, 'products_with_category')
  );

  const orderedRows = productRows(
    getRows(data, 'products_ordered_by_price')
  );

  const firstFive = productRows(
    getRows(data, 'first_five_products')
  );

  const filteredRows = productRows(
    getRows(data, 'price_greater_than_or_equal')
  );

  const electronics = productRows(
    getRows(data, 'electronics')
  );

  const totalCategory = categoryRows(
    getRows(data, 'total_price_per_category'),
    'total_price'
  );

  const averageCategory = categoryRows(
    getRows(data, 'average_price_per_category'),
    'avg_price'
  );

  const lowestCategory = categoryRows(
    getRows(data, 'lowest_price_per_category'),
    'min_price'
  );

  const sortedAverage = categoryRows(
    getRows(data, 'average_price_sorted'),
    'avg_price'
  );

  const electronicsBooks = getRows(
    data,
    'electronics_and_books'
  ).map((item, index) => ({
    name: getName(item, index),
    value: Number(
      item?.avg_price ??
      item?.average_price ??
      item?.price ??
      0
    ),
  }));

  const topProducts = [...namePrice]
    .sort((a, b) => b.price - a.price)
    .slice(0, 10);

  const priceRanges = [
    { name: '₱0–₱50', min: 0, max: 50 },
    { name: '₱51–₱100', min: 51, max: 100 },
    { name: '₱101–₱150', min: 101, max: 150 },
    { name: '₱151–₱200', min: 151, max: 200 },
    { name: '₱201–₱250', min: 201, max: 250 },
    { name: '₱251–₱300', min: 251, max: 300 },
    { name: '₱301–₱350', min: 301, max: 350 },
    { name: '₱351–₱400', min: 351, max: 400 },
    { name: '₱401–₱450', min: 401, max: 450 },
    { name: '₱451–₱500', min: 451, max: 500 },
  ].map((range) => ({
    ...range,
    count: namePrice.filter(
      (item) =>
        item.price >= range.min &&
        item.price <= range.max
    ).length,
  }));

  const categoryDistribution = Object.values(
    withCategory.reduce((acc, item) => {
      const key = item.category;
      if (!acc[key]) {
        acc[key] = { name: key, value: 0 };
      }
      acc[key].value += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const scatterData = electronics.map((item) => ({
    x: item.index,
    y: item.price,
    name: item.name,
  }));

  const treemapData = topProducts.map((item, index) => ({
    name: item.name,
    size: item.price,
    fill: COLORS[index % COLORS.length],
  }));

  const averageValue = namePrice.length
    ? namePrice.reduce((sum, item) => sum + item.price, 0) /
      namePrice.length
    : 0;

  // 11 CHARTS ONLY
  const chartData = [
    {
      title: '05. Product Name and Price',
      subtitle: 'Product price comparison',
      content: namePrice.length ? (
        <ChartContainer>
          <BarChart
            data={namePrice.slice(0, 12)}
            layout="vertical"
            margin={{ left: 10, right: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `₱${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="price" name="Price" radius={[0, 6, 6, 0]}>
              {namePrice.slice(0, 12).map((item, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : <EmptyChart />,
    },

    {
      title: '06. Products with Category',
      subtitle: 'Category and product prices',
      content: withCategory.length ? (
        <ChartContainer>
          <ComposedChart data={withCategory.slice(0, 12)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="price"
              fill={COLORS[1]}
              name="Price"
            />
            <Line
              dataKey="price"
              stroke={COLORS[2]}
              strokeWidth={2}
              name="Price trend"
            />
          </ComposedChart>
        </ChartContainer>
      ) : <EmptyChart />,
    },

    {
      title: '07. Products Ordered by Price',
      subtitle: 'Price sequence',
      content: orderedRows.length ? (
        <ChartContainer>
          <LineChart data={orderedRows.slice(0, 15)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="index"
              tick={{ fontSize: 9 }}
            />
            <YAxis
              tickFormatter={(v) => `₱${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke={COLORS[2]}
              strokeWidth={3}
              dot={{ r: 3 }}
              name="Price"
            />
          </LineChart>
        </ChartContainer>
      ) : <EmptyChart />,
    },

    {
      title: '08. First Five Products',
      subtitle: 'First five product records',
      content: firstFive.length ? (
        <ChartContainer>
          <PieChart>
            <Pie
              data={firstFive}
              dataKey="price"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={85}
              label
            >
              {firstFive.map((item, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ChartContainer>
      ) : <EmptyChart />,
    },

    {
      title: '09. Products Priced ≥ ₱3',
      subtitle: 'Filtered product prices',
      content: filteredRows.length ? (
        <ChartContainer>
          <AreaChart data={filteredRows.slice(0, 15)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area
              dataKey="price"
              stroke={COLORS[3]}
              fill={COLORS[3]}
              fillOpacity={0.35}
              name="Price"
            />
          </AreaChart>
        </ChartContainer>
      ) : <EmptyChart />,
    },

    {
      title: '10. Electronics Products',
      subtitle: 'Electronics price distribution',
      content: scatterData.length ? (
        <ChartContainer>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Product number"
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Price"
              tickFormatter={(v) => `₱${v}`}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter
              data={scatterData}
              fill={COLORS[4]}
              name="Electronics"
            />
          </ScatterChart>
        </ChartContainer>
      ) : <EmptyChart />,
    },

    {
      title: '11. Total Price per Category',
      subtitle: 'Combined category product value',
      content: totalCategory.length ? (
        <ChartContainer>
          <BarChart data={totalCategory.slice(0, 15)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name="Total Price"
              radius={[5, 5, 0, 0]}
            >
              {totalCategory.slice(0, 15).map((item, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : <EmptyChart />,
    },

    {
      title: '12. Average Price per Category',
      subtitle: 'Average category price distribution',
      content: averageCategory.length ? (
        <ChartContainer>
          <PieChart>
            <Pie
              data={averageCategory.slice(0, 10)}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={90}
              paddingAngle={3}
              label
            >
              {averageCategory.slice(0, 10).map((item, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ChartContainer>
      ) : <EmptyChart />,
    },

    {
      title: '13. Lowest Price per Category',
      subtitle: 'Minimum price comparison',
      content: lowestCategory.length ? (
        <ChartContainer>
          <RadarChart data={lowestCategory.slice(0, 12)}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fontSize: 9 }}
            />
            <PolarRadiusAxis />
            <Radar
              dataKey="value"
              stroke={COLORS[3]}
              fill={COLORS[3]}
              fillOpacity={0.4}
              name="Lowest Price"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ChartContainer>
      ) : <EmptyChart />,
    },

    {
      title: '14. Average Price Sorted',
      subtitle: 'Sorted average category prices',
      content: sortedAverage.length ? (
        <ChartContainer>
          <AreaChart data={sortedAverage.slice(0, 15)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={COLORS[5]}
              fill={COLORS[5]}
              fillOpacity={0.3}
              name="Average Price"
            />
          </AreaChart>
        </ChartContainer>
      ) : <EmptyChart />,
    },

    {
      title: '15. Product Price Analysis',
      subtitle: `Average product price: ${peso(averageValue)}`,
      content: topProducts.length ? (
        <ChartContainer>
          <Treemap
            data={treemapData}
            dataKey="size"
            nameKey="name"
            stroke="#fff"
            fill={COLORS[6]}
          >
            <Tooltip />
          </Treemap>
        </ChartContainer>
      ) : <EmptyChart />,
    },
  ];

  return (
    <div className="query-charts-grid">
      {chartData.map((chart, index) => (
        <ChartCard
          key={index}
          title={chart.title}
          subtitle={chart.subtitle}
        >
          {chart.content}
        </ChartCard>
      ))}
    </div>
  );
}

export default QueryCharts;
