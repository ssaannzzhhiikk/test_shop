export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  brands = [],
  categories = [],
}) {
  function updateField(field, value) {
    onChange({ ...filters, [field]: value, offset: 0 });
  }

  return (
    <aside className="space-y-6 border-b border-zinc-200 pb-6 lg:border-b-0 lg:border-r lg:pr-8">
      <div>
        <label className="label" htmlFor="search">
          Search
        </label>
        <input
          className="input"
          id="search"
          onChange={(event) => updateField("search", event.target.value)}
          placeholder="Dress, jacket, brand"
          value={filters.search}
        />
      </div>
      <div>
        <label className="label" htmlFor="brand">
          Brand
        </label>
        <select className="input" id="brand" onChange={(event) => updateField("brand", event.target.value)} value={filters.brand}>
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="category">
          Category
        </label>
        <select
          className="input"
          id="category"
          onChange={(event) => updateField("category", event.target.value)}
          value={filters.category}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="priceMin">
            Min
          </label>
          <input
            className="input"
            id="priceMin"
            min="0"
            onChange={(event) => updateField("priceMin", event.target.value)}
            placeholder="5000"
            type="number"
            value={filters.priceMin}
          />
        </div>
        <div>
          <label className="label" htmlFor="priceMax">
            Max
          </label>
          <input
            className="input"
            id="priceMax"
            min="0"
            onChange={(event) => updateField("priceMax", event.target.value)}
            placeholder="100000"
            type="number"
            value={filters.priceMax}
          />
        </div>
      </div>
      <button className="btn-secondary w-full" onClick={onReset} type="button">
        Reset filters
      </button>
    </aside>
  );
}
