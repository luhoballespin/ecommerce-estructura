import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import productCategory from "../helpers/productCategory";
import VerticalCard from "../components/VerticalCard";
import SummaryApi from "../common";

const CategoryProduct = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener categorías desde la URL
  const urlSearch = new URLSearchParams(location.search);
  const urlCategoryListinArray = urlSearch.getAll("category");

  const urlCategoryListObject = {};
  urlCategoryListinArray.forEach((el) => {
    urlCategoryListObject[el] = true;
  });

  const [selectCategory, setSelectCategory] = useState(urlCategoryListObject);
  const [filterCategoryList, setFilterCategoryList] = useState([]);

  // Fetch de productos por categoría o todos los productos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Si hay categorías seleccionadas, usar filtro
        if (filterCategoryList.length > 0) {
          const response = await fetch(SummaryApi.filterProduct.url, {
            method: SummaryApi.filterProduct.method,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              category: filterCategoryList,
            }),
          });
          const dataResponse = await response.json();
          if (dataResponse?.success && Array.isArray(dataResponse?.data)) {
            setData(dataResponse.data);
          } else {
            setData([]);
          }
        } else {
          // Si no hay categorías seleccionadas, mostrar todos los productos
          const response = await fetch(SummaryApi.allProduct.url);
          const dataResponse = await response.json();
          if (dataResponse?.success && Array.isArray(dataResponse?.data)) {
            setData(dataResponse.data);
          } else {
            setData([]);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterCategoryList]);

  // Ordenar productos por precio
  const handleOnChangeSortBy = (e) => {
    const { value } = e.target;
    setSortBy(value);

    if (value === "asc") {
      setData((prev) =>
        [...prev].sort((a, b) => a.sellingPrice - b.sellingPrice)
      );
    }

    if (value === "dsc") {
      setData((prev) =>
        [...prev].sort((a, b) => b.sellingPrice - a.sellingPrice)
      );
    }
  };

  // Manejo de checkbox
  const handleSelectCategory = (e) => {
    const { value, checked } = e.target;
    setSelectCategory((prev) => ({
      ...prev,
      [value]: checked,
    }));
  };

  // Actualiza lista de categorías seleccionadas y URL
  useEffect(() => {
    const arrayOfCategory = Object.keys(selectCategory).filter(
      (key) => selectCategory[key]
    );

    setFilterCategoryList(arrayOfCategory);

    const urlFormat = arrayOfCategory.map((el) => `category=${el}`);
    navigate("/product-category?" + urlFormat.join("&"));
  }, [selectCategory, navigate]);

  return (
    <div className="container mx-auto p-4">
      <div className="hidden lg:grid grid-cols-[200px,1fr]">
        {/* Sidebar */}
        <div className="bg-white p-2 min-h-[calc(100vh-120px)] overflow-y-scroll">
          {/* Sort by */}
          <div>
            <h3 className="text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300">
              Sort by
            </h3>
            <form className="text-sm flex flex-col gap-2 py-2">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="sortBy"
                  checked={sortBy === "asc"}
                  onChange={handleOnChangeSortBy}
                  value="asc"
                />
                <label>Price - Low to High</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="sortBy"
                  checked={sortBy === "dsc"}
                  onChange={handleOnChangeSortBy}
                  value="dsc"
                />
                <label>Price - High to Low</label>
              </div>
            </form>
          </div>

          {/* Filter by */}
          <div>
            <h3 className="text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300">
              Category
            </h3>
            <form className="text-sm flex flex-col gap-2 py-2">
              {productCategory.map((cat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="category"
                    checked={selectCategory[cat.value] || false}
                    value={cat.value}
                    id={cat.value}
                    onChange={handleSelectCategory}
                  />
                  <label htmlFor={cat.value}>{cat.label}</label>
                </div>
              ))}
            </form>
          </div>
        </div>

        {/* Productos */}
        <div className="px-4">
          <p className="font-medium text-slate-800 text-lg my-2">
            {filterCategoryList.length > 0
              ? `Resultados de búsqueda: ${data.length}`
              : `Todos los productos: ${data.length}`}
          </p>

          <div className="min-h-[calc(100vh-120px)] overflow-y-scroll max-h-[calc(100vh-120px)]">
            {data.length > 0 && !loading ? (
              <VerticalCard data={data} loading={loading} />
            ) : (
              <p className="text-slate-500">No se encontraron productos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProduct;
